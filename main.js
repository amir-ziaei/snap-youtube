let { spawn } = require('child_process')
let fs = require('fs')
let ytdl = require('youtube-dl-exec')

async function init() {
  const ytUrl = 'https://www.youtube.com/watch?v=2FsGsiCSjH0'
  const videoInfo = await ytdl(ytUrl, {
    noPart: true,
  })
  console.log('🚀 ~ init ~ videoInfo', videoInfo)
}
// init()

const convertVideoToFrames = (
  options = {
    videoName: '1.webm',
    imgFileName: 'img',
    fps: 1,
    startTime: 0,
    duration: 0,
    outputDir: './output/',
  },
) => {
  // Check if output directory exists, if not create one
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir)
  }
  // Creating the ffmpeg command arguments
  let args = [
    '-i',
    options.videoName,
    '-threads',
    '4',
    '-f',
    'image2',
    '-vf',
    `fps=${options.fps}`,
    '-q:v',
    '2',
    '-c:v',
    'mjpeg',
    '-bt',
    '20M',
  ]
  // if start time is set, adding the -ss option
  if (options.startTime > 0) {
    args.push('-ss', options.startTime)
  }
  // if duration is set, adding the -t option
  if (options.duration > 0) {
    args.push('-t', options.duration)
  }
  // add the output path and filename pattern
  args.push(`${options.outputDir}${options.imgFileName}%03d.jpg`)

  let ffmpegVideoFrameProcess = spawn('ffmpeg', args)

  ffmpegVideoFrameProcess.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  ffmpegVideoFrameProcess.stderr.on('data', (err) => {
    console.log(err.toString())
  })

  ffmpegVideoFrameProcess.on('error', (err) => {
    console.log(`Failed to start child process: ${err.toString()}`)
  })
  ffmpegVideoFrameProcess.on('close', (code) => {
    console.log(`Child process exited with code ${code}`)
  })
}

convertVideoToFrames()
