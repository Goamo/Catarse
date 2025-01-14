let isDrawing = false;
let isDrawing3D = false;
let ctx;
let brushType = "round";
let brushColor = "#000000";
let strokes = [];
let redoStack = [];
let layers = [];
let currentLayerIndex = 0;
let brightness = 0;
let contrast = 0;
let startLine = null;
let renderer3D;
let camera3D;
let controls;
let scene;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let currentMode = "2D";

let brushSettings = {
  round: { thickness: 10, color: "#000000", opacity: 1.0 },
  square: { thickness: 10, color: "#000000", opacity: 1.0 },
  spray: {
    thickness: 5,
    color: "#000000",
    opacity: 0.5,
    sprayRadius: 10,
    sprayDensity: 30,
  },
  watercolor: { thickness: 20, color: "#000000", opacity: 0.3, spread: 15 },
  oil: { thickness: 15, color: "#000000", opacity: 0.8, blending: true },
  eraser: { thickness: 20, color: "#ffffff", opacity: 1.0 },
};

window.onload = function () {
  init2DCanvas();
  setupEventListeners();
  addLayer();
  init3DScene();
};

function setupEventListeners() {
  document
    .getElementById("canvas2D")
    .addEventListener("mousedown", startDrawing);
  document.getElementById("canvas2D").addEventListener("mousemove", drawBrush);
  document.getElementById("canvas2D").addEventListener("mouseup", stopDrawing);
  document.getElementById("canvas2D").addEventListener("mouseout", stopDrawing);
}

function init2DCanvas() {
  const canvasElement = document.getElementById("canvas2D");
  ctx = canvasElement.getContext("2d");
  resizeCanvas();
}

function resizeCanvas() {
  const canvas2D = document.getElementById("canvas2D");
  const canvas3D = document.getElementById("canvas3D");
  canvas2D.width = window.innerWidth;
  canvas2D.height = window.innerHeight;
  canvas3D.width = window.innerWidth;
  canvas3D.height = window.innerHeight;
}

function startDrawing(event) {
  if (layers.length === 0) {
    alert("Добавьте хотя бы один слой перед началом рисования!");
    return;
  }

  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(event.clientX, event.clientY);
}

function drawBrush(event) {
  if (!isDrawing || layers.length === 0) return;

  const settings = brushSettings[brushType];
  ctx.lineWidth = settings.thickness;
  ctx.strokeStyle = settings.color;
  ctx.lineCap = brushType === "square" ? "butt" : "round";
  ctx.globalAlpha = settings.opacity;

  ctx.filter = `brightness(${brightness + 100}%) contrast(${contrast + 100}%)`;

  if (brushType === "spray") {
    drawSpray(event.clientX, event.clientY, settings);
  } else if (brushType === "watercolor") {
    drawWatercolor(event.clientX, event.clientY, settings);
  } else if (brushType === "oil") {
    drawOil(event.clientX, event.clientY, settings);
  } else {
    ctx.lineTo(event.clientX, event.clientY);
    ctx.stroke();
  }

  strokes.push({ x: event.clientX, y: event.clientY, brushType });
  redoStack = [];
}

function drawSpray(x, y, { sprayRadius, sprayDensity }) {
  for (let i = 0; i < sprayDensity; i++) {
    const offsetX = (Math.random() - 0.5) * sprayRadius;
    const offsetY = (Math.random() - 0.5) * sprayRadius;
    ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
  }
}

function drawWatercolor(x, y, { spread }) {
  ctx.beginPath();
  ctx.arc(x, y, spread, 0, Math.PI * 2, false);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.globalAlpha = brushSettings.watercolor.opacity;
  ctx.fill();
}

function drawOil(x, y, { blending }) {
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2, false);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.globalAlpha = brushSettings.oil.opacity;
  ctx.fill();
}

function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
  ctx.filter = "none";
}

function startDrawing3D(event) {
  if (layers.length === 0) {
    alert("Добавьте хотя бы один слой перед началом рисования!");
    return;
  }

  const rect = document.getElementById("canvas3D").getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;

  mouse.x = x;
  mouse.y = y;

  raycaster.setFromCamera(mouse, camera3D);

  const intersects = raycaster.intersectObject(
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  );
  if (intersects.length > 0) {
    const point = intersects[0].point;
    startLine = new THREE.Vector3(point.x, point.y, point.z);
    startDrawing3DLine(event);
  }

  isDrawing3D = true;
}

function draw3D(event) {
  if (!isDrawing3D || layers.length === 0) return;

  const rect = document.getElementById("canvas3D").getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;

  mouse.x = x;
  mouse.y = y;

  raycaster.setFromCamera(mouse, camera3D);

  const intersects = raycaster.intersectObject(
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  );
  if (intersects.length > 0) {
    const point = intersects[0].point;
    if (startLine) {
      add3DLine(new THREE.Vector3(point.x, point.y, point.z));
    }
    startLine = new THREE.Vector3(point.x, point.y, point.z);
  }
}

function add3DLine(point) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [startLine.x, startLine.y, startLine.z, point.x, point.y, point.z],
      3
    )
  );

  const material = get3DMaterial();
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

