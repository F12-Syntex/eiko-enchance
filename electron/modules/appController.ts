import { ipcMain, dialog } from 'electron'


// Module
// ======
export default () => {
  ipcMain.handle('update', async (event, options?: Electron.OpenDialogOptions) => {
    console.log('update');
    return { message: 'success' }
  })


  console.log('[-] MODULE::app controller Initialized')
}