package com.gantasmo.swaycommand

import android.content.Context
import android.media.midi.MidiDevice
import android.media.midi.MidiDeviceInfo
import android.media.midi.MidiManager
import android.media.midi.MidiReceiver
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.WebView
import org.json.JSONArray
import java.util.concurrent.Executor

/**
 * Opens the MIDI hardware and relays raw bytes into the WebView.
 *
 * A WebView implements no Web MIDI API at all, which is why the page cannot open
 * the Sway itself. It declares `window.__SWAY_HOST_MIDI__` before app.js runs,
 * so midi.js takes its relay path and decodes what arrives here with exactly the
 * factory map, learned overrides and pad channels it uses on the desktop. The
 * wire format is the one theDAW already speaks:
 *
 *     { type: 'sway/midi', data: [status, d1, d2], v: 1 }
 *
 * BATCHING is not premature. Hand tracking alone emits two continuous
 * controllers, and the Sway pushes them as fast as the surface changes, so a
 * busy moment is a few hundred messages a second. One evaluateJavascript per
 * message would spend more time crossing the JNI boundary than decoding. Frames
 * are collected and flushed once per display interval instead, which turns that
 * into about sixty calls a second regardless of how hard the surface is worked.
 */
class MidiBridge(
    private val context: Context,
    private val webView: WebView,
    private val onStatus: (String) -> Unit,
) {
    private val manager: MidiManager? =
        context.getSystemService(Context.MIDI_SERVICE) as? MidiManager

    private val main = Handler(Looper.getMainLooper())
    private val mainExecutor = Executor { main.post(it) }
    private val pending = ArrayList<ByteArray>(64)
    private var device: MidiDevice? = null
    private var flushScheduled = false
    private var openedName: String? = null

    /** Devices whose name contains this are opened in preference to any other. */
    private val preferred = "sway"

    private val flush = Runnable {
        flushScheduled = false
        val batch: List<ByteArray>
        synchronized(pending) {
            if (pending.isEmpty()) return@Runnable
            batch = ArrayList(pending)
            pending.clear()
        }
        val messages = JSONArray()
        for (bytes in batch) {
            val one = JSONArray()
            for (b in bytes) one.put(b.toInt() and 0xFF)
            messages.put(one)
        }
        // The adapter installed at document start turns each entry into the
        // postMessage that host-channel.js is listening for.
        webView.evaluateJavascript("window.__swayHost && window.__swayHost.midi($messages);", null)
    }

    private val receiver = object : MidiReceiver() {
        override fun onSend(msg: ByteArray, offset: Int, count: Int, timestamp: Long) {
            if (count <= 0) return
            val copy = msg.copyOfRange(offset, offset + count)
            synchronized(pending) {
                // A stall in the WebView must not grow this without bound.
                if (pending.size < 512) pending.add(copy)
            }
            if (!flushScheduled) {
                flushScheduled = true
                main.postDelayed(flush, FLUSH_MS)
            }
        }
    }

    private val deviceCallback = object : MidiManager.DeviceCallback() {
        override fun onDeviceAdded(info: MidiDeviceInfo) {
            if (device == null) main.post { open() }
        }

        override fun onDeviceRemoved(info: MidiDeviceInfo) {
            if (nameOf(info) == openedName) main.post { close(); open() }
        }
    }

    fun start() {
        val midi = manager
        if (midi == null) {
            onStatus("This device has no MIDI service")
            return
        }
        // API 33 replaced both the callback registration and the device query
        // with transport-aware forms, because Bluetooth LE MIDI arrived
        // alongside the USB byte stream. Only the byte stream is wanted here.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            midi.registerDeviceCallback(
                MidiManager.TRANSPORT_MIDI_BYTE_STREAM,
                mainExecutor,
                deviceCallback,
            )
        } else {
            @Suppress("DEPRECATION")
            midi.registerDeviceCallback(deviceCallback, main)
        }
        open()
    }

    fun stop() {
        manager?.unregisterDeviceCallback(deviceCallback)
        close()
    }

    /** Devices that can send to us, across whichever API this Android offers. */
    private fun readableDevices(midi: MidiManager): List<MidiDeviceInfo> {
        val all = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            midi.getDevicesForTransport(MidiManager.TRANSPORT_MIDI_BYTE_STREAM).toList()
        } else {
            @Suppress("DEPRECATION")
            midi.devices.toList()
        }
        // A device with no output port would open to silence.
        return all.filter { it.outputPortCount > 0 }
    }

    private fun nameOf(info: MidiDeviceInfo): String {
        val props = info.properties
        return props.getString(MidiDeviceInfo.PROPERTY_NAME)
            ?: listOfNotNull(
                props.getString(MidiDeviceInfo.PROPERTY_MANUFACTURER),
                props.getString(MidiDeviceInfo.PROPERTY_PRODUCT),
            ).joinToString(" ").ifEmpty { "MIDI device" }
    }

    private fun open() {
        val midi = manager ?: return
        if (device != null) return

        val candidates = readableDevices(midi)
        if (candidates.isEmpty()) {
            onStatus("No MIDI device. Connect the Sway through a USB-C hub that supplies power.")
            return
        }
        val info = candidates.firstOrNull { nameOf(it).lowercase().contains(preferred) }
            ?: candidates.first()

        midi.openDevice(info, { opened ->
            if (opened == null) {
                onStatus("Could not open ${nameOf(info)}")
                return@openDevice
            }
            val port = opened.openOutputPort(0)
            if (port == null) {
                onStatus("${nameOf(info)} has no readable port")
                opened.close()
                return@openDevice
            }
            port.connect(receiver)
            device = opened
            openedName = nameOf(info)
            Log.i(TAG, "opened $openedName")
            onStatus(openedName ?: "MIDI connected")
        }, main)
    }

    private fun close() {
        try {
            device?.close()
        } catch (err: Exception) {
            Log.w(TAG, "close failed", err)
        }
        device = null
        openedName = null
    }

    private companion object {
        const val TAG = "SwayMidi"
        const val FLUSH_MS = 16L
    }
}
