// Main application JavaScript

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// Toggle sidebar on mobile
if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Inject dynamic username and avatar from profile
function applyUserHeader() {
    try {
        const savedProfile = localStorage.getItem('energyProfile');
        if (!savedProfile) return;
        const profile = JSON.parse(savedProfile);
        const name = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.trim();
        const usernameEl = document.getElementById('headerUsername');
        const avatarEl = document.getElementById('headerAvatar');
        if (usernameEl && name) usernameEl.textContent = name;
        if (avatarEl && profile.avatar) avatarEl.src = profile.avatar;
    } catch (e) {}
}

// Calculate solar capacity
function calculateSolarCapacity() {
    const count = parseInt(document.getElementById('solarCount').value) || 0;
    const wattage = parseInt(document.getElementById('solarWattage').value) || 0;
    const capacity = (count * wattage) / 1000; // Convert to kW
    document.getElementById('solarCapacity').textContent = capacity.toFixed(1);
    showSavedMessage('solarCapacity');
}

// Calculate wind capacity
function calculateWindCapacity() {
    const count = parseInt(document.getElementById('windCount').value) || 0;
    const capacity = parseInt(document.getElementById('windCapacity').value) || 0;
    const totalCapacity = count * capacity;
    document.getElementById('windTotalCapacity').textContent = totalCapacity.toFixed(1);
    showSavedMessage('windTotalCapacity');
}

function showSavedMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const savedMessage = document.createElement('span');
        savedMessage.textContent = 'Saved!';
        savedMessage.className = 'saved-message';
        element.parentNode.appendChild(savedMessage);
        setTimeout(() => {
            savedMessage.remove();
        }, 2000);
    }
}

// Initialize event listeners for configuration inputs
document.addEventListener('DOMContentLoaded', function() {
    // Solar configuration
    const solarInputs = ['solarCount', 'solarWattage', 'solarArea'];
    solarInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateSolarCapacity);
        }
    });
    
    // Wind configuration
    const windInputs = ['windCount', 'windCapacity', 'rotorDiameter'];
    windInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateWindCapacity);
        }
    });
    
    // Initialize calculations
    calculateSolarCapacity();
    calculateWindCapacity();

    // Apply dynamic header info
    applyUserHeader();
});

// Tab functionality for settings page
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Export data function
function exportData(format) {
    // This would typically make an API call to export data
    alert(`Exporting data in ${format.toUpperCase()} format...`);
    // In a real application, this would trigger a download
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert ${type}`;
    notification.textContent = message;
    
    document.querySelector('.dashboard-content').prepend(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}