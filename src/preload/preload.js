// Preload, the entire IPC surface the renderer sees, behind contextBridge.

'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('swaycommand', {
  info: () => ipcRenderer.invoke('app:info'),

  // .gan web-plugins: pick / unpack / list; the page itself loads from gan://.
  plugins: {
    pickGan: () => ipcRenderer.invoke('gan:pick'),
    openGan: (ganPath) => ipcRenderer.invoke('gan:open', ganPath),
    listGan: () => ipcRenderer.invoke('gan:list'),
    removeGan: (id) => ipcRenderer.invoke('gan:remove', id),
  },

  // VST3 hosting through the pedalboard sidecar (main/vsthost.js).
  vst: {
    status: () => ipcRenderer.invoke('vst:status'),
    setPython: (py) => ipcRenderer.invoke('vst:setPython', py),
    pickPython: () => ipcRenderer.invoke('vst:pickPython'),
    scan: (refresh) => ipcRenderer.invoke('vst:scan', refresh),
    params: (pluginPath, state) => ipcRenderer.invoke('vst:params', pluginPath, state),
    render: (inputPath, plugins, opts) => ipcRenderer.invoke('vst:render', inputPath, plugins, opts),
    editor: (pluginPath, state) => ipcRenderer.invoke('vst:editor', pluginPath, state),
  },

  doctor: {
    run: () => ipcRenderer.invoke('doctor:run'),
    fix: (fixId) => ipcRenderer.invoke('doctor:fix', fixId),
    onFixProgress: (cb) => {
      const handler = (_e, data) => cb(data);
      ipcRenderer.on('fix:progress', handler);
      return () => ipcRenderer.removeListener('fix:progress', handler);
    },
  },

  project: {
    openDialog: () => ipcRenderer.invoke('project:openDialog'),
    saveDialog: (name) => ipcRenderer.invoke('project:saveDialog', name),
    read: (filePath) => ipcRenderer.invoke('project:read', filePath),
    write: (filePath, doc) => ipcRenderer.invoke('project:write', filePath, doc),
    recent: () => ipcRenderer.invoke('project:recent'),
    templates: () => ipcRenderer.invoke('project:templates'),
    readTemplate: (id) => ipcRenderer.invoke('project:readTemplate', id),
  },

  docs: {
    list: () => ipcRenderer.invoke('docs:list'),
    read: (id) => ipcRenderer.invoke('docs:read', id),
  },

  files: {
    pickAudio: () => ipcRenderer.invoke('files:pickAudio'),
    readAudio: (filePath) => ipcRenderer.invoke('files:readAudio', filePath),
    statAudio: (filePath) => ipcRenderer.invoke('files:statAudio', filePath),
    // The OS path of a File dropped onto the window (drag-and-drop import).
    pathOf: (file) => {
      try {
        return webUtils.getPathForFile(file);
      } catch {
        return '';
      }
    },
  },

  platform: {
    systemAudio: () => ipcRenderer.invoke('platform:systemAudio'),
  },

  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (patch) => ipcRenderer.invoke('settings:set', patch),
  },

  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
});
