// changing string prototype
// REF: https://stackoverflow.com/questions/21647928/javascript-unicode-string-to-hex
console.log("Hello, World!");
String.prototype.hexEncode = function () {
  var hex, i;

  var result = [];
  for (i = 0; i < this.length; i++) {
    hex = this.charCodeAt(i).toString(16);
    result.push(("000" + hex).slice(-4));
    //result.push(hex.slice(-4));
  }

  return result;
};

String.prototype.hexDecode = function () {
  var j;
  var hexes = this.match(/.{1,4}/g) || [];
  var back = "";
  for (j = 0; j < hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return;
};

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
// CONSTANTS
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

  const array = [
    "47",
    "49",
    "46",
    "38",
    "39",
    "61",
    "0A",
    "00",
    "0A",
    "00",
    "91",
    "00",
    "00",
    "FF",
    "FF",
    "FF",
    "FF",
    "00",
    "00",
    "00",
    "00",
    "FF",
    "00",
    "00",
    "00",
    "21",
    "F9",
    "04",
    "00",
    "00",
    "00",
    "00",
    "00",
    "2C",
    "00",
    "00",
    "00",
    "00",
    "0A",
    "00",
    "0A",
    "00",
    "00",
    "02",
    "16",
    "8C",
    "2D",
    "99",
    "87",
    "2A",
    "1C",
    "DC",
    "33",
    "A0",
    "02",
    "75",
    "EC",
    "95",
    "FA",
    "A8",
    "DE",
    "60",
    "8C",
    "04",
    "91",
    "4C",
    "01",
    "00",
    "3B",
  ];

  videoProcessor.download = function () {
    //console.log("download gif", this.gifFrames);
    //const array = ["G", "I", "F", "8", "9", "a", 10, 10];
    //array.forEach((el, index) => {
    //  if (index === 6 || index === 7) {
    //    console.log(("000" + el.toString(16)).slice(-4));
    //  } else {
    //    console.log(el.toString(16));
    //  }
    //});

    // Hexadecimal byte string
    //const hexString =
    //  "4749463839610A000A00910000FFFFFF00000000FF00000021F904000000002C000000000A000A000002168C2D99872A1CD033A00275EC95FAA8DE608C04914C01003B";
    //
    //// Convert hex string to base64
    //function hexToBase64(hex) {
    //  let str = "";
    //  for (let i = 0; i < hex.length; i += 2) {
    //    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    //  }
    //  return btoa(str);
    //}
    //
    //// Convert to base64 encoded string
    //const base64String = hexToBase64(hexString);
    //
    //// Create a Data URL for the GIF
    //const dataUrl = `data:image/gif;base64,${base64String}`;
    //
    //// Create an image element and append it to the body
    //const imgElement = document.createElement("img");
    //imgElement.src = dataUrl;
    //document.body.appendChild(imgElement);
    let sampleGif = document.getElementById("sample-gif");
    fetch(sampleGif.src)
      .then((el) => el.bytes())
      .then((el) => console.log(el))
      .catch((err) => console.log(err));
    // let newArray = [
    //   |========================================================================|
    //   |GIF89a                                                                  |
    //   |------------------------------------------------------------------------|
    //   |71, 73, 70, 56, 57, 97,                                                 |
    //   |========================================================================|
    //   |10, 0, // width                                                         |
    //   |10, 0, // height                                                        |
    //   |========================================================================|
    //   |145, 0, 0, // packed field(91, 10010001 (image descriptor)), Background color index, pixel aspect ratio
    //   |========================================================================|
    //   |255, 255, 255, //-+                      +- WHITE -+                    |
    //   |255, 0, 0,     // |                      |  RED    |                    |
    //   |0, 0, 255,     // | => ALL GIF COLORS => |  BLUE   | => GLOBAL COLOR TABLE
    //   |0, 0, 0,       //-+                      +- BLACK -+                    |
    //   |========================================================================|
    //   |GRAPHICS CONTROL EXTENSION  (OPTIONAL):                                 |
    //   |------------------------------------------------------------------------|
    //   |33, 249, 4, 0, 0, 0, 0, 0,                                              |
    //   |========================================================================|
    //   |44, => IMAGE SEPERATOR                                                  |
    //   |========================================================================|
    //   |TOP   LEFT  WIDTH  HEIGHT                                               |
    //   |^      ^      ^      ^                                                  |
    //   ||      |      |      |                                                  |
    //   |----  ----  -----  -----                                                |
    //   |0, 0, 0, 0, 10, 0, 10, 0, => IMAGE TOP(0,0), LEFT(0,0), WIDTH(10,0), HEIGHT(10,0)
    //   |========================================================================|
    //   |LZW COMPRESSED DATA                                                     |
    //   |------------------------------------------------------------------------|
    //   |0, 2, 22, 140, 45, 153, 135, 42, 28, 220, 51, 160, 2, 117, 236, 149,    |
    //   |250, 168, 222, 96, 140, 4, 145, 76, 1, 0,                               |
    //   |========================================================================|
    //   |GIF file terminator                                                     |
    //   |------------------------------------------------------------------------|
    //   |59, ====> TRAILER                                                       |
    //   |========================================================================|
    // ];

    let newArray = [
      71,
      73,
      70,
      56,
      57,
      97, // GIF89a
      10,
      0, // width
      10,
      0, // height
      145,
      0,
      0, // packed field, Background color index, pixel aspect ratio
      255,
      255,
      255, //-+                      +- WHITE
      255,
      0,
      0, // |                      |  RED
      0,
      0,
      255, // | => ALL GIF COLORS => |  BLUE
      0,
      0,
      0, //-+                      +- BLACK
      33,
      249,
      4,
      0,
      0,
      0,
      0,
      0,
      44,
      0,
      0,
      0,
      0,
      10,
      0,
      10,
      0,
      0,
      2,
      22,
      140,
      45,
      153,
      135,
      42,
      28,
      220,
      51,
      160,
      2,
      117,
      236,
      149,
      250,
      168,
      222,
      96,
      140,
      4,
      145,
      76,
      1,
      0,
      59,
    ];
    let newArrayBuffer = new Uint8Array(newArray);
    console.log(newArrayBuffer);
    console.log("helloworld");
    const blob = new Blob([newArrayBuffer]);
    console.log(blob);
    const dataUrl = URL.createObjectURL(blob);

    //const dataUrl = `data:image/gif;base64,${base64String}`;

    const imgElement = document.createElement("img");
    imgElement.src = dataUrl;
    imgElement.width = 20;
    imgElement.height = 20;
    document.body.appendChild(imgElement);
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

//const newArrayBuffer = new ArrayBuffer(array.length);
//console.log(newArrayBuffer);
//const gifArrayBuffer = new Uint8Array(newArrayBuffer);
//console.log(gifArrayBuffer);
//console.log(new DataView(newArrayBuffer));
//var blob = new Blob([gifArrayBuffer], { type: "image/gif" });
//console.log(blob, blob.arrayBuffer());
//var objectUrl = URL.createObjectURL(blob);
//console.log(objectUrl);
//window.open(objectUrl);
//let gifArrayBuffer = new Uint8Array();
//const header = "GIF89a";
//console.log(header.hexEncode());
//header.hexEncode().forEach((el) => {
//  gifArrayBuffer[gifArrayBuffer.byteLength] = parseInt(el);
//});
//console.log(gifArrayBuffer);
