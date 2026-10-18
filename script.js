/* =========================================================
   CuacaKu — Modern Interactive Weather App
   Data: Open-Meteo (cuaca & geocoding), BigDataCloud (reverse geocoding),
         OpenStreetMap + CARTO (peta)
   ========================================================= */
'use strict';

/* ---------- Konstanta ---------- */
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const WMO = {
    0: 'Cerah', 1: 'Cerah berawan', 2: 'Berawan sebagian', 3: 'Mendung',
    45: 'Berkabut', 48: 'Kabut beku',
    51: 'Gerimis ringan', 53: 'Gerimis', 55: 'Gerimis lebat', 56: 'Gerimis beku ringan', 57: 'Gerimis beku lebat',
    61: 'Hujan ringan', 63: 'Hujan sedang', 65: 'Hujan lebat', 66: 'Hujan beku ringan', 67: 'Hujan beku lebat',
    71: 'Salju ringan', 73: 'Salju sedang', 75: 'Salju lebat', 77: 'Butiran salju',
    80: 'Hujan lokal ringan', 81: 'Hujan lokal sedang', 82: 'Hujan lokal lebat',
    85: 'Hujan salju ringan', 86: 'Hujan salju lebat',
    95: 'Badai petir', 96: 'Badai petir & hujan es', 99: 'Badai petir & hujan es lebat',
};

const CITIES = [
    { label: 'Jakarta', name: 'Jakarta, Indonesia', lat: -6.2088, lon: 106.8456 },
    { label: 'Bandung', name: 'Bandung, Indonesia', lat: -6.9175, lon: 107.6191 },
    { label: 'Surabaya', name: 'Surabaya, Indonesia', lat: -7.2575, lon: 112.7521 },
    { label: 'Yogyakarta', name: 'Yogyakarta, Indonesia', lat: -7.7956, lon: 110.3695 },
    { label: 'Medan', name: 'Medan, Indonesia', lat: 3.5952, lon: 98.6722 },
    { label: 'Denpasar', name: 'Denpasar, Indonesia', lat: -8.6705, lon: 115.2126 },
    { label: 'Makassar', name: 'Makassar, Indonesia', lat: -5.1477, lon: 119.4327 },
    { label: 'Balikpapan', name: 'Balikpapan, Indonesia', lat: -1.2379, lon: 116.8529 },
    { label: 'Jayapura', name: 'Jayapura, Indonesia', lat: -2.5337, lon: 140.7181 },
    { label: 'Singapura', name: 'Singapura', lat: 1.3521, lon: 103.8198 },
    { label: 'Tokyo', name: 'Tokyo, Jepang', lat: 35.6762, lon: 139.6503 },
    { label: 'London', name: 'London, Inggris', lat: 51.5074, lon: -0.1278 },
    { label: 'New York', name: 'New York, Amerika Serikat', lat: 40.7128, lon: -74.006 },
];
const DEFAULT_LOC = CITIES[0];

const STEPS = [
    {
        icon: 'satellite', short: 'Observasi', title: 'Mengumpulkan Data Observasi',
        text: 'Setiap hari jutaan pengukuran dikumpulkan dari stasiun cuaca darat, kapal, pelampung laut, pesawat, balon radiosonde, radar, dan satelit. Data suhu, tekanan, kelembapan, dan angin ini menjadi “potret awal” kondisi atmosfer. Untuk wilayah Indonesia, satelit Himawari dan radar BMKG memegang peran penting.',
        facts: ['Ribuan stasiun darat', 'Radiosonde 2× sehari', 'Satelit Himawari tiap 10 menit'],
    },
    {
        icon: 'layers', short: 'Asimilasi', title: 'Asimilasi Data',
        text: 'Data observasi tersebar tidak merata — padat di daratan, jarang di lautan. Melalui asimilasi data, observasi digabungkan dengan prakiraan sebelumnya untuk membentuk kondisi awal atmosfer tiga dimensi yang paling mungkin di setiap titik grid model.',
        facts: ['Grid 3D global', 'Siklus tiap 6–12 jam', 'Metode 4D-Var / EnKF'],
    },
    {
        icon: 'cpu', short: 'Model NWP', title: 'Model Numerik (NWP)',
        text: 'Superkomputer menyelesaikan persamaan fisika fluida dan termodinamika untuk “memajukan” kondisi atmosfer langkah demi langkah ke masa depan. Model global seperti ECMWF IFS, NOAA GFS, dan DWD ICON menghitung jutaan titik grid dengan resolusi sekitar 9–25 km.',
        facts: ['Resolusi ±9–25 km', 'Hingga 137 lapisan vertikal', 'Langkah waktu beberapa menit'],
    },
    {
        icon: 'phone', short: 'Ensemble & Hasil', title: 'Ensemble, Koreksi & Penyajian',
        text: 'Model dijalankan berkali-kali dengan kondisi awal yang sedikit berbeda (ensemble) untuk mengukur ketidakpastian. Hasilnya dikoreksi secara statistik, lalu disajikan sebagai angka, ikon, dan grafik — seperti yang Anda lihat di halaman ini melalui API Open-Meteo.',
        facts: ['ECMWF: 51 anggota ensemble', 'Koreksi statistik (MOS)', 'Disajikan via Open-Meteo API'],
    },
];

const RELIABILITY = [96, 93, 89, 84, 78, 72, 66];

const API_CURRENT = 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
const API_HOURLY = 'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day';
const API_DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant';

/* ---------- Ikon UI (SVG garis) ---------- */
const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    locate: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    droplet: '<path d="M12 2.7s6 6.4 6 11.3a6 6 0 0 1-12 0c0-4.9 6-11.3 6-11.3z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    umbrella: '<path d="M22 12a10 10 0 0 0-20 0z"/><path d="M12 12v7a2 2 0 0 0 4 0M12 2v1"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    sunrise: '<path d="M12 2v6M8.5 5.5 12 2l3.5 3.5M4.2 10.2l1.4 1.4M2 18h2M20 18h2M18.4 11.6l1.4-1.4M22 22H2M16 18a4 4 0 0 0-8 0"/>',
    thermometer: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    satellite: '<path d="m13 7-4-4-4 4 4 4M17 11l4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4z"/><path d="M9 21a6 6 0 0 0-6-6M13 21A10 10 0 0 0 3 11"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
};
const ic = (name) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- Ikon cuaca animasi (SVG) ---------- */
const CLOUD_D = 'M18 46h28a10 10 0 0 0 0-20 14 14 0 0 0-27-3A10 10 0 0 0 18 46z';
const MOON = '<path class="w-moon" d="M40 14a18 18 0 1 0 12 30a14 14 0 0 1-12-30z" fill="#e2e8f0"/>';
const STARS = '<g fill="#fff"><circle class="w-star" cx="14" cy="16" r="1.6"/><circle class="w-star" cx="56" cy="12" r="1.3"/><circle class="w-star" cx="11" cy="44" r="1.2"/></g>';

