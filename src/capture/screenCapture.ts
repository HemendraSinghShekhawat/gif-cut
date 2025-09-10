import { canvas, ctx } from "./frameHandler.js";
import { displayMediaOptions } from "../config/appConfig.js";
import { GIFEncoder } from "../GIFEncoder.js";

let encoder = new GIFEncoder();

let imageDataDump: ImageData[] = [];

let preview = document.getElementById("preview") as HTMLVideoElement;
let recordingButton = document.getElementById(
  "recordScreenButton",
) as HTMLVideoElement;
let startButton = document.getElementById("startButton") as HTMLButtonElement;
let stopButton = document.getElementById("stopButton") as HTMLButtonElement;

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
			console.log(preview.videoWidth, preview.videoHeight)
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
  ctx?.drawImage(preview, 0, 0, preview.videoWidth, preview.videoHeight);
  const frame = ctx?.getImageData(0, 0, 10, 10);
  // const frame = ctx?.getImageData(0, 0, canvas.width, canvas.height);
  const data = frame?.data || [];
  if (frame && ctx) {
    imageDataDump.push(frame);
    if (imageDataDump.length >= 100) {
      if (preview.srcObject instanceof MediaStream) {
        let tracks = preview.srcObject.getTracks();

        tracks.forEach((track) => track.stop());
        preview.srcObject = null;
        console.log(imageDataDump);
      }
    }
    ctx?.putImageData(frame, 0, 0);
		encoder.addFrame(ctx)
		// console.log(encoder.out, "from video frame");
  }
}

function timerCallback() {
  if (preview.paused || preview.ended) {
    return;
  }
  computeFrame();
	stopVideoRecording()
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
		canvas.width = 10;
		canvas.height = 10;
    // canvas.width = preview.videoWidth;
    // canvas.height = preview.videoHeight;
    imageDataDump = [];
		encoder.start()
    timerCallback();
  },
  false,
);

const stopVideoRecording = () => {
  if (preview.srcObject instanceof MediaStream) {
    let tracks = preview.srcObject.getTracks();
		encoder.finish();
		let fileType = 'image/gif';
		let readableStream = encoder.stream();
		let bin_gif = new Uint8Array(readableStream);
		let blob = new Blob([bin_gif], { type: fileType });
		let url = URL.createObjectURL(blob)
		console.log(url, "url");

		let gifViewer = document.createElement('img');
		gifViewer.src = url;
		document.body.appendChild(gifViewer);
		let normalGifViewer = document.createElement('img');
		normalGifViewer.src = 'https://giflib.sourceforge.net/whatsinagif/sample_1.gif';// url;
		document.body.appendChild(normalGifViewer);

    tracks.forEach((track) => track.stop());
    preview.srcObject = null;
    console.log(imageDataDump);
  }
}

stopButton.addEventListener("click", () => {
	stopVideoRecording()
});

screenRecord();

screenRecording(displayMediaOptions as DisplayMediaStreamOptions);
