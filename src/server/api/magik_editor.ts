import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import settings from '../../managers/SettingsManager'
import { exec, execSync } from 'child_process'
import { promisify } from 'util'

let cachePath = ''

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = magikvideo(body)
  return result
})

let fps = 30

async function magikvideo(data: any) {
  cachePath = data.cacheDirectory
  const videoPath = data.videoPaths

  if (!videoPath) {
    throw new Error('videoPath is required')
  }

  const folderpath = path.join(cachePath, Math.random().toString(36).substring(7))

  // Create the folder
  if (!fs.existsSync(folderpath)) {
    fs.mkdirSync(folderpath, { recursive: true })
  }

  const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
  const ffmpegPath = findExecutable(modelsPath, 'ffmpeg.exe')

  let prefix = 1
  const audios = await Promise.all(
    videoPath.map(async (video: string) => {
      console.log('Processing video:', video)

      if (!ffmpegPath) {
        throw new Error('FFmpeg not found in models directory')
      }

      fps = await getFrameRate(ffmpegPath, video)

      const audio = await processVideo(prefix, video, folderpath)
      console.clear()
      console.log('Audio:', audio)
      console.log('Done processing video:', prefix)
      prefix++
      return audio
    })
  )

  const randomVideoName = Math.random().toString(36).substring(7)
  const outputVideoPath = path.join(cachePath, randomVideoName + '.mp4')

  // Now we construct the video using the audio + folder + framerate of 30
  const command = `${ffmpegPath} -framerate ${fps} -i "${folderpath}\\%04d.png" -i "${audios[0]}" -c:v libx264 -c:a mp3 -strict experimental -pix_fmt yuv420p -shortest "${outputVideoPath}"`
  console.log('Creating video:', command)

  // Uncomment these lines when you're ready to execute the command
  const response = await executeCommand(command)
  console.log('Video created:', response)

  return {}
}

async function processVideo(prefix: number, videoPath: string, folderpath: string): Promise<string> {
  const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
  const ffmpegPath = findExecutable(modelsPath, 'ffmpeg.exe')

  //make the folder if it doesn't exist
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true })
  }

  if (!ffmpegPath) {
    throw new Error('FFmpeg or FFprobe not found in models directory')
  }

  //   extract the audio from the video
  const audioPath = await extractAudio(ffmpegPath, videoPath, cachePath)

  //figure out in seconds the key sounds from the audio
  const keyAudioFrames = await getMusicBeatTimeInSecondsArray(audioPath)
  const updatedAudioPath = await createVideoFromKeySounds(prefix, videoPath, audioPath, keyAudioFrames, folderpath)

  return updatedAudioPath
}

async function getMusicBeatTimeInSecondsArray(audioPath: string){
  console.log('Attempting to read audio file:', audioPath)

  if (!fs.existsSync(audioPath)) {
    throw new Error('Audio file does not exist: ' + audioPath)
  }

  try {
    fs.accessSync(audioPath, fs.constants.R_OK)
  } catch (err) {
    throw new Error('No read access to audio file: ' + audioPath)
  }

  try {
    const randomName = Math.random().toString(36).substring(7)

    const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
    const audiowaveformPath = findExecutable(modelsPath, 'audiowaveform.exe')
    const waveformJsonPath = path.join(cachePath, randomName + '.json')

    // Run audiowaveform to generate waveform data
    const command = `"${audiowaveformPath}" -i "${audioPath}" -o "${waveformJsonPath}" --pixels-per-second 10 --output-format json`
    execSync(command)

    // Read the waveform data
    const waveformData = JSON.parse(fs.readFileSync(waveformJsonPath, 'utf8'))

    const beats: number[] = []

    // Smoothing the waveform data to reduce noise
    const smoothedData = smoothWaveformData(waveformData.data, 5) // Adjust the smoothing window as needed

    // Calculate an adaptive threshold based on the average amplitude
    const threshold = calculateAdaptiveThreshold(smoothedData)

    // Detect beats/spikes in the smoothed waveform data
    for (let i = 1; i < smoothedData.length - 1; i++) {
      const prev = smoothedData[i - 1]
      const curr = smoothedData[i]
      const next = smoothedData[i + 1]

      // Detect a peak that is greater than both its neighbors and above the threshold
      if (curr > prev && curr > next && curr > threshold) {
        const timeInSeconds = i / 10 // Since we used 10 pixels per second
        beats.push(timeInSeconds)
      }
    }

    console.log('Number of beats detected:', beats.length)

    // Optionally, filter the beats further using a threshold
    const beatRanges = createBeatRanges(beats, 0.5) // Adjust threshold as needed
    return beatRanges
  } catch (err) {
    console.error('Error processing audio file:', err)
    throw err
  }
}

