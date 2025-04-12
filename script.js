// Photo Booth with Background Selector Script

document.addEventListener('DOMContentLoaded', function () {
    // Camera variables
    let stream;
    let videoElement;
    let canvasElement;
    let captureButton;
    let photoCount = 0;
    let photoImages = [];

    // Frame selector variables
    const frameOptions = document.querySelectorAll('.frame-option');
    const previewCanvas = document.getElementById('preview-canvas');
    const ctx = previewCanvas.getContext('2d');
    const selectedFrameName = document.getElementById('selected-frame-name');
    const dimensionsDisplay = document.getElementById('dimensions-display');

    // Size inputs
    const widthInput = document.getElementById('background-width');
    const heightInput = document.getElementById('background-height');
    const presetButtons = document.querySelectorAll('.preset-btn');

    // Content inputs
    const contentText = document.getElementById('content-text');
    const textColor = document.getElementById('text-color');
    const textSize = document.getElementById('text-size');
    const contentPosition = document.getElementById('content-position');

    // New photo spacing controls
    const photoSpacing = document.getElementById('photo-spacing');
    const spacingValue = document.getElementById('spacing-value');

    // New photo area and position controls
    const photoAreaPercent = document.getElementById('photo-area-percent');
    const areaValue = document.getElementById('area-value');
    const photoPosition = document.getElementById('photo-position');

    // New margin controls
    const topMarginControl = document.getElementById('top-margin-control');
    const bottomMarginControl = document.getElementById('bottom-margin-control');
    const topMarginSlider = document.getElementById('top-margin');
    const bottomMarginSlider = document.getElementById('bottom-margin');
    const topMarginValue = document.getElementById('top-margin-value');
    const bottomMarginValue = document.getElementById('bottom-margin-value');

    // Photo style controls
    const borderRadiusSlider = document.getElementById('border-radius');
    const radiusValue = document.getElementById('radius-value');
    const vintageFrameSelect = document.getElementById('vintage-frame');

    // Action buttons
    const createBtn = document.getElementById('create-btn');
    const downloadBtn = document.getElementById('download-btn');
    const restartBtn = document.getElementById('restart-btn');
    const restartPhotoBtn = document.getElementById('restart-photo-btn');
    const downloadFinalBtn = document.getElementById('download-final-btn');
    const restartFinalBtn = document.getElementById('restart-final-btn');

    // Selected frame
    let selectedFrame = 'frame1.png';
    let selectedFrameImg = new Image();
    selectedFrameImg.src = selectedFrame;

    // Initialize camera elements
    videoElement = document.getElementById('camera');
    canvasElement = document.getElementById('canvas');
    captureButton = document.getElementById('capture-btn');

    // Initialize camera access
    initCamera();

    // Create event listeners
    captureButton.addEventListener('click', capturePhoto);

    // Set initial canvas size
    updateCanvasSize();

    // Add click event to each frame option
    frameOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Get the frame filename
            const framePath = this.getAttribute('data-frame');

            // Update selected frame
            selectedFrame = framePath;
            selectedFrameImg.src = framePath;

            // Update selected frame name display
            selectedFrameName.textContent = framePath;

            // Update selected class
            frameOptions.forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');

            console.log('Selected frame:', framePath);

            // Update preview
            updatePreview();
        });

        // Add error handling for frame images
        const img = option.querySelector('img');
        if (img) {
            img.onerror = function () {
                console.error('Failed to load image:', this.src);
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iODAiIHk9IjgwIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2Ugbm90IGZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                option.classList.add('error');
            };
        }
    });

    // Add event listeners for size inputs
    widthInput.addEventListener('change', function () {
        validateSize();
        updateCanvasSize();
        updatePreview();
    });

    heightInput.addEventListener('change', function () {
        validateSize();
        updateCanvasSize();
        updatePreview();
    });

    // Add event listeners for preset buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', function () {
            const width = this.getAttribute('data-width');
            const height = this.getAttribute('data-height');

            widthInput.value = width;
            heightInput.value = height;

            updateCanvasSize();
            updatePreview();
        });
    });

    // Add event listeners for content inputs
    contentText.addEventListener('input', updatePreview);
    textColor.addEventListener('input', updatePreview);
    textSize.addEventListener('input', updatePreview);
    contentPosition.addEventListener('change', updatePreview);

    // Add event listener for spacing control
    photoSpacing.addEventListener('input', function () {
        spacingValue.textContent = this.value;
        updatePreview();
    });

    // Add event listeners for the new controls
    photoAreaPercent.addEventListener('input', function () {
        areaValue.textContent = this.value;
        updatePreview();
    });

    photoPosition.addEventListener('change', function () {
        // Show/hide margin controls based on selected position
        if (this.value === 'top') {
            topMarginControl.style.display = 'flex';
            bottomMarginControl.style.display = 'none';
        } else if (this.value === 'bottom') {
            topMarginControl.style.display = 'none';
            bottomMarginControl.style.display = 'flex';
        } else {
            topMarginControl.style.display = 'none';
            bottomMarginControl.style.display = 'none';
        }
        updatePreview();
    });

    // Add event listeners for margin sliders
    topMarginSlider.addEventListener('input', function () {
        topMarginValue.textContent = this.value;
        updatePreview();
    });

    bottomMarginSlider.addEventListener('input', function () {
        bottomMarginValue.textContent = this.value;
        updatePreview();
    });

    // Add event listeners for photo style controls
    borderRadiusSlider.addEventListener('input', function () {
        radiusValue.textContent = this.value;
        updatePreview();
    });

    vintageFrameSelect.addEventListener('change', updatePreview);

    // Create button click handler
    createBtn.addEventListener('click', createPhotoStrip);

    // Download button click handler
    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = 'photo-strip.png';
        link.href = previewCanvas.toDataURL('image/png');
        link.click();
    });

    // Final download button handler
    downloadFinalBtn.addEventListener('click', function () {
        const finalImage = document.getElementById('final-image');
        const link = document.createElement('a');
        link.download = 'photo-strip-' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = finalImage.src;
        link.click();
    });

    // Restart buttons click handlers
    restartBtn.addEventListener('click', restartProcess);
    restartPhotoBtn.addEventListener('click', restartProcess);
    restartFinalBtn.addEventListener('click', restartProcess);

    // Initialize camera access
    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });

            videoElement.srcObject = stream;
            captureButton.disabled = false;
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please make sure you have granted permission and your camera is connected.');
            captureButton.disabled = true;
        }
    }

    // Capture photo from webcam
    function capturePhoto() {
        // Check if we already have 4 photos
        if (photoCount >= 4) {
            alert("You've already taken 4 photos!");
            return;
        }

        // Set canvas dimensions to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Draw video frame to canvas
        const context = canvasElement.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        // Flip horizontally to correct the mirror effect
        context.translate(canvasElement.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        // Convert canvas to image data URL
        const imageDataUrl = canvasElement.toDataURL('image/png');

        // Create image element
        const img = document.createElement('img');
        img.src = imageDataUrl;

        // Store image data
        photoImages.push(imageDataUrl);

        // Update photo cell
        const photoCell = document.getElementById(`photo${photoCount + 1}`);
        photoCell.innerHTML = '';
        photoCell.appendChild(img);

        // Update counter
        photoCount++;

        // Update display counter
        document.getElementById('photo-count').textContent = photoCount;

        // Add visual feedback for capture
        captureButton.classList.add('flash');
        setTimeout(() => captureButton.classList.remove('flash'), 300);

        // Check if we've taken all 4 photos
        if (photoCount === 4) {
            // Show restart button
            restartBtn.style.display = 'inline-block';
            captureButton.disabled = true;

            // Show customization sections
            document.getElementById('size-selector').style.display = 'block';
            document.getElementById('frame-selector').style.display = 'block';
            document.getElementById('content-section').style.display = 'block';
            document.getElementById('preview-section').style.display = 'block';
            document.getElementById('photo-actions').style.display = 'flex';

            // Initialize preview
            updateCanvasSize();
            updatePreview();

            // Scroll to the size selector
            document.getElementById('size-selector').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Function to validate size inputs
    function validateSize() {
        let width = parseInt(widthInput.value);
        let height = parseInt(heightInput.value);

        // Ensure width is within bounds
        if (isNaN(width) || width < 300) width = 300;
        if (width > 1200) width = 1200;

        // Ensure height is within bounds
        if (isNaN(height) || height < 300) height = 300;
        if (height > 1200) height = 1200;

        // Update inputs with validated values
        widthInput.value = width;
        heightInput.value = height;

        // Update dimensions display
        dimensionsDisplay.textContent = width + ' × ' + height + ' px';
    }

    // Function to update canvas size
    function updateCanvasSize() {
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);

        previewCanvas.width = width;
        previewCanvas.height = height;

        // Update dimensions display
        dimensionsDisplay.textContent = width + ' × ' + height + ' px';

        // Adjust the preview container to maintain aspect ratio
        const previewElement = document.querySelector('.preview');
        const maxWidth = 400; // Maximum width for preview display

        if (width > maxWidth) {
            const scale = maxWidth / width;
            previewElement.style.width = maxWidth + 'px';
            previewElement.style.height = (height * scale) + 'px';
        } else {
            previewElement.style.width = width + 'px';
            previewElement.style.height = height + 'px';
        }
    }

    // Function to update the preview with current selections
    function updatePreview() {
        // Only update if we have all 4 photos
        if (photoCount < 4) return;

        const width = previewCanvas.width;
        const height = previewCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background (white by default)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw selected frame
        if (selectedFrame !== 'none') {
            selectedFrameImg.onload = function () {
                // Draw frame to fit canvas
                ctx.drawImage(selectedFrameImg, 0, 0, width, height);

                // Draw photos on top in a vertical arrangement
                drawPhotosVertically();

                // Draw content on top
                drawContent();
            };

            // If the image is already loaded, draw it immediately
            if (selectedFrameImg.complete) {
                ctx.drawImage(selectedFrameImg, 0, 0, width, height);
                drawPhotosVertically();
                drawContent();
            }
        } else {
            drawPhotosVertically();
            drawContent();
        }
    }

    // Draw photos in a vertical arrangement - updated with spacing parameter and border effects
    function drawPhotosVertically() {
        const width = previewCanvas.width;
        const height = previewCanvas.height;

        // Get current spacing value from slider
        const spacing = parseInt(photoSpacing.value);

        // Get area percentage and position
        const areaPercent = parseInt(photoAreaPercent.value) / 100;
        const position = photoPosition.value;

        // Get style settings
        const borderRadius = parseInt(borderRadiusSlider.value);
        const vintageFrame = vintageFrameSelect.value;

        // Calculate photo dimensions based on canvas size, spacing, and area percentage
        const usableHeight = height * areaPercent; // Percentage of total height based on slider
        const photoWidth = width * 0.9;
        const photoHeight = (usableHeight - (spacing * 3)) / 4; // Adjust for custom spacing

        // Get user-defined margins
        const customTopMargin = parseInt(topMarginSlider.value);
        const customBottomMargin = parseInt(bottomMarginSlider.value);

        // Calculate starting Y position based on selected position
        let startY;
        switch (position) {
            case 'top':
                startY = customTopMargin; // Top position with custom margin
                break;
            case 'center':
                // Center the group of photos in the canvas
                const totalPhotoAreaHeight = (photoHeight * 4) + (spacing * 3);
                startY = Math.max(20, (height - totalPhotoAreaHeight) / 2);
                break;
            case 'bottom':
                // Position photos at the bottom with custom margin
                const totalBottomHeight = (photoHeight * 4) + (spacing * 3);
                startY = Math.max(20, height - totalBottomHeight - customBottomMargin);
                break;
            default:
                startY = 20;
        }

        // Draw photos
        for (let i = 0; i < 4; i++) {
            if (i < photoImages.length) {
                // Calculate vertical position based on custom spacing and starting position
                const y = (i === 0) ? startY : (startY + (photoHeight * i) + (spacing * i));
                const x = (width - photoWidth) / 2;

                // Draw the vintage frame first if selected
                if (vintageFrame !== 'none') {
                    drawVintageFrame(x, y, photoWidth, photoHeight, vintageFrame);
                }

                // Create image from photo data
                const img = new Image();
                img.src = photoImages[i];

                // Draw the photo with all its effects
                drawPhotoWithEffects(img, x, y, photoWidth, photoHeight, borderRadius);
            }
        }
    }

    // Function to draw a photo with all effects applied
    function drawPhotoWithEffects(img, x, y, width, height, borderRadius) {
        const drawPhoto = function () {
            // Calculate aspect ratio to maintain proportions
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight;

            if (aspectRatio > width / height) {
                // Image is wider than our target
                drawWidth = width;
                drawHeight = width / aspectRatio;
            } else {
                // Image is taller than our target
                drawHeight = height;
                drawWidth = height * aspectRatio;
            }

            // Center image
            const offsetX = x + (width - drawWidth) / 2;
            const offsetY = y + (height - drawHeight) / 2;

            // Draw photo with rounded corners if specified
            if (borderRadius > 0) {
                ctx.save();
                roundedRect(offsetX, offsetY, drawWidth, drawHeight, borderRadius);
                ctx.clip();
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                ctx.restore();
            } else {
                // Draw normal photo without rounded corners
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        };

        // If image is already loaded, draw it immediately, otherwise wait for onload
        if (img.complete) {
            drawPhoto();
        } else {
            img.onload = drawPhoto;
        }
    }

    // Helper function to create a rounded rectangle path
    function roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Function to draw vintage photo frame
    function drawVintageFrame(x, y, width, height, frameType) {
        // Expand dimensions to create frame border
        const frameOffset = width * 0.05; // 5% of width for frame
        const frameX = x - frameOffset;
        const frameY = y - frameOffset;
        const frameWidth = width + (frameOffset * 2);
        const frameHeight = height + (frameOffset * 2);

        ctx.save();

        switch (frameType) {
            case 'vintage1': // Classic white border
                // Draw white frame
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                roundedRect(frameX, frameY, frameWidth, frameHeight, 3);
                ctx.fill();

                // Add subtle texture to frame
                ctx.globalAlpha = 0.1;
                for (let i = 0; i < 200; i++) {
                    const dotX = frameX + Math.random() * frameWidth;
                    const dotY = frameY + Math.random() * frameHeight;
                    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#888888';
                    ctx.fillRect(dotX, dotY, 1, 1);
                }
                ctx.globalAlpha = 1.0;
                break;

            case 'vintage2': // Torn edge effect
                // Draw white base
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.beginPath();
                // Create jagged path for torn paper effect
                ctx.moveTo(frameX, frameY);

                // Top edge
                for (let i = 0; i < 20; i++) {
                    const jitter = Math.random() * 4 - 2;
                    const xPos = frameX + (i * frameWidth / 20);
                    ctx.lineTo(xPos, frameY + jitter);
                }

                // Right edge
                for (let i = 0; i < 20; i++) {
                    const jitter = Math.random() * 4 - 2;
                    const yPos = frameY + (i * frameHeight / 20);
                    ctx.lineTo(frameX + frameWidth + jitter, yPos);
                }

                // Bottom edge
                for (let i = 20; i > 0; i--) {
                    const jitter = Math.random() * 4 - 2;
                    const xPos = frameX + (i * frameWidth / 20);
                    ctx.lineTo(xPos, frameY + frameHeight + jitter);
                }

                // Left edge
                for (let i = 20; i > 0; i--) {
                    const jitter = Math.random() * 4 - 2;
                    const yPos = frameY + (i * frameHeight / 20);
                    ctx.lineTo(frameX + jitter, yPos);
                }

                ctx.closePath();
                ctx.fill();

                // Add vintage yellowing
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = '#D4B483';
                ctx.fill();
                ctx.globalAlpha = 1.0;
                break;

            case 'vintage3': // Scalloped edge
                // Draw white base with scalloped border
                ctx.fillStyle = '#FFFEF0'; // Slightly off-white for vintage feel
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                ctx.beginPath();

                // Top edge with scallop pattern
                const scallops = 8; // Number of scallops per side
                const scallopsRadius = frameWidth / (scallops * 2);

                // Start at top-left
                ctx.moveTo(frameX, frameY + scallopsRadius);

                // Top scallops
                for (let i = 0; i < scallops; i++) {
                    const centerX = frameX + (2 * i + 1) * scallopsRadius;
                    ctx.arc(centerX, frameY + scallopsRadius, scallopsRadius, Math.PI, 0, false);
                }

                // Right scallops
                for (let i = 0; i < scallops; i++) {
                    const centerY = frameY + (2 * i + 1) * scallopsRadius;
                    ctx.arc(frameX + frameWidth - scallopsRadius, centerY, scallopsRadius, Math.PI * 0.5, Math.PI * 1.5, false);
                }

                // Bottom scallops
                for (let i = scallops - 1; i >= 0; i--) {
                    const centerX = frameX + (2 * i + 1) * scallopsRadius;
                    ctx.arc(centerX, frameY + frameHeight - scallopsRadius, scallopsRadius, 0, Math.PI, false);
                }

                // Left scallops
                for (let i = scallops - 1; i >= 0; i--) {
                    const centerY = frameY + (2 * i + 1) * scallopsRadius;
                    ctx.arc(frameX + scallopsRadius, centerY, scallopsRadius, Math.PI * 1.5, Math.PI * 0.5, false);
                }

                ctx.closePath();
                ctx.fill();

                // Add subtle aging to the frame
                ctx.globalAlpha = 0.07;
                ctx.fillStyle = '#D4B483';
                ctx.fill();
                ctx.globalAlpha = 1.0;
                break;
        }

        ctx.restore();
    }

    // Function to draw content text
    function drawContent() {
        const text = contentText.value;
        if (!text) return;

        const width = previewCanvas.width;
        const height = previewCanvas.height;

        // Text properties
        ctx.fillStyle = textColor.value;
        ctx.font = `${textSize.value}px Arial`;
        ctx.textAlign = 'center';

        // Calculate text position
        let textY;
        const position = contentPosition.value;

        switch (position) {
            case 'top':
                ctx.textBaseline = 'top';
                textY = 20;
                break;
            case 'middle':
                ctx.textBaseline = 'middle';
                textY = height / 2;
                break;
            case 'bottom':
                ctx.textBaseline = 'bottom';
                textY = height - 20;
                break;
            default:
                ctx.textBaseline = 'middle';
                textY = height / 2;
        }

        // Break text into lines if needed
        const maxWidth = width * 0.9; // 90% of canvas width
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // Draw each line
        const lineHeight = parseInt(textSize.value) * 1.2;
        let offsetY = 0;

        // Adjust starting Y position for multi-line text
        if (position === 'top') {
            // No adjustment needed for top alignment
        } else if (position === 'middle') {
            offsetY = -(lines.length - 1) * lineHeight / 2;
        } else if (position === 'bottom') {
            offsetY = -(lines.length - 1) * lineHeight;
        }

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], width / 2, textY + offsetY + (i * lineHeight));
        }
    }

    // Function to create the final photo strip
    function createPhotoStrip() {
        if (photoCount < 4) {
            alert("Please take all 4 photos first!");
            return;
        }

        // Get current preview canvas state
        const finalImage = document.getElementById('final-image');
        finalImage.src = previewCanvas.toDataURL('image/png');

        // Show the final photo container
        document.getElementById('camera-section').style.display = 'none';
        document.getElementById('size-selector').style.display = 'none';
        document.getElementById('frame-selector').style.display = 'none';
        document.getElementById('content-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'none';
        document.getElementById('photo-actions').style.display = 'none';

        document.getElementById('final-photo').style.display = 'block';

        // Scroll to the final photo
        document.getElementById('final-photo').scrollIntoView({ behavior: 'smooth' });
    }

    // Function to restart the process
    function restartProcess() {
        // Reset photo count and images
        photoCount = 0;
        photoImages = [];

        // Update photo count display
        document.getElementById('photo-count').textContent = photoCount;

        // Reset photo cells
        for (let i = 1; i <= 4; i++) {
            const photoCell = document.getElementById(`photo${i}`);
            photoCell.innerHTML = '<div class="placeholder">' + i + '</div>';
        }

        // Reset UI state
        captureButton.disabled = false;
        restartBtn.style.display = 'none';

        // Hide sections that should be shown only after photos are taken
        document.getElementById('size-selector').style.display = 'none';
        document.getElementById('frame-selector').style.display = 'none';
        document.getElementById('content-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'none';
        document.getElementById('photo-actions').style.display = 'none';
        document.getElementById('final-photo').style.display = 'none';

        // Show camera section
        document.getElementById('camera-section').style.display = 'block';

        // Reset selected frame to default
        frameOptions.forEach((opt, index) => {
            if (index === 0) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

        selectedFrame = 'frame1.png';
        selectedFrameImg.src = selectedFrame;
        selectedFrameName.textContent = selectedFrame;

        // Reset content inputs
        contentText.value = '';
        textColor.value = '#ffffff';
        textSize.value = '24';
        contentPosition.value = 'middle';

        // Reset photo area and position to default
        photoAreaPercent.value = 80;
        areaValue.textContent = '80';
        photoPosition.value = 'center';

        // Reset margin sliders
        topMarginSlider.value = 40;
        topMarginValue.textContent = '40';
        bottomMarginSlider.value = 40;
        bottomMarginValue.textContent = '40';

        // Reset photo style controls
        borderRadiusSlider.value = 0;
        radiusValue.textContent = '0';
        vintageFrameSelect.value = 'none';

        // Hide margin controls
        topMarginControl.style.display = 'none';
        bottomMarginControl.style.display = 'none';

        // Reset size inputs to default
        widthInput.value = '600';
        heightInput.value = '800';

        // Reset spacing to default value
        photoSpacing.value = 20;
        spacingValue.textContent = '20';

        // Scroll to the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
