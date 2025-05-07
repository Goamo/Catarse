const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const resultCanvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const resultCtx = resultCanvas.getContext('2d');
        const videoUpload = document.getElementById('video-upload');
        const colorSimplification = document.getElementById('color-simplification');
        const contourThreshold = document.getElementById('contour-threshold');
        const noiseLevel = document.getElementById('noise-level');
        const filterIntensity = document.getElementById('filter-intensity');
        const cartoonEffect = document.getElementById('cartoon-effect');
        const blendMode = document.getElementById('blend-mode');
        const saveFormat = document.getElementById('saveFormat');
        let isColorMode = true;
        const layers = [];

        videoUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const url = URL.createObjectURL(file);
            video.src = url;
            video.style.display = 'block';
        });

        function addLayer() {
            const layer = {
                canvas: document.createElement('canvas'),
                ctx: null,
                opacity: 1.0,
                blendMode: 'normal'
            };
            layer.ctx = layer.canvas.getContext('2d');
            layers.push(layer);

            const layerElement = document.createElement('div');
            layerElement.classList.add('layer');
            const opacityInput = document.createElement('input');
            opacityInput.type = 'range';
            opacityInput.min = '0';
            opacityInput.max = '1';
            opacityInput.step = '0.1';
            opacityInput.value = layer.opacity;
            opacityInput.addEventListener('input', function () {
                layer.opacity = parseFloat(opacityInput.value);
            });

            const blendModeSelect = document.createElement('select');
            ['normal', 'ultiply', 'creen', 'overlay', 'darken', 'lighten'].forEach(mode => {
                const option = document.createElement('option');
                option.value = mode;
                option.textContent = mode;
                blendModeSelect.appendChild(option);
            });
            blendModeSelect.value = layer.blendMode;
            blendModeSelect.addEventListener('change', function () {
                layer.blendMode = blendModeSelect.value;
            });

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Удалить';
            removeButton.addEventListener('click', function () {
                layers.splice(layers.indexOf(layer), 1);
                layerElement.remove();
            });

            layerElement.appendChild(opacityInput);
            layerElement.appendChild(blendModeSelect);
            layerElement.appendChild(removeButton);
            document.getElementById('layerContainer').appendChild(layerElement);
        }

        function applyStylizedEffect() {
            if (!video.src) {
                alert('Пожалуйста, загрузите видео!');
                return;
            }

            canvas.style.display = 'block';
            resultCanvas.style.display = 'block';
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            resultCanvas.width = video.videoWidth;
            resultCanvas.height = video.videoHeight;

            video.play();
            drawEffect();
        }

        function drawEffect() {
            if (video.paused || video.ended) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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

                // Применение мультяшного эффекта
                if (cartoonIntensity > 0) {
                    const avg = (modifiedR + modifiedG + modifiedB) / 3;
                    modifiedR = avg + (modifiedR - avg) * cartoonIntensity / 100;
                    modifiedG = avg + (modifiedG - avg) * cartoonIntensity / 100;
                    modifiedB = avg + (modifiedB - avg) * cartoonIntensity / 100;
                }

                switch (blend) {
                    case 'ultiply':
                        data[i] = r * modifiedR / 255 * intensity + r * (1 - intensity);
                        data[i + 1] = g * modifiedG / 255 * intensity + g * (1 - intensity);
                        data[i + 2] = b * modifiedB / 255 * intensity + b * (1 - intensity);
                        break;
                    case 'creen':
                        data[i] = 255 - (255 - r) * (255 - modifiedR) / 255 * intensity + r * (1 - intensity);
                        data[i + 1] = 255 - (255 - g) * (255 - modifiedG) / 255 * intensity + g * (1 - intensity);
                        data[i + 2] = 255 - (255 - b) * (255 - modifiedB) / 255 * intensity + b * (1 - intensity);
                        break;
                    case 'overlay':
                        data[i] = r < 128
                          ? (2 * r * modifiedR / 255) * intensity + r * (1 - intensity)
                            : (255 - 2 * (255 - r) * (255 - modifiedR) / 255) * intensity + r * (1 - intensity);
                        data[i + 1] = g < 128
                          ? (2 * g * modifiedG / 255) * intensity + g * (1 - intensity)
                            : (255 - 2 * (255 - g) * (255 - modifiedG) / 255) * intensity + g * (1 - intensity);
                        data[i + 2] = b < 128
                          ? (2 * b * modifiedB / 255) * intensity + b * (1 - intensity)
                            : (255 - 2 * (255 - b) * (255 - modifiedB) / 255) * intensity + b * (1 - intensity);
                        break;
                    case 'darken':
                        data[i] = Math.min(r, modifiedR) * intensity + r * (1 - intensity);
                        data[i + 1] = Math.min(g, modifiedG) * intensity + g * (1 - intensity);
                        data[i + 2] = Math.min(b, modifiedB) * intensity + b * (1 - intensity);
                        break;
                    case 'lighten':
                        data[i] = Math.max(r, modifiedR) * intensity + r * (1 - intensity);
                        data[i + 1] = Math.max(g, modifiedG) * intensity + g * (1 - intensity);
                        data[i + 2] = Math.max(b, modifiedB) * intensity + b * (1 - intensity);
                        break;
                    default:
                        data[i] = r * (1 - intensity) + modifiedR * intensity;
                        data[i + 1] = g * (1 - intensity) + modifiedG * intensity;
                        data[i + 2] = b * (1 - intensity) + modifiedB * intensity;
                }
            }

            imageData.data.set(data);
            ctx.putImageData(imageData, 0, 0);

            resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
            resultCtx.drawImage(canvas, 0, 0);

            layers.forEach(layer => {
                layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                layer.canvas.width = resultCanvas.width;
                layer.canvas.height = resultCanvas.height;
            });

            requestAnimationFrame(drawEffect);
        }

        function toggleColorMode() {
    isColorMode =!isColorMode;
    alert(isColorMode? 'Цветовой режим включен' : 'Черно-белый режим включен');
}

