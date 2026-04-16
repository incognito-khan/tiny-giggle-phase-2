import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export async function generateThumbnail(file) {
  if (!ffmpeg.loaded) {
    const baseURL =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript",
      ),
    });
  }

  await ffmpeg.writeFile("input.mp4", await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-ss",
    "00:00:00.001",
    "-frames:v",
    "1",
    "-vf",
    "scale=320:-1",
    "-q:v",
    "10",
    "thumbnail.jpg",
  ]);

  const data = await ffmpeg.readFile("thumbnail.jpg");
  const blob = new Blob([data], { type: "image/jpeg" });

  await ffmpeg.deleteFile("input.mp4");
  await ffmpeg.deleteFile("thumbnail.jpg");

  return blob;
}
