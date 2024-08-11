import { exec } from 'child_process'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import type { Model } from '~/src/types/model'
import { defineEventHandler, H3Event, readBody } from 'h3'
import { ref } from 'vue'

const progressRef = ref(0)

async function upscale(event: H3Event, modelInfo: Model, scaleRatio: number, exportFilePath: string, cacheDir: string, sourceFile: string, advcancedOptions: any) {
  const isImage = /\.(jpg|jpeg|png)$/i.test(sourceFile)
  const isVideo = /\.(mp4|avi|mov|mkv|vlc)$/i.test(sourceFile)

  if (isImage) {
    return upscaleImage(modelInfo, scaleRatio, exportFilePath, sourceFile)
  } else if (isVideo) {
    return upscaleVideo(modelInfo, scaleRatio, exportFilePath, cacheDir, sourceFile)
  }

  return { message: 'Unsupported file type' }
}

function upscaleImage(modelInfo: Model, scaleRatio: number, exportFilePath: string, sourceFile: string) {
  const documentsPath = path.join(os.homedir(), 'Documents')
  const modelsDir = path.join(documentsPath, 'eiko', 'models')
  const executable = path.join(modelsDir, modelInfo.execusionScriptPath)
  const modelName = modelInfo.name.split('.bin')[0]
  const fileName = path.basename(sourceFile)
  const outputFile = path.join(exportFilePath, `upscaled_${Math.floor(Math.random() * 1000)}_${fileName}`)

  let command = `${executable} -i ${sourceFile} -o ${outputFile} -n ${modelName}`
  if (scaleRatio > 1 && scaleRatio < 5) {
    command += ` -s ${scaleRatio}`
  }

  return executeCommand(command, outputFile)
}

function upscaleVideo(modelInfo: Model, scaleRatio: number, exportFilePath: string, cacheDir: string, sourceFile: string) {
  console.log('Upscaling video')
  const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
  const ffmpegPath = findExecutable(modelsPath, 'ffmpeg.exe')
  const ffprobPath = findExecutable(modelsPath, 'ffprobe.exe')

  if (!ffmpegPath || !ffprobPath) {
    return { error: 'FFmpeg not found in models directory' }
  }

  const randomConstant = Math.floor(Math.random() * 1000)

  const fileName = path.basename(sourceFile).split('.')[0]
  const outputDir = path.join(exportFilePath, `${fileName}_raw_frames(${randomConstant})`)
  const audioPath = path.join(exportFilePath, `${fileName}${randomConstant}_audio.aac`)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  const extractFramesCmd = `${ffmpegPath} -i "${sourceFile}" "${outputDir}\\%04d.png"`
  const extractAudioCmd = `${ffmpegPath} -i "${sourceFile}" -vn -acodec copy "${audioPath}"`

  return Promise.all([upscaleVideoScript(extractFramesCmd), upscaleVideoScript(extractAudioCmd)]).then(async () => {
    const frameRate = await getFrameRate(ffmpegPath, sourceFile)
    const totalFrames = getTotalFrames(outputDir)

    const upscaledFramesDir = path.join(exportFilePath, `${fileName}_upscaled_frames(${randomConstant})`)
    if (!fs.existsSync(upscaledFramesDir)) {
      fs.mkdirSync(upscaledFramesDir)
    }

    return upscaleVideoFrames(outputDir, modelInfo, scaleRatio, upscaledFramesDir, cacheDir, totalFrames, frameRate).then(() => {
      const outputVideoPath = path.join(exportFilePath, `${fileName}_upscaled(${randomConstant}).mp4`)
      return createVideoFromFramesWithAudio(ffmpegPath, upscaledFramesDir, audioPath, outputVideoPath, frameRate)
    })
  })
}
async function getFrameRate(ffmpegPath: string, sourceFile: string): Promise<number> {
  const command = `${ffmpegPath} -i "${sourceFile}"`
  const response = await executeCommand(command, '', true)
  const output = response.output || ''
  const match = output.match(/(\d+\.?\d*) fps/)
  const fps = match ? parseFloat(match[1]) : 30
  console.log(`Frame rate: ${fps}`)
  return fps
}

