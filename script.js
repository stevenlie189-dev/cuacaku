// ===========================
// CuacaKu — Weather App Script
// ===========================

// WMO Weather Codes mapping
const WMO_CODES = {
    0: { desc: 'Cerah', icon: '☀️', iconNight: '🌙' },
    1: { desc: 'Sebagian Besar Cerah', icon: '🌤️', iconNight: '🌙' },
    2: { desc: 'Berawan Sebagian', icon: '⛅', iconNight: '☁️' },
    3: { desc: 'Berawan', icon: '☁️', iconNight: '☁️' },
    45: { desc: 'Berkabut', icon: '🌫️', iconNight: '🌫️' },
    48: { desc: 'Kabut Tebal', icon: '🌫️', iconNight: '🌫️' },
    51: { desc: 'Gerimis Ringan', icon: '🌦️', iconNight: '🌧️' },
    53: { desc: 'Gerimis Sedang', icon: '🌦️', iconNight: '🌧️' },
    55: { desc: 'Gerimis Lebat', icon: '🌧️', iconNight: '🌧️' },
    56: { desc: 'Gerimis Beku Ringan', icon: '🌧️', iconNight: '🌧️' },
    57: { desc: 'Gerimis Beku Lebat', icon: '🌧️', iconNight: '🌧️' },
    61: { desc: 'Hujan Ringan', icon: '🌦️', iconNight: '🌧️' },
    63: { desc: 'Hujan Sedang', icon: '🌧️', iconNight: '🌧️' },
    65: { desc: 'Hujan Lebat', icon: '🌧️', iconNight: '🌧️' },
    66: { desc: 'Hujan Beku Ringan', icon: '🌧️', iconNight: '🌧️' },
    67: { desc: 'Hujan Beku Lebat', icon: '🌧️', iconNight: '🌧️' },
    71: { desc: 'Salju Ringan', icon: '🌨️', iconNight: '🌨️' },
    73: { desc: 'Salju Sedang', icon: '🌨️', iconNight: '🌨️' },
    75: { desc: 'Salju Lebat', icon: '❄️', iconNight: '❄️' },
    77: { desc: 'Butiran Salju', icon: '❄️', iconNight: '❄️' },
    80: { desc: 'Hujan Ringan Sesaat', icon: '🌦️', iconNight: '🌧️' },
    81: { desc: 'Hujan Sedang Sesaat', icon: '🌧️', iconNight: '🌧️' },
    82: { desc: 'Hujan Lebat Sesaat', icon: '⛈️', iconNight: '⛈️' },
    85: { desc: 'Hujan Salju Ringan', icon: '🌨️', iconNight: '🌨️' },
    86: { desc: 'Hujan Salju Lebat', icon: '🌨️', iconNight: '🌨️' },
    95: { desc: 'Badai Petir', icon: '⛈️', iconNight: '⛈️' },
    96: { desc: 'Badai Petir & Hujan Es Ringan', icon: '⛈️', iconNight: '⛈️' },
    99: { desc: 'Badai Petir & Hujan Es Lebat', icon: '⛈️', iconNight: '⛈️' },
};

// Indonesian day names
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const searchResults = document.getElementById('searchResults');
const loadingOverlay = document.getElementById('loadingOverlay');
const mainContent = document.getElementById('mainContent');

// State
let searchTimeout = null;
let currentLat = null;
let currentLon = null;

// ===========================
// Initialize
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupEventListeners();
    // Load Jakarta as default
    loadWeatherData(-6.2088, 106.8456, 'Jakarta, Indonesia');
});

// ===========================
// Background Particles
// ===========================
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['rgba(79,172,254,0.2)', 'rgba(168,85,247,0.15)', 'rgba(34,211,238,0.15)', 'rgba(244,114,182,0.1)'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(particle);
    }
}

// ===========================
// Event Listeners
// ===========================
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    searchInput.addEventListener('input', handleSearchInput);
    locationBtn.addEventListener('click', handleGeolocation);
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
}

// ===========================
// Search & Geocoding
// ===========================
function handleSearchInput() {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }

    searchTimeout = setTimeout(() => {
        geocodeSearch(query);
    }, 400);
}

