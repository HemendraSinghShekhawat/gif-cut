import { videoProcessor } from "./videoProcessor.js";

export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const videoElement = document.getElementById("video");
export const downloadButton = document.getElementById("download");
export const playButton = document.getElementById("play");
export const startButton = document.getElementById("start");
export const stopButton = document.getElementById("stop");

const checkForElements = (element: HTMLElement | null, id: string) => {
  if (!element) {
    console.log(`no element with id: ${id} is present in the document`);
    return true;
  }
  return false;
};

export const allEventsFactory = () => {
  const vidP = new videoProcessor();
  if (
    (
      [
        [canvas, "canvas"],
        [videoElement, "videoElement"],
        [downloadButton, "downloadButton"],
        [playButton, "playButton"],
        [startButton, "startButton"],
        [stopButton, "stopButton"],
      ] as Array<[HTMLElement | null, string]>
    )
      .map((el) => checkForElements(el[0], el[1]))
      .every((el) => el !== false)
  ) {
    console.log("something is wrong in accessing elements");
    return;
  }
  if (!videoElement) {
    console.log("no video element");
    return;
  }
  if (!playButton) {
    console.log("no play element");
    return;
  }
  if (!startButton) {
    console.log("no start element");
    return;
  }
  if (!stopButton) {
    console.log("no stop button");
    return;
  }
  if (!downloadButton) {
    console.log("no download button");
    return;
  }
  startButton.addEventListener("click", function () {
    console.log("startbutton");
  });
  stopButton.addEventListener("click", function () {
    console.log("startbutton");
    vidP.stopCapture();
  });
  startButton.addEventListener("click", function () {
    vidP.startCapture();
  });
  playButton?.addEventListener("click", function () {
    vidP.playFrameByFrame();
  });
};
