// DOM Elements
        const canvas = document.getElementById('pixelCanvas');
        const ctx = canvas.getContext('2d');
        const colorPalette = document.getElementById('colorPalette');
        const currentColorEl = document.getElementById('currentColor');
        const gridWidthSlider = document.getElementById('gridWidth');
        const gridWidthValue = document.getElementById('gridWidthValue');
        const gridHeightSlider = document.getElementById('gridHeight');
        const gridHeightValue = document.getElementById('gridHeightValue');
        const pixelSizeSlider = document.getElementById('pixelSize');
        const pixelSizeValue = document.getElementById('pixelSizeValue');
        const clearBtn = document.getElementById('clearCanvas');
        const saveBtn = document.getElementById('saveCanvas');
        const toolButtons = document.querySelectorAll('.tool-btn');
        const dropZone = document.getElementById('dropZone');
        const imageUpload = document.getElementById('imageUpload');
        const uploadBtn = document.getElementById('uploadBtn');
        const referenceImage = document.getElementById('referenceImage');
        const removeImageBtn = document.getElementById('removeImage');
        const convertImageBtn = document.getElementById('convertImage');
        const scaleSlider = document.getElementById('scale');
        const scaleValue = document.getElementById('scaleValue');
        const maintainAspectRatioCheckbox = document.getElementById('maintainAspectRatio');
        const greyscaleCheckbox = document.getElementById('greyscale');
        const usePaletteCheckbox = document.getElementById('usePalette');
        const paletteSelect = document.getElementById('paletteSelect');
        const customPaletteControls = document.getElementById('customPaletteControls');
        const customPaletteColors = document.getElementById('customPaletteColors');
        const customColorPicker = document.getElementById('customColorPicker');
        const addCustomColorBtn = document.getElementById('addCustomColor');
        const saveCustomPaletteBtn = document.getElementById('saveCustomPalette');
        const ratioButtons = document.querySelectorAll('.ratio-btn');
        const canvasDimensions = document.getElementById('canvasDimensions');
        const loader = document.getElementById('loader');

        // App State
        let currentColor = '#FF5733';
        let gridWidth = parseInt(gridWidthSlider.value);
        let gridHeight = parseInt(gridHeightSlider.value);
        let pixelSize = parseInt(pixelSizeSlider.value);
        let isDrawing = false;
        let currentTool = 'pencil';
        let canvasData = [];
        let referenceImageData = null;
        let scale = parseInt(scaleSlider.value);
        let maintainAspectRatio = true;
        let useGrayscale = false;
        let usePalette = false;
        let selectedPalette = 'default';
        let customPalette = [];

        // Color palettes
        const palettes = {
            default: [
                '#FF5733', '#33FF57', '#3357FF', '#F3FF33', 
                '#FF33F3', '#33FFF3', '#FFFFFF', '#000000',
                '#FF8C33', '#8C33FF', '#33FF8C', '#F3A833',
                '#A833F3', '#33A8F3', '#888888', '#333333'
            ],
            '4color': [
                '#FF0000', '#00FF00', '#0000FF', '#FFFF00'
            ],
            '16color': [
                '#FF0000', '#FF7F00', '#FFFF00', '#7FFF00',
                '#00FF00', '#00FF7F', '#00FFFF', '#007FFF',
                '#0000FF', '#7F00FF', '#FF00FF', '#FF007F',
                '#FFFFFF', '#C0C0C0', '#808080', '#000000'
            ],
            custom: []
        };

        // Initialize the app
        function init() {
            setupColorPalette();
            setupEventListeners();
            resizeCanvas();
            drawGrid();
            initializeCanvasData();
            updateCurrentColorDisplay();
            loadCustomPalettes();
            updateCanvasDimensions();
            updateCursor();
        }

        // Set up the color palette
        function setupColorPalette() {
            colorPalette.innerHTML = '';
            const colors = palettes.default;
            
            colors.forEach(color => {
                const colorEl = document.createElement('div');
                colorEl.className = 'color';
                colorEl.style.backgroundColor = color;
                colorEl.dataset.color = color;
                
                if (color === currentColor) {
                    colorEl.classList.add('active');
                }
                
                colorEl.addEventListener('click', () => {
                    document.querySelectorAll('.color').forEach(c => c.classList.remove('active'));
                    colorEl.classList.add('active');
                    currentColor = color;
                    updateCurrentColorDisplay();
                });
                
                colorPalette.appendChild(colorEl);
            });
        }

        // Set up event listeners
        function setupEventListeners() {
            // Canvas events - using more precise event handling
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseleave', handleMouseUp);
            
            // Touch events for mobile
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
            
            // Tool buttons
            toolButtons.forEach(button => {
                button.addEventListener('click', () => {
                    toolButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    currentTool = button.id.replace('Tool', '');
                    updateCursor();
                });
            });
            
            // Size controls
            gridWidthSlider.addEventListener('input', () => {
                gridWidth = parseInt(gridWidthSlider.value);
                gridWidthValue.textContent = gridWidth;
                resizeCanvas();
                drawGrid();
                initializeCanvasData();
                updateCanvasDimensions();
            });
            
            gridHeightSlider.addEventListener('input', () => {
                gridHeight = parseInt(gridHeightSlider.value);
                gridHeightValue.textContent = gridHeight;
                resizeCanvas();
                drawGrid();
                initializeCanvasData();
                updateCanvasDimensions();
            });
            
            pixelSizeSlider.addEventListener('input', () => {
                pixelSize = parseInt(pixelSizeSlider.value);
                pixelSizeValue.textContent = `${pixelSize}px`;
                resizeCanvas();
                drawGrid();
                redrawCanvas();
            });
            
            // Aspect ratio buttons
            ratioButtons.forEach(button => {
                button.addEventListener('click', () => {
                    ratioButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    const ratio = button.dataset.ratio;
                    if (ratio !== 'custom') {
                        applyAspectRatio(ratio);
                    }
                });
            });
            
            // Action buttons
            clearBtn.addEventListener('click', clearCanvas);
            saveBtn.addEventListener('click', saveCanvas);
            
            // Image reference controls
            uploadBtn.addEventListener('click', () => imageUpload.click());
            imageUpload.addEventListener('change', handleImageUpload);
            removeImageBtn.addEventListener('click', removeReferenceImage);
            convertImageBtn.addEventListener('click', convertImageToPixelArt);
            
            // Drag and drop events
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('dragleave', handleDragLeave);
            dropZone.addEventListener('drop', handleDrop);
            
            // Conversion controls
            scaleSlider.addEventListener('input', () => {
                scale = parseInt(scaleSlider.value);
                scaleValue.textContent = scale;
            });
            
            maintainAspectRatioCheckbox.addEventListener('change', () => {
                maintainAspectRatio = maintainAspectRatioCheckbox.checked;
            });
            
            greyscaleCheckbox.addEventListener('change', () => {
                useGrayscale = greyscaleCheckbox.checked;
            });
            
            usePaletteCheckbox.addEventListener('change', () => {
                usePalette = usePaletteCheckbox.checked;
            });
            
            paletteSelect.addEventListener('change', () => {
                selectedPalette = paletteSelect.value;
                if (selectedPalette === 'custom') {
                    customPaletteControls.style.display = 'block';
                    updateCustomPaletteDisplay();
                } else {
                    customPaletteControls.style.display = 'none';
                }
            });
            
            // Custom palette controls
            addCustomColorBtn.addEventListener('click', addCustomColor);
            saveCustomPaletteBtn.addEventListener('click', saveCustomPalette);
        }

        // Update cursor based on current tool
        function updateCursor() {
            if (currentTool === 'pencil') {
                canvas.classList.add('cursor-pencil');
                canvas.classList.remove('cursor-eraser');
            } else if (currentTool === 'eraser') {
                canvas.classList.add('cursor-eraser');
                canvas.classList.remove('cursor-pencil');
            } else {
                canvas.classList.remove('cursor-pencil', 'cursor-eraser');
            }
        }

        // Mouse event handlers with precise coordinate calculation
        function handleMouseDown(e) {
            e.preventDefault();
            isDrawing = true;
            const { x, y } = getCanvasCoordinates(e);
            drawAtPosition(x, y);
        }

        function handleMouseMove(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const { x, y } = getCanvasCoordinates(e);
            drawAtPosition(x, y);
        }

        function handleMouseUp() {
            isDrawing = false;
        }

        // Touch event handlers
        function handleTouchStart(e) {
            e.preventDefault();
            isDrawing = true;
            const touch = e.touches[0];
            const { x, y } = getCanvasCoordinates(touch);
            drawAtPosition(x, y);
        }

        function handleTouchMove(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const touch = e.touches[0];
            const { x, y } = getCanvasCoordinates(touch);
            drawAtPosition(x, y);
        }

        function handleTouchEnd() {
            isDrawing = false;
        }

        // Get precise canvas coordinates
        function getCanvasCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const x = Math.floor(((clientX - rect.left) * scaleX) / pixelSize);
            const y = Math.floor(((clientY - rect.top) * scaleY) / pixelSize);
            
            return { x, y };
        }

        // Draw at specific grid position
        function drawAtPosition(x, y) {
            if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                if (currentTool === 'pencil') {
                    canvasData[y][x] = currentColor;
                } else if (currentTool === 'eraser') {
                    canvasData[y][x] = null;
                } else if (currentTool === 'fill') {
                    fillArea(x, y);
                } else if (currentTool === 'colorPicker') {
                    pickColor(x, y);
                }
                
                redrawCanvas();
            }
        }

        // Apply aspect ratio to grid dimensions
        function applyAspectRatio(ratio) {
            const [widthRatio, heightRatio] = ratio.split(':').map(Number);
            
            // Calculate new dimensions while maintaining approximate pixel count
            const currentPixels = gridWidth * gridHeight;
            const aspectRatio = widthRatio / heightRatio;
            
            // Calculate new dimensions that maintain similar pixel count
            gridHeight = Math.round(Math.sqrt(currentPixels / aspectRatio));
            gridWidth = Math.round(gridHeight * aspectRatio);
            
            // Ensure dimensions are within bounds
            gridWidth = Math.max(16, Math.min(64, gridWidth));
            gridHeight = Math.max(16, Math.min(64, gridHeight));
            
            // Update sliders and values
            gridWidthSlider.value = gridWidth;
            gridHeightSlider.value = gridHeight;
            gridWidthValue.textContent = gridWidth;
            gridHeightValue.textContent = gridHeight;
            
            // Update canvas
            resizeCanvas();
            drawGrid();
            initializeCanvasData();
            updateCanvasDimensions();
        }

        // Update canvas dimensions display
        function updateCanvasDimensions() {
            canvasDimensions.textContent = `Canvas Size: ${gridWidth} × ${gridHeight} pixels`;
        }

        // Update current color display
        function updateCurrentColorDisplay() {
            currentColorEl.style.backgroundColor = currentColor;
        }

        // Resize canvas based on grid and pixel size
        function resizeCanvas() {
            canvas.width = gridWidth * pixelSize;
            canvas.height = gridHeight * pixelSize;
        }

        // Draw the grid lines
        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            
            for (let x = 0; x <= gridWidth; x++) {
                ctx.beginPath();
                ctx.moveTo(x * pixelSize, 0);
                ctx.lineTo(x * pixelSize, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y <= gridHeight; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * pixelSize);
                ctx.lineTo(canvas.width, y * pixelSize);
                ctx.stroke();
            }
        }

        // Initialize canvas data array
        function initializeCanvasData() {
            canvasData = [];
            for (let y = 0; y < gridHeight; y++) {
                canvasData[y] = [];
                for (let x = 0; x < gridWidth; x++) {
                    canvasData[y][x] = null;
                }
            }
        }

        // Redraw the entire canvas from data
        function redrawCanvas() {
            drawGrid();
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    if (canvasData[y][x]) {
                        ctx.fillStyle = canvasData[y][x];
                        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        }

        // Flood fill algorithm
        function fillArea(x, y) {
            const targetColor = canvasData[y][x];
            if (targetColor === currentColor) return;
            
            const queue = [[x, y]];
            const visited = new Set();
            
            while (queue.length > 0) {
                const [cx, cy] = queue.shift();
                const key = `${cx},${cy}`;
                
                if (visited.has(key)) continue;
                if (cx < 0 || cx >= gridWidth || cy < 0 || cy >= gridHeight) continue;
                if (canvasData[cy][cx] !== targetColor) continue;
                
                canvasData[cy][cx] = currentColor;
                visited.add(key);
                
                queue.push([cx + 1, cy]);
                queue.push([cx - 1, cy]);
                queue.push([cx, cy + 1]);
                queue.push([cx, cy - 1]);
            }
            
            redrawCanvas();
        }

        // Color picker tool
        function pickColor(x, y) {
            if (canvasData[y][x]) {
                currentColor = canvasData[y][x];
                updateCurrentColorDisplay();
                
                // Update active color in palette
                document.querySelectorAll('.color').forEach(colorEl => {
                    if (colorEl.dataset.color === currentColor) {
                        colorEl.classList.add('active');
                    } else {
                        colorEl.classList.remove('active');
                    }
                });
            }
        }

        // Clear the canvas
        function clearCanvas() {
            if (confirm('Are you sure you want to clear the canvas?')) {
                initializeCanvasData();
                redrawCanvas();
            }
        }

        // Save the canvas as an image
        function saveCanvas() {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = gridWidth * pixelSize;
            tempCanvas.height = gridHeight * pixelSize;
            
            // Fill with white background
            tempCtx.fillStyle = '#FFFFFF';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw the pixel art
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    if (canvasData[y][x]) {
                        tempCtx.fillStyle = canvasData[y][x];
                        tempCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'pixel-art.png';
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
        }

        // Image reference functions
        function handleDragOver(e) {
            e.preventDefault();
            dropZone.classList.add('dragover');
        }

        function handleDragLeave(e) {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        }

        function handleDrop(e) {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageFile(files[0]);
            }
        }

        function handleImageUpload(e) {
            const files = e.target.files;
            if (files.length > 0) {
                handleImageFile(files[0]);
            }
        }

        function handleImageFile(file) {
            if (!file.type.match('image.*')) {
                alert('Please select an image file.');
                return;
            }
            
            showLoader();
            const reader = new FileReader();
            reader.onload = function(e) {
                referenceImage.src = e.target.result;
                referenceImage.style.display = 'block';
                referenceImageData = new Image();
                referenceImageData.src = e.target.result;
                
                referenceImageData.onload = function() {
                    hideLoader();
                    // Auto-detect aspect ratio and suggest it
                    const imgAspectRatio = referenceImageData.width / referenceImageData.height;
                    
                    if (imgAspectRatio > 1.3) {
                        // Wide image (16:9, 4:3, etc.)
                        applyAspectRatio('16:9');
                    } else if (imgAspectRatio < 0.7) {
                        // Tall image (9:16)
                        applyAspectRatio('9:16');
                    } else {
                        // Square-ish image
                        applyAspectRatio('1:1');
                    }
                };
            };
            reader.readAsDataURL(file);
        }

        function removeReferenceImage() {
            referenceImage.style.display = 'none';
            referenceImageData = null;
        }

        function convertImageToPixelArt() {
            if (!referenceImageData) {
                alert('Please upload an image first.');
                return;
            }
            
            showLoader();
            
            // Use setTimeout to allow the UI to update
            setTimeout(() => {
                // Create a temporary canvas to work with the image
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                // Calculate dimensions based on scale and aspect ratio
                let width, height;
                
                if (maintainAspectRatio) {
                    // Maintain aspect ratio of original image
                    const aspectRatio = referenceImageData.width / referenceImageData.height;
                    
                    // Calculate dimensions that fit within our grid while maintaining aspect ratio
                    if (aspectRatio > 1) {
                        // Wide image
                        width = Math.min(Math.floor(referenceImageData.width / scale), gridWidth);
                        height = Math.floor(width / aspectRatio);
                    } else {
                        // Tall image
                        height = Math.min(Math.floor(referenceImageData.height / scale), gridHeight);
                        width = Math.floor(height * aspectRatio);
                    }
                } else {
                    // Use full grid dimensions
                    width = Math.min(Math.floor(referenceImageData.width / scale), gridWidth);
                    height = Math.min(Math.floor(referenceImageData.height / scale), gridHeight);
                }
                
                // Ensure dimensions are at least 1
                width = Math.max(1, width);
                height = Math.max(1, height);
                
                tempCanvas.width = width;
                tempCanvas.height = height;
                
                // Draw the image scaled down
                tempCtx.drawImage(referenceImageData, 0, 0, width, height);
                
                // Get the pixel data
                const imageData = tempCtx.getImageData(0, 0, width, height);
                const data = imageData.data;
                
                // Clear the canvas
                initializeCanvasData();
                
                // Calculate how many grid cells each pixelated pixel should cover
                const cellsPerPixelX = Math.ceil(gridWidth / width);
                const cellsPerPixelY = Math.ceil(gridHeight / height);
                
                // Get the selected palette
                let palette = palettes[selectedPalette];
                if (selectedPalette === 'custom' && customPalette.length > 0) {
                    palette = customPalette;
                }
                
                // Convert each pixel to our grid
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        const r = data[index];
                        const g = data[index + 1];
                        const b = data[index + 2];
                        const a = data[index + 3];
                        
                        // Only set color if pixel is not transparent
                        if (a > 128) {
                            let color;
                            
                            if (useGrayscale) {
                                // Convert to grayscale
                                const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
                                color = `rgb(${gray}, ${gray}, ${gray})`;
                            } else if (usePalette && palette.length > 0) {
                                // Find the closest color from the palette
                                color = findClosestColor(r, g, b, palette);
                            } else {
                                // Use the original color
                                color = `rgb(${r}, ${g}, ${b})`;
                            }
                            
                            // Calculate the grid position for this pixel
                            const gridX = Math.floor(x * (gridWidth / width));
                            const gridY = Math.floor(y * (gridHeight / height));
                            
                            // Calculate how many cells to fill from this position
                            const nextGridX = Math.min(Math.floor((x + 1) * (gridWidth / width)), gridWidth);
                            const nextGridY = Math.min(Math.floor((y + 1) * (gridHeight / height)), gridHeight);
                            
                            const widthCells = nextGridX - gridX;
                            const heightCells = nextGridY - gridY;
                            
                            // Fill the corresponding grid cells
                            for (let py = 0; py < heightCells; py++) {
                                for (let px = 0; px < widthCells; px++) {
                                    const actualGridX = gridX + px;
                                    const actualGridY = gridY + py;
                                    
                                    if (actualGridX < gridWidth && actualGridY < gridHeight) {
                                        canvasData[actualGridY][actualGridX] = color;
                                    }
                                }
                            }
                        }
                    }
                }
                
                redrawCanvas();
                hideLoader();
            }, 100);
        }

        // Find the closest color from a palette
        function findClosestColor(r, g, b, palette) {
            let minDistance = Infinity;
            let closestColor = '#000000';
            
            palette.forEach(color => {
                // Convert hex to RGB
                const hex = color.replace('#', '');
                const cr = parseInt(hex.substr(0, 2), 16);
                const cg = parseInt(hex.substr(2, 2), 16);
                const cb = parseInt(hex.substr(4, 2), 16);
                
                // Calculate color distance
                const rDiff = r - cr;
                const gDiff = g - cg;
                const bDiff = b - cb;
                
                const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = color;
                }
            });
            
            return closestColor;
        }

        // Custom palette functions
        function addCustomColor() {
            const color = customColorPicker.value;
            if (!customPalette.includes(color)) {
                customPalette.push(color);
                updateCustomPaletteDisplay();
            }
        }

        function updateCustomPaletteDisplay() {
            customPaletteColors.innerHTML = '';
            customPalette.forEach(color => {
                const colorEl = document.createElement('div');
                colorEl.className = 'custom-color';
                colorEl.style.backgroundColor = color;
                colorEl.title = color;
                
                colorEl.addEventListener('click', () => {
                    customPalette = customPalette.filter(c => c !== color);
                    updateCustomPaletteDisplay();
                });
                
                customPaletteColors.appendChild(colorEl);
            });
        }

        function saveCustomPalette() {
            if (customPalette.length === 0) {
                alert('Please add at least one color to your custom palette.');
                return;
            }
            
            localStorage.setItem('customPixelPalette', JSON.stringify(customPalette));
            alert('Custom palette saved!');
        }

        function loadCustomPalettes() {
            const savedPalette = localStorage.getItem('customPixelPalette');
            if (savedPalette) {
                customPalette = JSON.parse(savedPalette);
                palettes.custom = customPalette;
                updateCustomPaletteDisplay();
            }
        }

        // Loader functions
        function showLoader() {
            loader.style.display = 'flex';
        }

        function hideLoader() {
            loader.style.display = 'none';
        }

        // Initialize the app when the page loads
        window.addEventListener('load', init);
