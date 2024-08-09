import { promises as fs } from 'fs'
import path from 'path'
import { Model } from '../../types/model'
import { installModule } from 'nuxt/kit'
import axios from 'axios'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import extractZip from 'extract-zip'

const modelsCache: Model[] = [
  new Model(
    'realesrgan-ncnn',
    'A portable version of RealESRGAN for image upscaling. Contains 4 models: realesrgan-x4plus-anime, realesrgan-x4plus, realesrgan-x2plus, realesrgan-anime-video.',
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip',
    45471545,
    false,
    true,
    false
  ),
  new Model('realesrgan-x4plus-anime', 'A RealESRGAN model trained on anime images for 4x upscaling.', '', 0, false, false, true),
  new Model('realesrgan-x4plus', 'A RealESRGAN model trained on mixed images for 4x upscaling.', '', 0, false, false, true),
  new Model('realesrgan-x2plus', 'A RealESRGAN model trained on mixed images for 2x upscaling.', '', 0, false, false, true),
  new Model('realesrgan-anime-video', 'A RealESRGAN model trained on anime images for video upscaling.', '', 0, false, false, true),
]

export default defineEventHandler(async (event) => {
  const modelsPath = path.join(process.env.HOME || process.env.USERPROFILE || '', 'Documents', 'eiko', 'models')

  try {
    await fs.access(modelsPath)
  } catch {
    await fs.mkdir(modelsPath, { recursive: true })
  }

  const methodName = event.node.req.headers['x-method-name'] as string

  const methodMap: { [key: string]: Function } = {
    getInstalledModels: () => getInstalledModels(modelsPath),
    getAllModels: getAllModels,
    installModel: async () => {
      const body = await readBody(event)
      return installModel(body.model, modelsPath)
    }
  }

  if (methodName && methodName in methodMap) {
    return await methodMap[methodName]()
  } else {
    return { error: 'Unsupported method' }
  }
})

async function getInstalledModels(modelsPath: string) {
  try {
    const modelFolders = await fs.readdir(modelsPath, { withFileTypes: true })
    // const installedModels = modelFolders.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)

    let installedModels: string[] = []

    for (const dirent of modelFolders) {
      if (dirent.isDirectory()) {
        const file = dirent.name

        if (file === 'realesrgan-ncnn') {
          //push all the installed models in the real esrgan folder which would be located in the models folder inside of real esrgan
          const realEsrganFolder = path.join(modelsPath, file)
          const realEsrganModels = await fs.readdir(realEsrganFolder, { withFileTypes: true })

          //push all .bin files in the real esrgan folder
          for (const realEsrganDirent of realEsrganModels) {
            if (realEsrganDirent.isFile() && realEsrganDirent.name.endsWith('.bin')) {
              installedModels.push(realEsrganDirent.name)
            }
          }
        }

        installedModels.push(dirent.name)
      }
    }

    let models: Model[] = []
    for (const model of modelsCache) {
      if (installedModels.includes(model.name)) {
        model.setInstalled(true)
      }
      models.push(model)
    }



    return { models: models }
  } catch (error) {
    return { error: 'Could not retrieve models.' }
  }
}

async function getAllModels() {
  return { models: modelsCache }
}

export async function installModel(model: Model, modelsPath: string) {
  const downloadUrl = model.downloadUrl
  const downloadSize = model.fileSize

  try {
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / downloadSize)
        console.log(`Download progress: ${percentCompleted}%`)
      },
    })

    const zipFilePath = path.join(modelsPath, `${model.name}.zip`)
    const writer = createWriteStream(zipFilePath)

    await pipeline(response.data, writer)

    const extractPath = path.join(modelsPath, model.name)
    await extractZip(zipFilePath, { dir: extractPath })

    await fs.unlink(zipFilePath)

    console.log(`Model ${model.name} installed successfully.`)
    return { message: `Model ${model.name} installed successfully.` }
  } catch (error) {
    console.error(`Error installing model ${model.name}:`, error)
    return { error: `Error installing model ${model.name}. Please try again.` }
  }
}
