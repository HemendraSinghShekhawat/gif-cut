/**
 * @type {HTMLVideoElement}
 * */
const videoElem = document.getElementById("video");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
const playElem = document.getElementById("play");
const downloadElem = document.getElementById("download");

/**
 * @type {HTMLCanvasElement}
 * */
const canvasElem = document.getElementById("canvas");
const ctxElem = canvasElem.getContext("2d");
ctxElem.imageSmoothingEnabled = true;
ctxElem.imageSmoothingQuality = "high";
canvas.width = videoElem.offsetWidth;
canvas.height = videoElem.offsetHeight;
canvas.style.width = `${videoElem.offsetWidth}px`;
canvas.style.height = `${videoElem.offsetHeight}px`;

const videoForGifOptions = {
  fps: 50,
  duration: 1000,
};

const frameDuration = 1e3 / videoForGifOptions.fps;
const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: false,
};

const main = function () {
  const videoProcessor = {};

  videoProcessor.doLoad = function () {
    this.video = document.getElementById("video");
    this.canvas = canvasElem;
    this.width = this.video.videoWidth;
    this.height = this.video.videoHeight;
    this.gifFrames = {};
  };
  videoProcessor.doLoad();

  videoProcessor.computeFrame = function () {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvas.style.width = `${videoElem.offsetWidth}px`;
    this.canvas.style.height = `${videoElem.offsetHeight}px`;
    this.width = this.video.videoWidth;
    this.height = this.video.videoHeight;
    const aspectRatio = this.width / this.height;
    const currentFrameIndex = Math.floor(this.video.currentTime * 1000);
    ctxElem.drawImage(
      this.video,
      0,
      0,
      (this.width * aspectRatio) / 2,
      (this.height * aspectRatio) / 2,
    );
    this.gifFrames[currentFrameIndex] = canvasElem.toDataURL("image/png");
  };

  videoProcessor.timerCallback = function () {
    if (this.video.srcObject === null || this.video.srcObject.active !== true) {
      return;
    }
    try {
      videoProcessor.computeFrame();
    } catch (err) {
      console.log(err);
    }
    setTimeout(() => {
      videoProcessor.timerCallback();
    }, frameDuration);
  };

  videoProcessor.dumpOptionsInfo = function () {
    const videoTrack = this.video.srcObject.getVideoTracks()[0];
    ctxElem.drawImage(this.video, 0, 0, this.width, this.height);

    console.log("Track settings:");
    console.log(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.log("Track constraints:");
    console.log(JSON.stringify(videoTrack.getConstraints(), null, 2));
  };

  videoProcessor.startCapture = async function () {
    try {
      this.video.srcObject =
        await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      this.gifFrames = {};
      videoProcessor.dumpOptionsInfo();
      //this.video.paused = false;
      videoProcessor.timerCallback();
    } catch (err) {
      console.error(err);
    }
  };
  videoProcessor.stopCapture = function () {
    this.video.srcObject = null;
  };

  videoProcessor.playFrameByFrame = function () {
    const data = this.gifFrames;
    if (data) {
      Object.entries(data).map(([key, value]) => {
        setTimeout(() => {
          let image = new Image();
          image.onload = function () {
            ctxElem.drawImage(image, 0, 0, this.width, this.height);
          };
          image.src = value;
        }, Number(key));
      });
    }
  };

  videoProcessor.download = function () {
    const downloadFileType = "image/gif";
    const downloadFileName = `download-gif-${new Date().toUTCString().replace(/(\s|,|:)/g, "")}.gif`;
    console.log(downloadFileType, downloadFileName);
  };

  startElem.addEventListener(
    "click",
    () => {
      console.log("startCapture");
      videoProcessor.startCapture();
    },
    false,
  );

  stopElem.addEventListener(
    "click",
    () => {
      console.log("stopCapture");
      videoProcessor.stopCapture();
    },
    false,
  );

  playElem.addEventListener(
    "click",
    () => {
      console.log("play");
      videoProcessor.playFrameByFrame();
    },
    false,
  );

  downloadElem.addEventListener(
    "click",
    () => {
      console.log("download");
      videoProcessor.download();
    },
    false,
  );
};
main();
