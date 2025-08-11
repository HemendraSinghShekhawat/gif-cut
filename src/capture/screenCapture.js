"use strict";
const startCaptureButton = document.getElementById("start");
let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let recordingTimeMS = 5000;
const screenRecord = async () => {
    try {
        startButton.addEventListener("click", async () => {
            console.log("begining");
            console.log(ctx);
            preview.srcObject = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            await new Promise((resolve) => (preview.onloadedmetadata = resolve));
            canvas.width = preview.videoWidth;
            canvas.height = preview.videoHeight;
            console.log(ctx, "hello world");
            ctx?.drawImage(preview, 0, 0);
            console.log("end");
        });
    }
    catch (err) {
        console.error(err);
    }
};
screenRecord();
