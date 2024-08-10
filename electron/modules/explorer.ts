import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import paths from 'path'

// Helpers
// =======
const getWindowFromEvent = (event: Electron.IpcMainInvokeEvent) => {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  return win
}

// Module
// ======
export default (mainWindow: BrowserWindow) => {
  ipcMain.handle('dialog:openFile', async (event, options?: Electron.OpenDialogOptions) => {
    const win = getWindowFromEvent(event)
    if (!win) return { canceled: true, filePaths: [] }

    const result = await dialog.showOpenDialog(win, options || {})
    return result
  })

  ipcMain.handle('dialog:saveFile', async (event, options?: Electron.SaveDialogOptions) => {
    const win = getWindowFromEvent(event)
    if (!win) return { canceled: true, filePath: undefined }

    const result = await dialog.showSaveDialog(win, options || {})
    return result
  })

  ipcMain.handle('dialog:showMessageBox', async (event, options: Electron.MessageBoxOptions) => {
    const win = getWindowFromEvent(event)
    if (!win) return { response: -1, checkboxChecked: false }

    const result = await dialog.showMessageBox(win, options)
    return result
  })

  ipcMain.handle('dialog:openFolder', async (event, options?: Electron.OpenDialogOptions) => {
    const win = getWindowFromEvent(event)
    if (!win) return { canceled: true, filePaths: [] }

    const result = await dialog.showOpenDialog(win, { ...options, properties: ['openDirectory'] })
    return result
  })

  ipcMain.handle('dialog:getFiles', async (event, path: string) => {
    //get all the absulute paths of the files in the folder
    const files = fs.readdirSync(path).map(file => {
      return paths.join(path, file)
    });

    return files
  })

  console.log('[-] MODULE::explorer Initialized')
}