function createVideoFromFramesWithAudio(ffmpegPath: string, outputDir: string, audioPath: string, exportFilePath: string, frameRate: number) {
  const command = `${ffmpegPath} -framerate ${frameRate} -i ${outputDir}\\%04d.png -i "${audioPath}" -c:v libx264 -profile:v high -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -threads 0 -stats -progress pipe:1 ${exportFilePath}`
  return executeCommand(command, exportFilePath)
}

function getTotalFrames(dir: string): number {
  const files = fs.readdirSync(dir)
  return files.length
}

function upscaleVideoScript(command: string) {
  return new Promise((resolve, reject) => {
    const process = exec(command)

    process.on('close', (code) => {
      console.log(`close >> child process exited with code ${code}`)
      if (code === 0) {
        resolve({})
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })

    process.on('error', (error) => {
      reject(error)
    })
  })
}

function findExecutable(dir: string, executableName: string): string | null {
  let foundPath: string | null = null
  const searchDir = (currentDir: string) => {
    fs.readdirSync(currentDir).forEach((file) => {
      const filePath = path.join(currentDir, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        searchDir(filePath)
      } else if (file === executableName) {
        foundPath = filePath
      }
    })
  }
  searchDir(dir)
  return foundPath
}

function executeCommand(command: string, outputFile: string, returnOutput = false): Promise<{ filePath?: string, output?: string }> {
  return new Promise((resolve, reject) => {
    const process = exec(command)

    let output = ''

    process.stdout?.on('data', (data: string) => {
      output += data
    })

    process.stderr?.on('data', (data: string) => {
      output += data
    })

    process.on('close', (code: number) => {
      console.log(`close >> child process exited with code ${code}`)
      if (code === 0) {
        if (returnOutput) {
          resolve({ output })
        } else {
          resolve(outputFile ? { filePath: outputFile } : {})
        }
      } else {
        // reject(new Error(`Process exited with code ${code}`))
        resolve({ output })
      }
    })

    process.on('error', (error: Error) => {
      reject(error)
    })
  })
}

function createVideoFromFrames(ffmpegPath: string, outputDir: string, exportFilePath: string, frameRate: number) {
  const command = `${ffmpegPath} -framerate ${frameRate} -i ${outputDir}\\%04d.png -c:v libx264 -profile:v high -crf 20 -pix_fmt yuv420p -threads 0 -stats -progress pipe:1 ${exportFilePath}`
  return executeCommand(command, exportFilePath)
}

function upscaleVideoFrames(outputDir: string, modelInfo: Model, scaleRatio: number, exportFilePath: string, cacheDir: string, totalFrames: number, frameRate: number) {
  const modelName = modelInfo.name.split('.bin')[0]
  const executable = path.join(os.homedir(), 'Documents', 'eiko', 'models', modelInfo.execusionScriptPath)
  const command = `${executable} -i ${outputDir} -o ${exportFilePath} -n ${modelName} fps=${frameRate}`

  return new Promise((resolve, reject) => {
    const process = exec(command)

    process.stderr?.on('data', (data) => {
      if (data.includes('%')) {
        const progress = parseFloat(data.split('%')[0].trim())
        // console.log(`Frame progress: ${progress}%`)

        // console.log('Progress:', data)

        // Count the number of files in the export directory
        const processedFrames = fs.readdirSync(exportFilePath).length

        // Calculate overall progress
        progressRef.value = Math.floor((processedFrames / totalFrames + progress / 100 / totalFrames) * 100)
        // console.log(`Overall progress: ${progressRef.value.toFixed(2)}%`)
      }
    })

    process.on('close', (code) => {
      progressRef.value = 0
      if (code === 0) {
        resolve({})
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })

    process.on('error', (error) => {
      reject(error)
    })
  })
}

export default defineEventHandler(async (event) => {
  const methodName = event.node.req.headers['x-method-name'] as string
  const methodMap: { [key: string]: Function } = {
    upscale: async () => {
      const body = await readBody(event)
      return upscale(event, body.aiModel, body.scaleRatio, body.exportFilePath, body.cacheDir, body.sourceFile, body.advancedOptions)
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
  const currentProgress = progressRef.value || 0
  return { progress: currentProgress }
}
