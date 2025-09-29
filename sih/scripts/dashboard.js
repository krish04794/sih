// Dashboard-specific JavaScript
let productionChartInstance;

// Initialize charts
function initializeCharts() {
    // Production Chart
    const productionCtx = document.getElementById('productionChart');
    if (productionCtx) {
        productionChartInstance = new Chart(productionCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [
                    {
                        label: 'Solar Production',
                        data: [0, 0, 3.2, 6.8, 4.5, 0.5],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Wind Production',
                        data: [2.1, 2.8, 1.5, 1.2, 2.5, 3.1],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Consumption',
                        data: [1.5, 1.2, 3.8, 4.2, 5.1, 4.3],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Energy Production & Consumption (Today)'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Power (kW)'
                        }
                    }
                }
            }
        });
    }
    
    // Efficiency Chart
    const efficiencyCtx = document.getElementById('efficiencyChart');
    if (efficiencyCtx) {
        new Chart(efficiencyCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'System Efficiency (%)',
                        data: [82, 85, 78, 88, 90, 76, 83],
                        backgroundColor: 'rgba(46, 204, 113, 0.7)',
                        borderColor: '#2ecc71',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly System Efficiency'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        }
                    }
                }
            }
        });
    }
}

// Render energy flow diagram
function renderEnergyFlow() {
    const flowDiagram = document.getElementById('flowDiagram');
    if (!flowDiagram) return;
    
    flowDiagram.innerHTML = `
        <div class="flow-container" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 20px;">
            <div class="flow-source" style="text-align: center;">
                <div style="font-size: 2rem; color: #f39c12;"><i class="fas fa-sun"></i></div>
                <div>Solar</div>
                <div style="font-weight: bold;">4.2 kW</div>
            </div>
            
            <div class="flow-arrow" style="font-size: 1.5rem;">→</div>
            
            <div class="flow-inverter" style="text-align: center;">
                <div style="font-size: 2rem; color: #3498db;"><i class="fas fa-exchange-alt"></i></div>
                <div>Inverter</div>
                <div style="font-size: 0.8rem;">Online</div>
            </div>
            
            <div class="flow-arrow" style="font-size: 1.5rem;">→</div>
            
            <div class="flow-battery" style="text-align: center;">
                <div style="font-size: 2rem; color: #9b59b6;"><i class="fas fa-battery-half"></i></div>
                <div>Battery</div>
                <div style="font-weight: bold;">78%</div>
            </div>
            
            <div class="flow-arrow" style="font-size: 1.5rem;">→</div>
            
            <div class="flow-grid" style="text-align: center;">
                <div style="font-size: 2rem; color: #e74c3c;"><i class="fas fa-bolt"></i></div>
                <div>Grid</div>
                <div style="font-weight: bold;">Importing</div>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <div style="display: inline-block; text-align: center; margin: 0 15px;">
                <div style="font-size: 1.5rem; color: #3498db;"><i class="fas fa-wind"></i></div>
                <div>Wind</div>
                <div style="font-weight: bold;">1.8 kW</div>
            </div>
        </div>
    `;
}

// Update real-time data
function updateRealtimeData() {
    // This would typically fetch data from an API
    // For demo purposes, we'll simulate data updates
    
    const solarValue = (Math.random() * 8 + 2).toFixed(1);
    const windValue = (Math.random() * 4).toFixed(1);
    const batteryValue = Math.max(0, Math.min(100, 78 + (Math.random() * 4 - 2)));
    
    // Update status cards
    document.querySelector('.status-card:nth-child(1) .value').textContent = `${solarValue} kW`;
    document.querySelector('.status-card:nth-child(2) .value').textContent = `${windValue} kW`;
    document.querySelector('.status-card:nth-child(3) .value').textContent = `${batteryValue.toFixed(0)}%`;
    
    // Update equipment uptime
    const equipmentItems = document.querySelectorAll('.equipment-item');
    equipmentItems.forEach(item => {
        const uptimeElement = item.querySelector('.uptime');
        if (uptimeElement) {
            const currentTime = uptimeElement.textContent;
            // Simulate time increment (in a real app, this would calculate actual uptime)
            uptimeElement.textContent = incrementUptime(currentTime);
        }
    });
}

// Helper function to increment uptime display
function incrementUptime(timeString) {
    const parts = timeString.split(' ');
    let hours = parseInt(parts[0].replace('h', ''));
    let minutes = parseInt(parts[1].replace('m', ''));
    
    minutes += 1;
    if (minutes >= 60) {
        minutes = 0;
        hours += 1;
    }
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    renderEnergyFlow();
    
    // Update real-time data every 5 seconds
    setInterval(updateRealtimeData, 5000);
    
    // Initial update
    updateRealtimeData();

    // Chart time range filter
    const chartTimeRange = document.getElementById('chartTimeRange');
    if (chartTimeRange) {
        chartTimeRange.addEventListener('change', (e) => {
            updateChartData(e.target.value);
        });
    }
});

function updateChartData(timeRange) {
    if (!productionChartInstance) return;

    let labels;
    let dataPoints;

    switch (timeRange) {
        case '7days':
            labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
            dataPoints = 7;
            break;
        case '30days':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            dataPoints = 4;
            break;
        case 'today':
        default:
            labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
            dataPoints = 6;
            break;
    }

    productionChartInstance.data.labels = labels;
    productionChartInstance.data.datasets.forEach(dataset => {
        dataset.data = Array.from({ length: dataPoints }, () => Math.random() * 10);
    });

    productionChartInstance.update();
}