async function geocodeSearch(query) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=id&format=json`);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            showSearchResults(data.results);
        } else {
            searchResults.innerHTML = '<div class="search-result-item"><span class="result-name">Kota tidak ditemukan</span></div>';
            searchResults.classList.add('active');
        }
    } catch (err) {
        console.error('Geocoding error:', err);
    }
}

function showSearchResults(results) {
    searchResults.innerHTML = '';
    results.forEach(result => {
        const item = document.createElement('div');
        item.classList.add('search-result-item');
        const admin = result.admin1 ? `, ${result.admin1}` : '';
        item.innerHTML = `
            <span>📍</span>
            <div>
                <div class="result-name">${result.name}${admin}</div>
                <div class="result-country">${result.country || ''} · ${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°</div>
            </div>
        `;
        item.addEventListener('click', () => {
            const locationName = `${result.name}${admin}, ${result.country || ''}`;
            searchInput.value = locationName;
            searchResults.classList.remove('active');
            loadWeatherData(result.latitude, result.longitude, locationName);
        });
        searchResults.appendChild(item);
    });
    searchResults.classList.add('active');
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (query.length < 2) return;
    geocodeSearch(query);
}

function handleGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolokasi tidak didukung oleh browser Anda.');
        return;
    }

    locationBtn.textContent = '⏳';
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            locationBtn.textContent = '📍';
            const { latitude, longitude } = pos.coords;
            searchInput.value = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
            loadWeatherData(latitude, longitude, `Lokasi Anda (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
        },
        (err) => {
            locationBtn.textContent = '📍';
            alert('Tidak dapat mengakses lokasi. Pastikan izin lokasi telah diberikan.');
            console.error(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ===========================
// Fetch Weather Data
// ===========================
async function loadWeatherData(lat, lon, locationName) {
    currentLat = lat;
    currentLon = lon;
    showLoading(true);

    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
            hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,visibility,uv_index,is_day',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
            timezone: 'auto',
            forecast_days: '7',
        });

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();

        renderCurrentWeather(data, locationName);
        renderHourlyForecast(data);
        renderDailyForecast(data);
        renderSunInfo(data);

        // Tampilkan konten terlebih dahulu agar elemen canvas memiliki dimensi lebar/tinggi
        mainContent.style.display = 'block';
        mainContent.offsetHeight; // force reflow

        drawHourlyChart(data);
        drawDailyChart(data);

    } catch (err) {
        console.error('Weather fetch error:', err);
        alert(`Gagal memuat data cuaca (${err.message || 'Error'}). Silakan coba lagi.`);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// ===========================
// Render Current Weather
// ===========================
function renderCurrentWeather(data, locationName) {
    const current = data.current;
    const isDay = current.is_day === 1;
    const wmo = WMO_CODES[current.weather_code] || WMO_CODES[0];

    document.getElementById('cityName').textContent = locationName;
    
    const now = new Date();
    document.getElementById('currentDate').textContent = 
        `${HARI[now.getDay()]}, ${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()} · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    document.getElementById('currentTemp').textContent = Math.round(current.temperature_2m);
    document.getElementById('weatherDesc').textContent = wmo.desc;
    document.getElementById('weatherIconLarge').textContent = isDay ? wmo.icon : wmo.iconNight;

    document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById('pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;

    // Find current hour UV index
    const currentHourIndex = findCurrentHourIndex(data.hourly.time);
    const uvVal = data.hourly.uv_index[currentHourIndex] ?? '--';
    document.getElementById('uvIndex').textContent = typeof uvVal === 'number' ? uvVal.toFixed(1) : uvVal;

    const visVal = data.hourly.visibility[currentHourIndex];
    document.getElementById('visibility').textContent = visVal ? `${(visVal / 1000).toFixed(1)} km` : '--';
}

function findCurrentHourIndex(times) {
    const now = new Date();
    const nowISO = now.toISOString().slice(0, 13);
    for (let i = 0; i < times.length; i++) {
        if (times[i].slice(0, 13) >= nowISO) return i;
    }
    return 0;
}

// ===========================
// Render Hourly Forecast
// ===========================
function renderHourlyForecast(data) {
    const container = document.getElementById('hourlyForecast');
    container.innerHTML = '';

    const startIdx = findCurrentHourIndex(data.hourly.time);
    const hours = Math.min(24, data.hourly.time.length - startIdx);

    for (let i = 0; i < hours; i++) {
        const idx = startIdx + i;
        const time = new Date(data.hourly.time[idx]);
        const isDay = data.hourly.is_day[idx] === 1;
        const wmo = WMO_CODES[data.hourly.weather_code[idx]] || WMO_CODES[0];
        const temp = Math.round(data.hourly.temperature_2m[idx]);
        const precip = data.hourly.precipitation_probability[idx];

        const card = document.createElement('div');
        card.classList.add('hourly-card');
        if (i === 0) card.classList.add('current');

        card.innerHTML = `
            <span class="hourly-time">${i === 0 ? 'Saat ini' : `${time.getHours().toString().padStart(2, '0')}:00`}</span>
            <span class="hourly-icon">${isDay ? wmo.icon : wmo.iconNight}</span>
            <span class="hourly-temp">${temp}°</span>
            ${precip > 0 ? `<span class="hourly-precip">💧${precip}%</span>` : ''}
        `;
        container.appendChild(card);
    }
}

// ===========================
// Render Daily Forecast
// ===========================
function renderDailyForecast(data) {
    const container = document.getElementById('dailyForecast');
    container.innerHTML = '';

    const daily = data.daily;
    const allTemps = [...daily.temperature_2m_min, ...daily.temperature_2m_max];
    const globalMin = Math.min(...allTemps);
    const globalMax = Math.max(...allTemps);
    const range = globalMax - globalMin || 1;

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const wmo = WMO_CODES[daily.weather_code[i]] || WMO_CODES[0];
        const min = Math.round(daily.temperature_2m_min[i]);
        const max = Math.round(daily.temperature_2m_max[i]);
        const precip = daily.precipitation_probability_max[i];

        const barLeft = ((daily.temperature_2m_min[i] - globalMin) / range) * 100;
        const barWidth = ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / range) * 100;

        const dayName = i === 0 ? 'Hari Ini' : HARI[date.getDay()];

        const card = document.createElement('div');
        card.classList.add('daily-card');
        card.innerHTML = `
            <span class="daily-day">${dayName}</span>
            <span class="daily-icon">${wmo.icon}</span>
            <div class="daily-temp-bar">
                <span class="daily-temp-min">${min}°</span>
                <div class="daily-bar-container">
                    <div class="daily-bar-fill" style="left: ${barLeft}%; width: ${Math.max(barWidth, 5)}%;"></div>
                </div>
                <span class="daily-temp-max">${max}°</span>
            </div>
            <span class="daily-precip">${precip > 0 ? `💧${precip}%` : ''}</span>
        `;
        container.appendChild(card);
    }
}

// ===========================
// Render Sun Info
// ===========================
function renderSunInfo(data) {
    const daily = data.daily;
    const sunrise = new Date(daily.sunrise[0]);
    const sunset = new Date(daily.sunset[0]);

    document.getElementById('sunrise').textContent = 
        `${sunrise.getHours().toString().padStart(2, '0')}:${sunrise.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('sunset').textContent = 
        `${sunset.getHours().toString().padStart(2, '0')}:${sunset.getMinutes().toString().padStart(2, '0')}`;

    // Daylight duration
    const daylightMs = sunset - sunrise;
    const daylightHours = Math.floor(daylightMs / 3600000);
    const daylightMins = Math.floor((daylightMs % 3600000) / 60000);
    document.getElementById('daylightDuration').textContent = `${daylightHours} jam ${daylightMins} menit`;

    // Animate sun position
    const now = new Date();
    const sunArc = document.getElementById('sunArc');
    const sunDot = document.getElementById('sunDot');

    if (now >= sunrise && now <= sunset) {
        const progress = (now - sunrise) / (sunset - sunrise);
        const angle = Math.PI * (1 - progress);
        const arcWidth = sunArc.offsetWidth / 2;
        const arcHeight = sunArc.offsetHeight;
        
        const x = arcWidth + arcWidth * Math.cos(angle) - 12;
        const y = arcHeight - arcHeight * Math.sin(angle) - 12;
        
        sunDot.style.left = `${x}px`;
        sunDot.style.top = `${y}px`;
        sunDot.style.opacity = '1';
    } else {
        sunDot.style.opacity = '0.2';
        sunDot.style.left = 'calc(50% - 12px)';
        sunDot.style.top = '-12px';
    }
}

// ===========================
// Canvas Charts (No Library)
// ===========================
function drawHourlyChart(data) {
    const canvas = document.getElementById('hourlyChart');
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 20, bottom: 40, left: 45 };

    const startIdx = findCurrentHourIndex(data.hourly.time);
    const count = Math.min(24, data.hourly.time.length - startIdx);
    const temps = [];
    const labels = [];

    for (let i = 0; i < count; i++) {
        temps.push(data.hourly.temperature_2m[startIdx + i]);
        const t = new Date(data.hourly.time[startIdx + i]);
        labels.push(`${t.getHours().toString().padStart(2, '0')}:00`);
    }

    const minTemp = Math.min(...temps) - 1;
    const maxTemp = Math.max(...temps) + 1;
    const tempRange = maxTemp - minTemp || 1;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        const tempVal = maxTemp - (tempRange / 4) * i;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(tempVal)}°`, padding.left - 8, y + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Inter';
    const step = Math.max(1, Math.floor(count / 8));
    for (let i = 0; i < count; i += step) {
        const x = padding.left + (chartW / (count - 1)) * i;
        ctx.fillText(labels[i], x, height - 10);
    }

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(79,172,254,0.3)');
    gradient.addColorStop(1, 'rgba(79,172,254,0.02)');

    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((temps[i] - minTemp) / tempRange) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((temps[i] - minTemp) / tempRange) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw dots
    for (let i = 0; i < count; i += Math.max(1, Math.floor(count / 12))) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((temps[i] - minTemp) / tempRange) * chartH;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4facfe';
        ctx.fill();
        ctx.strokeStyle = '#0a0e27';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Temperature label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(temps[i])}°`, x, y - 10);
    }
}

