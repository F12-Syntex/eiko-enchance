import { exec } from 'child_process'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import type { Model } from '~/src/types/model'

export default defineEventHandler(async (event) => {
  const methodName = event.node.req.headers['x-method-name'] as string

  const methodMap: { [key: string]: Function } = {
    upscale: async () => {
      const body = await readBody(event)
      return upscale(body.aiModel, body.scaleRatio, body.exportFilePath, body.cacheDir, body.sourceFile, body.outputFile)
    }
  }

  if (methodName && methodName in methodMap) {
    return await methodMap[methodName]()
  } else {
    return { error: 'Unsupported method' }
  }
})

async function upscale(modelInfo: Model, scaleRatio: any, exportFilePath: any, cacheDir: any, sourceFile: any, outputFile: any) {
  //first determine if it's an image or a video
  //if it's an image, upscale its
  //if it's a video, extract the frames, upscale them, and recompile the video

  // const executable = documents -> eiko -> models -> modelInfo.execusionScriptPath
  const documentsPath = path.join(os.homedir(), 'Documents')
  const models = path.join(documentsPath, 'eiko', 'models')
  const executable = path.join(models, modelInfo.execusionScriptPath)

  //check if it's an image
  if (sourceFile.endsWith('.jpg') || sourceFile.endsWith('.jpeg') || sourceFile.endsWith('.png')) {
    const name = modelInfo.name.split('.bin')[0]

    //run the realesrgan-ncnn-vulkan executable pass the source file, with the scale ratio and model then save the output to the export file path
    //-m ${name}
    console.log('outputFile', outputFile)
    // fs.writeFileSync(outputFile, '')

    const command = `${executable} -i ${sourceFile} -o ${outputFile} -n ${name} -s ${scaleRatio}`
    console.log(command)

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return { error: error.message }
      }
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    })
  }

  return { message: 'C:/Users/username/Documents/eiko/models' }
}
