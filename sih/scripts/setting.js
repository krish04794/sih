// Settings Management JavaScript

class SettingsManager {
    constructor() {
        this.currentSettings = null;
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateSettingsDisplay();
        this.startStatusUpdates();
    }
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('energySettings');
            if (savedSettings) {
                this.currentSettings = JSON.parse(savedSettings);
            } else {
                this.createDefaultSettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.createDefaultSettings();
        }
    }
    
    // Create default settings
    createDefaultSettings() {
        this.currentSettings = {
            general: {
                systemName: 'EnergyGrid Pro System',
                systemLocation: 'New York, USA',
                currency: 'USD',
                units: 'metric'
            },
            display: {
                theme: 'light',
                chartStyle: 'smooth',
                dataRefresh: '10000',
                autoLogout: '30'
            },
            api: {
                emoncmsKey: 'demo',
                weatherKey: '',
                simulationMode: 'auto'
            },
            alerts: {
                batteryLow: 20,
                batteryHigh: 90,
                gridImportLimit: 5.0,
                efficiencyThreshold: 80
            },
            notifications: {
                email: true,
                push: true,
                sms: false,
                emailAddress: 'john.doe@energygrid.com',
                smsNumber: ''
            },
            billing: {
                importTariff: 0.15,
                exportTariff: 0.08,
                touRates: {
                    offPeak: 0.12,
                    standard: 0.15,
                    peak: 0.20
                },
                billingCycle: 'monthly',
                billingDate: 1,
                utilityProvider: 'Local Power Company'
            },
            system: {
                dataRetention: 365,
                lastBackup: null,
                version: '2.1.0',
                lastUpdate: '2024-01-15'
            }
        };
        this.saveSettings();
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('energySettings', JSON.stringify(this.currentSettings));
            
            // Apply settings that need immediate effect
            this.applyImmediateSettings();
            
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
    
    // Apply settings that need immediate effect
    applyImmediateSettings() {
        // Apply theme
        this.applyTheme(this.currentSettings.display.theme);
        
        // Apply data refresh rate to smart meter
        if (window.smartMeter) {
            // The smart meter would use this setting in a real implementation
        }
    }
    
    // Apply theme to the interface
    applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark');
        
        // Add new theme class
        if (theme === 'dark') {
            body.classList.add('theme-dark');
        } else {
            body.classList.add('theme-light');
        }
        
        // For auto theme, we'd need to detect system preference
        if (theme === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('theme-dark');
            } else {
                body.classList.add('theme-light');
            }
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Tab functionality is handled by main.js
        
        // API key visibility toggle
        const toggleButtons = document.querySelectorAll('.api-key-input button');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.parentElement.querySelector('input');
                this.togglePasswordVisibility(input);
            });
        });
        
        // Simulation mode change
        const simulationMode = document.getElementById('simulationMode');
        if (simulationMode) {
            simulationMode.addEventListener('change', (e) => {
                this.handleSimulationModeChange(e.target.value);
            });
        }
        
        // Auto-save for some settings
        const autoSaveFields = [
            'systemName', 'systemLocation', 'currency', 'units',
            'theme', 'chartStyle', 'dataRefresh', 'autoLogout',
            'batteryLow', 'batteryHigh', 'gridImportLimit', 'efficiencyThreshold',
            'importTariff', 'exportTariff', 'billingCycle', 'billingDate', 'utilityProvider'
        ];
        
        autoSaveFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', this.autoSaveField.bind(this));
            }
        });
        
        // Notification checkboxes
        const notificationCheckboxes = document.querySelectorAll('#emailNotifications, #pushNotifications, #smsNotifications');
        notificationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.autoSaveField.bind(this));
        });
    }
    
    // Toggle password/API key visibility
    togglePasswordVisibility(input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        
        const button = input.nextElementSibling;
        button.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
    
    // Handle simulation mode change
    handleSimulationModeChange(mode) {
        if (window.smartMeter) {
            window.smartMeter.setSimulationMode(mode);
        }
        
        // Show/hide API key fields based on mode
        const apiKeyFields = document.querySelectorAll('.api-key-input');
        if (mode === 'api') {
            apiKeyFields.forEach(field => field.style.display = 'flex');
        } else {
            apiKeyFields.forEach(field => field.style.display = 'none');
        }
    }
    
    // Auto-save individual field
    autoSaveField(event) {
        const field = event.target;
        const fieldId = field.id;
        const value = field.type === 'checkbox' ? field.checked : field.value;
        
        this.updateSettingsField(fieldId, value);
        this.saveSettings();
        this.showSaveIndicator('Setting saved');
    }
    
    // Update settings field based on ID
    updateSettingsField(fieldId, value) {
        const fieldMap = {
            // General settings
            'systemName': ['general', 'systemName'],
            'systemLocation': ['general', 'systemLocation'],
            'currency': ['general', 'currency'],
            'units': ['general', 'units'],
            
            // Display settings
            'theme': ['display', 'theme'],
            'chartStyle': ['display', 'chartStyle'],
            'dataRefresh': ['display', 'dataRefresh'],
            'autoLogout': ['display', 'autoLogout'],
            
            // API settings
            'emoncmsKey': ['api', 'emoncmsKey'],
            'weatherKey': ['api', 'weatherKey'],
            'simulationMode': ['api', 'simulationMode'],
            
            // Alert thresholds
            'batteryLow': ['alerts', 'batteryLow'],
            'batteryHigh': ['alerts', 'batteryHigh'],
            'gridImportLimit': ['alerts', 'gridImportLimit'],
            'efficiencyThreshold': ['alerts', 'efficiencyThreshold'],
            
            // Notifications
            'emailNotifications': ['notifications', 'email'],
            'pushNotifications': ['notifications', 'push'],
            'smsNotifications': ['notifications', 'sms'],
            'notificationEmail': ['notifications', 'emailAddress'],
            'smsNumber': ['notifications', 'smsNumber'],
            
            // Billing
            'importTariff': ['billing', 'importTariff'],
            'exportTariff': ['billing', 'exportTariff'],
            'billingCycle': ['billing', 'billingCycle'],
            'billingDate': ['billing', 'billingDate'],
            'utilityProvider': ['billing', 'utilityProvider']
        };
        
        const path = fieldMap[fieldId];
        if (path) {
            // Handle nested objects for TOU rates
            if (fieldId.includes('tou')) {
                const rateType = fieldId.replace('tou', '').toLowerCase();
                this.currentSettings.billing.touRates[rateType] = parseFloat(value);
            } else {
                this.currentSettings[path[0]][path[1]] = value;
            }
        }
    }
    
    // Update settings display
    updateSettingsDisplay() {
        if (!this.currentSettings) return;
        
        const settings = this.currentSettings;
        
        // General settings
        document.getElementById('systemName').value = settings.general.systemName;
        document.getElementById('systemLocation').value = settings.general.systemLocation;
        document.getElementById('currency').value = settings.general.currency;
        document.getElementById('units').value = settings.general.units;
        
        // Display settings
        document.getElementById('theme').value = settings.display.theme;
        document.getElementById('chartStyle').value = settings.display.chartStyle;
        document.getElementById('dataRefresh').value = settings.display.dataRefresh;
        document.getElementById('autoLogout').value = settings.display.autoLogout;
        
        // API settings
        document.getElementById('emoncmsKey').value = settings.api.emoncmsKey;
        document.getElementById('weatherKey').value = settings.api.weatherKey;
        document.getElementById('simulationMode').value = settings.api.simulationMode;
        
        // Alert thresholds
        document.getElementById('batteryLow').value = settings.alerts.batteryLow;
        document.getElementById('batteryHigh').value = settings.alerts.batteryHigh;
        document.getElementById('gridImportLimit').value = settings.alerts.gridImportLimit;
        document.getElementById('efficiencyThreshold').value = settings.alerts.efficiencyThreshold;
        
        // Notifications
        document.getElementById('emailNotifications').checked = settings.notifications.email;
        document.getElementById('pushNotifications').checked = settings.notifications.push;
        document.getElementById('smsNotifications').checked = settings.notifications.sms;
        document.getElementById('notificationEmail').value = settings.notifications.emailAddress;
        document.getElementById('smsNumber').value = settings.notifications.smsNumber;
        
        // Billing
        document.getElementById('importTariff').value = settings.billing.importTariff;
        document.getElementById('exportTariff').value = settings.billing.exportTariff;
        document.getElementById('billingCycle').value = settings.billing.billingCycle;
        document.getElementById('billingDate').value = settings.billing.billingDate;
        document.getElementById('utilityProvider').value = settings.billing.utilityProvider;
        
        // TOU rates
        const touRates = settings.billing.touRates;
        document.querySelectorAll('.tou-rate input').forEach((input, index) => {
            const rates = [touRates.offPeak, touRates.standard, touRates.peak];
            if (rates[index] !== undefined) {
                input.value = rates[index];
            }
        });
        
        // Apply initial settings
        this.applyImmediateSettings();
        this.handleSimulationModeChange(settings.api.simulationMode);
    }
    
    // Start periodic status updates
    startStatusUpdates() {
        setInterval(() => {
            this.updateSyncStatus();
        }, 30000); // Update every 30 seconds
        
        this.updateSyncStatus(); // Initial update
    }
    
    // Update synchronization status
    updateSyncStatus() {
        const lastSyncElement = document.getElementById('lastSync');
        if (lastSyncElement) {
            const now = new Date();
            lastSyncElement.textContent = 'Just now';
            // In a real application, you would show actual sync time
        }
    }
    
    // Show save indicator
    showSaveIndicator(message) {
        // Similar to profile.js implementation
        const existingIndicator = document.querySelector('.save-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
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
        
        setTimeout(() => {
            indicator.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
}

// Global functions for HTML onclick handlers
function openTab(tabName) {
    // This function is already in main.js, but we'll ensure it works here too
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

function toggleApiKey(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        
        const button = input.nextElementSibling;
        button.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
}

function saveGeneralSettings() {
    if (window.settingsManager) {
        window.settingsManager.showSaveIndicator('General settings saved');
    }
}

function saveDisplaySettings() {
    if (window.settingsManager) {
        window.settingsManager.showSaveIndicator('Display settings saved');
    }
}

function saveApiSettings() {
    if (window.settingsManager) {
        // Update API keys in smart meter
        const emoncmsKey = document.getElementById('emoncmsKey').value;
        const weatherKey = document.getElementById('weatherKey').value;
        
        if (window.smartMeter) {
            window.smartMeter.setApiKeys(emoncmsKey, weatherKey);
        }
        
        window.settingsManager.showSaveIndicator('API settings saved');
    }
}

function saveAlertThresholds() {
    if (window.settingsManager) {
        window.settingsManager.showSaveIndicator('Alert thresholds saved');
    }
}

function saveNotificationSettings() {
    if (window.settingsManager) {
        window.settingsManager.showSaveIndicator('Notification settings saved');
    }
}

function saveTariffSettings() {
    if (window.settingsManager) {
        window.settingsManager.showSaveIndicator('Tariff settings saved');
    }
}

function saveBillingSettings() {
    if (window.settingsManager) {
        window.settingsManager.showSaveIndicator('Billing settings saved');
    }
}

function testEmoncmsConnection() {
    alert('Testing EMONCMS connection...\nThis would validate the API key and connection in a real implementation.');
}

function syncNow() {
    if (window.smartMeter) {
        window.smartMeter.collectData();
        window.settingsManager.showSaveIndicator('Data sync initiated');
    }
}

function exportAllData() {
    alert('Exporting all system data...\nThis would generate a comprehensive export in a real implementation.');
}

function clearOldData() {
    if (confirm('Are you sure you want to clear data older than 1 year? This action cannot be undone.')) {
        alert('Old data clearance initiated...\nThis would remove old records in a real implementation.');
    }
}

function backupSystem() {
    alert('System backup initiated...\nThis would create a full system backup in a real implementation.');
}

function checkForUpdates() {
    alert('Checking for system updates...\nYour system is up to date.');
}

function systemDiagnostics() {
    alert('Running system diagnostics...\nAll systems are functioning normally.');
}

function restartSystem() {
    if (confirm('Are you sure you want to restart the system? This will temporarily interrupt data collection.')) {
        alert('System restart initiated...\nThe system will restart in a real implementation.');
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.settingsManager = new SettingsManager();
});

// Add CSS for settings page
const settingsStyle = document.createElement('style');
settingsStyle.textContent = `
    .sync-status {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .sync-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }
    
    .sync-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .sync-btn, .data-btn, .system-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.9rem;
    }
    
    .sync-btn:hover, .data-btn:hover, .system-btn:hover {
        background: #2980b9;
    }
    
    .data-management, .system-info {
        margin-bottom: 20px;
    }
    
    .data-info, .system-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 15px;
    }
    
    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
    }
    
    .data-actions, .system-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .status-online {
        color: #27ae60;
        font-weight: bold;
    }
    
    .notification-channels {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .channel-item {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .channel-item input[type="email"],
    .channel-item input[type="tel"] {
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 3px;
        margin-left: auto;
        min-width: 200px;
    }
    
    .tou-rates {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
    }
    
    .tou-rate {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
    }
    
    .tou-rate input {
        width: 80px;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
    }
    
    /* Dark theme support */
    .theme-dark {
        background-color: #1a1a1a;
        color: #ffffff;
    }
    
    .theme-dark .settings-card {
        background-color: #2d2d2d;
        color: #ffffff;
    }
    
    .theme-dark input,
    .theme-dark select {
        background-color: #3d3d3d;
        color: #ffffff;
        border-color: #555;
    }
    
    .theme-dark .tab-btn {
        background-color: #2d2d2d;
        color: #cccccc;
    }
    
    .theme-dark .tab-btn.active {
        background-color: #1a1a1a;
        color: #ffffff;
    }
`;
document.head.appendChild(settingsStyle);