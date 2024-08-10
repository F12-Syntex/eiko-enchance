import { exec } from 'child_process'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import type { Model } from '~/src/types/model'
import { defineEventHandler, H3Event, readBody } from 'h3'
import { ref } from 'vue'
import aiModels from '../../controller/ai-models'
import Settings from '~/src/pages/Settings.vue'
import SettingsManager from '~/src/managers/SettingsManager'

const progressRef = ref(0)

async function upscale(event: H3Event, modelInfo: Model, scaleRatio: any, exportFilePath: any, cacheDir: any, sourceFile: any) {
  const documentsPath = path.join(os.homedir(), 'Documents')
  const models = path.join(documentsPath, 'eiko', 'models')
  const executable = path.join(models, modelInfo.execusionScriptPath)

  if (sourceFile.endsWith('.jpg') || sourceFile.endsWith('.jpeg') || sourceFile.endsWith('.png')) {
    const modelName = modelInfo.name.split('.bin')[0]
    const fileName = path.basename(sourceFile)
    const outputFile = path.join(exportFilePath, `upscaled_${Math.floor(Math.random() * 1000)}_${fileName}`)
    let command = `${executable} -i ${sourceFile} -o ${outputFile} -n ${modelName}`

    if (scaleRatio > 1 && scaleRatio < 5) {
      command += ` -s ${scaleRatio}`
    }

    return new Promise((resolve, reject) => {
      const upscaleProcess = exec(command)

      upscaleProcess.stderr?.on('data', (data) => {
        if (data.includes('%')) {
          const progress = data.split('%')[0].trim()
          console.log(`progress: ${progress}`)
          progressRef.value = parseFloat(progress)
        }
      })

      upscaleProcess.on('close', (code) => {
        console.log(`close >> child process exited with code ${code}`)
        progressRef.value = 0
        if (code === 0) {
          resolve({ filePath: outputFile })
        } else {
          reject(new Error(`Upscale process exited with code ${code}`))
        }
      })

      upscaleProcess.on('error', (error) => {
        reject(error)
      })
    })
  } else if (sourceFile.endsWith('.mp4') || sourceFile.endsWith('.avi') || sourceFile.endsWith('.mov') || sourceFile.endsWith('.mkv') || sourceFile.endsWith('.vlc')) {
    console.log('Upscaling video')

    //check if the ffmpeg dependency is installed
    const modelsPath = path.join(process.env.HOME || process.env.USERPROFILE || '', 'Documents', 'eiko', 'models')

    //recursively search for the ffmpeg.exe executable in the models directory
    let ffmpegPath = ''
    const searchForFFmpeg = (dir: string) => {
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file)
        if (fs.lstatSync(filePath).isDirectory()) {
          searchForFFmpeg(filePath)
        }
        if (file === 'ffmpeg.exe') {
          ffmpegPath = filePath
        }
      })
    }
    searchForFFmpeg(modelsPath)

    if (!ffmpegPath || ffmpegPath === '') {
      return { error: 'FFmpeg not found in models directory' }
    }

    //first we will extract every frame from the video, then use realesrgan-ncnn to upscale the entire folder in one go using the directory as input
    const modelName = modelInfo.name.split('.bin')[0]
    const fileName = path.basename(sourceFile)
    const outputDir = path.join(exportFilePath, `upscaled_${Math.floor(Math.random() * 1000)}_${fileName.split('.')[0]}_frames`)

    //create the output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    //first extract all the frames to the output directory in the folder called {name}_frames
    const command = `${ffmpegPath} -i "${sourceFile}" -vframes 3 "${outputDir}\\%04d.png" -vframes 3`
    console.log(`command: ${command}`)

    const fps = 30;

    // only run the command for now
    return new Promise((resolve, reject) => {
      const upscaleProcess = exec(command)

      upscaleProcess.stderr?.on('data', (data) => {
        console.log(data)
      })

      upscaleProcess.on('close', (code) => {
        console.log(`close >> child process exited with code ${code}`)
        if (code === 0) {
          // resolve({ filePath: outputDir })
          // now we can upscale the entire folder pass all the frames to the upscale function and the variables

          const outputPathForUpscaledFrames = path.join(exportFilePath, `upscaled_${Math.floor(Math.random() * 1000)}_${fileName.split('.')[0]}_upscaled`)

          if (!fs.existsSync(outputPathForUpscaledFrames)) {
            fs.mkdirSync(outputPathForUpscaledFrames)
          }

          upscaleVideoFromFolder(outputDir, modelInfo, scaleRatio, outputPathForUpscaledFrames, cacheDir)
            .then((result) => {
              // now we can create a video from the upscaled frames
              const newExportPath = path.join(exportFilePath, `upscaled_${Math.floor(Math.random() * 1000)}_${fileName.split('.')[0]}_upscaled.mp4`)
              createVideoFromFrames(ffmpegPath, outputPathForUpscaledFrames, newExportPath, fps)
                .then((result) => {
                  resolve(result)
                })
                .catch((error) => {
                  reject(error)
                })
            })
            .catch((error) => {
              reject(error)
            })
        } else {
          reject(new Error(`Upscale process exited with code ${code}`))
        }
      })

      upscaleProcess.on('error', (error) => {
        reject(error)
      })
    })
  }

  return { message: 'C:/Users/username/Documents/eiko/models' }
}
function createVideoFromFrames(ffmpegPath: string, outputDir: string, exportFilePath: string, frameRate: any) {
  const command = `${ffmpegPath} -framerate ${frameRate} -i ${outputDir}\\%04d.png -c:v libx264 -profile:v high -crf 20 -pix_fmt yuv420p ${exportFilePath}`

  return new Promise((resolve, reject) => {
    const upscaleProcess = exec(command)

    upscaleProcess.stderr?.on('data', (data) => {
      console.log(data)
    })

    upscaleProcess.on('close', (code) => {
      console.log(`close >> child process exited with code ${code}`)
      if (code === 0) {
        resolve({ filePath: exportFilePath })
      } else {
        reject(new Error(`Upscale process exited with code ${code}`))
      }
    })

    upscaleProcess.on('error', (error) => {
      reject(error)
    })
  })
}