function autoEnhance() {
    alert('Автоулучшение применено!');
}

function saveParameters() {
    const parameters = {
        colorQuant: colorSimplification.value,
        contourThreshold: contourThreshold.value,
        noiseLevel: noiseLevel.value,
        filterIntensity: filterIntensity.value,
        cartoonEffect: cartoonEffect.value,
        blendMode: blendMode.value
    };
    localStorage.setItem('videoStylingParameters', JSON.stringify(parameters));
    alert('Параметры сохранены!');
}

function loadParameters() {
    const savedParameters = localStorage.getItem('videoStylingParameters');
    if (savedParameters) {
        const parameters = JSON.parse(savedParameters);
        colorSimplification.value = parameters.colorQuant;
        contourThreshold.value = parameters.contourThreshold;
        noiseLevel.value = parameters.noiseLevel;
        filterIntensity.value = parameters.filterIntensity;
        cartoonEffect.value = parameters.cartoonEffect;
        blendMode.value = parameters.blendMode;

        document.getElementById('colorValue').textContent = parameters.colorQuant;
        document.getElementById('contourValue').textContent = parameters.contourThreshold;
        document.getElementById('noiseValue').textContent = parameters.noiseLevel;
        document.getElementById('intensityValue').textContent = parameters.filterIntensity;
        document.getElementById('cartoonValue').textContent = parameters.cartoonEffect;

        applyStylizedEffect();
        alert('Параметры загружены!');
    } else {
        alert('Нет сохраненных параметров.');
    }
}

// Обработчики событий для ползунков
colorSimplification.addEventListener('input', function() {
    document.getElementById('colorValue').textContent = colorSimplification.value;
});

contourThreshold.addEventListener('input', function() {
    document.getElementById('contourValue').textContent = contourThreshold.value;
});

noiseLevel.addEventListener('input', function() {
    document.getElementById('noiseValue').textContent = noiseLevel.value;
});

filterIntensity.addEventListener('input', function() {
    document.getElementById('intensityValue').textContent = filterIntensity.value;
});

cartoonEffect.addEventListener('input', function() {
    document.getElementById('cartoonValue').textContent = cartoonEffect.value;
});

document.getElementById('saveButton').addEventListener('click', function() {
    const resultCanvas = document.getElementById('resultCanvas');
    const saveFormat = document.getElementById('saveFormat').value;

    if (saveFormat === 'p4') {
        const stream = resultCanvas.captureStream();
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        const chunks = [];
        mediaRecorder.ondataavailable = function(event) {
            chunks.push(event.data);
        };
        mediaRecorder.onstop = function(event) {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'video.mp4';
            a.click();
        };
        setTimeout(function() {
            mediaRecorder.stop();
        }, 10000); // Saving after 10 seconds
    } else if (saveFormat === 'gif') {
        const gif = new GIF({
            workers: 2,
            quality: 10
        });
        gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animated.gif';
            a.click();
        });
        gif.addFrame(resultCanvas, {copy: true});
        gif.render();
    }
});