function sunG(cx, cy, r) {
    let rays = '';
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        rays += `<line x1="${(cx + Math.cos(a) * (r + 5)).toFixed(1)}" y1="${(cy + Math.sin(a) * (r + 5)).toFixed(1)}" x2="${(cx + Math.cos(a) * (r + 10)).toFixed(1)}" y2="${(cy + Math.sin(a) * (r + 10)).toFixed(1)}"/>`;
    }
    return `<g class="w-rays" stroke="#fcd34d" stroke-width="3" stroke-linecap="round">${rays}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbbf24"/>`;
}
const cloud = (tf, fill, cls = '') => `<g transform="${tf}"><path class="w-cloud ${cls}" d="${CLOUD_D}" fill="${fill}"/></g>`;
const DROPS = '<g stroke="#60a5fa" stroke-width="3" stroke-linecap="round"><line class="w-drop" x1="24" y1="46" x2="22" y2="52"/><line class="w-drop" x1="33" y1="48" x2="31" y2="54"/><line class="w-drop" x1="42" y1="46" x2="40" y2="52"/></g>';
const FLAKES = '<g fill="#fff"><circle class="w-flake" cx="24" cy="48" r="2.5"/><circle class="w-flake" cx="33" cy="52" r="2.5"/><circle class="w-flake" cx="42" cy="48" r="2.5"/></g>';

function kind(code) {
    if (code >= 95) return 'storm';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code === 45 || code === 48) return 'fog';
    if (code === 3) return 'overcast';
    if (code === 1 || code === 2) return 'partly';
    return 'clear';
}

function wIcon(code, isDay = true) {
    let s;
    switch (kind(code)) {
        case 'clear':
            s = isDay ? sunG(32, 32, 12) : STARS + MOON; break;
        case 'partly':
            s = (isDay ? `<g transform="translate(-6 -6)">${sunG(28, 28, 9)}</g>` : `<g transform="translate(-8 -6) scale(.8)">${MOON}</g>`)
                + cloud('translate(4 6)', '#f1f5f9'); break;
        case 'overcast':
            s = cloud('translate(-8 -8) scale(.95)', '#94a3b8', 'back') + cloud('translate(4 4)', '#e2e8f0'); break;
        case 'fog':
            s = cloud('translate(0 -8)', '#cbd5e1')
                + '<g class="w-fog" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" opacity=".85"><line x1="12" y1="46" x2="42" y2="46"/><line x1="20" y1="53" x2="52" y2="53"/></g>'; break;
        case 'rain':
            s = cloud('translate(0 -6)', '#cbd5e1') + DROPS; break;
        case 'snow':
            s = cloud('translate(0 -6)', '#e2e8f0') + FLAKES; break;
        case 'storm':
            s = cloud('translate(0 -8)', '#64748b') + '<polygon class="w-bolt" points="34,36 25,50 31,50 27,61 40,45 34,45 38,36" fill="#facc15"/>'; break;
    }
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${s}</svg>`;
}

function themeFor(code, isDay) {
    const k = kind(code);
    if (k === 'storm' || k === 'snow' || k === 'rain') return k;
    if (k === 'fog' || k === 'overcast') return 'cloudy';
    return isDay ? 'day' : 'night';
}

/* ---------- Utilitas ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v, d = 1) => (v == null || isNaN(v)) ? '--' : Number(v).toLocaleString('id-ID', { maximumFractionDigits: d });
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Waktu dari API berupa waktu lokal lokasi tanpa offset → diperlakukan sebagai "UTC" agar konsisten
const tms = (s) => s.length === 10 ? Date.parse(s) : Date.parse(s + ':00Z');
const hm = (ms) => { const d = new Date(ms); return `${pad2(d.getUTCHours())}.${pad2(d.getUTCMinutes())}`; };
const nowLoc = () => Date.now() + ((state.data && state.data.utc_offset_seconds) || 0) * 1000;
const DIRS = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
const DIRS_S = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
const dirIdx = (deg) => Math.round((((deg % 360) + 360) % 360) / 45) % 8;
const durTxt = (ms) => { const h = Math.floor(ms / 3.6e6), m = Math.round((ms % 3.6e6) / 6e4); return h ? `${h} jam ${m} menit` : `${m} menit`; };

const storage = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* abaikan */ } },
};

/* ---------- State ---------- */
const state = {
    loc: null, data: null, hT: [], cur: 0,
    unit: storage.get('cuacaku:unit') === 'f' ? 'f' : 'c',
    metric: 'temp', day: 0, hour: null, hover: null, range: [],
    animP: 1, chartRaf: 0, geo: null, reqId: 0, fetchedAt: 0,
    map: null, marker: null, step: 0, stepTimer: null, windDeg: null,
};

const conv = (c) => state.unit === 'f' ? c * 9 / 5 + 32 : c;
const T = (c) => (c == null || isNaN(c)) ? '--' : Math.round(conv(c)) + '°';

const els = {};
function cacheEls() {
    ['fxCanvas', 'searchInput', 'searchResults', 'locationBtn', 'unitToggle', 'chips', 'hero', 'updatedAt', 'cityName', 'localTime',
        'currentTemp', 'tempUnit', 'weatherDesc', 'feelsLike', 'todayMax', 'todayMin', 'heroIcon', 'heroSummary',
        'humidityRing', 'humidity', 'dewPoint', 'humidityNote', 'windArrow', 'windSpeed', 'windNote',
        'uvIndex', 'uvMarker', 'uvNote', 'rainProb', 'rainBar', 'rainNote', 'pressure', 'pressureMarker', 'pressureNote',
        'visibility', 'visBar', 'visibilityNote', 'sunProgress', 'sunDot', 'sunrise', 'sunset', 'daylight', 'sunNote',
        'dailyList', 'dayDetail', 'chartTabs', 'chartSubtitle', 'mainChart', 'chartTooltip', 'hourlyStrip', 'mapSection',
        'steps', 'stepPanel', 'uncLead', 'uncDay', 'uncForecast', 'uncRange', 'uncAcc', 'uncTrack', 'uncBand', 'uncMarker',
        'uncLo', 'uncHi', 'uncSlider', 'uncNote', 'toast',
    ].forEach((id) => { els[id] = document.getElementById(id); });
}

async function fetchJSON(url, timeout = 15000) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeout);
    try {
        const r = await fetch(url, { signal: ctl.signal });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
    } finally {
        clearTimeout(t);
    }
}

/* =========================================================
   Pengambilan data
   ========================================================= */
async function loadWeather(loc, { silent = false } = {}) {
    const id = ++state.reqId;
    document.body.classList.add('is-fetching');
    try {
        const params = new URLSearchParams({
            latitude: loc.lat.toFixed(4), longitude: loc.lon.toFixed(4),
            current: API_CURRENT, hourly: API_HOURLY, daily: API_DAILY,
            timezone: 'auto', forecast_days: '7',
        });
        const data = await fetchJSON(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (id !== state.reqId) return;
        if (data.error) throw new Error(data.reason || 'API error');

        state.loc = loc;
        state.data = data;
        state.hT = data.hourly.time.map(tms);
        state.fetchedAt = Date.now();
        if (!silent) { state.day = 0; state.hour = null; }
        storage.set('cuacaku:loc', loc);

        renderAll(!silent);
        const n = new Date();
        els.updatedAt.textContent = `${pad2(n.getHours())}.${pad2(n.getMinutes())}`;
        document.body.classList.remove('is-loading');
        hideToast();
    } catch (err) {
        if (id !== state.reqId) return;
        console.error('Gagal memuat cuaca:', err);
        if (!silent) showToast('Gagal memuat data cuaca. Periksa koneksi internet Anda.', () => loadWeather(loc));
    } finally {
        if (id === state.reqId) document.body.classList.remove('is-fetching');
    }
}

async function reverseName(lat, lon) {
    try {
        const j = await fetchJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`, 6000);
        const place = j.city || j.locality || j.principalSubdivision;
        if (place) return j.countryName ? `${place}, ${j.countryName}` : place;
    } catch { /* gunakan koordinat */ }
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

