# snap-youtube

**snap-youtube** is a command-line tool that allows you to convert a YouTube
video into a series of JPEG images, one image for each second of the video. It
uses the `youtube-dl-exec` package to download the video and `FFmpeg` to convert
the video into images.

## Prerequisites

You will need to have the following software installed on your machine:

- `Node` and `NPM`
- `FFmpeg`

## Installation

1. Clone the repository to your local machine:

```sh
git clone https://github.com/amir-ziaei/snap-youtube
```

2. Change into the directory and install the dependencies:

```sh
cd snap-youtube && npm install
```

## Usage

To convert a video, you will need to provide a YouTube video URL as a
command-line argument. You can run the script using the following command:

```sh
npm start <youtube-video-url>
```

For example:

```sh
npm start https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

The script saves the images in a new directory named after the video ID, under
the `output` directory.

## Note

- This script uses `FFmpeg` to convert the video. Make sure you have `FFmpeg`
  installed on your machine, if not, you can download it from the official
  website.
- The script might take some time to execute, especially if the video is long or
  the internet connection is slow.
