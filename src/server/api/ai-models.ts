import { promises as fs } from 'fs'
import path from 'path'
import { Model } from '../../types/model'
import { installModule } from 'nuxt/kit'
import axios from 'axios'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import extractZip from 'extract-zip'

const REALESRGAN_SCRIPT = 'realesrgan-ncnn/realesrgan-ncnn-vulkan.exe'
const modelsCache: Model[] = [
  new Model(
    'realesrgan-ncnn',
    'A portable version of RealESRGAN for image upscaling. Contains 4 models: realesrgan-x4plus-anime, realesrgan-x4plus, realesrgan-x2plus, realesrgan-anime-video.',
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip',
    45471545,
    false,
    true,
    false,
    REALESRGAN_SCRIPT,
    ''
  ),

  new Model('realesr-animevideov3-x2.bin', 'A RealSR model trained on anime images for 2x upscaling.', '', 0, false, false, true, REALESRGAN_SCRIPT, 'realesrgan-ncnn/models/realesr-animevideov3-x2.bin'),
  new Model('realesr-animevideov3-x3.bin', 'A RealSR model trained on anime images for 3x upscaling.', '', 0, false, false, true, REALESRGAN_SCRIPT, 'realesrgan-ncnn/models/realesr-animevideov3-x3.bin'),
  new Model('realesr-animevideov3-x4.bin', 'A RealSR model trained on anime images for 4x upscaling.', '', 0, false, false, true, REALESRGAN_SCRIPT, 'realesrgan-ncnn/models/realesr-animevideov3-x4.bin'),
  new Model('realesrgan-x4plus-anime.bin', 'A RealESRGAN model trained on anime images for 4x upscaling.', '', 0, false, false, true, REALESRGAN_SCRIPT, 'realesrgan-ncnn/models/realesrgan-x4plus-anime.bin'),
  new Model('realesrgan-x4plus.bin', 'A RealESRGAN model trained on mixed images for 4x upscaling.', '', 0, false, false, true, REALESRGAN_SCRIPT, 'realesrgan-ncnn/models/realesrgan-x4plus.bin'),
  new Model('realesrgan-anime-video.bin', 'A RealESRGAN model trained on anime images for video upscaling.', '', 0, false, false, true, REALESRGAN_SCRIPT, 'realesrgan-ncnn/models/realesrgan-anime-video.bin'),
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
    },
    deleteModel: async () => {
      const body = await readBody(event)
      return deleteModel(body.model)
    },
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
          const realEsrganModelsFolder = path.join(realEsrganFolder, 'models')
          const realEsrganModels = await fs.readdir(realEsrganModelsFolder, { withFileTypes: true })

          installedModels.push(file)

          //push all .bin files in the real esrgan folder
          for (const realEsrganDirent of realEsrganModels) {
            if (realEsrganDirent.isFile() && realEsrganDirent.name.endsWith('.bin')) {
              //push the name without the bin extension
              // console.log(">> " + realEsrganDirent.name.trim())
              installedModels.push(realEsrganDirent.name.trim())
            }
          }
        }

        installedModels.push(dirent.name)
      }
    }

    let models: Model[] = []

    modelsCache.forEach((model) => {
      // console.log(model.name)
      if (installedModels.includes(model.name)) {
        model.setInstalled(true)
        // console.log(`Model ${model.name} is installed.`)
      }else{
        model.setInstalled(false)
        // console.log(`Model ${model.name} is not installed.`)
      }
      models.push(model)
    });

    // console.log("Models: " + models)

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


export async function deleteModel(model: Model) {
  const modelPath = path.join(process.env.HOME || process.env.USERPROFILE || '', 'Documents', 'eiko', 'models', model.name)
  try {
    await fs.rmdir(modelPath,
      {
        recursive: true
      })
    console.log(`Model ${model.name} deleted successfully.`)
  } catch (error) {
    console.error(`Error deleting model ${model.name}:`, error)
    throw error
  }
}