/* =========================================================
   Render
   ========================================================= */
function computeCur() {
    const n = nowLoc();
    let i = 0;
    for (let k = 0; k < state.hT.length; k++) {
        if (state.hT[k] <= n) i = k; else break;
    }
    state.cur = clamp(i, 0, Math.max(0, state.hT.length - 24));
}

function renderAll(animate) {
    computeCur();
    const c = state.data.current;
    setTheme(themeFor(c.weather_code, c.is_day === 1));
    renderHero(animate);
    renderStats();
    renderSun();
    renderChips();
    renderDays();
    renderDayDetail(false);
    buildRange();
    renderStrip();
    animateChart();
    updateUnc();
    updateMap();
    document.title = `${Math.round(conv(c.temperature_2m))}° ${state.loc.name.split(',')[0]} — CuacaKu`;
}

function animateNum(el, to, animate) {
    const from = parseFloat(el.dataset.v);
    el.dataset.v = to;
    if (!animate || REDUCED) { el.textContent = to; return; }
    const start = isNaN(from) ? to - 10 : from;
    const t0 = performance.now();
    const step = (t) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = Math.round(start + (to - start) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function tzLabel() {
    const a = state.data.timezone_abbreviation || '';
    return /^[+-]/.test(a) ? 'GMT' + a : a;
}

function updateClock() {
    const n = new Date(nowLoc());
    els.localTime.textContent = `${HARI[n.getUTCDay()]}, ${n.getUTCDate()} ${BULAN[n.getUTCMonth()]} ${n.getUTCFullYear()} · ${hm(nowLoc())} ${tzLabel()}`;
}

function renderHero(animate) {
    const d = state.data, c = d.current, dl = d.daily, h = d.hourly;
    els.cityName.textContent = state.loc.name;
    updateClock();
    animateNum(els.currentTemp, Math.round(conv(c.temperature_2m)), animate);
    els.tempUnit.textContent = state.unit === 'f' ? '°F' : '°C';
    els.weatherDesc.textContent = WMO[c.weather_code] || 'Tidak diketahui';
    els.feelsLike.textContent = T(c.apparent_temperature);
    els.todayMax.textContent = T(dl.temperature_2m_max[0]);
    els.todayMin.textContent = T(dl.temperature_2m_min[0]);

    const key = `${c.weather_code}-${c.is_day}`;
    if (els.heroIcon.dataset.k !== key) {
        els.heroIcon.innerHTML = wIcon(c.weather_code, c.is_day === 1);
        els.heroIcon.dataset.k = key;
    }

    // Ringkasan 24 jam ke depan
    let best = state.cur;
    for (let i = state.cur; i < Math.min(state.cur + 24, state.hT.length); i++) {
        if ((h.precipitation_probability[i] || 0) > (h.precipitation_probability[best] || 0)) best = i;
    }
    const bp = h.precipitation_probability[best] || 0;
    let s = `${WMO[c.weather_code] || 'Kondisi'} saat ini dengan kelembapan ${c.relative_humidity_2m}%. `;
    s += bp >= 30
        ? `Peluang hujan tertinggi ${bp}% sekitar pukul ${pad2(new Date(state.hT[best]).getUTCHours())}.00.`
        : 'Kecil kemungkinan hujan dalam 24 jam ke depan.';
    if (dl.temperature_2m_max[0] >= 33) s += ' Siang hari akan terasa panas — tetap terhidrasi.';
    els.heroSummary.textContent = s;
}

function uvLabel(uv) {
    return uv < 3 ? 'Rendah' : uv < 6 ? 'Sedang' : uv < 8 ? 'Tinggi' : uv < 11 ? 'Sangat tinggi' : 'Ekstrem';
}

function renderStats() {
    const d = state.data, c = d.current, h = d.hourly, dl = d.daily, i = state.cur;

    // Kelembapan
    const hum = c.relative_humidity_2m;
    els.humidity.textContent = hum + '%';
    els.humidityRing.style.setProperty('--p', hum);
    els.dewPoint.textContent = T(h.dew_point_2m[i]);
    els.humidityNote.textContent = hum < 30 ? 'Udara kering' : hum < 60 ? 'Kelembapan nyaman' : hum < 80 ? 'Cukup lembap' : 'Sangat lembap — terasa gerah';

    // Angin (panah menunjuk arah tiupan angin)
    const target = c.wind_direction_10m + 180;
    const prev = state.windDeg == null ? target : state.windDeg;
    state.windDeg = prev + ((((target - prev) % 360) + 540) % 360 - 180);
    els.windArrow.style.setProperty('--deg', state.windDeg + 'deg');
    const ws = c.wind_speed_10m;
    els.windSpeed.textContent = Math.round(ws);
    const bf = ws < 2 ? 'Tenang' : ws < 12 ? 'Sepoi-sepoi' : ws < 29 ? 'Sedang' : ws < 50 ? 'Kencang' : 'Sangat kencang';
    els.windNote.textContent = `${bf} dari ${DIRS[dirIdx(c.wind_direction_10m)]} · hembusan ${Math.round(c.wind_gusts_10m)} km/j`;

    // UV
    const uv = h.uv_index[i] || 0;
    els.uvIndex.textContent = num(uv);
    els.uvMarker.style.left = clamp(uv / 11, 0, 1) * 100 + '%';
    els.uvNote.textContent = `${uvLabel(uv)} · puncak hari ini ${num(dl.uv_index_max[0])}`;

    // Hujan
    const rp = h.precipitation_probability[i] || 0;
    els.rainProb.textContent = rp;
    els.rainBar.style.width = rp + '%';
    els.rainNote.textContent = `Total curah hujan hari ini ${num(dl.precipitation_sum[0])} mm`;

    // Tekanan
    const p = c.pressure_msl;
    els.pressure.textContent = Math.round(p);
    els.pressureMarker.style.left = clamp((p - 980) / 60, 0, 1) * 100 + '%';
    const ref = i >= 3 ? h.pressure_msl[i - 3] : null;
    const diff = ref == null ? 0 : h.pressure_msl[i] - ref;
    const trend = ref == null ? '' : diff > 1 ? ' · naik' : diff < -1 ? ' · turun' : ' · stabil';
    els.pressureNote.textContent = (p < 1000 ? 'Rendah — cenderung berawan/hujan' : p > 1020 ? 'Tinggi — cenderung cerah' : 'Normal') + trend;

    // Jarak pandang
    const vis = h.visibility[i];
    if (vis == null) {
        els.visibility.textContent = '--';
        els.visBar.style.width = '0%';
        els.visibilityNote.textContent = 'Data tidak tersedia';
    } else {
        const km = vis / 1000;
        els.visibility.textContent = num(km, km < 10 ? 1 : 0);
        els.visBar.style.width = clamp(km / 20, 0, 1) * 100 + '%';
        els.visibilityNote.textContent = km >= 10 ? 'Sangat jelas' : km >= 5 ? 'Baik' : km >= 2 ? 'Sedang — ada kabut/hujan' : 'Buruk — berhati-hatilah';
    }
}

function renderSun() {
    const dl = state.data.daily;
    const sr = tms(dl.sunrise[0]), ss = tms(dl.sunset[0]), n = nowLoc();
    els.sunrise.textContent = hm(sr);
    els.sunset.textContent = hm(ss);
    const dur = dl.daylight_duration ? dl.daylight_duration[0] : (ss - sr) / 1000;
    els.daylight.textContent = `${Math.floor(dur / 3600)}j ${Math.round((dur % 3600) / 60)}m`;

    const p = clamp((n - sr) / (ss - sr), 0, 1);
    const up = n >= sr && n <= ss;
    const a = Math.PI * (1 - p);
    const cx = 100 + 80 * Math.cos(a), cy = 95 - 80 * Math.sin(a);
    els.sunDot.setAttribute('cx', cx.toFixed(1));
    els.sunDot.setAttribute('cy', cy.toFixed(1));
    els.sunDot.style.cx = cx.toFixed(1) + 'px';
    els.sunDot.style.cy = cy.toFixed(1) + 'px';
    els.sunDot.classList.toggle('down', !up);
    els.sunProgress.style.strokeDashoffset = (252 * (1 - p)).toFixed(1);

    if (n < sr) els.sunNote.textContent = `Matahari terbit dalam ${durTxt(sr - n)}`;
    else if (up) els.sunNote.textContent = `Matahari terbenam dalam ${durTxt(ss - n)}`;
    else els.sunNote.textContent = dl.sunrise[1] ? `Matahari terbit besok pukul ${hm(tms(dl.sunrise[1]))}` : 'Matahari telah terbenam';
}

function renderChips() {
    els.chips.innerHTML = CITIES.map((c, i) =>
        `<button class="chip${state.loc && state.loc.name === c.name ? ' active' : ''}" data-i="${i}">${c.label}</button>`).join('');
}

function dayName(d, dt) {
    return d === 0 ? 'Hari ini' : d === 1 ? 'Besok' : HARI[dt.getUTCDay()];
}

function renderDays() {
    const dl = state.data.daily;
    els.dailyList.innerHTML = dl.time.map((t, d) => {
        const dt = new Date(tms(t));
        const p = dl.precipitation_probability_max[d] || 0;
        return `<button class="day${d === state.day ? ' selected' : ''}" style="--i:${d}" data-day="${d}" aria-pressed="${d === state.day}">
            <span class="day-name">${dayName(d, dt)}</span>
            <span class="day-date">${dt.getUTCDate()} ${BULAN_S[dt.getUTCMonth()]}</span>
            <span class="day-icon">${wIcon(dl.weather_code[d], true)}</span>
            <span class="day-temp"><b>${T(dl.temperature_2m_max[d])}</b><span>${T(dl.temperature_2m_min[d])}</span></span>
            <span class="day-rain"><span class="bar"><i data-w="${p}"></i></span><small>${p}%</small></span>
        </button>`;
    }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        $$('.day-rain i', els.dailyList).forEach((el) => { el.style.width = el.dataset.w + '%'; });
    }));
}

