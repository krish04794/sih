// Smart Meter Integration and Simulation

class SmartMeterSimulator {
    constructor() {
        this.solarPower = 4.2;
        this.windPower = 1.8;
        this.consumption = 6.5;
        this.batteryLevel = 78;
        this.gridImport = 0.5;
        this.isCharging = true;
        this.dataHistory = [];
        this.emoncmsApiKey = 'demo';
        this.weatherApiKey = null;
        this.simulationMode = 'auto'; // auto, manual, api
    }
    
    // Initialize the smart meter simulator
    init() {
        this.loadHistoricalData();
        this.startDataCollection();
        console.log('Smart Meter Simulator initialized');
    }
    
    // Start collecting data at regular intervals
    startDataCollection() {
        setInterval(() => {
            this.collectData();
        }, 5000); // Collect data every 5 seconds
    }
    
    // Collect data from various sources
    async collectData() {
        const timestamp = new Date().toISOString();
        
        try {
            let data;
            
            switch(this.simulationMode) {
                case 'api':
                    data = await this.fetchFromEmoncms();
                    break;
                case 'manual':
                    data = this.generateManualData();
                    break;
                case 'auto':
                default:
                    data = await this.generateSimulatedData();
                    break;
            }
            
            // Add timestamp and store
            data.timestamp = timestamp;
            this.dataHistory.push(data);
            
            // Keep only last 1000 records to prevent memory issues
            if (this.dataHistory.length > 1000) {
                this.dataHistory = this.dataHistory.slice(-1000);
            }
            
            // Update dashboard
            this.updateDashboard(data);
            
            // Save to localStorage
            this.saveToLocalStorage();
            
        } catch (error) {
            console.error('Error collecting smart meter data:', error);
            // Fallback to simulated data
            const fallbackData = this.generateManualData();
            fallbackData.timestamp = timestamp;
            this.updateDashboard(fallbackData);
        }
    }
    
    // Fetch data from EMONCMS demo API
    async fetchFromEmoncms() {
        try {
            const response = await fetch(`https://emoncms.org/feed/list.json?apikey=${this.emoncmsApiKey}`);
            const data = await response.json();
            
            // Process EMONCMS data structure
            return this.processEmoncmsData(data);
        } catch (error) {
            throw new Error('Failed to fetch from EMONCMS: ' + error.message);
        }
    }
    
    // Process EMONCMS data into our format
    processEmoncmsData(emonData) {
        // This is a simplified processing - adjust based on actual EMONCMS feed structure
        return {
            solar: this.getFeedValue(emonData, 'solar') || this.solarPower,
            wind: this.getFeedValue(emonData, 'wind') || this.windPower,
            consumption: this.getFeedValue(emonData, 'consumption') || this.consumption,
            gridImport: this.getFeedValue(emonData, 'grid') || this.gridImport,
            batteryLevel: this.batteryLevel,
            efficiency: Math.random() * 20 + 80 // Simulated efficiency
        };
    }
    
    // Helper to get feed value by name
    getFeedValue(feedList, feedName) {
        const feed = Array.isArray(feedList) ? feedList.find(f => f.name && f.name.toLowerCase().includes(feedName)) : null;
        return feed ? feed.value : null;
    }
    