// Function to smooth the waveform data using a simple moving average
function smoothWaveformData(data: number[], windowSize: number): number[] {
  const smoothed = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize)
    const end = Math.min(data.length, i + windowSize + 1)
    const window = data.slice(start, end)
    const average = window.reduce((sum, value) => sum + value, 0) / window.length
    smoothed.push(average)
  }
  return smoothed
}

// Function to calculate an adaptive threshold based on the average amplitude
function calculateAdaptiveThreshold(data: number[]): number {
  const averageAmplitude = data.reduce((sum, value) => sum + value, 0) / data.length
  return averageAmplitude * 1.5 // Adjust multiplier as needed
}

async function getMusicBeatTimeInSecondsArray1(audioPath: string) {
  console.log('Attempting to read audio file:', audioPath)

  if (!fs.existsSync(audioPath)) {
    throw new Error('Audio file does not exist: ' + audioPath)
  }

  try {
    fs.accessSync(audioPath, fs.constants.R_OK)
  } catch (err) {
    throw new Error('No read access to audio file: ' + audioPath)
  }

  try {
    const audioBuffer = fs.readFileSync(audioPath)
    console.log('Successfully read audio file, size:', audioBuffer.length)

    const sampleRate = 44100 // You might want to detect this from the file if possible
    const bytesPerSample = 2
    const samples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / bytesPerSample)

    console.log('Number of samples:', samples.length)
    console.log('Duration in seconds:', samples.length / sampleRate)

    const windowSize = 1024
    const hopSize = 512
    const threshold = 1.02
    const waitTime = 0.3 // Minimum time between beats in seconds

    const beats: number[] = []
    let energyHistory: number[] = []
    let lastBeatTime = -waitTime

    for (let i = 0; i < samples.length - windowSize; i += hopSize) {
      let energy = 0
      for (let j = 0; j < windowSize; j++) {
        energy += Math.abs(samples[i + j])
      }
      energyHistory.push(energy)

      if (energyHistory.length > 43) {
        const averageEnergy = energyHistory.reduce((a, b) => a + b) / energyHistory.length
        const currentTime = i / sampleRate

        if (energy > averageEnergy * threshold && currentTime - lastBeatTime >= waitTime) {
          beats.push(currentTime)
          lastBeatTime = currentTime
        }

        energyHistory.shift()
      }
    }

    console.log('Number of beats detected:', beats.length)
    console.log('First few beats:', beats.slice(0, 5))
    console.log('Last few beats:', beats.slice(-5))

    const beatRanges = createBeatRanges(beats, 0.5)

    return beatRanges
  } catch (err) {
    console.error('Error processing audio file:', err)
    throw err
  }
}

function createBeatRanges(beats: number[], rangeSize: number = 0.5): [number, number][] {
  let ranges: [number, number][] = beats.map((beat) => [Math.max(0, beat - rangeSize), beat + rangeSize])

  // Merge overlapping ranges
  ranges.sort((a, b) => a[0] - b[0])
  let mergedRanges: [number, number][] = []
  for (let range of ranges) {
    if (!mergedRanges.length || range[0] > mergedRanges[mergedRanges.length - 1][1]) {
      mergedRanges.push(range)
    } else {
      mergedRanges[mergedRanges.length - 1][1] = Math.max(mergedRanges[mergedRanges.length - 1][1], range[1])
    }
  }

  return mergedRanges
}
async function createVideoFromKeySounds(prefix: number, originalVideo: string, audioPath: string, keySounds: number[][], videoPath: string) {
  const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
  const ffmpegPath = findExecutable(modelsPath, 'ffmpeg.exe')

  if (!ffmpegPath) {
    throw new Error('FFmpeg or FFprobe not found in models directory')
  }

  //extract the video frames using the time stamps in the key frames
  const updated_audio = await extractFramesFromVideo(prefix, originalVideo, keySounds, videoPath, audioPath)
  return updated_audio
}