function renderDayDetail(swap) {
    const dl = state.data.daily, d = state.day;
    const dt = new Date(tms(dl.time[d]));
    const code = dl.weather_code[d];
    const max = dl.temperature_2m_max[d], min = dl.temperature_2m_min[d];
    const p = dl.precipitation_probability_max[d] || 0;
    const sum = dl.precipitation_sum[d] || 0;
    const wind = dl.wind_speed_10m_max[d], gust = dl.wind_gusts_10m_max[d];
    const uv = dl.uv_index_max[d] || 0;

    const tips = [];
    if (kind(code) === 'storm') tips.push(['zap', 'Waspada petir — hindari area terbuka']);
    if (p >= 60) tips.push(['umbrella', 'Bawa payung atau jas hujan']);
    else if (p >= 30) tips.push(['umbrella', 'Siapkan payung untuk berjaga-jaga']);
    if (uv >= 8) tips.push(['sun', 'UV sangat tinggi — pakai tabir surya & topi']);
    else if (uv >= 6) tips.push(['sun', 'Gunakan tabir surya saat siang']);
    if (max >= 33) tips.push(['thermometer', 'Cuaca panas — perbanyak minum air']);
    if (min <= 15) tips.push(['thermometer', 'Udara dingin — siapkan jaket']);
    if (gust >= 40) tips.push(['wind', 'Angin kencang — amankan benda ringan']);
    if (!tips.length) tips.push(['check', 'Cuaca bersahabat untuk aktivitas luar ruangan']);

    const items = [
        ['thermometer', 'Maks / Min', `${T(max)} / ${T(min)}`],
        ['umbrella', 'Peluang hujan', `${p}%`],
        ['droplet', 'Curah hujan', `${num(sum)} mm`],
        ['wind', 'Angin maks', `${Math.round(wind)} km/j ${DIRS_S[dirIdx(dl.wind_direction_10m_dominant[d])]}`],
        ['sun', 'UV maks', `${num(uv)} · ${uvLabel(uv)}`],
        ['sunrise', 'Terbit · Terbenam', `${hm(tms(dl.sunrise[d]))} · ${hm(tms(dl.sunset[d]))}`],
    ];

    els.dayDetail.innerHTML = `
        <div class="dd-head">
            <div class="dd-icon anim">${wIcon(code, true)}</div>
            <div>
                <h3>${dayName(d, dt)}, ${dt.getUTCDate()} ${BULAN[dt.getUTCMonth()]}</h3>
                <p>${WMO[code] || ''} · terasa hingga ${T(dl.apparent_temperature_max[d])}</p>
            </div>
        </div>
        <div class="dd-grid">${items.map(([i, l, v]) => `<div class="dd-item">${ic(i)}<span>${l}</span><b>${v}</b></div>`).join('')}</div>
        <ul class="dd-tips">${tips.map(([i, t]) => `<li>${ic(i)}${t}</li>`).join('')}</ul>`;

    if (swap) {
        els.dayDetail.classList.remove('swap');
        void els.dayDetail.offsetWidth;
        els.dayDetail.classList.add('swap');
    }
}

function selectDay(d) {
    if (!state.data || d === state.day) return;
    state.day = d;
    state.hour = null;
    state.hover = null;
    $$('.day', els.dailyList).forEach((el, j) => {
        el.classList.toggle('selected', j === d);
        el.setAttribute('aria-pressed', j === d);
    });
    renderDayDetail(true);
    buildRange();
    renderStrip();
    animateChart();
    showTip(null);
}

/* ---------- Rentang jam untuk grafik & strip ---------- */
function buildRange() {
    const start = state.day === 0 ? state.cur : state.day * 24;
    const len = Math.max(0, Math.min(24, state.hT.length - start));
    state.range = Array.from({ length: len }, (_, k) => start + k);
    if (state.day === 0) {
        els.chartSubtitle.textContent = `24 jam ke depan · mulai pukul ${hm(state.hT[start])}`;
    } else {
        const dt = new Date(tms(state.data.daily.time[state.day]));
        els.chartSubtitle.textContent = `Per jam · ${HARI[dt.getUTCDay()]}, ${dt.getUTCDate()} ${BULAN[dt.getUTCMonth()]}`;
    }
}

