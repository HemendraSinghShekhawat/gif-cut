/**
 * @type {HTMLVideoElement}
 * */
const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
const playElem = document.getElementById("play");

/**
 * @type {HTMLCanvasElement}
 * */
const canvasElem = document.getElementById("canvas");
const ctxElem = canvasElem.getContext("2d");
ctxElem.imageSmoothingEnabled = false;
ctxElem.imageSmoothingQuality = "high";
console.dir(videoElem)
console.dir(canvasElem);

canvasElem.width = videoElem.scrollWidth * window.devicePixelRatio;
canvasElem.height= videoElem.scrollHeight * window.devicePixelRatio;
canvas.style.width = `${videoElem.scrollWidth}px`;
canvas.style.height = `${videoElem.scrollHeight}px`;

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
		this.width = this.video.clientWidth;
		this.height = this.video.clientHeight;
		this.gifFrames = {};
	};
	videoProcessor.doLoad();
	console.log(ctxElem.imageSmoothingEnabled, ctxElem.imageSmoothingQuality)

	videoProcessor.computeFrame = function () {
		const currentFrameIndex = Math.floor(this.video.currentTime * 1000);
		const framesNameLength = Math.ceil(Math.log10(frames));
		ctxElem.drawImage(this.video, 0, 0, this.width  * window.devicePixelRatio, this.height * window.devicePixelRatio);
		this.gifFrames[currentFrameIndex] = canvasElem.toDataURL("image/png");
	};

	videoProcessor.timerCallback = function () {
		if (this.video.srcObject === null || this.video.srcObject.active !== true) {
			return;
		}
		try {
			videoProcessor.computeFrame();
		} catch (err) {
			console.log(err)
		}
		setTimeout(() => {
			videoProcessor.timerCallback();
		}, frameDuration);
	};

	videoProcessor.dumpOptionsInfo = function () {
		console.log(this.video);
		const videoTrack = this.video.srcObject.getVideoTracks()[0];
		ctxElem.drawImage(this.video, 0, 0, this.width * window.devicePixelRatio, this.height * window.devicePixelRatio);

		console.log("Track settings:");
		console.log(JSON.stringify(videoTrack.getSettings(), null, 2));
		console.log("Track constraints:");
		console.log(JSON.stringify(videoTrack.getConstraints(), null, 2));
	}

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
	}
	videoProcessor.stopCapture = function () {
		this.video.srcObject = null;
	};

	videoProcessor.playFrameByFrame = function () {
		const data = this.gifFrames;
		console.log(data);
		if(data) {
			Object.entries(data)
				.map(([key, value]) => {
					setTimeout(() => {
						let image = new Image();
						image.onload = function (){
							ctxElem.drawImage(image, 0, 0, this.width  * window.devicePixelRatio, this.height * window.devicePixelRatio);
						}
						image.src = value;
					}, Number(key))
				})
		}
	}

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
		false
	)


};
main();
