// Profile Management JavaScript

class ProfileManager {
    constructor() {
        this.currentProfile = null;
        this.init();
    }
    
    init() {
        this.loadProfile();
        this.setupEventListeners();
        this.updateProfileDisplay();
    }
    
    // Load profile from localStorage
    loadProfile() {
        try {
            const savedProfile = localStorage.getItem('energyProfile');
            if (savedProfile) {
                this.currentProfile = JSON.parse(savedProfile);
            } else {
                // Default profile
                this.currentProfile = {
                    personalInfo: {
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@energygrid.com',
                        phone: '+1 (555) 123-4567',
                        company: 'EnergyGrid Solutions Inc.',
                        position: 'System Administrator'
                    },
                    accountSettings: {
                        username: 'johndoe',
                        language: 'en',
                        timezone: 'est',
                        dateFormat: 'mm/dd/yyyy'
                    },
                    notifications: {
                        emailAlerts: true,
                        maintenanceAlerts: true,
                        performanceReports: true,
                        billingAlerts: false
                    },
                    avatar: '../assets/user-avatar.png'
                };
                this.saveProfile();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.createDefaultProfile();
        }
    }
    
    // Create default profile
    createDefaultProfile() {
        this.currentProfile = {
            personalInfo: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@energygrid.com',
                phone: '+1 (555) 123-4567',
                company: 'EnergyGrid Solutions Inc.',
                position: 'System Administrator'
            },
            accountSettings: {
                username: 'johndoe',
                language: 'en',
                timezone: 'est',
                dateFormat: 'mm/dd/yyyy'
            },
            notifications: {
                emailAlerts: true,
                maintenanceAlerts: true,
                performanceReports: true,
                billingAlerts: false
            },
            avatar: '../assets/user-avatar.png'
        };
    }
    
