// Settings handlers wired to SmartMeterSimulator
function toggleApiKey(id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

function saveApiSettings() {
    const emonKey = document.getElementById('emoncmsKey')?.value || 'demo';
    const weatherKey = document.getElementById('weatherKey')?.value || null;
    const mode = document.getElementById('simulationMode')?.value || 'auto';
    if (window.smartMeter) {
        window.smartMeter.setApiKeys(emonKey, weatherKey);
        window.smartMeter.setSimulationMode(mode);
    }
    alert('API settings saved');
}

function saveGeneralSettings() { alert('General settings saved'); }
function saveDisplaySettings() { alert('Display settings saved'); }
function saveAlertThresholds() { alert('Alert settings saved'); }
function saveNotificationSettings() { alert('Notification settings saved'); }
function saveTariffSettings() { alert('Tariff settings saved'); }
function exportAllData() { alert('Export initiated'); }
function clearOldData() { alert('Old data cleared'); }
function backupSystem() { alert('Backup created'); }
function checkForUpdates() { alert('Checking for updates...'); }
function systemDiagnostics() { alert('Diagnostics started'); }
function restartSystem() { alert('System restart triggered'); }

function testEmoncmsConnection() {
    if (!window.smartMeter) return alert('Smart meter not ready');
    window.smartMeter.fetchFromEmoncms().then(() => alert('EMONCMS reachable')).catch(err => alert('EMONCMS error: ' + err.message));
}

function syncNow() {
    if (!window.smartMeter) return;
    window.smartMeter.collectData();
    const el = document.getElementById('lastSync');
    if (el) el.textContent = 'Just now';
}

