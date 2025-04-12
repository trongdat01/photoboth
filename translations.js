// This file contains translations for the camera permission UI and other text elements

// Add these to your existing translations object
const permissionTranslations = {
    en: {
        "permission-title": "Camera Access Required",
        "permission-text": "This photo booth needs access to your camera to take photos.",
        "step-1-text": "Click the \"Enable Camera\" button below",
        "step-2-text": "When your browser asks for permission, click \"Allow\"",
        "step-3-text": "Start taking photos!",
        "enable-camera-text": "Enable Camera",
        "camera-instructions-text": "Your browser will ask for permission to use your camera. Please click \"Allow\" when prompted."
    },
    vi: {
        "permission-title": "Cần Quyền Truy Cập Camera",
        "permission-text": "Ứng dụng chụp ảnh này cần quyền truy cập vào camera của bạn để chụp ảnh.",
        "step-1-text": "Nhấp vào nút \"Bật Camera\" bên dưới",
        "step-2-text": "Khi trình duyệt hỏi quyền, hãy nhấp \"Cho phép\"",
        "step-3-text": "Bắt đầu chụp ảnh!",
        "enable-camera-text": "Bật Camera",
        "camera-instructions-text": "Trình duyệt sẽ yêu cầu quyền sử dụng camera của bạn. Vui lòng nhấp vào \"Cho phép\" khi được nhắc."
    }
};

// Function to update permission translations
function updatePermissionTranslations(lang) {
    for (const [id, text] of Object.entries(permissionTranslations[lang])) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
}

// Call this in your existing language switch handler
function updateAllTranslations(lang) {
    // Your existing updateLanguage function call if available
    if (typeof updateLanguage === 'function') {
        updateLanguage(lang);
    }
    // Add the permission translations update
    updatePermissionTranslations(lang);
}

// Initialize with English by default when the page loads
document.addEventListener('DOMContentLoaded', function () {
    updatePermissionTranslations('en');
});