function get3DMaterial() {
  const settings = brushSettings[brushType];
  return new THREE.LineBasicMaterial({ color: settings.color });
}

function startDrawing3DLine(event) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0], 3)
  );

  const material = get3DMaterial();
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

function stopDrawing3D() {
  isDrawing3D = false;
  startLine = null;
}

function toggleDrawingMode() {
  const button = document.getElementById("toggleModeButton");

  if (currentMode === "2D") {
    currentMode = "3D";
    document.getElementById("canvas2D").style.display = "none";
    document.getElementById("canvas3D").style.display = "block";
    button.textContent = "Переключить на 2D";
    camera3D.position.z = 5;
    controls.enabled = true;
    document
      .getElementById("canvas3D")
      .addEventListener("mousedown", startDrawing3D);
    document.getElementById("canvas3D").addEventListener("mousemove", draw3D);
    document
      .getElementById("canvas3D")
      .addEventListener("mouseup", stopDrawing3D);
    document
      .getElementById("canvas3D")
      .addEventListener("mouseout", stopDrawing3D);
  } else {
    currentMode = "2D";
    document.getElementById("canvas2D").style.display = "block";
    document.getElementById("canvas3D").style.display = "none";
    button.textContent = "Переключить на 3D";
    controls.enabled = false;
    document
      .getElementById("canvas3D")
      .removeEventListener("mousedown", startDrawing3D);
    document
      .getElementById("canvas3D")
      .removeEventListener("mousemove", draw3D);
    document
      .getElementById("canvas3D")
      .removeEventListener("mouseup", stopDrawing3D);
    document
      .getElementById("canvas3D")
      .removeEventListener("mouseout", stopDrawing3D);
  }
}

function toggleBrushDropdown() {
  const dropdown = document.getElementById("brushDropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function toggleBrushSettings() {
  const settingsDropdown = document.getElementById("brushSettingsDropdown");
  settingsDropdown.style.display =
    settingsDropdown.style.display === "block" ? "none" : "block";
}

function setBrushType(type) {
  brushType = type;
  toggleBrushDropdown();
}

function updateBrushThickness(thickness) {
  brushSettings[brushType].thickness = thickness;
}

function setColor(color) {
  brushColor = color;
  brushSettings[brushType].color = color;
}

function updateOpacity(opacity) {
  brushSettings[brushType].opacity = opacity / 100;
}

function updateBrightness(value) {
  brightness = parseInt(value, 10);
}

function updateContrast(value) {
  contrast = parseInt(value, 10);
}

function addLayer() {
  const layerName = `Слой ${layers.length + 1}`;
  layers.push(layerName);
  currentLayerIndex = layers.length - 1;
  updateLayerList();
}

function removeLayer() {
  if (layers.length > 0) {
    layers.pop();
    updateLayerList();
  }
}

function updateLayerList() {
  const layerList = document.getElementById("layerList");
  layerList.innerHTML = "";

  layers.forEach((layer, index) => {
    const layerItem = document.createElement("div");
    layerItem.className = "layer-item";
    layerItem.innerHTML = `<span class="layer-name">${layer}</span> <button class="delete-layer-btn" onclick="deleteLayer(${index})">🗑️</button>`;
    layerList.appendChild(layerItem);
  });
}

function deleteLayer(index) {
  if (layers[index]) {
    layers.splice(index, 1);
    updateLayerList();
  }
}

function undo() {
  if (strokes.length > 0) {
    redoStack.push(strokes.pop());
    redrawCanvas();
  }
}

function redo() {
  if (redoStack.length > 0) {
    strokes.push(redoStack.pop());
    redrawCanvas();
  }
}

function redrawCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.filter = `brightness(${brightness + 100}%) contrast(${contrast + 100}%)`;
  strokes.forEach((stroke) => {
    ctx.lineWidth = brushSettings[stroke.brushType].thickness;
    ctx.strokeStyle = brushSettings[stroke.brushType].color;
    ctx.globalAlpha = brushSettings[stroke.brushType].opacity;
    ctx.lineTo(stroke.x, stroke.y);
    ctx.stroke();
  });
  ctx.filter = "none";
}

function init3DScene() {
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera3D.position.z = 5;

  controls = new THREE.OrbitControls(
    camera3D,
    document.getElementById("canvas3D")
  );

  renderer3D = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas3D"),
  });
  renderer3D.setSize(window.innerWidth, window.innerHeight);

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (currentMode === "3D") {
    controls.update();
    renderer3D.render(scene, camera3D);
  }
}

window.addEventListener("resize", resizeCanvas);

// Добавили обязательное экспортирование функций
window.toggleBrushDropdown = toggleBrushDropdown;
window.toggleBrushSettings = toggleBrushSettings;
window.setBrushType = setBrushType;
window.updateBrushThickness = updateBrushThickness;
window.setColor = setColor;
window.updateOpacity = updateOpacity;
window.updateBrightness = updateBrightness;
window.updateContrast = updateContrast;
window.addLayer = addLayer;
window.removeLayer = removeLayer;
window.undo = undo;
window.redo = redo;
window.toggleDrawingMode = toggleDrawingMode;
