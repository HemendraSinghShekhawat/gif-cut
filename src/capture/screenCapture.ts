import { canvas, ctx } from "./frameHandler.js";
import { displayMediaOptions } from "../config/appConfig.js";

let preview = document.getElementById("preview") as HTMLVideoElement;
let recordingButton = document.getElementById(
  "recordScreenButton",
) as HTMLVideoElement;
let startButton = document.getElementById("startButton") as HTMLButtonElement;
let stopButton = document.getElementById("stopButton") as HTMLButtonElement;
// let downloadButton = document.getElementById(
//   "downloadButton",
// ) as HTMLButtonElement;

const screenRecord = async () => {
  try {
    startButton.addEventListener("click", async () => {
      preview.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      await new Promise((resolve) => (preview.onloadedmetadata = resolve));
      canvas.width = preview.videoWidth;
      canvas.height = preview.videoHeight;

      ctx?.drawImage(preview, 0, 0);
    });
  } catch (err) {
    console.error(err);
  }
};

function screenRecording(displayMediaOptions: DisplayMediaStreamOptions) {
  recordingButton.addEventListener("click", async () => {
    let captureStream = null;

    try {
      captureStream =
        await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      preview.srcObject = captureStream;
    } catch (err) {
      console.error(`Error: ${err}`);
    }
    return captureStream;
  });
}

function computeFrame() {
  ctx?.drawImage(preview, 0, 0, preview.width, preview.height);
  const frame = ctx?.getImageData(0, 0, canvas.width, canvas.height);
  const data = frame?.data || [];
  if (frame && ctx) {
    ctx?.putImageData(frame, 0, 0);
  }
}

function timerCallback() {
  if (preview.paused || preview.ended) {
    return;
  }
  computeFrame();
  setTimeout(() => {
    timerCallback();
  }, 0);
}

preview.addEventListener(
  "play",
  () => {
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.imageSmoothingQuality = "high";
    }
    canvas.width = preview.width;
    canvas.height = preview.height;
    timerCallback();
  },
  false,
);

stopButton.addEventListener("click", () => {
  if (preview.srcObject instanceof MediaStream) {
    let tracks = preview.srcObject.getTracks();

    tracks.forEach((track) => track.stop());
    preview.srcObject = null;
  }
});

screenRecord();

screenRecording(displayMediaOptions as DisplayMediaStreamOptions);
