export default function useElectron() {
  const isServer = process.server || typeof window === 'undefined' || typeof window.require === 'undefined'
  const isElectron = !isServer && navigator.userAgent.toLowerCase().includes('electron')
  if (!isElectron || isServer) return { isElectron }

  // Initialize electron
  const electron = window.require('electron')

  // Window title bar actions
  // ========================
  const titleBarActions = {
    minimize: () => electron.ipcRenderer.invoke('titlebar:action', 'minimize'),
    toggleMaximize: () => electron.ipcRenderer.invoke('titlebar:action', 'toggleMaximize'),
    isMaximized: () => electron.ipcRenderer.invoke('isMaximized:app', null),
    close: () => electron.ipcRenderer.invoke('close:app', null)
  }

  const fileExplorer = {
    openFileDialog: async (options = {}) => {
      const defaultOptions = {
        properties: ['openFile'],
        filters: [{ name: 'All Files', extensions: ['*'] }]
      }
      const dialogOptions = { ...defaultOptions, ...options }

      try {
        if (!electron.ipcRenderer.invoke) {
          throw new Error('ipcRenderer.invoke is not available. Make sure you are using a recent version of Electron.')
        }
        const result = await electron.ipcRenderer.invoke('dialog:openFile', dialogOptions)
        return result
      } catch (error) {
        console.error('Error opening file dialog:', error)
        throw error // Re-throw the error so the caller can handle it
      }
    },
    openFileDialogFolder: async (options = {}) => {
      const defaultOptions = {
        properties: ['openDirectory']
      }
      const dialogOptions = { ...defaultOptions, ...options }

      try {
        if (!electron.ipcRenderer.invoke) {
          throw new Error('ipcRenderer.invoke is not available. Make sure you are using a recent version of Electron.')
        }
        const result = await electron.ipcRenderer.invoke('dialog:openFolder', dialogOptions)
        return result
      } catch (error) {
        console.error('Error opening folder dialog:', error)
        throw error // Re-throw the error so the caller can handle it
      }
    },
    exploreFolder: async (path: string) => {
      try {
        if (!electron.ipcRenderer.invoke) {
          throw new Error('ipcRenderer.invoke is not available. Make sure you are using a recent version of Electron.')
        }
        const result = await electron.ipcRenderer.invoke('dialog:getFiles', path)
        return result
      } catch (error) {
        console.error('Error exploring folder:', error)
        throw error // Re-throw the error so the caller can handle it
      }
    }
  }

  const controller = {
    update: async (options = {}) => {
      try {
        if (!electron.ipcRenderer.invoke) {
          throw new Error('ipcRenderer.invoke is not available. Make sure you are using a recent version of Electron.')
        }

        const result = await electron.ipcRenderer.invoke('update', options)
        return result
      } catch (error) {
        console.error('Error updating app:', error)
        throw error // Re-throw the error so the caller can handle it
      }
    }
  }

  // Window title bar stats
  // ======================
  const windowStats = ref({
    isMaximized: false,
    isFullscreen: false
  })

  electron.ipcRenderer.on('window:maximizeChanged', (_event, value) => {
    windowStats.value.isMaximized = value
  })
  electron.ipcRenderer.on('window:fullscreenChanged', (_event, value) => {
    windowStats.value.isFullscreen = value
  })

  // Initialize ipcRenderer
  return { isElectron, titleBarActions, windowStats, fileExplorer, controller }
}
