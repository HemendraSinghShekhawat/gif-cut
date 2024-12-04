// import { data } from "./data.js";
// console.log(data);

/**
 * @type {HTMLVideoElement}
 * */
const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

/**
 * @type {HTMLCanvasElement}
 * */
const canvasElem = document.getElementById("canvas");
const ctxElem = canvasElem.getContext("2d");

const videoForGifOptions = {
  fps: 50,
  duration: 1000,
};
const frameDuration = 1e3 / videoForGifOptions.fps;

// const displayMediaOptions = {
//   video: {
//     displaySurface: "browser",
//   },
//   audio: {
//     suppressLocalAudioPlayback: false,
//   },
//   preferCurrentTab: false,
//   selfBrowserSurface: "exclude",
//   systemAudio: "include",
//   surfaceSwitching: "include",
//   monitorTypeSurfaces: "include",
// };

const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: false,
};

const main = function () {
  const videoProcessor = {};
  const gifFrames = {};

  videoProcessor.doLoad = function () {
    this.video = videoElem;
    this.canvas = canvasElem;
    this.width = this.video.clientWidth;
    this.height = this.video.clientHeight;
  };
  videoProcessor.doLoad();

  videoProcessor.computeFrame = function () {
    const currentFrameIndex = Math.floor(this.video.currentTime * 100);
    const framesNameLength = Math.ceil(Math.log10(frames));
    ctxElem.drawImage(this.video, 0, 0, this.width, this.height);
    gifFrames[currentFrameIndex] = canvasElem.toDataURL("image/png");
  };

  videoProcessor.timerCallback = function () {
    if (this.video.srcObject === null || this.video.srcObject.active !== true) {
      return;
    }
    videoProcessor.computeFrame();
    setTimeout(() => {
      videoProcessor.timerCallback();
    }, frameDuration);
  };

  function dumpOptionsInfo() {
    const videoTrack = this.video.srcObject.getVideoTracks()[0];
    ctxElem.drawImage(this.video, 0, 0, this.width, this.height);

    console.log("Track settings:");
    console.log(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.log("Track constraints:");
    console.log(JSON.stringify(videoTrack.getConstraints(), null, 2));
  }

  async function startCapture() {
    try {
      videoElem.srcObject =
        await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      dumpOptionsInfo();
      videoElem.paused = false;
      videoProcessor.timerCallback();
    } catch (err) {
      console.error(err);
    }
  }
  const stopCapture = function () {
    videoElem.srcObject = null;
  };

  startElem.addEventListener(
    "click",
    () => {
      console.log("startCapture");
      startCapture();
    },
    false,
  );

  stopElem.addEventListener(
    "click",
    () => {
      console.log("stopCapture");
      stopCapture();
    },
    false,
  );
};
main();
