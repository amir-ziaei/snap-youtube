import fs from 'fs'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ffmpegPath = 'ffmpeg'
const ytDlpPath = 'yt-dlp'

ensureEnv()
  .then(askArgs)
  .then(prepare)
  .then(download)
  .then(screenshotVideo)
  .then(deleteVideo)
  .then(logSuccessAndExit)
  .catch(logExceptionAndExit)

//-------------------------------------------------------------------------*//
function ensureEnv() {
  return new Promise<void>(resolve => {
    const [ytDlpProc, ffmpegProc] = [
      Bun.spawnSync([ytDlpPath, '--version']),
      Bun.spawnSync([ffmpegPath, '-version']),
    ]
    if (ytDlpProc.exitCode !== 0) {
      throw new Error(
        'yt-dlp is not installed. Please install yt-dlp and try again',
      )
    }
    if (ffmpegProc.exitCode !== 0) {
      throw new Error(
        'ffmpeg is not installed. Please install ffmpeg and try again',
      )
    }
    resolve()
  })
}

async function askArgs() {
  const rl = readline.createInterface({ input, output })
  const maybeYtUrl = await rl.question('The YouTube video URL: ')
  return getYoutubeVideoId(maybeYtUrl)
}

async function prepare(videoId: string) {
  const outDir = `/output`
  createDirIfNotExists(outDir)
  const videoOutDir = `${outDir}/${videoId}`
  createDirIfNotExists(videoOutDir)
  const videoOutPath = `${videoOutDir}/${videoId}.webm`
  return {
    videoId,
    videoOutDir,
    videoOutPath,
  }
}

type Pipe = Awaited<ReturnType<typeof prepare>>

function download(props: Pipe) {
  return new Promise<typeof props>((resolve, reject) => {
    Bun.spawn(
      [
        ytDlpPath,
        '-f',
        'bv',
        '--no-part',
        '-o',
        props.videoOutPath,
        props.videoId,
      ],
      {
        stdout: 'inherit',
        onExit(_, code) {
          if (code === 0) {
            resolve(props)
          } else {
            reject(new Error('Failed to download video'))
          }
        },
      },
    )
  })
}

function screenshotVideo(props: Pipe) {
  return new Promise<typeof props>((resolve, reject) => {
    Bun.spawn(
      [
        ffmpegPath,
        '-i',
        props.videoOutPath,
        '-vf',
        'thumbnail,fps=1',
        '-q:v',
        '1',
        `${props.videoOutDir}/%d.png`,
      ],
      {
        stdout: 'inherit',
        onExit(_, code) {
          if (code === 0) {
            resolve(props)
          } else {
            reject(new Error('Failed to screenshot video'))
          }
        },
      },
    )
  })
}

function deleteVideo(args: Pipe) {
  fs.unlinkSync(args.videoOutPath)
  return args
}

function getYoutubeVideoId(ytUrl: string) {
  const videoIdRegex =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch|movie|channel)\/?\?v\=))([^#&?]*)/
  const match = ytUrl.match(videoIdRegex)
  if (!match) {
    throw new Error('Invalid YouTube URL. Please provide a valid YouTube URL')
  }
  return match[1]
}

function createDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

function logExceptionAndExit(e: unknown) {
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    console.error(e)
  } else if (e instanceof Error) {
    console.error(e.message)
  } else {
    console.error('Unexpected error')
  }
  process.exit(1)
}

function logSuccessAndExit({ videoOutDir }: Pipe) {
  console.log(`Success: screenshots saved to ${videoOutDir}`)
  process.exit(0)
}
