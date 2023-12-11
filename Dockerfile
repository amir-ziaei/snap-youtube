FROM oven/bun:alpine

RUN apk add ffmpeg yt-dlp

WORKDIR /app

COPY package.json /app
COPY bun.lockb /app
COPY tsconfig.json /app
RUN bun install

COPY src /app

VOLUME /output

CMD ["bun", "main.ts"]
