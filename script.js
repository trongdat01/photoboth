// Photo Booth with Background Selector Script

document.addEventListener('DOMContentLoaded', function () {
    // Camera permission handling
    const cameraPermissionUI = document.getElementById('camera-permission');
    const cameraSection = document.getElementById('camera-section');
    const enableCameraBtn = document.getElementById('enable-camera-btn');

    // Hide camera section initially
    cameraSection.style.display = 'none';

    // Show camera permission UI
    cameraPermissionUI.style.display = 'block';

    // Handle enable camera button click
    enableCameraBtn.addEventListener('click', function () {
        // Hide permission UI and show loading indicator
        cameraPermissionUI.style.display = 'none';
        document.getElementById('preloader').style.display = 'flex';

        // Start camera initialization
        initCamera().then(() => {
            // Show camera section if successful
            cameraSection.style.display = 'block';
            document.getElementById('preloader').style.display = 'none';
        }).catch(() => {
            // Show permission UI again if failed
            cameraPermissionUI.style.display = 'block';
            document.getElementById('preloader').style.display = 'none';
        });
    });

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

    // Add the new filter controls variables
    const photoFilter = document.getElementById('photo-filter');
    const filterIntensity = document.getElementById('filter-intensity');
    const intensityValue = document.getElementById('intensity-value');

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

    // Add event listeners for the new filter controls
    photoFilter.addEventListener('change', updatePreview);
    filterIntensity.addEventListener('input', function () {
        intensityValue.textContent = this.value;
        updatePreview();
    });

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

    // Tab functionality for control panels
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to current button
            this.classList.add('active');

            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Initialize retake buttons (moved to after DOM is fully loaded)
    function initRetakeButtons() {
        const retakeButtons = document.querySelectorAll('.retake-btn');

        retakeButtons.forEach(button => {
            // Remove any existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add fresh event listener
            newButton.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent event bubbling
                const photoIndex = parseInt(this.getAttribute('data-photo')) - 1;
                retakePhoto(photoIndex);
            });
        });
    }

    // Call initialization
    initRetakeButtons();

    // Language translations
    const translations = {
        en: {
            "main-title": "Photo Booth with Fun Backgrounds",
            "step1-title": "Step 1: Take Your Photos",
            "step2-title": "Step 2: Choose Your Background",
            "step3-title": "Make It Your Own",
            "adjustments-title": "Customize Your Photos",
            "size-tab": "Size",
            "layout-tab": "Layout",
            "style-tab": "Style",
            "text-tab": "Add Text",
            "selected-frame-text": "Background",
            "dimensions-text": "Size",
            "photo-styles-text": "Photo Styles",
            "border-radius-label": "Rounded corners:",
            "frame-style-label": "Photo borders:",
            "frame-none-option": "No border",
            "frame-white-option": "Classic white border",
            "frame-torn-option": "Torn paper edge",
            "frame-scallop-option": "Scalloped edge",
            "color-effect-label": "Photo look:",
            "effect-none-option": "Regular (modern)",
            "effect-sepia-option": "Old sepia tone",
            "effect-bw-option": "Black & white",
            "effect-vibrant-option": "Vibrant colors",
            "effect-faded-option": "Washed out",
            "effect-vintage-option": "Faded vintage",
            "effect-warm-option": "Warm golden tone",
            "effect-strength-label": "How strong the effect is:",
            "create-btn-text": "Create My Photo Strip",
            "download-btn-text": "Save to My Device",
            "restart-btn-text": "Start Over",
            "final-photo-title": "Your Finished Photo Strip",
            "download-final-text": "Save Photo",
            "restart-final-text": "Make a New One",
            "capture-btn": "Take Photo",
            "restart-photos": "Start Over",
            "width-label": "Width (pixels):",
            "height-label": "Height (pixels):",
            "portrait-preset": "Portrait",
            "tall-preset": "Tall",
            "square-preset": "Square",
            "photo-arrangement": "Photo Arrangement",
            "photo-area-label": "How much space photos take up (%):",
            "photo-position-label": "Photos position:",
            "top-position": "At the top",
            "center-position": "Centered",
            "bottom-position": "At the bottom",
            "space-from-top": "Space from top:",
            "space-from-bottom": "Space from bottom:",
            "spacing-heading": "Spacing",
            "photo-spacing-label": "Space between photos:",
            "add-message-heading": "Add a Message",
            "message-label": "Your message:",
            "message-placeholder": "Type your message here...",
            "text-color-label": "Text color:",
            "text-size-label": "Text size:",
            "text-position-label": "Text position:",
            "text-top-position": "At the top",
            "text-middle-position": "In the middle",
            "text-bottom-position": "At the bottom",
            "output-size-heading": "Output Size",
            "retake-button": "Retake"
        },
        vi: {
            "main-title": "Chụp Ảnh với Nền Thú Vị",
            "step1-title": "Bước 1: Chụp Ảnh của Bạn",
            "step2-title": "Bước 2: Chọn Phông Nền",
            "step3-title": "Bước 3: Tùy Chỉnh Theo Ý Bạn",
            "adjustments-title": "Tùy Chỉnh Ảnh của Bạn",
            "size-tab": "Kích thước",
            "layout-tab": "Bố cục",
            "style-tab": "Phong cách",
            "text-tab": "Thêm Chữ",
            "selected-frame-text": "Phông nền",
            "dimensions-text": "Kích thước",
            "photo-styles-text": "Kiểu Ảnh",
            "border-radius-label": "Bo góc:",
            "frame-style-label": "Viền ảnh:",
            "frame-none-option": "Không viền",
            "frame-white-option": "Viền trắng cổ điển",
            "frame-torn-option": "Viền giấy rách",
            "frame-scallop-option": "Viền hình sò",
            "color-effect-label": "Hiệu ứng ảnh:",
            "effect-none-option": "Thông thường (hiện đại)",
            "effect-sepia-option": "Tông màu nâu đỏ cũ",
            "effect-bw-option": "Đen trắng",
            "effect-vibrant-option": "Màu sắc rực rỡ",
            "effect-faded-option": "Phai màu",
            "effect-vintage-option": "Vintage mờ",
            "effect-warm-option": "Tông vàng ấm áp",
            "effect-strength-label": "Độ mạnh hiệu ứng:",
            "create-btn-text": "Tạo Dải Ảnh của Tôi",
            "download-btn-text": "Lưu vào Thiết Bị",
            "restart-btn-text": "Bắt Đầu Lại",
            "final-photo-title": "Dải Ảnh Hoàn Thành của Bạn",
            "download-final-text": "Lưu Ảnh",
            "restart-final-text": "Tạo Ảnh Mới",
            "capture-btn": "Chụp Ảnh",
            "restart-photos": "Bắt Đầu Lại",
            "width-label": "Chiều rộng (pixel):",
            "height-label": "Chiều cao (pixel):",
            "portrait-preset": "Dọc",
            "tall-preset": "Cao",
            "square-preset": "Vuông",
            "photo-arrangement": "Sắp Xếp Ảnh",
            "photo-area-label": "Không gian ảnh chiếm (%):",
            "photo-position-label": "Vị trí ảnh:",
            "top-position": "Ở trên cùng",
            "center-position": "Ở giữa",
            "bottom-position": "Ở dưới cùng",
            "space-from-top": "Khoảng cách từ trên:",
            "space-from-bottom": "Khoảng cách từ dưới:",
            "spacing-heading": "Khoảng Cách",
            "photo-spacing-label": "Khoảng cách giữa các ảnh:",
            "add-message-heading": "Thêm Lời Nhắn",
            "message-label": "Lời nhắn của bạn:",
            "message-placeholder": "Nhập lời nhắn của bạn ở đây...",
            "text-color-label": "Màu chữ:",
            "text-size-label": "Kích thước chữ:",
            "text-position-label": "Vị trí chữ:",
            "text-top-position": "Ở trên cùng",
            "text-middle-position": "Ở giữa",
            "text-bottom-position": "Ở dưới cùng",
            "output-size-heading": "Kích Thước Đầu Ra",
            "retake-button": "Chụp lại"
        }
    };

    // Language selector functionality
    const langButtons = document.querySelectorAll('.lang-btn');

    // Set default language (English)
    let currentLang = 'en';

    // Function to update all text elements based on selected language
    function updateLanguage(lang) {
        currentLang = lang;

        // Update all text elements that have IDs
        for (const [id, text] of Object.entries(translations[lang])) {
            const element = document.getElementById(id);
            if (element) {
                // Special case for button with nested span
                if (id === 'capture-btn') {
                    // Keep the photo count intact
                    const photoCount = document.getElementById('photo-count').textContent;
                    element.innerHTML = `${text} (<span id="photo-count">${photoCount}</span>/4)`;
                }
                // Special case for textarea
                else if (element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[lang]["message-placeholder"];
                }
                // All other elements
                else {
                    element.textContent = text;
                }
            }
        }

        // Update retake buttons
        document.querySelectorAll('.retake-btn').forEach(btn => {
            btn.innerHTML = `<i class="fas fa-redo"></i> ${translations[lang]["retake-button"]}`;
        });

        // Update frame labels
        document.querySelectorAll('.frame-label').forEach((label, index) => {
            label.textContent = `${lang === 'en' ? 'Frame' : 'Khung'} ${index + 1}`;
        });

        // Directly set text for the preset buttons if not handled by ID
        const presetButtons = document.querySelectorAll('.preset-btn');
        if (presetButtons.length >= 3) {
            if (!document.getElementById('portrait-preset')) {
                presetButtons[0].textContent = translations[lang]["portrait-preset"];
            }
            if (!document.getElementById('tall-preset')) {
                presetButtons[1].textContent = translations[lang]["tall-preset"];
            }
            if (!document.getElementById('square-preset')) {
                presetButtons[2].textContent = translations[lang]["square-preset"];
            }
        }

        // Ensure text area placeholder is updated
        const contentTextarea = document.getElementById('content-text');
        if (contentTextarea) {
            contentTextarea.placeholder = translations[lang]["message-placeholder"];
        }

        // Ensure dropdown options are updated
        updateDropdownOptions(lang);
    }

    // Function to update dropdown options
    function updateDropdownOptions(lang) {
        // Photo position dropdown
        const photoPositionSelect = document.getElementById('photo-position');
        if (photoPositionSelect) {
            const options = photoPositionSelect.options;
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                switch (option.value) {
                    case 'top':
                        option.textContent = translations[lang]["top-position"];
                        break;
                    case 'center':
                        option.textContent = translations[lang]["center-position"];
                        break;
                    case 'bottom':
                        option.textContent = translations[lang]["bottom-position"];
                        break;
                }
            }
        }

        // Text position dropdown
        const contentPositionSelect = document.getElementById('content-position');
        if (contentPositionSelect) {
            const options = contentPositionSelect.options;
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                switch (option.value) {
                    case 'top':
                        option.textContent = translations[lang]["text-top-position"];
                        break;
                    case 'middle':
                        option.textContent = translations[lang]["text-middle-position"];
                        break;
                    case 'bottom':
                        option.textContent = translations[lang]["text-bottom-position"];
                        break;
                }
            }
        }
    }

    // Add click event listeners to language buttons
    langButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');

            // Update active button
            langButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update language
            updateLanguage(lang);
        });
    });

    // Initialize with default language
    updateLanguage('en');

    // Add the language update function to the existing code
    // This makes the language function available to other parts of your code
    window.updateLanguage = updateLanguage;

    // Improved camera initialization function - returns a promise
    async function initCamera() {
        try {
            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser doesn't support camera access");
            }

            // Try different device constraints to improve compatibility
            const constraints = [
                // Try default settings first
                { video: true, audio: false },
                // Try with explicit facingMode
                { video: { facingMode: "user" }, audio: false },
                // Try with low-quality video as fallback
                { video: { width: 320, height: 240 }, audio: false },
                // Try with exact facing mode as last resort
                { video: { facingMode: { exact: "user" } }, audio: false }
            ];

            let stream = null;
            let error = null;

            // Try each constraint set until one works
            for (const constraint of constraints) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraint);
                    if (stream) break; // Found a working constraint
                } catch (err) {
                    error = err; // Keep track of the last error
                    console.log(`Tried ${JSON.stringify(constraint)} but failed:`, err);
                }
            }

            if (!stream) {
                // If all constraints failed, throw the last error
                throw error || new Error("Couldn't access any camera");
            }

            // Success! Set the stream to the video element
            videoElement.srcObject = stream;

            return new Promise((resolve) => {
                // Wait for video to be loaded to get its actual dimensions
                videoElement.onloadedmetadata = function () {
                    captureButton.disabled = false;

                    // Update photo cell aspect ratio to match camera
                    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
                    const photoCells = document.querySelectorAll('.photo-cell');

                    photoCells.forEach(cell => {
                        cell.style.aspectRatio = aspectRatio;
                    });

                    console.log(`Camera initialized with aspect ratio: ${aspectRatio}`);
                    resolve();
                };
            });
        } catch (err) {
            console.error('Error accessing camera:', err);

            // Create detailed error message
            const cameraContainer = document.querySelector('.camera-container');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'camera-error';
            errorMessage.innerHTML = `
                <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>Camera Access Denied</h3>
                <p>We couldn't access your camera. This could be due to:</p>
                <ul>
                    <li>Camera permission was denied</li>
                    <li>No camera is connected to your device</li>
                    <li>Another application is using your camera</li>
                </ul>
                <p>To fix this:</p>
                <ol>
                    <li>Check your browser's address bar for camera permission icon and click it to allow access</li>
                    <li>Make sure your camera is properly connected</li>
                    <li>Close other applications that might be using your camera</li>
                    <li>If using mobile, make sure your browser has camera permissions in your device settings</li>
                </ol>
                <button id="retry-camera" class="retry-btn"><i class="fas fa-redo"></i> Try Again</button>
            `;

            // Clear the camera container and show the error
            cameraContainer.innerHTML = '';
            cameraContainer.appendChild(errorMessage);

            // Add event listener to retry button
            document.getElementById('retry-camera').addEventListener('click', function () {
                // Remove error message
                errorMessage.remove();

                // Try to initialize camera again
                cameraPermissionUI.style.display = 'block';
                cameraSection.style.display = 'none';
            });

            captureButton.disabled = true;
            throw err; // Rethrow to reject the promise
        }
    }

    // Modify the capturePhoto function to have more friendly alerts
    function capturePhoto() {
        // Get the retake index if it exists
        const retakeIndex = captureButton.hasAttribute('data-retake') ?
            parseInt(captureButton.getAttribute('data-retake')) : -1;

        // If we're not in retake mode, check if we already have 4 photos
        if (retakeIndex === -1 && photoCount >= 4) {
            alert("You've already taken all 4 photos! You can replace any photo by clicking the 'Retake' button below it.");
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

        // Update the img styling to fit properly
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        // If we're retaking a specific photo
        if (retakeIndex >= 0) {
            // Update the photo in our array
            photoImages[retakeIndex] = imageDataUrl;

            // Update photo cell - important: clear only the photo cell, not the wrapper
            const photoCell = document.getElementById(`photo${retakeIndex + 1}`);
            photoCell.className = 'photo-cell'; // Reset classes
            photoCell.innerHTML = ''; // Clear only the cell contents
            photoCell.appendChild(img);

            // Get the parent wrapper
            const photoWrapper = photoCell.closest('.photo-wrapper');

            // Make sure the wrapper has the has-photo class to show the retake button
            photoWrapper.classList.add('has-photo');

            // Clear retake attribute
            captureButton.removeAttribute('data-retake');

            // If we were in the customization steps, return to them
            if (photoCount === 4) {
                showCustomizationSections();
            }

            // Visual feedback for capture
            captureButton.classList.add('flash');
            setTimeout(() => captureButton.classList.remove('flash'), 300);

            return;
        }

        // Regular photo taking (not retake)
        // Store image data
        photoImages.push(imageDataUrl);

        // Update photo cell - only clear the cell, not the wrapper
        const photoCell = document.getElementById(`photo${photoCount + 1}`);
        photoCell.innerHTML = ''; // Clear only the cell contents
        photoCell.appendChild(img);

        // Get the parent wrapper and add has-photo class
        const photoWrapper = photoCell.closest('.photo-wrapper');
        photoWrapper.classList.add('has-photo');

        // DO NOT create new retake button - it's already in the HTML

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

            // We don't disable the capture button anymore, so users can still retake
            // captureButton.disabled = true;

            // Show customization sections using the new layout function
            showCustomizationSections();
        }
    }

    // Function to retake a specific photo - better messaging
    function retakePhoto(photoIndex) {
        console.log('Retaking photo at index:', photoIndex);

        // Make sure the camera is enabled
        captureButton.disabled = false;

        // Set the current target for the next capture
        captureButton.setAttribute('data-retake', photoIndex);

        // Visual cue that we're in retake mode
        const photoCell = document.getElementById(`photo${photoIndex + 1}`);
        photoCell.classList.add('retake-pending');

        // Show message to guide the user
        alert(`Let's take a new photo for position ${photoIndex + 1}. Get ready to pose!`);

        // If we already proceeded to next steps, we need to go back to camera
        if (document.getElementById('camera-section').style.display === 'none') {
            // Hide other sections
            document.getElementById('frame-selector').style.display = 'none';
            document.getElementById('preview-and-controls').style.display = 'none';
            document.getElementById('photo-actions').style.display = 'none';

            // Show camera section
            document.getElementById('camera-section').style.display = 'block';

            // Scroll to camera
            document.getElementById('camera-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Function to validate size inputs
    function validateSize() {
        let width = parseInt(widthInput.value);
        let height = parseInt(heightInput.value);

        // Ensure width is within bounds
        if (isNaN(width) || width < 300) width = 300;
        if (width > 1800) width = 1800;

        // Ensure height is within bounds
        if (isNaN(height) || height < 300) height = 300;
        if (height > 1800) height = 1800;

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

            // Get filter type and intensity
            const filterType = photoFilter.value;
            const intensity = parseInt(filterIntensity.value) / 100;

            // Draw photo with rounded corners and filters
            ctx.save();

            // Apply rounded corners if specified
            if (borderRadius > 0) {
                roundedRect(offsetX, offsetY, drawWidth, drawHeight, borderRadius);
                ctx.clip();
            }

            // First draw the original image
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // Then apply filters on top if a filter is selected
            if (filterType !== 'none') {
                applyPhotoFilter(filterType, intensity, offsetX, offsetY, drawWidth, drawHeight);
            }

            ctx.restore();
        };

        // If image is already loaded, draw it immediately, otherwise wait for onload
        if (img.complete) {
            drawPhoto();
        } else {
            img.onload = drawPhoto;
        }
    }

    // New function to apply various photo filters - color effects only
    function applyPhotoFilter(filterType, intensity, x, y, width, height) {
        // Get the image data from the canvas
        const imageData = ctx.getImageData(x, y, width, height);
        const data = imageData.data;

        // Apply different filters based on the selected type - color transformations only
        switch (filterType) {
            case 'sepia':
                // Sepia tone effect (brownish vintage look) - color only
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Calculate sepia values
                    const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
                    const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
                    const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);

                    // Mix original and sepia based on intensity
                    data[i] = r * (1 - intensity) + sepiaR * intensity;
                    data[i + 1] = g * (1 - intensity) + sepiaG * intensity;
                    data[i + 2] = b * (1 - intensity) + sepiaB * intensity;
                }
                break;

            case 'grayscale':
                // Black and white effect - color only
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Calculate grayscale value using luminance formula
                    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

                    // Mix original and grayscale based on intensity
                    data[i] = r * (1 - intensity) + gray * intensity;
                    data[i + 1] = g * (1 - intensity) + gray * intensity;
                    data[i + 2] = b * (1 - intensity) + gray * intensity;
                }
                break;

            case 'kodachrome':
                // Kodachrome film look (vibrant with enhanced red/blue) - color only
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Enhance contrast and shift colors
                    const newR = Math.min(255, r * 1.2);
                    const newG = g;
                    const newB = Math.min(255, b * 1.1);

                    // Mix original and effect based on intensity
                    data[i] = r * (1 - intensity) + newR * intensity;
                    data[i + 1] = g * (1 - intensity) + newG * intensity;
                    data[i + 2] = b * (1 - intensity) + newB * intensity;
                }
                break;

            case 'polaroid':
                // Polaroid instant camera look - color only, no vignette
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Slightly washed out look with slight green-blue tint
                    const newR = Math.min(255, r * 1.1);
                    const newG = Math.min(255, g * 1.15);
                    const newB = Math.min(255, b * 0.9);

                    // Mix original and effect based on intensity
                    data[i] = r * (1 - intensity) + newR * intensity;
                    data[i + 1] = g * (1 - intensity) + newG * intensity;
                    data[i + 2] = b * (1 - intensity) + newB * intensity;
                }
                break;

            case 'vintage':
                // Faded vintage look - color only, no vignette
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Yellowish tint with reduced saturation
                    const newR = Math.min(255, r * 0.9 + 20);
                    const newG = Math.min(255, g * 0.8 + 20);
                    const newB = Math.min(255, b * 0.7 + 10);

                    // Mix original and effect based on intensity
                    data[i] = r * (1 - intensity) + newR * intensity;
                    data[i + 1] = g * (1 - intensity) + newG * intensity;
                    data[i + 2] = b * (1 - intensity) + newB * intensity;
                }
                break;

            case 'oldfilm':
                // Old film look - color transformation only, no grain or vignette
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Reduce saturation slightly and add warmth (color only)
                    const avg = (r + g + b) / 3;
                    const newR = r * 0.6 + avg * 0.4 + 10;
                    const newG = g * 0.6 + avg * 0.4 + 5;
                    const newB = b * 0.6 + avg * 0.4;

                    // Mix original and effect based on intensity
                    data[i] = r * (1 - intensity) + newR * intensity;
                    data[i + 1] = g * (1 - intensity) + newG * intensity;
                    data[i + 2] = b * (1 - intensity) + newB * intensity;
                }
                break;
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, x, y);
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

    // Function to create the final photo strip - friendlier error message
    function createPhotoStrip() {
        if (photoCount < 4) {
            alert("Please take all 4 photos before creating your photo strip!");
            return;
        }

        // Get current preview canvas state
        const finalImage = document.getElementById('final-image');
        finalImage.src = previewCanvas.toDataURL('image/png');

        // Smooth transition to the final photo
        const previewControls = document.getElementById('preview-and-controls');
        const frameSelector = document.getElementById('frame-selector');
        const photoActions = document.getElementById('photo-actions');
        const finalPhoto = document.getElementById('final-photo');

        // Hide all other sections with a fade out
        previewControls.style.animation = 'fadeOut 0.4s ease forwards';
        frameSelector.style.animation = 'fadeOut 0.4s ease forwards';
        photoActions.style.animation = 'fadeOut 0.4s ease forwards';

        setTimeout(() => {
            previewControls.style.display = 'none';
            frameSelector.style.display = 'none';
            photoActions.style.display = 'none';

            // Show final photo with a bounce animation
            finalPhoto.style.display = 'block';

            // Scroll to the final photo
            finalPhoto.scrollIntoView({ behavior: 'smooth' });
        }, 400);
    }

    // Function to restart the process - fix the reset logic
    function restartProcess() {
        // Reset photo count and images
        photoCount = 0;
        photoImages = [];

        // Update photo count display
        document.getElementById('photo-count').textContent = photoCount;

        // Reset photo cells correctly
        for (let i = 1; i <= 4; i++) {
            // Reset just the cell contents with placeholder, leaving buttons intact
            const photoCell = document.getElementById(`photo${i}`);
            photoCell.innerHTML = '<div class="placeholder">' + i + '</div>';

            // Remove has-photo class from wrapper to hide the retake button
            const photoWrapper = photoCell.closest('.photo-wrapper');
            photoWrapper.classList.remove('has-photo');
        }

        // Reinitialize retake buttons
        initRetakeButtons();

        // Clear any retake state
        captureButton.removeAttribute('data-retake');

        // Reset UI state
        captureButton.disabled = false;
        restartBtn.style.display = 'none';

        // Hide sections that should be shown only after photos are taken
        document.getElementById('frame-selector').style.display = 'none';
        document.getElementById('preview-and-controls').style.display = 'none';
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

        // Reset photo filter controls
        photoFilter.value = 'none';
        filterIntensity.value = 75;
        intensityValue.textContent = '75';

        // Hide margin controls
        topMarginControl.style.display = 'none';
        bottomMarginControl.style.display = 'none';

        // Reset size inputs to default
        widthInput.value = '300';
        heightInput.value = '800';

        // Reset spacing to default value
        photoSpacing.value = 20;
        spacingValue.textContent = '20';

        // Scroll to the top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Function to show customization sections
    function showCustomizationSections() {
        // First show the frame selector (Step 2)
        const cameraSection = document.getElementById('camera-section');
        const frameSelector = document.getElementById('frame-selector');

        smoothTransition(cameraSection, frameSelector);

        // Then show the preview and controls section (Step 3) with slight delay
        setTimeout(() => {
            const previewControls = document.getElementById('preview-and-controls');
            const photoActions = document.getElementById('photo-actions');

            previewControls.style.display = 'flex';
            photoActions.style.display = 'flex';

            // Add revealed class for animation
            previewControls.classList.add('revealed');
            photoActions.classList.add('revealed');

            // Initialize preview
            updateCanvasSize();
            updatePreview();
        }, 600);
    }

    // Add smooth loading functions
    // Improve frame option loading with staggered animations
    frameOptions.forEach((option, index) => {
        option.style.setProperty('--item-index', index);
    });

    // Add smooth transitions between steps
    function smoothTransition(fromElement, toElement) {
        if (fromElement && toElement) {
            fromElement.style.animation = 'fadeOut 0.4s ease forwards';

            setTimeout(() => {
                fromElement.style.display = 'none';
                toElement.style.display = fromElement.tagName === 'DIV' &&
                    fromElement.classList.contains('preview-and-controls') ? 'flex' : 'block';
                toElement.style.animation = 'fadeIn 0.5s ease forwards';

                // Scroll smoothly
                toElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        }
    }

    // Optimize image loading
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        imageObserver.unobserve(image);

                        image.onload = () => {
                            image.classList.add('loaded');
                        };
                    }
                });
            });

            images.forEach(image => imageObserver.observe(image));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            images.forEach(image => {
                image.src = image.dataset.src;
            });
        }
    }

    // Call lazy load function
    lazyLoadImages();

    // Enhance the createPhotoStrip function for smoother transitions
    const originalCreatePhotoStrip = createPhotoStrip;
    createPhotoStrip = function () {
        if (photoCount < 4) {
            alert("Please take all 4 photos before creating your photo strip!");
            return;
        }

        // Get current preview canvas state
        const finalImage = document.getElementById('final-image');
        finalImage.src = previewCanvas.toDataURL('image/png');

        // Smooth transition to the final photo
        const previewControls = document.getElementById('preview-and-controls');
        const frameSelector = document.getElementById('frame-selector');
        const photoActions = document.getElementById('photo-actions');
        const finalPhoto = document.getElementById('final-photo');

        // Hide all other sections with a fade out
        previewControls.style.animation = 'fadeOut 0.4s ease forwards';
        frameSelector.style.animation = 'fadeOut 0.4s ease forwards';
        photoActions.style.animation = 'fadeOut 0.4s ease forwards';

        setTimeout(() => {
            previewControls.style.display = 'none';
            frameSelector.style.display = 'none';
            photoActions.style.display = 'none';

            // Show final photo with a bounce animation
            finalPhoto.style.display = 'block';

            // Scroll to the final photo
            finalPhoto.scrollIntoView({ behavior: 'smooth' });
        }, 400);
    };

    // Enhance the restartProcess function for smoother transitions
    const originalRestartProcess = restartProcess;
    restartProcess = function () {
        // Original restart logic
        originalRestartProcess();

        // Add smooth transition back to camera section
        const cameraSection = document.getElementById('camera-section');

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 300);
    };
});