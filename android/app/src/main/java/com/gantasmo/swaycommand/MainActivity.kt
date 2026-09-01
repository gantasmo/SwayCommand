package com.gantasmo.swaycommand

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewFeature
import androidx.webkit.WebViewCompat

/**
 * The cockpit, hosted in a WebView, with the phone acting as the brains.
 *
 * The web bundle is the same one theDAW embeds. Two things make it work here.
 *
 * SERVED, NOT LOADED FROM FILE. WebViewAssetLoader publishes the assets under
 * https://appassets.androidplatform.net, which is a secure origin. A file://
 * page is not, and without a secure context getUserMedia refuses to hand over
 * the microphone and AudioWorklet refuses to load its module, so the analyser
 * would have no signal and the synth no voice. The bundle is built with
 * `--base=/assets/` to match the path published below.
 *
 * THE HOST OWNS MIDI. A WebView implements no Web MIDI API, so the flag injected
 * before app.js runs tells midi.js to take its relay path, and MidiBridge feeds
 * it bytes from android.media.midi.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var midi: MidiBridge? = null

    private val askForMicrophone =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            pendingAudio?.let { request ->
                if (granted) request.grant(request.resources) else request.deny()
                pendingAudio = null
            }
        }

    private var pendingAudio: PermissionRequest? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // A performance surface that dims mid-set is a failure, and the visuals
        // are the whole output.
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        goFullscreen()

        web = WebView(this)
        setContentView(web)

        WebView.setWebContentsDebuggingEnabled(BuildConfigDebug)

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            // Scenes and samples start themselves; requiring a gesture per
            // element would silence the timeline.
            mediaPlaybackRequiresUserGesture = false
            // Everything is served from the asset loader, so the WebView never
            // needs direct filesystem reach.
            allowFileAccess = false
            allowContentAccess = false
            setSupportZoom(false)
            builtInZoomControls = false
        }

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest,
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

            override fun onPageFinished(view: WebView, url: String) {
                // Fallback for a WebView too old for document-start scripts. The
                // flag arrives late here, so MIDI relay may miss the first
                // frames; the modern path above is what normally runs.
                if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                    view.evaluateJavascript(HOST_SCRIPT, null)
                }
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                val wantsAudio = request.resources.any {
                    it == PermissionRequest.RESOURCE_AUDIO_CAPTURE
                }
                if (!wantsAudio) {
                    request.deny()
                    return
                }
                val granted = ContextCompat.checkSelfPermission(
                    this@MainActivity,
                    Manifest.permission.RECORD_AUDIO,
                ) == PackageManager.PERMISSION_GRANTED

                if (granted) {
                    request.grant(request.resources)
                } else {
                    // The page asked before Android did. Hold the request, ask,
                    // and answer it from the callback.
                    pendingAudio = request
                    askForMicrophone.launch(Manifest.permission.RECORD_AUDIO)
                }
            }
        }

        // Must be installed before the document runs: app.js reads the flag
        // while deciding whether to open MIDI hardware itself.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(web, HOST_SCRIPT, setOf(ORIGIN))
        }

        midi = MidiBridge(this, web) { status ->
            runOnUiThread {
                web.evaluateJavascript(
                    "window.__swayHost && window.__swayHost.status(${jsString(status)});",
                    null,
                )
            }
        }

        web.loadUrl("$ORIGIN/assets/index.html")
    }

    override fun onStart() {
        super.onStart()
        midi?.start()
        web.evaluateJavascript("window.__swayHost && window.__swayHost.visible(true);", null)
    }

    override fun onStop() {
        // A hidden tab that keeps rendering burns the battery for nothing, and
        // the port has to be released so another application can take it.
        web.evaluateJavascript("window.__swayHost && window.__swayHost.visible(false);", null)
        midi?.stop()
        super.onStop()
    }

    override fun onDestroy() {
        midi?.stop()
        web.destroy()
        super.onDestroy()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) goFullscreen()
    }

    @Suppress("DEPRECATION")
    private fun goFullscreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.hide(android.view.WindowInsets.Type.systemBars())
        } else {
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        }
    }

    private fun jsString(value: String) =
        "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

    private companion object {
        const val ORIGIN = "https://appassets.androidplatform.net"

        // BuildConfig is not generated unless buildFeatures.buildConfig is on,
        // and one boolean is not worth the extra generated class.
        val BuildConfigDebug = true

        /**
         * Installed before the document runs.
         *
         * The relay flag has to be readable synchronously by midi.js, and the
         * adapter turns native pushes into the postMessage shape host-channel.js
         * already listens for. Posting to `window` rather than a parent is what
         * makes the same contract work top level: host-channel accepts a message
         * whose source is window.parent, and at the top of a frame tree
         * window.parent is window.
         */
        const val HOST_SCRIPT = """
            (function () {
              if (window.__swayHost) return;
              window.__SWAY_HOST_MIDI__ = true;
              window.__SWAY_HOST_NAME__ = 'Android USB MIDI';
              window.__swayHost = {
                midi: function (messages) {
                  for (var i = 0; i < messages.length; i++) {
                    window.postMessage({ type: 'sway/midi', data: messages[i], v: 1 }, '*');
                  }
                },
                visible: function (on) {
                  window.postMessage({ type: 'sway/visibility', visible: !!on, v: 1 }, '*');
                },
                status: function (text) {
                  window.__swayHostStatus = text;
                  window.dispatchEvent(new CustomEvent('sway-host-status', { detail: text }));
                }
              };
            })();
        """
    }
}