function hourLabel(k) {
    if (state.day === 0 && k === 0) return 'Kini';
    return `${pad2(new Date(state.hT[state.range[k]]).getUTCHours())}.00`;
}

function renderStrip() {
    const h = state.data.hourly;
    els.hourlyStrip.innerHTML = state.range.map((i, k) => {
        const p = h.precipitation_probability[i] || 0;
        return `<button class="hour${state.hour === k ? ' active' : ''}" data-k="${k}">
            <span class="hour-t">${hourLabel(k)}</span>
            <span class="hour-i">${wIcon(h.weather_code[i], h.is_day[i] === 1)}</span>
            <span class="hour-v">${T(h.temperature_2m[i])}</span>
            <span class="hour-r${p < 10 ? ' dim' : ''}">${ic('droplet')}${p}%</span>
        </button>`;
    }).join('');
    els.hourlyStrip.scrollTo({ left: 0 });
}

function setActiveHour(k) {
    $$('.hour', els.hourlyStrip).forEach((el, j) => el.classList.toggle('active', j === k));
}

function scrollStripTo(k) {
    const el = els.hourlyStrip.children[k];
    if (!el) return;
    els.hourlyStrip.scrollTo({ left: el.offsetLeft - els.hourlyStrip.clientWidth / 2 + el.offsetWidth / 2, behavior: REDUCED ? 'auto' : 'smooth' });
}

/* =========================================================
   Grafik canvas interaktif
   ========================================================= */
const METRICS = {
    temp: {
        type: 'line', color: ['#fb923c', '#38bdf8'],
        get: (h, i) => conv(h.temperature_2m[i]),
        fmt: (v) => Math.round(v) + '°', axis: (v) => Math.round(v) + '°',
    },
    rain: {
        type: 'bar', fixed: [0, 100],
        get: (h, i) => h.precipitation_probability[i] || 0,
        fmt: (v) => Math.round(v) + '%', axis: (v) => Math.round(v) + '%',
    },
    wind: {
        type: 'line', color: ['#c4b5fd', '#818cf8'],
        get: (h, i) => h.wind_speed_10m[i],
        fmt: (v) => String(Math.round(v)), axis: (v) => String(Math.round(v)),
    },
    humidity: {
        type: 'line', color: ['#67e8f9', '#0891b2'], fixed: [0, 100],
        get: (h, i) => h.relative_humidity_2m[i],
        fmt: (v) => Math.round(v) + '%', axis: (v) => Math.round(v) + '%',
    },
};

function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// Kurva monoton (Fritsch–Carlson) — halus tanpa "overshoot"
function monoPath(ctx, pts) {
    const n = pts.length;
    const dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) {
        dx[i] = pts[i + 1].x - pts[i].x;
        m[i] = (pts[i + 1].y - pts[i].y) / dx[i];
    }
    t[0] = m[0];
    t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
        if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
        const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
        if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < n - 1; i++) {
        const h = dx[i] / 3;
        ctx.bezierCurveTo(pts[i].x + h, pts[i].y + t[i] * h, pts[i + 1].x - h, pts[i + 1].y - t[i + 1] * h, pts[i + 1].x, pts[i + 1].y);
    }
}

function drawChart() {
    const cv = els.mainChart, wrap = cv.parentElement;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    if (!W || !H || !state.data) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const m = METRICS[state.metric], h = state.data.hourly, R = state.range, n = R.length;
    if (n < 2) return;
    const vals = R.map((i) => m.get(h, i));

    let lo, hi;
    if (m.fixed) {
        [lo, hi] = m.fixed;
    } else {
        lo = Math.min(...vals); hi = Math.max(...vals);
        const pv = Math.max(1, (hi - lo) * 0.25);
        lo = Math.floor(lo - pv); hi = Math.ceil(hi + pv);
        if (state.metric === 'wind') lo = Math.max(0, lo);
    }

    const P = { l: 40, r: 14, t: 28, b: 30 };
    const pw = W - P.l - P.r, ph = H - P.t - P.b;
    const X = (k) => P.l + (k + 0.5) * pw / n;
    const Y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * ph;
    state.geo = { P, pw, n, X, W };

    const font = (w, s) => `${w} ${s}px "Plus Jakarta Sans", system-ui, sans-serif`;

    // Grid & sumbu Y
    ctx.font = font(500, 11);
    ctx.textBaseline = 'middle';
    for (let g = 0; g <= 4; g++) {
        const v = lo + (hi - lo) * g / 4, y = Y(v);
        ctx.strokeStyle = 'rgba(255,255,255,.07)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(W - P.r, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.textAlign = 'right';
        ctx.fillText(m.axis(v), P.l - 8, y);
    }

    // Label sumbu X
    const every = Math.max(1, Math.ceil(44 / (pw / n)));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (let k = 0; k < n; k += every) {
        ctx.fillStyle = (state.day === 0 && k === 0) ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.45)';
        ctx.fillText(hourLabel(k), X(k), H - 8);
    }

    // Seri data (dengan animasi "reveal")
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, P.l + pw * state.animP, H);
    ctx.clip();

    const active = state.hover != null ? state.hover : state.hour;

    if (m.type === 'bar') {
        const bw = Math.min(18, (pw / n) * 0.62);
        const y0 = Y(0);
        vals.forEach((v, k) => {
            const x = X(k), y = Y(v), hb = Math.max(2, y0 - y);
            const g = ctx.createLinearGradient(0, y0 - hb, 0, y0);
            g.addColorStop(0, `rgba(96,165,250,${0.45 + 0.55 * v / 100})`);
            g.addColorStop(1, 'rgba(96,165,250,.12)');
            ctx.fillStyle = active === k ? '#bfdbfe' : g;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x - bw / 2, y0 - hb, bw, hb, Math.min(6, bw / 2));
            else ctx.rect(x - bw / 2, y0 - hb, bw, hb);
            ctx.fill();
        });
    } else {
        const pts = vals.map((v, k) => ({ x: X(k), y: Y(v) }));
        const gf = ctx.createLinearGradient(0, P.t, 0, P.t + ph);
        gf.addColorStop(0, hexA(m.color[0], 0.35));
        gf.addColorStop(1, hexA(m.color[1], 0));
        ctx.beginPath();
        monoPath(ctx, pts);
        ctx.lineTo(pts[n - 1].x, P.t + ph);
        ctx.lineTo(pts[0].x, P.t + ph);
        ctx.closePath();
        ctx.fillStyle = gf;
        ctx.fill();

        const gs = ctx.createLinearGradient(0, P.t, 0, P.t + ph);
        gs.addColorStop(0, m.color[0]);
        gs.addColorStop(1, m.color[1]);
        ctx.beginPath();
        monoPath(ctx, pts);
        ctx.strokeStyle = gs;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // Label nilai
    ctx.font = font(600, 11);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.textAlign = 'center';
    for (let k = 0; k < n; k += every) {
        const v = vals[k];
        if (m.type === 'bar' && v <= 0) continue;
        ctx.fillText(m.fmt(v), X(k), Y(v) - (m.type === 'bar' ? 6 : 12));
    }
    ctx.restore();

    // Penanda jam aktif
    if (active != null && active < n) {
        const x = X(active), y = Y(vals[active]);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,.4)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, P.t - 6); ctx.lineTo(x, P.t + ph); ctx.stroke();
        ctx.restore();
        if (m.type === 'line') {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = m.color[0];
            ctx.stroke();
        }
    }
}

