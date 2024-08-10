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
    //return all the file objects in the given path
    const files = fs.readdirSync(path).map((file) => {
      const filePath = paths.join(path, file)
      //return the file object such as .isDirectory(), .isFile(), .size, .name, .ext, .path
      //also make the file available in the frontend as currently it doesnt have permission to access the file
      return {
        isDirectory: fs.statSync(filePath as fs.PathLike).isDirectory(), 
        isFile: fs.statSync(filePath as fs.PathLike).isFile(),
        size: fs.statSync(filePath as fs.PathLike).size, 
        name: file, 
        ext: paths.extname(file),
        absulutePath: filePath,
      }
    })

    return files
  })

  console.log('[-] MODULE::explorer Initialized')
}
