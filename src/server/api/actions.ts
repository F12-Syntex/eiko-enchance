// import { dialog } from 'electron'
// import { BrowserWindow } from 'electron'

// export default defineEventHandler(async (event) => {
//   const methodName = event.node.req.headers['x-method-name'] as string

//   const methodMap: { [key: string]: Function } = {
//     exploreFileView: exploreFileView,
//   }

//   if (methodName && methodName in methodMap) {
//     return await methodMap[methodName]()
//   } else {
//     return { error: 'Unsupported method' }
//   }
// })

// async function exploreFileView() {
//   try {
//     const mainWindow = BrowserWindow.getFocusedWindow()
    
//     if (!mainWindow) {
//       throw new Error('No focused window found')
//     }

//     const result = await dialog.showOpenDialog(mainWindow, {
//       properties: ['openDirectory']
//     })

//     if (result.canceled) {
//       return { canceled: true }
//     } else {
//       const selectedFolder = result.filePaths[0]
//       return { folderPath: selectedFolder }
//     }
//   } catch (error) {
//     console.error('Error in exploreFileView:', error)
//     return { error: 'Failed to open file manager' }
//   }
// }