    // Generate simulated data based on realistic patterns
    async generateSimulatedData() {
        const now = new Date();
        const hour = now.getHours();
        const isDaytime = hour > 6 && hour < 20;
        
        // Solar follows daytime pattern with some randomness
        const solarBase = isDaytime ? (Math.random() * 8 + 2) : 0;
        const solarVariation = Math.sin((hour - 6) * Math.PI / 12) * 4;
        const solarPower = Math.max(0, solarBase + solarVariation);
        
        // Wind has more random patterns with some gusts
        const windBase = 1 + Math.random() * 3;
        const windGust = Math.random() > 0.7 ? Math.random() * 4 : 0;
        const windPower = windBase + windGust;
        
        // Consumption follows daily patterns (higher in morning and evening)
        const consumptionBase = 4 + Math.random() * 3;
        const consumptionPeak = hour >= 7 && hour <= 9 ? 2 : (hour >= 17 && hour <= 21 ? 3 : 0);
        const consumption = consumptionBase + consumptionPeak;
        
        // Calculate net power and update battery
        const netPower = solarPower + windPower - consumption;
        this.updateBatteryLevel(netPower);
        
        // Grid import/export based on net power and battery
        let gridImport = 0;
        if (netPower < 0 && this.batteryLevel <= 10) {
            gridImport = Math.abs(netPower);
        }
        
        return {
            solar: parseFloat(solarPower.toFixed(2)),
            wind: parseFloat(windPower.toFixed(2)),
            consumption: parseFloat(consumption.toFixed(2)),
            gridImport: parseFloat(gridImport.toFixed(2)),
            batteryLevel: parseFloat(this.batteryLevel.toFixed(1)),
            efficiency: parseFloat((Math.random() * 10 + 85).toFixed(1)),
            timestamp: now.toISOString()
        };
    }
    
    // Generate manual data (simple random values)
    generateManualData() {
        return {
            solar: parseFloat((Math.random() * 8 + 2).toFixed(2)),
            wind: parseFloat((Math.random() * 4).toFixed(2)),
            consumption: parseFloat((Math.random() * 5 + 3).toFixed(2)),
            gridImport: parseFloat((Math.random() * 2).toFixed(2)),
            batteryLevel: parseFloat(this.batteryLevel.toFixed(1)),
            efficiency: parseFloat((Math.random() * 10 + 85).toFixed(1))
        };
    }
    
    // Update battery level based on net power
    updateBatteryLevel(netPower) {
        // Simple battery model: 10kWh capacity, charge/discharge efficiency 90%
        const batteryCapacity = 10; // kWh
        const efficiency = 0.9;
        
        if (netPower > 0) {
            // Excess power - charge battery
            const chargeEnergy = (netPower * efficiency) / 12; // Convert to % of capacity
            this.batteryLevel = Math.min(100, this.batteryLevel + chargeEnergy);
            this.isCharging = true;
        } else if (netPower < 0 && this.batteryLevel > 5) {
            // Power deficit - discharge battery
            const dischargeEnergy = (Math.abs(netPower) / efficiency) / 12;
            this.batteryLevel = Math.max(0, this.batteryLevel - dischargeEnergy);
            this.isCharging = false;
        }
    }
    
    // Update dashboard with new data
    updateDashboard(data) {
        // Update status cards
        this.updateStatusCard(1, `${data.solar} kW`, data.solar > 0 ? 'Active' : 'Inactive');
        this.updateStatusCard(2, `${data.wind} kW`, data.wind > 0.5 ? 'Active' : 'Low Wind');
        this.updateStatusCard(3, `${data.batteryLevel}%`, this.isCharging ? 'Charging' : 'Discharging');
        this.updateStatusCard(4, data.gridImport > 0 ? 'Importing' : 'Exporting', `${Math.abs(data.gridImport)} kW`);
        
        // Update energy flow diagram
        this.updateEnergyFlow(data);
    }
    
    // Update specific status card
    updateStatusCard(index, value, status) {
        const card = document.querySelector(`.status-card:nth-child(${index})`);
        if (card) {
            const valueElement = card.querySelector('.value');
            const statusElement = card.querySelector('.status');
            
            if (valueElement) valueElement.textContent = value;
            if (statusElement) {
                statusElement.textContent = status;
                // Update status class based on value
                statusElement.className = 'status';
                if (status.includes('Active') || status.includes('Charging')) {
                    statusElement.classList.add('active');
                } else if (status.includes('Discharging')) {
                    statusElement.classList.add('charging');
                }
            }
        }
    }
    