    // Save profile to localStorage
    saveProfile() {
        try {
            localStorage.setItem('energyProfile', JSON.stringify(this.currentProfile));
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Avatar upload
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', this.handleAvatarUpload.bind(this));
        }
        
        // Form auto-save (optional - you can remove if you prefer manual save)
        const formElements = document.querySelectorAll('#firstName, #lastName, #email, #phone, #company, #position, #username, #language, #timezone, #dateFormat');
        formElements.forEach(element => {
            element.addEventListener('change', this.autoSaveField.bind(this));
        });
        
        // Notification preferences
        const notificationCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        notificationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.autoSaveField.bind(this));
        });
    }
    
    // Auto-save individual field
    autoSaveField(event) {
        const field = event.target;
        const fieldId = field.id;
        const value = field.type === 'checkbox' ? field.checked : field.value;
        
        // Map field IDs to profile structure
        this.updateProfileField(fieldId, value);
        this.saveProfile();
        
        // Show auto-save indicator
        this.showSaveIndicator('Auto-saved');
    }
    
    // Update profile field based on ID
    updateProfileField(fieldId, value) {
        const fieldMap = {
            // Personal info
            'firstName': ['personalInfo', 'firstName'],
            'lastName': ['personalInfo', 'lastName'],
            'email': ['personalInfo', 'email'],
            'phone': ['personalInfo', 'phone'],
            'company': ['personalInfo', 'company'],
            'position': ['personalInfo', 'position'],
            
            // Account settings
            'username': ['accountSettings', 'username'],
            'language': ['accountSettings', 'language'],
            'timezone': ['accountSettings', 'timezone'],
            'dateFormat': ['accountSettings', 'dateFormat'],
            
            // Notifications
            'emailAlerts': ['notifications', 'emailAlerts'],
            'maintenanceAlerts': ['notifications', 'maintenanceAlerts'],
            'performanceReports': ['notifications', 'performanceReports'],
            'billingAlerts': ['notifications', 'billingAlerts']
        };
        
        const path = fieldMap[fieldId];
        if (path) {
            this.currentProfile[path[0]][path[1]] = value;
        }
    }
    
    // Handle avatar upload
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentProfile.avatar = e.target.result;
                this.updateAvatarDisplay();
                this.saveProfile();
                this.showSaveIndicator('Avatar updated');
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Update avatar display
    updateAvatarDisplay() {
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg && this.currentProfile.avatar) {
            avatarImg.src = this.currentProfile.avatar;
        }
    }
    
    // Update entire profile display
    updateProfileDisplay() {
        if (!this.currentProfile) return;
        
        const profile = this.currentProfile;
        
        // Update personal info fields
        document.getElementById('firstName').value = profile.personalInfo.firstName;
        document.getElementById('lastName').value = profile.personalInfo.lastName;
        document.getElementById('email').value = profile.personalInfo.email;
        document.getElementById('phone').value = profile.personalInfo.phone;
        document.getElementById('company').value = profile.personalInfo.company;
        document.getElementById('position').value = profile.personalInfo.position;
        
        // Update account settings
        document.getElementById('username').value = profile.accountSettings.username;
        document.getElementById('language').value = profile.accountSettings.language;
        document.getElementById('timezone').value = profile.accountSettings.timezone;
        document.getElementById('dateFormat').value = profile.accountSettings.dateFormat;
        
        // Update notification preferences
        document.getElementById('emailAlerts').checked = profile.notifications.emailAlerts;
        document.getElementById('maintenanceAlerts').checked = profile.notifications.maintenanceAlerts;
        document.getElementById('performanceReports').checked = profile.notifications.performanceReports;
        document.getElementById('billingAlerts').checked = profile.notifications.billingAlerts;
        
        // Update avatar
        this.updateAvatarDisplay();
        
        // Update profile header
        this.updateProfileHeader();
    }
    
    // Update profile header information
    updateProfileHeader() {
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo && this.currentProfile) {
            const nameElement = profileInfo.querySelector('h2');
            const emailElement = profileInfo.querySelector('p:nth-child(3)');
            const phoneElement = profileInfo.querySelector('p:nth-child(4)');
            
            if (nameElement) {
                nameElement.textContent = `${this.currentProfile.personalInfo.firstName} ${this.currentProfile.personalInfo.lastName}`;
            }
            if (emailElement) {
                emailElement.innerHTML = `<i class="fas fa-envelope"></i> ${this.currentProfile.personalInfo.email}`;
            }
            if (phoneElement) {
                phoneElement.innerHTML = `<i class="fas fa-phone"></i> ${this.currentProfile.personalInfo.phone}`;
            }
        }
    }
    
    // Show save indicator
    showSaveIndicator(message) {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.save-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        indicator.textContent = message;
        
        document.body.appendChild(indicator);
        
        // Remove after 2 seconds
        setTimeout(() => {
            indicator.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
    
    // Validate profile data
    validateProfile() {
        const errors = [];
        
        // Email validation
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Phone validation (basic)
        const phone = document.getElementById('phone').value;
        if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            errors.push('Please enter a valid phone number');
        }
        
        // Required fields
        const requiredFields = ['firstName', 'lastName', 'email'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                errors.push(`${field.previousElementSibling.textContent} is required`);
            }
        });
        
        return errors;
    }
    
    // Save all profile changes
    saveAllChanges() {
        const errors = this.validateProfile();
        
        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return false;
        }
        
        // Update all fields from form
        this.updateAllFieldsFromForm();
        
        if (this.saveProfile()) {
            this.showSaveIndicator('Profile saved successfully!');
            return true;
        } else {
            alert('Error saving profile. Please try again.');
            return false;
        }
    }
    
    // Update all fields from form
    updateAllFieldsFromForm() {
        const fields = [
            'firstName', 'lastName', 'email', 'phone', 'company', 'position',
            'username', 'language', 'timezone', 'dateFormat'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                this.updateProfileField(fieldId, field.value);
            }
        });
        
        // Update checkboxes
        const checkboxes = [
            'emailAlerts', 'maintenanceAlerts', 'performanceReports', 'billingAlerts'
        ];
        
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                this.updateProfileField(checkboxId, checkbox.checked);
            }
        });
    }
}

// Global functions for HTML onclick handlers
function saveProfile() {
    if (window.profileManager) {
        window.profileManager.saveAllChanges();
    }
}

function resetForm() {
    if (window.profileManager) {
        if (confirm('Are you sure you want to reset all changes?')) {
            window.profileManager.loadProfile();
            window.profileManager.updateProfileDisplay();
            window.profileManager.showSaveIndicator('Form reset');
        }
    }
}

function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        const confirmPassword = prompt('Confirm new password:');
        if (newPassword === confirmPassword) {
            alert('Password changed successfully!');
            // In a real application, you would make an API call here
        } else {
            alert('Passwords do not match!');
        }
    }
}

function enable2FA() {
    alert('Two-factor authentication setup would be initiated here.\nThis feature requires additional backend integration.');
}

function viewLoginHistory() {
    alert('Login history would be displayed here.\nThis feature requires additional backend integration.');
}

function handleAvatarUpload(event) {
    if (window.profileManager) {
        window.profileManager.handleAvatarUpload(event);
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.profileManager = new ProfileManager();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .security-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .security-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
    }
    
    .security-btn:hover {
        background: #2980b9;
    }
    
    .preferences {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .preference-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .cancel-btn {
        background: #95a5a6;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
    }
    
    .cancel-btn:hover {
        background: #7f8c8d;
    }
`;
document.head.appendChild(style);