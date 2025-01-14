const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const videoUpload = document.getElementById("video-upload");
const colorSimplification = document.getElementById("color-simplification");
const contourThreshold = document.getElementById("contour-threshold");
const noiseLevel = document.getElementById("noise-level");
const filterIntensity = document.getElementById("filter-intensity");
const cartoonEffect = document.getElementById("cartoon-effect");
const blendMode = document.getElementById("blend-mode");
const saveFormat = document.getElementById("saveFormat");
let isColorMode = true;
const layers = [];

// Change playback speed
function changeSpeed(factor) {
  video.playbackRate = factor;
}

// Video upload handler
videoUpload.addEventListener("change", function (event) {
  const file = event.target.files[0];
  const url = URL.createObjectURL(file);
  video.src = url;
  video.style.display = "block";
});

function addLayer() {
  const layer = {
    canvas: document.createElement("canvas"),
    ctx: null,
    opacity: 1.0,
    blendMode: "normal",
  };
  layer.ctx = layer.canvas.getContext("2d");
  layers.push(layer);

  const layerElement = document.createElement("div");
  layerElement.classList.add("layer");
  const opacityInput = document.createElement("input");
  opacityInput.type = "range";
  opacityInput.min = "0";
  opacityInput.max = "1";
  opacityInput.step = "0.1";
  opacityInput.value = layer.opacity;
  opacityInput.addEventListener("input", function () {
    layer.opacity = parseFloat(opacityInput.value);
  });

  const blendModeSelect = document.createElement("select");
  ["normal", "multiply", "screen", "overlay", "darken", "lighten"].forEach(
    (mode) => {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = mode;
      blendModeSelect.appendChild(option);
    }
  );
  blendModeSelect.value = layer.blendMode;
  blendModeSelect.addEventListener("change", function () {
    layer.blendMode = blendModeSelect.value;
  });

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", function () {
    layers.splice(layers.indexOf(layer), 1);
    layerElement.remove();
  });

  layerElement.appendChild(opacityInput);
  layerElement.appendChild(blendModeSelect);
  layerElement.appendChild(removeButton);
  document.getElementById("layerContainer").appendChild(layerElement);
}

function applyStylizedEffect() {
  if (!video.src) {
    alert("Please upload a video!");
    return;
  }

  canvas.style.display = "block";
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  video.play();
  drawEffect();
}

function drawEffect() {
  if (video.paused || video.ended) return;

  // Draw processed video on the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get image data from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const colorQuant = parseInt(colorSimplification.value);
  const contourLimit = parseInt(contourThreshold.value);
  const noiseIntensity = parseInt(noiseLevel.value);
  const intensity = parseFloat(filterIntensity.value);
  const cartoonIntensity = parseInt(cartoonEffect.value);
  const blend = blendMode.value;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let modifiedR = r;
    let modifiedG = g;
    let modifiedB = b;

    if (isColorMode) {
      modifiedR = Math.round(r / colorQuant) * colorQuant;
      modifiedG = Math.round(g / colorQuant) * colorQuant;
      modifiedB = Math.round(b / colorQuant) * colorQuant;
    } else {
      const grayscale = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
      modifiedR = modifiedG = modifiedB = grayscale;
    }

    if (isColorMode) {
      const grayscale = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
      if (grayscale < contourLimit) {
        modifiedR = modifiedG = modifiedB = 0;
      }
    }

    const noise = (Math.random() - 0.5) * noiseIntensity * 2;
    modifiedR = Math.min(255, Math.max(0, modifiedR + noise));
    modifiedG = Math.min(255, Math.max(0, modifiedG + noise));
    modifiedB = Math.min(255, Math.max(0, modifiedB + noise));

    // Apply cartoon effect
    if (cartoonIntensity > 0) {
      const avg = (modifiedR + modifiedG + modifiedB) / 3;
      modifiedR = avg + ((modifiedR - avg) * cartoonIntensity) / 100;
      modifiedG = avg + ((modifiedG - avg) * cartoonIntensity) / 100;
      modifiedB = avg + ((modifiedB - avg) * cartoonIntensity) / 100;
    }

    switch (blend) {
      case "multiply":
        data[i] = ((r * modifiedR) / 255) * intensity + r * (1 - intensity);
        data[i + 1] = ((g * modifiedG) / 255) * intensity + g * (1 - intensity);
        data[i + 2] = ((b * modifiedB) / 255) * intensity + b * (1 - intensity);
        break;
      case "screen":
        data[i] = 255 - ((255 - r) * (255 - modifiedR)) / 255;
        data[i + 1] = 255 - ((255 - g) * (255 - modifiedG)) / 255;
        data[i + 2] = 255 - ((255 - b) * (255 - modifiedB)) / 255;
        break;
      case "overlay":
        data[i] = Math.round((r / 255) * modifiedR + (1 - r / 255) * r);
        data[i + 1] = Math.round((g / 255) * modifiedG + (1 - g / 255) * g);
        data[i + 2] = Math.round((b / 255) * modifiedB + (1 - b / 255) * b);
        break;
      case "darken":
        data[i] = Math.min(r, modifiedR);
        data[i + 1] = Math.min(g, modifiedG);
        data[i + 2] = Math.min(b, modifiedB);
        break;
      case "lighten":
        data[i] = Math.max(r, modifiedR);
        data[i + 1] = Math.max(g, modifiedG);
        data[i + 2] = Math.max(b, modifiedB);
        break;
      case "normal":
      default:
        data[i] = modifiedR;
        data[i + 1] = modifiedG;
        data[i + 2] = modifiedB;
        break;
    }
  }

  // Display modified data on the canvas
  ctx.putImageData(imageData, 0, 0);

  // Continue drawing using animation
  requestAnimationFrame(drawEffect);
}

function toggleColorMode() {
  isColorMode = !isColorMode;
  applyStylizedEffect();
}

function autoEnhance() {
  colorSimplification.value = 100;
  contourThreshold.value = 120;
  noiseLevel.value = 10;
  filterIntensity.value = 0.8;
  cartoonEffect.value = 60;
  applyStylizedEffect();
}

saveButton.addEventListener("click", function () {
  const format = saveFormat.value;

  if (format === "mp4") {
    saveAsMP4();
  } else if (format === "gif") {
    saveAsGIF();
  }
});