    // Update energy flow visualization
    updateEnergyFlow(data) {
        const flowDiagram = document.getElementById('flowDiagram');
        if (!flowDiagram) return;
        
        flowDiagram.innerHTML = `
            <div class="flow-container" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 20px;">
                <div class="flow-source" style="text-align: center;">
                    <div style="font-size: 2rem; color: #f39c12;"><i class="fas fa-sun"></i></div>
                    <div>Solar</div>
                    <div style="font-weight: bold;">${data.solar} kW</div>
                </div>
                
                <div class="flow-arrow" style="font-size: 1.5rem;">→</div>
                
                <div class="flow-inverter" style="text-align: center;">
                    <div style="font-size: 2rem; color: #3498db;"><i class="fas fa-exchange-alt"></i></div>
                    <div>Inverter</div>
                    <div style="font-size: 0.8rem;">${data.solar > 0 ? 'Online' : 'Standby'}</div>
                </div>
                
                <div class="flow-arrow" style="font-size: 1.5rem;">${this.isCharging ? '→' : '←'}</div>
                
                <div class="flow-battery" style="text-align: center;">
                    <div style="font-size: 2rem; color: #9b59b6;"><i class="fas fa-battery-half"></i></div>
                    <div>Battery</div>
                    <div style="font-weight: bold;">${data.batteryLevel}%</div>
                </div>
                
                <div class="flow-arrow" style="font-size: 1.5rem;">${data.gridImport > 0 ? '←' : '→'}</div>
                
                <div class="flow-grid" style="text-align: center;">
                    <div style="font-size: 2rem; color: #e74c3c;"><i class="fas fa-bolt"></i></div>
                    <div>Grid</div>
                    <div style="font-weight: bold;">${data.gridImport > 0 ? 'Importing' : 'Exporting'}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <div style="display: inline-block; text-align: center; margin: 0 15px;">
                    <div style="font-size: 1.5rem; color: #3498db;"><i class="fas fa-wind"></i></div>
                    <div>Wind</div>
                    <div style="font-weight: bold;">${data.wind} kW</div>
                </div>
                
                <div style="display: inline-block; text-align: center; margin: 0 15px;">
                    <div style="font-size: 1.5rem; color: #e74c3c;"><i class="fas fa-home"></i></div>
                    <div>Load</div>
                    <div style="font-weight: bold;">${data.consumption} kW</div>
                </div>
            </div>
        `;
    }
    
    // Get historical data for charts
    getHistoricalData(hours = 24) {
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
        
        return this.dataHistory.filter(entry => {
            const entryTime = new Date(entry.timestamp);
            return entryTime >= cutoffTime;
        });
    }
    
    // Save data to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('smartMeterData', JSON.stringify({
                history: this.dataHistory.slice(-100), // Keep last 100 entries
                settings: {
                    simulationMode: this.simulationMode,
                    emoncmsApiKey: this.emoncmsApiKey,
                    weatherApiKey: this.weatherApiKey
                }
            }));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }
    
    // Load historical data from localStorage
    loadHistoricalData() {
        try {
            const savedData = localStorage.getItem('smartMeterData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.dataHistory = parsedData.history || [];
                
                if (parsedData.settings) {
                    this.simulationMode = parsedData.settings.simulationMode || 'auto';
                    this.emoncmsApiKey = parsedData.settings.emoncmsApiKey || 'demo';
                    this.weatherApiKey = parsedData.settings.weatherApiKey || null;
                }
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
    }
    
    // Set simulation mode
    setSimulationMode(mode) {
        this.simulationMode = mode;
        this.saveToLocalStorage();
    }
    
    // Set API keys
    setApiKeys(emoncmsKey, weatherKey) {
        this.emoncmsApiKey = emoncmsKey;
        this.weatherApiKey = weatherKey;
        this.saveToLocalStorage();
    }
}

// Initialize smart meter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.smartMeter = new SmartMeterSimulator();
    window.smartMeter.init();
});