function animateChart() {
    cancelAnimationFrame(state.chartRaf);
    if (REDUCED) { state.animP = 1; drawChart(); return; }
    state.animP = 0;
    drawChart();
    const t0 = performance.now();
    const frame = (t) => {
        const k = Math.min(1, (t - t0) / 900);
        state.animP = 1 - Math.pow(1 - k, 3);
        drawChart();
        if (k < 1) state.chartRaf = requestAnimationFrame(frame);
    };
    state.chartRaf = requestAnimationFrame(frame);
}

function showTip(k) {
    const tip = els.chartTooltip;
    if (k == null || !state.geo || state.range[k] == null) { tip.classList.remove('show'); return; }
    const i = state.range[k], h = state.data.hourly;
    const t = new Date(state.hT[i]);
    const head = (state.day === 0 && k === 0) ? `Sekarang · ${HARI[t.getUTCDay()]}` : `${HARI[t.getUTCDay()]}, ${pad2(t.getUTCHours())}.00`;
    tip.innerHTML = `
        <div class="tt-head">${head}</div>
        <div class="tt-cond"><span class="tt-ic">${wIcon(h.weather_code[i], h.is_day[i] === 1)}</span>${WMO[h.weather_code[i]] || ''}</div>
        <div class="tt-row"><span>Suhu</span><b>${T(h.temperature_2m[i])}</b></div>
        <div class="tt-row"><span>Terasa</span><b>${T(h.apparent_temperature[i])}</b></div>
        <div class="tt-row"><span>Peluang hujan</span><b>${h.precipitation_probability[i] || 0}% · ${num(h.precipitation[i])} mm</b></div>
        <div class="tt-row"><span>Angin</span><b>${Math.round(h.wind_speed_10m[i])} km/j ${DIRS_S[dirIdx(h.wind_direction_10m[i])]}</b></div>
        <div class="tt-row"><span>Kelembapan</span><b>${h.relative_humidity_2m[i]}%</b></div>`;
    const { X, W } = state.geo;
    const tw = tip.offsetWidth || 200;
    let left = X(k) + 16;
    if (left + tw > W) left = X(k) - tw - 16;
    left = clamp(left, 0, Math.max(0, W - tw));
    tip.style.transform = `translate(${left}px, 8px)`;
    tip.classList.add('show');
}

function moveTabInd() {
    const btn = $('button.active', els.chartTabs);
    const ind = $('.tab-ind', els.chartTabs);
    if (!btn || !ind) return;
    ind.style.width = btn.offsetWidth + 'px';
    ind.style.transform = `translateX(${btn.offsetLeft}px)`;
}

/* =========================================================
   Peta (Leaflet)
   ========================================================= */
function updateMap() {
    if (typeof L === 'undefined') { els.mapSection.style.display = 'none'; return; }
    const { lat, lon, name } = state.loc;
    const c = state.data.current;
    const label = `<b>${esc(name.split(',')[0])}</b> · ${T(c.temperature_2m)} · ${esc(WMO[c.weather_code] || '')}`;

    if (!state.map) {
        state.map = L.map('map', { scrollWheelZoom: false, worldCopyJump: true, fadeAnimation: false }).setView([lat, lon], 9);
        const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
        L.tileLayer(esri + 'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Peta &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors',
            maxZoom: 16,
        }).addTo(state.map);
        L.tileLayer(esri + 'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16 }).addTo(state.map);
        state.map.on('click', (e) => pickPoint(e.latlng.lat, ((e.latlng.lng + 540) % 360) - 180));
        state.map.on('focus', () => state.map.scrollWheelZoom.enable());
        state.map.on('blur', () => state.map.scrollWheelZoom.disable());
        state.marker = L.marker([lat, lon], {
            icon: L.divIcon({ className: 'map-pin', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
        }).addTo(state.map);
        state.marker.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -14], className: 'map-tip' });
    } else {
        state.marker.setLatLng([lat, lon]);
        state.marker.setTooltipContent(label);
        if (state.map.distance(state.map.getCenter(), [lat, lon]) > 2000) {
            state.map.flyTo([lat, lon], Math.max(state.map.getZoom(), 8), { duration: REDUCED ? 0 : 1.2 });
        }
    }
}

async function pickPoint(lat, lon) {
    document.body.classList.add('is-fetching');
    const name = await reverseName(lat, lon);
    loadWeather({ lat, lon, name });
}

/* =========================================================
   Edukasi: langkah & simulasi ketidakpastian
   ========================================================= */
function renderSteps() {
    els.steps.innerHTML = STEPS.map((s, i) =>
        `<button class="step" data-step="${i}"><span class="step-num">${ic(s.icon)}</span><span>${s.short}</span></button>`).join('');
    setStep(0, false);
    if (!REDUCED) state.stepTimer = setInterval(() => setStep((state.step + 1) % STEPS.length), 7000);
}

function setStep(i, swap = true) {
    state.step = i;
    $$('.step', els.steps).forEach((b, j) => {
        b.classList.toggle('active', j === i);
        b.classList.toggle('done', j < i);
    });
    els.steps.style.setProperty('--prog', i / (STEPS.length - 1));
    const s = STEPS[i];
    els.stepPanel.innerHTML = `
        <div class="sp-icon">${ic(s.icon)}</div>
        <div class="sp-body">
            <h3>${i + 1}. ${s.title}</h3>
            <p>${s.text}</p>
            <div class="sp-facts">${s.facts.map((f) => `<span>${f}</span>`).join('')}</div>
        </div>`;
    if (swap) {
        els.stepPanel.classList.remove('swap');
        void els.stepPanel.offsetWidth;
        els.stepPanel.classList.add('swap');
    }
}

// Anggota ensemble ilustratif (deterministik agar titik bergerak mulus)
const prand = (s) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const ENSEMBLE = Array.from({ length: 24 }, (_, k) => {
    const r1 = prand(k * 2 + 1) || 1e-6, r2 = prand(k * 2 + 2);
    const z = clamp(Math.sqrt(-2 * Math.log(r1)) * Math.cos(2 * Math.PI * r2) / 2, -1.2, 1.2);
    return { z, y: 12 + prand(k * 7 + 3) * 76 };
});

