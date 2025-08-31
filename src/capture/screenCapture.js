import { canvas, ctx } from "./frameHandler.js";
import { displayMediaOptions } from "../config/appConfig.js";
let imageDataDump = [];
let preview = document.getElementById("preview");
let recordingButton = document.getElementById("recordScreenButton");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
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
    }
    catch (err) {
        console.error(err);
    }
};
function screenRecording(displayMediaOptions) {
    recordingButton.addEventListener("click", async () => {
        let captureStream = null;
        try {
            captureStream =
                await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            preview.srcObject = captureStream;
        }
        catch (err) {
            console.error(`Error: ${err}`);
        }
        return captureStream;
    });
}
function computeFrame() {
    ctx?.drawImage(preview, 0, 0, preview.videoWidth, preview.videoHeight);
    const frame = ctx?.getImageData(0, 0, canvas.width, canvas.height);
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
preview.addEventListener("play", () => {
    if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = "high";
    }
    canvas.width = preview.videoWidth;
    canvas.height = preview.videoHeight;
    imageDataDump = [];
    timerCallback();
}, false);
stopButton.addEventListener("click", () => {
    if (preview.srcObject instanceof MediaStream) {
        let tracks = preview.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        preview.srcObject = null;
        console.log(imageDataDump);
    }
});
screenRecord();
screenRecording(displayMediaOptions);