async function getFrameRate(ffmpegPath: string, sourceFile: string): Promise<number> {
  const command = `${ffmpegPath} -i "${sourceFile}"`
  const response = await executeCommand(command)
  const output = response.output || ''
  const match = output.match(/(\d+\.?\d*) fps/)
  const fps = match ? parseFloat(match[1]) : 30
  console.log(`Frame rate: ${fps}`)
  return fps
}

async function extractFramesFromVideo(prefix: number, videoPath: string, keyAudioFrames: number[][], folderpath: string, audioFile: string) {
  const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
  const ffmpegPath = findExecutable(modelsPath, 'ffmpeg.exe')

  if (!ffmpegPath) {
    throw new Error('FFmpeg not found in models directory')
  }

  //   const fps = await getFrameRate(ffmpegPath, videoPath)

  const extractedFrames: string[] = []

  //create a new audio file cropped to the key sounds
  const audioPath = await cropAudio(audioFile, keyAudioFrames, cachePath, fps)

  // Create a filter complex string for all keyframes
  let filterComplex = keyAudioFrames
    .map((keyFrame, index) => {
      const start = keyFrame[0]
      const end = keyFrame[1]
      return `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${index}];`
    })
    .join('')

  // Add the concat filter to combine all segments
  filterComplex += keyAudioFrames.map((_, index) => `[v${index}]`).join('') + `concat=n=${keyAudioFrames.length}:v=1:a=0[out]`

  const command = `${ffmpegPath} -i "${videoPath}" -filter_complex "${filterComplex}" -map "[out]" "${folderpath}\\%04d.png"`

  try {
    const response = await executeCommand(command)
    // console.log('Extracted frames:', response)

    // Assuming the frames are named sequentially, we can generate the frame paths
    const frameCount = keyAudioFrames.reduce((sum, keyFrame) => sum + Math.ceil((keyFrame[1] - keyFrame[0]) * fps), 0) // Assuming 30 fps
    for (let i = 1; i < frameCount + 1; i++) {
      extractedFrames.push(path.join(folderpath, `${prefix}_${i.toString().padStart(4, '0')}.png`))
    }
  } catch (error) {
    console.error('Error extracting frames:', error)
  }

  return audioPath
}

async function cropAudio(audioPath: string, keySounds: number[][], cachePath: string, fps: number): Promise<string> {
  const modelsPath = path.join(os.homedir(), 'Documents', 'eiko', 'models')
  const ffmpegPath = findExecutable(modelsPath, 'ffmpeg.exe')

  if (!ffmpegPath) {
    throw new Error('FFmpeg not found in models directory')
  }

  const randomName = Math.random().toString(36).substring(7)
  const outputPath = path.join(cachePath, `${randomName}_cropped.mp3`)

  // Create filter complex string for all key sound ranges
  let filterComplex = keySounds
    .map((keySound, index) => {
      const start = keySound[0]
      const end = keySound[1]
      return `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${index}];`
    })
    .join('')

  // Add the concat filter to combine all segments
  filterComplex += keySounds.map((_, index) => `[a${index}]`).join('') + `concat=n=${keySounds.length}:v=0:a=1[out]`

  const command = `"${ffmpegPath}" -i "${audioPath}" -filter_complex "${filterComplex}" -map "[out]" "${outputPath}"`
  console.log('Cropping audio:', command)

  try {
    const response = await executeCommand(command)
    console.log('Cropped audio:', response)
    return outputPath
  } catch (error) {
    console.error('Error cropping audio:', error)
    throw error
  }
}

async function extractAudio(ffmpegPath: string, videoPath: string, cachePath: string): Promise<string> {
  const randomName = Math.random().toString(36).substring(7)
  const audioPath = path.join(cachePath, randomName + '.mp3')
  const command = `"${ffmpegPath}" -i "${videoPath}" -vn -acodec libmp3lame "${audioPath}"`

  try {
    // Wait for the command to complete
    await executeCommand(command)

    return audioPath
  } catch (error) {
    console.error('Error extracting audio:', error)
    throw error
  }
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

const execAsync = promisify(exec)

async function executeCommand(command: string): Promise<{ output?: string }> {
  try {
    const { stdout, stderr } = await execAsync(command)
    const output = stdout + stderr
    console.log(`close >> child process exited successfully`)
    return { output }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`error >> ${error.message}`)
      return { output: error.message }
    }
    throw error
  }
}
