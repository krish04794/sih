// Data History Management

class DataHistoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.filter = {
            startDate: null,
            endDate: null,
            assetType: 'all',
            timeRange: '24h'
        };
    }
    
    // Initialize data history page
    init() {
        this.setupEventListeners();
        this.loadData();
        this.applyFilters();
    }
    
    // Setup event listeners for filters and controls
    setupEventListeners() {
        // Date filter
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.addEventListener('change', () => {
                this.filter.startDate = startDateInput.value;
                this.applyFilters();
            });
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', () => {
                this.filter.endDate = endDateInput.value;
                this.applyFilters();
            });
        }
        
        // Asset type filter
        const assetTypeSelect = document.getElementById('assetType');
        if (assetTypeSelect) {
            assetTypeSelect.addEventListener('change', () => {
                this.filter.assetType = assetTypeSelect.value;
                this.applyFilters();
            });
        }
        
        // Time range filter
        const timeRangeSelect = document.getElementById('timeRange');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', () => {
                this.filter.timeRange = timeRangeSelect.value;
                this.applyFilters();
            });
        }
        
        // Export buttons
        const exportCsvBtn = document.getElementById('exportCsv');
        const exportPdfBtn = document.getElementById('exportPdf');
        
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
        }
        
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportData('pdf'));
        }
        
        // Pagination
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.previousPage());
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.nextPage());
        }
    }
    
    // Load data from smart meter or localStorage
    loadData() {
        if (window.smartMeter && window.smartMeter.dataHistory) {
            this.data = window.smartMeter.dataHistory;
        } else {
            // Fallback: load from localStorage or generate sample data
            this.loadFromLocalStorage();
        }
        
        this.renderTable();
    }
    
    // Load data from localStorage
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('smartMeterData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.data = parsedData.history || this.generateSampleData();
            } else {
                this.data = this.generateSampleData();
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
            this.data = this.generateSampleData();
        }
    }
    
    // Generate sample data for demonstration
    generateSampleData() {
        const sampleData = [];
        const now = new Date();
        
        for (let i = 0; i < 100; i++) {
            const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30-minute intervals
            const solar = (Math.random() * 8 + 2).toFixed(2);
            const wind = (Math.random() * 4).toFixed(2);
            const consumption = (Math.random() * 5 + 3).toFixed(2);
            
            sampleData.push({
                timestamp: timestamp.toISOString(),
                solar: parseFloat(solar),
                wind: parseFloat(wind),
                consumption: parseFloat(consumption),
                gridImport: parseFloat((Math.random() * 2).toFixed(2)),
                batteryLevel: parseFloat((Math.random() * 100).toFixed(1)),
                efficiency: parseFloat((Math.random() * 10 + 85).toFixed(1))
            });
        }
        
        return sampleData;
    }
    
    // Apply filters to data
    applyFilters() {
        let filteredData = [...this.data];
        
        // Filter by date range
        if (this.filter.startDate) {
            const startDate = new Date(this.filter.startDate);
            filteredData = filteredData.filter(entry => 
                new Date(entry.timestamp) >= startDate
            );
        }
        
        if (this.filter.endDate) {
            const endDate = new Date(this.filter.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            filteredData = filteredData.filter(entry => 
                new Date(entry.timestamp) <= endDate
            );
        }
        
        // Filter by time range
        if (this.filter.timeRange !== 'all') {
            const hours = parseInt(this.filter.timeRange);
            const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
            filteredData = filteredData.filter(entry => 
                new Date(entry.timestamp) >= cutoffTime
            );
        }
        
        // Filter by asset type (for future use with multiple assets)
        if (this.filter.assetType !== 'all') {
            // Currently all data includes all assets
            // This can be expanded when we have per-asset data
        }
        
        this.filteredData = filteredData;
        this.currentPage = 1;
        this.renderTable();
    }
    
    // Render data table
    renderTable() {
        const tableBody = document.getElementById('dataTableBody');
        if (!tableBody) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData ? 
            this.filteredData.slice(startIndex, endIndex) : 
            this.data.slice(startIndex, endIndex);
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Populate table
        pageData.forEach(entry => {
            const row = document.createElement('tr');
            const date = new Date(entry.timestamp);
            
            row.innerHTML = `
                <td>${date.toLocaleDateString()}</td>
                <td>${date.toLocaleTimeString()}</td>
                <td>${entry.solar}</td>
                <td>${entry.wind}</td>
                <td>${entry.consumption}</td>
                <td>${entry.gridImport}</td>
                <td>${entry.batteryLevel}</td>
                <td>${entry.efficiency}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update pagination info
        this.updatePaginationInfo();
    }
    
    // Update pagination information
    updatePaginationInfo() {
        const totalItems = this.filteredData ? this.filteredData.length : this.data.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${totalItems} records)`;
        }
        
        // Update button states
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }
    
    // Go to next page
    nextPage() {
        const totalItems = this.filteredData ? this.filteredData.length : this.data.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    }
    
    // Go to previous page
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    }
    
    // Export data in specified format
    exportData(format) {
        const exportData = this.filteredData || this.data;
        
        if (format === 'csv') {
            this.exportToCsv(exportData);
        } else if (format === 'pdf') {
            this.exportToPdf(exportData);
        }
    }
    
    // Export to CSV
    exportToCsv(data) {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }
        
        // Create CSV header
        const headers = ['Date', 'Time', 'Solar (kW)', 'Wind (kW)', 'Consumption (kW)', 'Grid Import (kW)', 'Battery Level (%)', 'Efficiency (%)'];
        const csvRows = [headers.join(',')];
        
        // Add data rows
        data.forEach(entry => {
            const date = new Date(entry.timestamp);
            const row = [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                entry.solar,
                entry.wind,
                entry.consumption,
                entry.gridImport,
                entry.batteryLevel,
                entry.efficiency
            ];
            csvRows.push(row.join(','));
        });
        
        // Create and download file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `energy_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('CSV export completed!');
    }
    
    // Export to PDF (simplified version)
    exportToPdf(data) {
        // In a real application, you would use a library like jsPDF
        // This is a simplified version that creates a printable table
        
        if (data.length === 0) {
            alert('No data to export');
            return;
        }
        
        // Create a printable version of the table
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Energy Data Export</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        h1 { color: #2c3e50; }
                    </style>
                </head>
                <body>
                    <h1>Energy Data Export</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Solar (kW)</th>
                                <th>Wind (kW)</th>
                                <th>Consumption (kW)</th>
                                <th>Grid Import (kW)</th>
                                <th>Battery Level (%)</th>
                                <th>Efficiency (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(entry => {
                                const date = new Date(entry.timestamp);
                                return `
                                    <tr>
                                        <td>${date.toLocaleDateString()}</td>
                                        <td>${date.toLocaleTimeString()}</td>
                                        <td>${entry.solar}</td>
                                        <td>${entry.wind}</td>
                                        <td>${entry.consumption}</td>
                                        <td>${entry.gridImport}</td>
                                        <td>${entry.batteryLevel}</td>
                                        <td>${entry.efficiency}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        
        alert('PDF export completed! The print dialog will open.');
    }
}

// Initialize data history manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('dataTableBody')) {
        window.dataHistoryManager = new DataHistoryManager();
        window.dataHistoryManager.init();
    }
});