function updateUnc() {
    if (!state.data) return;
    if (!$('.unc-dot', els.uncTrack)) {
        ENSEMBLE.forEach(() => {
            const dot = document.createElement('span');
            dot.className = 'unc-dot';
            els.uncTrack.appendChild(dot);
        });
    }
    const d = +els.uncSlider.value;
    const dl = state.data.daily;
    const maxes = dl.temperature_2m_max;
    const lo = Math.min(...maxes) - 7, hi = Math.max(...maxes) + 7;
    const f = maxes[d], s = 0.8 + 0.6 * d;
    const pct = (v) => clamp((v - lo) / (hi - lo), 0, 1) * 100;

    els.uncBand.style.left = pct(f - s) + '%';
    els.uncBand.style.width = (pct(f + s) - pct(f - s)) + '%';
    els.uncMarker.style.left = pct(f) + '%';
    $$('.unc-dot', els.uncTrack).forEach((el, k) => {
        el.style.left = pct(f + ENSEMBLE[k].z * s) + '%';
        el.style.top = ENSEMBLE[k].y + '%';
    });

    const dt = new Date(tms(dl.time[d]));
    els.uncLead.textContent = `+${d} hari`;
    els.uncDay.textContent = d === 0 ? 'Hari ini' : `${HARI[dt.getUTCDay()]}, ${dt.getUTCDate()} ${BULAN_S[dt.getUTCMonth()]}`;
    els.uncForecast.textContent = T(f);
    els.uncRange.textContent = `${T(f - s)} – ${T(f + s)}`;
    els.uncAcc.textContent = `~${RELIABILITY[d]}%`;
    els.uncLo.textContent = T(lo);
    els.uncHi.textContent = T(hi);
    els.uncSlider.style.setProperty('--fill', (d / 6) * 100 + '%');
    els.uncNote.textContent = d <= 2
        ? 'Prakiraan 1–3 hari sangat andal: anggota ensemble masih berkumpul rapat di sekitar nilai prakiraan.'
        : d <= 4
            ? 'Anggota ensemble mulai menyebar — cocok untuk perencanaan, tetapi periksa kembali mendekati hari-H.'
            : 'Sebaran sudah lebar — anggap sebagai gambaran tren, bukan angka pasti. Inilah “Efek Kupu-kupu”: kesalahan kecil membesar seiring waktu.';
}

/* =========================================================
   Efek latar belakang (hujan, salju, bintang, cahaya)
   ========================================================= */
const FX = { cv: null, ctx: null, w: 0, h: 0, parts: [], theme: null, flash: 0, raf: 0 };

function setupFX() {
    FX.cv = els.fxCanvas;
    FX.ctx = FX.cv.getContext('2d');
    fxResize();
    window.addEventListener('resize', fxResize);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(FX.raf); else fxStart();
    });
}

function fxResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    FX.w = window.innerWidth;
    FX.h = window.innerHeight;
    FX.cv.width = FX.w * dpr;
    FX.cv.height = FX.h * dpr;
    FX.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (FX.theme) { fxBuild(); if (REDUCED) fxFrame(0, true); }
}

function setTheme(t) {
    document.body.dataset.theme = t;
    if (FX.theme !== t) { FX.theme = t; fxBuild(); fxStart(); }
}

function fxBuild() {
    const { w, h } = FX, R = Math.random;
    const area = clamp((w * h) / (1440 * 900), 0.4, 1.6);
    const P = [];
    const th = FX.theme;
    if (th === 'rain' || th === 'storm') {
        const n = Math.round((th === 'storm' ? 220 : 150) * area);
        for (let i = 0; i < n; i++) P.push({ x: R() * w * 1.2, y: R() * h, l: 10 + R() * 18, v: 9 + R() * 8, a: 0.12 + R() * 0.3 });
    } else if (th === 'snow') {
        const n = Math.round(110 * area);
        for (let i = 0; i < n; i++) P.push({ x: R() * w, y: R() * h, r: 1 + R() * 2.6, v: 0.4 + R() * 1.1, p: R() * 6.28, a: 0.4 + R() * 0.5 });
    } else if (th === 'night') {
        const n = Math.round(160 * area);
        for (let i = 0; i < n; i++) P.push({ x: R() * w, y: R() * h, r: 0.3 + R() * 1.4, p: R() * 6.28, s: 0.5 + R() * 1.5 });
    } else if (th === 'day') {
        for (let i = 0; i < 14; i++) P.push({ x: R() * w, y: R() * h, r: 60 + R() * 140, vx: (R() - 0.5) * 0.25, vy: (R() - 0.5) * 0.25, a: 0.03 + R() * 0.05 });
    } else {
        for (let i = 0; i < 9; i++) P.push({ x: R() * w, y: R() * h * 0.7, r: 180 + R() * 220, vx: 0.08 + R() * 0.18, vy: 0, a: 0.035 + R() * 0.04 });
    }
    FX.parts = P;
}

function fxStart() {
    cancelAnimationFrame(FX.raf);
    if (REDUCED) { fxFrame(0, true); return; }
    const loop = (t) => { fxFrame(t, false); FX.raf = requestAnimationFrame(loop); };
    FX.raf = requestAnimationFrame(loop);
}

function fxFrame(t, once) {
    const { ctx, w, h, parts } = FX, th = FX.theme;
    ctx.clearRect(0, 0, w, h);
    if (th === 'rain' || th === 'storm') {
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.2;
        for (const p of parts) {
            ctx.strokeStyle = `rgba(186,214,255,${p.a})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.l * 0.25, p.y + p.l); ctx.stroke();
            if (!once) {
                p.y += p.v; p.x -= p.v * 0.25;
                if (p.y > h) { p.y = -20; p.x = Math.random() * w * 1.2; }
            }
        }
        if (th === 'storm' && !once) {
            if (Math.random() < 0.004) FX.flash = 1;
            if (FX.flash > 0.01) {
                ctx.fillStyle = `rgba(220,210,255,${FX.flash * 0.22})`;
                ctx.fillRect(0, 0, w, h);
                FX.flash *= 0.9;
            }
        }
    } else if (th === 'snow') {
        ctx.fillStyle = '#fff';
        for (const p of parts) {
            ctx.globalAlpha = p.a;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            if (!once) {
                p.y += p.v; p.p += 0.01; p.x += Math.sin(p.p) * 0.4;
                if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
            }
        }
        ctx.globalAlpha = 1;
    } else if (th === 'night') {
        ctx.fillStyle = '#fff';
        for (const p of parts) {
            ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin((t / 1000) * p.s + p.p));
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
    } else {
        for (const p of parts) {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, `rgba(255,255,255,${p.a})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            if (!once) {
                p.x += p.vx; p.y += p.vy;
                if (p.x - p.r > w) p.x = -p.r;
                if (p.x + p.r < 0) p.x = w + p.r;
                if (p.y - p.r > h) p.y = -p.r;
                if (p.y + p.r < 0) p.y = h + p.r;
            }
        }
    }
}

/* =========================================================
   Toast
   ========================================================= */
let toastTimer;
function showToast(msg, retry) {
    clearTimeout(toastTimer);
    els.toast.innerHTML = `<span>${esc(msg)}</span>${retry ? '<button type="button">Coba lagi</button>' : ''}`;
    if (retry) $('button', els.toast).addEventListener('click', () => { hideToast(); retry(); });
    els.toast.classList.add('show');
    if (!retry) toastTimer = setTimeout(hideToast, 5000);
}
function hideToast() { els.toast.classList.remove('show'); }

/* =========================================================
   Interaksi
   ========================================================= */
let searchTimer, searchItems = [], searchActive = -1;

function openResults(open) { els.searchResults.classList.toggle('open', open); }

function renderResults() {
    if (!searchItems.length) {
        els.searchResults.innerHTML = '<div class="sr-empty">Kota tidak ditemukan</div>';
    } else {
        els.searchResults.innerHTML = searchItems.map((r, i) => {
            const sub = [r.admin1, r.country].filter(Boolean).join(', ');
            return `<button class="sr-item${i === searchActive ? ' active' : ''}" data-i="${i}" role="option">${ic('pin')}<span><b>${esc(r.name)}</b><small>${esc(sub)}</small></span></button>`;
        }).join('');
    }
    openResults(true);
}

