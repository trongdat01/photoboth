// Frame Background Selector Script

document.addEventListener('DOMContentLoaded', function () {
    // Get all frame options
    const frameOptions = document.querySelectorAll('.frame-option');

    // Get preview elements
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

    // Action buttons
    const applyBtn = document.getElementById('apply-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Track currently selected frame
    let selectedFrame = 'frame1.png';
    let selectedFrameImg = new Image();
    selectedFrameImg.src = selectedFrame;

    // Set initial canvas size
    updateCanvasSize();

    // Initialize preview
    updatePreview();

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

    // Apply button click handler
    applyBtn.addEventListener('click', function () {
        // Here you can implement what happens when the user applies the selected background
        alert('Applied background: ' + selectedFrame + ' with dimensions: ' + previewCanvas.width + 'x' + previewCanvas.height + 'px');
    });

    // Download button click handler
    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = 'custom-background.png';
        link.href = previewCanvas.toDataURL('image/png');
        link.click();
    });

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
        const maxWidth = 500; // Maximum width for preview display

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

                // Draw content on top
                drawContent();
            };

            // If the image is already loaded, draw it immediately
            if (selectedFrameImg.complete) {
                ctx.drawImage(selectedFrameImg, 0, 0, width, height);
                drawContent();
            }
        } else {
            drawContent();
        }
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
        const maxWidth = width * 0.8; // 80% of canvas width
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

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const selectedOption = document.querySelector('.frame-option.selected');
            const options = Array.from(frameOptions);
            const currentIndex = options.indexOf(selectedOption);

            let newIndex;
            if (e.key === 'ArrowLeft') {
                newIndex = (currentIndex - 1 + options.length) % options.length;
            } else {
                newIndex = (currentIndex + 1) % options.length;
            }

            options[newIndex].click();
        }
    });
});
