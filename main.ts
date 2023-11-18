import fs from 'fs'

const localBinDir = './bin'
const ffmpegInLocalBin = `${localBinDir}/ffmpeg`
const ytDlpInLocalBin = `${localBinDir}/yt-dlp`
const ffmpegPath = (await Bun.file(ffmpegInLocalBin).exists())
  ? ffmpegInLocalBin
  : 'ffmpeg'
const ytDlpPath = (await Bun.file(ytDlpInLocalBin).exists())
  ? ytDlpInLocalBin
  : 'yt-dlp'

ensureEnv()
  .then(parseArgs)
  .then(prepare)
  .then(download)
  .then(screenshotVideo)
  .then(deleteVideo)
  .catch(logException)
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

async function parseArgs() {
  const { 2: maybeYtUrl } = Bun.argv
  if (!maybeYtUrl) {
    throw new Error('Please provide a YouTube URL')
  }
  return getYoutubeVideoId(maybeYtUrl)
}

async function prepare(videoId: string) {
  createDirIfNotExists('./output')
  const outDir = `./output/${videoId}`
  createDirIfNotExists(outDir)
  const videoOutPath = `./output/${videoId}/${videoId}.webm`
  return {
    videoId,
    outDir,
    videoOutPath,
  }
}

type Pipe = Awaited<ReturnType<typeof prepare>>

function download(props: Pipe) {
  return new Promise<typeof props>((resolve, reject) => {
    Bun.spawn(
      [
        './bin/yt-dlp',
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
        './bin/ffmpeg',
        '-i',
        props.videoOutPath,
        '-vf',
        'thumbnail,fps=1',
        '-q:v',
        '1',
        `${props.outDir}/%d.png`,
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

function deleteVideo({ videoOutPath }: Pipe) {
  fs.unlinkSync(videoOutPath)
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

function logException(e: unknown) {
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    console.error(e)
  } else if (e instanceof Error) {
    console.error(e.message)
  } else {
    console.error('Unexpected error')
  }
}
