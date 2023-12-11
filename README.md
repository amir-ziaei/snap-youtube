# snap-youtube

**snap-youtube** is a command-line tool that allows you to convert a YouTube
video into a series of JPEG images, one image for each second of the video.

## Prerequisites

You will need to have [Docker](https://www.docker.com) installed on your
machine.

## Getting Started

1. Clone the repository to your local machine:

```sh
git clone https://github.com/amir-ziaei/snap-youtube
```

2. Change into the directory.

```sh
cd snap-youtube
```

3. Run the following command to start the script:

```sh
docker-compose build app && docker-compose run app
```

The script will prompt you to enter the YouTube video URL you wish to convert.
The result will be saved in the `./output/<video-id>` directory.

## Note

- The script might take some time to execute, especially if the video is long or
  the internet connection is slow.