function drawDailyChart(data) {
    const canvas = document.getElementById('dailyChart');
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 20, bottom: 40, left: 45 };

    const daily = data.daily;
    const count = daily.time.length;
    const maxTemps = daily.temperature_2m_max;
    const minTemps = daily.temperature_2m_min;

    const allTemps = [...maxTemps, ...minTemps];
    const globalMin = Math.min(...allTemps) - 1;
    const globalMax = Math.max(...allTemps) + 1;
    const tempRange = globalMax - globalMin || 1;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const tempVal = globalMax - (tempRange / 4) * i;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(tempVal)}°`, padding.left - 8, y + 4);
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Inter';
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const d = new Date(daily.time[i]);
        const label = i === 0 ? 'Hari ini' : HARI[d.getDay()].slice(0, 3);
        ctx.fillText(label, x, height - 10);
    }

    // Fill between max and min
    const gradientFill = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradientFill.addColorStop(0, 'rgba(168,85,247,0.2)');
    gradientFill.addColorStop(1, 'rgba(79,172,254,0.05)');

    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((maxTemps[i] - globalMin) / tempRange) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    for (let i = count - 1; i >= 0; i--) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((minTemps[i] - globalMin) / tempRange) * chartH;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = gradientFill;
    ctx.fill();

    // Max line
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((maxTemps[i] - globalMin) / tempRange) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Min line
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const y = padding.top + chartH - ((minTemps[i] - globalMin) / tempRange) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots and labels for max
    for (let i = 0; i < count; i++) {
        const x = padding.left + (chartW / (count - 1)) * i;
        const yMax = padding.top + chartH - ((maxTemps[i] - globalMin) / tempRange) * chartH;
        const yMin = padding.top + chartH - ((minTemps[i] - globalMin) / tempRange) * chartH;

        // Max dot
        ctx.beginPath();
        ctx.arc(x, yMax, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();
        ctx.strokeStyle = '#0a0e27';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(maxTemps[i])}°`, x, yMax - 10);

        // Min dot
        ctx.beginPath();
        ctx.arc(x, yMin, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4facfe';
        ctx.fill();
        ctx.strokeStyle = '#0a0e27';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 10px Inter';
        ctx.fillText(`${Math.round(minTemps[i])}°`, x, yMin + 18);
    }

    // Legend
    ctx.font = '11px Inter';
    ctx.fillStyle = '#f472b6';
    ctx.fillText('● Maks', width - 90, 16);
    ctx.fillStyle = '#4facfe';
    ctx.fillText('● Min', width - 35, 16);
}

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentLat !== null) {
            // Redraw charts on resize
            loadWeatherData(currentLat, currentLon, document.getElementById('cityName').textContent);
        }
    }, 300);
});
