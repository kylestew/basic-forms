import Stats from "stats.js";

import { settings, update, render } from "./sketch";

let ctx, stats;
let canvasScale, canvasXOff, canvasYOff;

let videoStream, mediaRecorder;
let recordedChunks;

function resetCanvas() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  // scale/translate canvas to [-1, 1] crop
  if (ctx.canvas.width > ctx.canvas.height) {
    // height is max side
    canvasScale = ctx.canvas.height / 2;
    canvasXOff = (ctx.canvas.width - ctx.canvas.height) / 2;
    canvasYOff = 0;
  } else {
    canvasScale = ctx.canvas.width / 2;
    canvasXOff = 0;
    canvasYOff = (ctx.canvas.height - ctx.canvas.width) / 2;
  }
}

function normalizeCanvas() {
  ctx.translate(canvasXOff, canvasYOff);
  ctx.scale(canvasScale, canvasScale);
  ctx.translate(1, 1);
  ctx.scale(1, -1);
  ctx.strokeWidth(1.0);
  ctx.lineJoin = "round";
}

function download(dataURL, name) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = name;
  link.click();
}

function downloadCanvas() {
  var dataURL = ctx.canvas.toDataURL("image/png");
  download(dataURL, "image");
}

function init() {
  var canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resetCanvas();

  // TODO: refactor this to be cleaner
  videoStream = canvas.captureStream(30);
  var options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(videoStream, options);
  recordedChunks = [];
  mediaRecorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      var blob = new Blob(recordedChunks, { type: "video/webm" });
      var videoURL = URL.createObjectURL(blob);
      download(videoURL, "video");
      recordedChunks = [];
    }
  };

  // monkey-patch normalized stroke width updates
  ctx.strokeWidth = function (value) {
    this.lineWidth = value / canvasScale;
  };

  if (settings.animated === true) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  function mainLoop(time) {
    if (stats) stats.begin();

    update(time);

    ctx.fillStyle = settings.clearColor || "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();

    // defaults
    ctx.fillStyle = "#F0F";
    ctx.strokeStyle = "black";

    normalizeCanvas();
    render({ ctx: ctx, canvasScale: 1.0 / canvasScale });

    ctx.restore();

    if (stats) stats.end();

    if (settings.animated === true) requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);
}

window.onload = function () {
  init();
};

window.onresize = function () {
  resetCanvas();
};

window.onkeydown = function (evt) {
  if (evt.key == "s") {
    downloadCanvas();
  } else if (evt.key == "r") {
    if (mediaRecorder.state == "recording") {
      mediaRecorder.stop();
    } else {
      mediaRecorder.start();
      console.log("recording...");
    }
  }
};