async function doSearch(q) {
    try {
        const j = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=id&format=json`, 8000);
        if (els.searchInput.value.trim() !== q) return;
        searchItems = j.results || [];
        searchActive = searchItems.length ? 0 : -1;
        renderResults();
    } catch {
        searchItems = [];
        els.searchResults.innerHTML = '<div class="sr-empty">Pencarian gagal. Coba lagi.</div>';
        openResults(true);
    }
}

function chooseResult(r) {
    const parts = [r.name];
    if (r.admin1 && r.admin1 !== r.name) parts.push(r.admin1);
    if (r.country) parts.push(r.country);
    els.searchInput.value = '';
    searchItems = [];
    openResults(false);
    els.searchInput.blur();
    loadWeather({ lat: r.latitude, lon: r.longitude, name: parts.join(', ') });
}

function bindUI() {
    // Pencarian
    els.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const q = els.searchInput.value.trim();
        if (q.length < 2) { openResults(false); return; }
        searchTimer = setTimeout(() => doSearch(q), 300);
    });
    els.searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!searchItems.length) return;
            e.preventDefault();
            searchActive = (searchActive + (e.key === 'ArrowDown' ? 1 : -1) + searchItems.length) % searchItems.length;
            renderResults();
        } else if (e.key === 'Enter') {
            const q = els.searchInput.value.trim();
            if (searchItems.length) chooseResult(searchItems[Math.max(0, searchActive)]);
            else if (q.length >= 2) { await doSearch(q); if (searchItems[0]) chooseResult(searchItems[0]); }
        } else if (e.key === 'Escape') {
            openResults(false);
            els.searchInput.blur();
        }
    });
    els.searchInput.addEventListener('focus', () => { if (searchItems.length) renderResults(); });
    els.searchResults.addEventListener('click', (e) => {
        const b = e.target.closest('.sr-item');
        if (b) chooseResult(searchItems[+b.dataset.i]);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) openResults(false); });
    document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
            els.searchInput.focus();
        }
    });

    // Lokasi saya
    els.locationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) { showToast('Browser Anda tidak mendukung geolokasi.'); return; }
        els.locationBtn.classList.add('spin');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            const name = await reverseName(lat, lon);
            els.locationBtn.classList.remove('spin');
            loadWeather({ lat, lon, name });
        }, (err) => {
            els.locationBtn.classList.remove('spin');
            showToast(err.code === 1 ? 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.' : 'Lokasi Anda tidak dapat ditemukan.');
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
    });

    // Satuan suhu
    els.unitToggle.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-unit]');
        if (!b || b.dataset.unit === state.unit) return;
        state.unit = b.dataset.unit;
        storage.set('cuacaku:unit', state.unit);
        applyUnitUI();
        if (state.data) renderAll(false);
    });

    // Kota populer
    els.chips.addEventListener('click', (e) => {
        const b = e.target.closest('.chip');
        if (b) loadWeather(CITIES[+b.dataset.i]);
    });

    // Kartu hari
    els.dailyList.addEventListener('click', (e) => {
        const b = e.target.closest('.day');
        if (b) selectDay(+b.dataset.day);
    });

    // Tab grafik
    els.chartTabs.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-metric]');
        if (!b || b.dataset.metric === state.metric) return;
        $$('button[data-metric]', els.chartTabs).forEach((x) => x.classList.toggle('active', x === b));
        state.metric = b.dataset.metric;
        moveTabInd();
        animateChart();
        showTip(state.hour);
    });

    // Hover / sentuh grafik
    const cv = els.mainChart;
    cv.addEventListener('pointermove', (e) => {
        if (!state.geo) return;
        const r = cv.getBoundingClientRect();
        const { P, pw, n } = state.geo;
        const k = clamp(Math.floor(((e.clientX - r.left - P.l) / pw) * n), 0, n - 1);
        if (k !== state.hover) {
            state.hover = k;
            drawChart();
            showTip(k);
            setActiveHour(k);
        }
    });
    cv.addEventListener('pointerleave', () => {
        state.hover = null;
        drawChart();
        showTip(state.hour);
        setActiveHour(state.hour);
    });
    cv.addEventListener('click', () => {
        if (state.hover == null) return;
        state.hour = state.hover;
        scrollStripTo(state.hour);
    });

    // Kartu jam
    els.hourlyStrip.addEventListener('click', (e) => {
        const b = e.target.closest('.hour');
        if (!b) return;
        const k = +b.dataset.k;
        state.hour = state.hour === k ? null : k;
        state.hover = null;
        drawChart();
        showTip(state.hour);
        setActiveHour(state.hour);
        if (state.hour != null) scrollStripTo(k);
    });

    // Ubah ukuran grafik
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            drawChart();
            showTip(state.hover != null ? state.hover : state.hour);
            moveTabInd();
        }).observe(els.mainChart.parentElement);
    } else {
        window.addEventListener('resize', () => { drawChart(); moveTabInd(); });
    }

    // Langkah edukasi
    els.steps.addEventListener('click', (e) => {
        const b = e.target.closest('.step');
        if (!b) return;
        clearInterval(state.stepTimer);
        setStep(+b.dataset.step);
    });

    // Slider ketidakpastian
    els.uncSlider.addEventListener('input', updateUnc);

    // Efek tilt & cahaya pada hero
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !REDUCED) {
        els.hero.addEventListener('pointermove', (e) => {
            const r = els.hero.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            els.hero.style.setProperty('--mx', px * 100 + '%');
            els.hero.style.setProperty('--my', py * 100 + '%');
            els.hero.style.setProperty('--rx', ((px - 0.5) * 5).toFixed(2) + 'deg');
            els.hero.style.setProperty('--ry', (-(py - 0.5) * 5).toFixed(2) + 'deg');
        });
        els.hero.addEventListener('pointerleave', () => {
            els.hero.style.setProperty('--rx', '0deg');
            els.hero.style.setProperty('--ry', '0deg');
        });
    }
}

function applyUnitUI() {
    els.unitToggle.dataset.unit = state.unit;
    $$('button[data-unit]', els.unitToggle).forEach((b) => b.classList.toggle('active', b.dataset.unit === state.unit));
}

function setupReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED) { items.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.classList.add('in');
            io.unobserve(en.target);
            if (en.target.id === 'mapSection' && state.map) setTimeout(() => state.map.invalidateSize(), 950);
        });
    }, { threshold: 0.1 });
    items.forEach((el) => io.observe(el));
}

/* =========================================================
   Inisialisasi
   ========================================================= */
function init() {
    cacheEls();
    $$('[data-icon]').forEach((el) => { el.outerHTML = ic(el.dataset.icon); });
    setupFX();
    setTheme(document.body.dataset.theme || 'night');
    applyUnitUI();
    renderChips();
    renderSteps();
    bindUI();
    setupReveal();
    moveTabInd();

    const saved = storage.get('cuacaku:loc');
    const valid = saved && typeof saved.lat === 'number' && typeof saved.lon === 'number' && saved.name;
    loadWeather(valid ? saved : DEFAULT_LOC);

    // Jam & posisi matahari diperbarui tiap 30 detik
    setInterval(() => { if (state.data) { updateClock(); renderSun(); } }, 30000);

    // Data diperbarui otomatis tiap 10 menit
    setInterval(() => { if (state.loc && !document.hidden) loadWeather(state.loc, { silent: true }); }, 600000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && state.loc && Date.now() - state.fetchedAt > 600000) loadWeather(state.loc, { silent: true });
    });
}

init();