function upscaleVideoFromFolder(outputDir: string, modelInfo: Model, scaleRatio: any, exportFilePath: any, cacheDir: any) {
  const modelName = modelInfo.name.split('.bin')[0]
  const executable = path.join(process.env.HOME || process.env.USERPROFILE || '', 'Documents', 'eiko', 'models', modelInfo.execusionScriptPath)
  const command = `${executable} -i ${outputDir} -o ${exportFilePath} -n ${modelName}`

  return new Promise((resolve, reject) => {
    const upscaleProcess = exec(command)

    upscaleProcess.stderr?.on('data', (data) => {
      if (data.includes('%')) {
        const progress = data.split('%')[0].trim()
        console.log(`progress: ${progress}`)
        progressRef.value = parseFloat(progress)
      }
    })

    upscaleProcess.on('close', (code) => {
      console.log(`close >> child process exited with code ${code}`)
      progressRef.value = 0
      if (code === 0) {
        resolve({ filePath: exportFilePath })
      } else {
        reject(new Error(`Upscale process exited with code ${code}`))
      }
    })

    upscaleProcess.on('error', (error) => {
      reject(error)
    })
  })
}

export default defineEventHandler(async (event) => {
  const methodName = event.node.req.headers['x-method-name'] as string
  const methodMap: { [key: string]: Function } = {
    upscale: async () => {
      const body = await readBody(event)
      return upscale(event, body.aiModel, body.scaleRatio, body.exportFilePath, body.cacheDir, body.sourceFile)
    },
    getProgress: getProgress
  }

  if (methodName && methodName in methodMap) {
    return await methodMap[methodName]()
  } else {
    return { error: 'Unsupported method' }
  }
})

async function getProgress() {
  const currentProgress = progressRef.value ? progressRef.value : 0
  console.log(`currentProgress: ${currentProgress}`)
  const jsonResult = { progress: currentProgress }
  return jsonResult
}
