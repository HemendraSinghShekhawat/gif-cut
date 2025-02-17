import { canvas, context } from "./canvasElement.js";

console.log(canvas, context);

const videoElement = document.getElementById("video") as HTMLVideoElement;

export class videoProcessor {
  videoElement;
  canvasElement;
  videoWidth;
  videoHeight;
  allRenderedFrames;

  constructor() {
    this.videoElement = videoElement;
    this.canvasElement = canvas;
    this.videoWidth = this.videoElement.videoWidth;
    this.videoHeight = this.videoElement.videoHeight;
    this.allRenderedFrames = {} as {
      [key: string]: Base64URLString;
    };
  }

  computeFrames() {
    this.videoWidth = this.videoElement.clientWidth;
    this.videoHeight = this.videoElement.clientHeight;
    this.canvasElement.width = this.videoElement.clientWidth;
    this.canvasElement.height = this.videoElement.clientHeight;
    this.canvasElement.style.width = `${this.videoElement.clientWidth}px`;
    this.canvasElement.style.height = `${this.videoElement.clientHeight}px`;
    const currentFrameIndex = Math.floor(this.videoElement.currentTime * 1000);
    if (context) {
      context.drawImage(
        this.videoElement,
        0,
        0,
        this.videoWidth,
        this.videoHeight,
      );
      this.allRenderedFrames[`${currentFrameIndex}`] =
        this.canvasElement.toDataURL("image/png") as string;
    }
  }

  timerCallback() {
    if (this.videoElement.srcObject === null || !this.videoElement.srcObject) {
      return;
    }
    try {
      this.computeFrames();
    } catch (err) {
      console.log(err);
    }
    setTimeout(() => {
      this.timerCallback();
    }, 0);
  }

  dumpOptionsInfo() {
    console.log("video playing");
  }

  async startCapture() {
    try {
      this.videoElement.srcObject =
        await navigator.mediaDevices.getDisplayMedia();
      this.allRenderedFrames = {};
      this.dumpOptionsInfo();
      this.timerCallback();
    } catch (err) {
      console.error(err);
    }
  }

  stopCapture() {
    this.videoWidth = videoElement.videoWidth;
    this.videoHeight = videoElement.videoHeight;
    this.videoElement.srcObject = null;
  }

  renderFrame(image: CanvasImageSource) {
    if (context) {
      console.log(
        image,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height,
      );
      context.drawImage(
        image,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height,
      );
    }
  }

  playFrameByFrame() {
    const data = this.allRenderedFrames;
    if (data) {
      Object.entries(data).map(([key, value]) => {
        setTimeout(() => {
          let image = new Image();
          image.onload = () => this.renderFrame(image);
          image.src = value;
        }, Number(key));
      });
    }
  }
}
