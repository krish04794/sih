// Weather Map and Output Estimation (Open-Meteo, no API key)
(function() {
    let map;
    let marker;
    let currentLatLng = { lat: 26.9124, lng: 75.7873 }; // Jaipur default

    function initMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        map = L.map('map').setView([currentLatLng.lat, currentLatLng.lng], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        marker = L.marker([currentLatLng.lat, currentLatLng.lng], { draggable: true }).addTo(map);
        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            currentLatLng = { lat: pos.lat, lng: pos.lng };
        });

        map.on('click', (e) => {
            currentLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
            marker.setLatLng(e.latlng);
        });
    }

    async function fetchWeather(lat, lon) {
        // Open-Meteo: global radiation and wind speed
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=shortwave_radiation,temperature_2m,windspeed_10m&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        const idx = 0;
        const irr = data.hourly?.shortwave_radiation?.[idx] ?? 0; // W/m²
        const t2m = data.hourly?.temperature_2m?.[idx] ?? 25; // °C
        const wind = data.hourly?.windspeed_10m?.[idx] ?? 3; // m/s
        return { irr, t2m, wind };
    }

    function estimateSolarPower(irradianceWm2, arraySizeKw, temperatureC) {
        // Simple PV model: P = P_rated * (irr/1000) * (1 - 0.004*(T-25))
        const tempCoeff = -0.004;
        const performanceRatio = 0.8; // wiring, inverter
        const normalizedIrr = Math.max(0, irradianceWm2) / 1000; // kW/m² proxy
        const tempFactor = 1 + tempCoeff * (temperatureC - 25);
        return Math.max(0, arraySizeKw * normalizedIrr * tempFactor * performanceRatio);
    }

    function estimateWindPower(windSpeedMs, ratedKw) {
        // Cubic model between cut-in 3 m/s and rated 12 m/s, zero outside
        const cutIn = 3;
        const rated = 12;
        if (windSpeedMs <= cutIn) return 0;
        if (windSpeedMs >= rated) return ratedKw;
        const ratio = (windSpeedMs - cutIn) / (rated - cutIn);
        return ratedKw * Math.pow(ratio, 3);
    }

    async function runEstimate() {
        const [lat, lon] = [currentLatLng.lat, currentLatLng.lng];
        const solarSizeKw = parseFloat(document.getElementById('solarSizeKw').value) || 0;
        const windRatedKw = parseFloat(document.getElementById('windRatedKw').value) || 0;

        const { irr, t2m, wind } = await fetchWeather(lat, lon);

        const solarKw = estimateSolarPower(irr, solarSizeKw, t2m);
        const windKw = estimateWindPower(wind, windRatedKw);

        document.getElementById('irradiance').textContent = `${irr.toFixed(0)} W/m²`;
        document.getElementById('airTemp').textContent = `${t2m.toFixed(1)} °C`;
        document.getElementById('windSpeed').textContent = `${wind.toFixed(1)} m/s`;
        document.getElementById('solarPower').textContent = `${solarKw.toFixed(1)} kW`;
        document.getElementById('windPower').textContent = `${windKw.toFixed(1)} kW`;
    }

    function wirePresetSelect() {
        const preset = document.getElementById('presetLocation');
        if (!preset) return;
        preset.addEventListener('change', () => {
            const [latStr, lonStr] = preset.value.split(',');
            currentLatLng = { lat: parseFloat(latStr), lng: parseFloat(lonStr) };
            map.setView([currentLatLng.lat, currentLatLng.lng], 7);
            marker.setLatLng([currentLatLng.lat, currentLatLng.lng]);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMap();
        wirePresetSelect();
        const btn = document.getElementById('runEstimate');
        if (btn) btn.addEventListener('click', runEstimate);
    });
})();


