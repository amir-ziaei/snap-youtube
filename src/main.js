const { spawn } = require('node:child_process')
const fs = require('node:fs')
const ytdl = require('youtube-dl-exec')
const ffmpegPath = require('ffmpeg-static')

;(async function init() {
  const ytUrl = process.argv[2]
  if (!ytUrl) {
    console.log('Please provide a YouTube URL')
    process.exit(1)
  }
  const ytId = getYoutubeVideoId(ytUrl)
  if (!ytId) {
    console.log('Please provide a valid YouTube URL')
    process.exit(1)
  }
  createDirIfNotExists('./output')
  createDirIfNotExists(`./output/${ytId}`)
  const output = `./output/${ytId}/${ytId}.webm`
  const download = urlOrId =>
    ytdl(urlOrId, {
      noPart: true,
      output,
    })
  try {
    await download(ytId)
  } catch {
    try {
      await download(ytUrl)
    } catch {
      console.log('Failed to download video')
      process.exit(1)
    }
  }
  convertVideoToFrames({
    videoName: output,
    outputDir: `./output/${ytId}/frames/`,
  })
})()

function convertVideoToFrames({ videoName, outputDir }) {
  const options = {
    videoName,
    outputDir,
    imgFileName: 'img',
    startTime: 0,
    duration: 0,
  }

  createDirIfNotExists(options.outputDir)

  // prettier-ignore
  let args = [
    '-i', options.videoName,
    '-threads', 'auto',
    '-f', 'image2',
    '-vf', `setpts=1.0*PTS, fps=1`,
    '-q:v', '1',
    '-c:v', 'mjpeg',
    '-bt', '20M',
    '-an',
  ]
  // prettier-enable

  if (options.startTime > 0) {
    args.push('-ss', options.startTime)
  }

  if (options.duration > 0) {
    args.push('-t', options.duration)
  }

  args.push(`${options.outputDir}${options.imgFileName}%03d.jpg`)

  let ffmpegVideoFrameProcess = spawn(ffmpegPath, args)

  ffmpegVideoFrameProcess.stdout.on('data', data => {
    console.log(data.toString())
  })

  ffmpegVideoFrameProcess.stderr.on('data', err => {
    console.log(err.toString())
  })

  ffmpegVideoFrameProcess.on('error', err => {
    console.log(`Failed to start child process: ${err.toString()}`)
  })
  ffmpegVideoFrameProcess.on('close', code => {
    console.log(`Child process exited with code ${code}`)
  })
}

function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

function getYoutubeVideoId(url) {
  const videoIdRegex =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch|movie|channel)\/?\?v\=))([^#&?]*)/
  const match = url.match(videoIdRegex)
  if (!match) return null
  const videoId = match[1]
  return videoId
}
