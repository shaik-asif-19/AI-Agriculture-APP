// =============================================
// WEATHER.JS — Open-Meteo API (Free, No Key)
// =============================================

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL  = 'https://geocoding-api.open-meteo.com/v1/search';
const NOMINATIM_URL  = 'https://nominatim.openstreetmap.org/reverse';

// Weather code descriptions
const WMO_CODES = {
  0:  { label: 'Clear Sky',          icon: '☀️' },
  1:  { label: 'Mainly Clear',       icon: '🌤️' },
  2:  { label: 'Partly Cloudy',      icon: '⛅' },
  3:  { label: 'Overcast',           icon: '☁️' },
  45: { label: 'Foggy',              icon: '🌫️' },
  48: { label: 'Icy Fog',            icon: '🌫️' },
  51: { label: 'Light Drizzle',      icon: '🌦️' },
  53: { label: 'Drizzle',            icon: '🌦️' },
  55: { label: 'Heavy Drizzle',      icon: '🌧️' },
  61: { label: 'Light Rain',         icon: '🌧️' },
  63: { label: 'Rain',               icon: '🌧️' },
  65: { label: 'Heavy Rain',         icon: '🌨️' },
  71: { label: 'Light Snow',         icon: '🌨️' },
  73: { label: 'Snow',               icon: '❄️' },
  75: { label: 'Heavy Snow',         icon: '❄️' },
  80: { label: 'Showers',            icon: '🌦️' },
  81: { label: 'Showers',            icon: '🌧️' },
  82: { label: 'Heavy Showers',      icon: '⛈️' },
  95: { label: 'Thunderstorm',       icon: '⛈️' },
  96: { label: 'Thunderstorm+Hail',  icon: '⛈️' },
  99: { label: 'Heavy Thunderstorm', icon: '🌩️' },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: 'Unknown', icon: '🌡️' };
}

// ── Get User Location ─────────────────────────
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

// ── Reverse Geocode ───────────────────────────
async function getLocationName(lat, lon) {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'AgriAI-App/1.0' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    return addr.village || addr.town || addr.city || addr.county || addr.state || 'Your Location';
  } catch {
    return 'Your Location';
  }
}

// ── Fetch Weather ─────────────────────────────
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'uv_index_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: 7
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

// ── Agriculture Guidance ──────────────────────
function getAgriculturalGuidance(weatherData) {
  const alerts = [];
  if (!weatherData?.current) return alerts;

  const cur = weatherData.current;
  const daily = weatherData.daily;
  const temp = cur.temperature_2m;
  const humidity = cur.relative_humidity_2m;
  const windSpeed = cur.wind_speed_10m;
  const uv = cur.uv_index;
  const code = cur.weather_code;
  const precipToday = daily?.precipitation_sum?.[0] || 0;
  const precipProb = daily?.precipitation_probability_max?.[0] || 0;

  // Rain warnings
  if (precipProb >= 70 || [61,63,65,80,81,82,95,96,99].includes(code)) {
    alerts.push({
      type: 'warning',
      icon: '🌧️',
      title: 'Avoid Spraying Pesticides',
      desc: 'Expected rainfall will wash away pesticides. Delay application.'
    });
    alerts.push({
      type: 'info',
      icon: '💧',
      title: 'Delay Irrigation',
      desc: `Rain expected (${precipProb}% probability). Natural watering today.`
    });
  }

  // Heat stress
  if (temp >= 38) {
    alerts.push({
      type: 'danger',
      icon: '🌡️',
      title: 'Extreme Heat — Protect Crops',
      desc: `Temperature ${temp}°C. Water crops early morning. Cover sensitive seedlings.`
    });
  } else if (temp >= 34) {
    alerts.push({
      type: 'warning',
      icon: '☀️',
      title: 'Heat Stress Risk',
      desc: `${temp}°C detected. Irrigate in the evening to reduce water evaporation.`
    });
  }

  // Cold warning
  if (temp <= 8) {
    alerts.push({
      type: 'warning',
      icon: '🥶',
      title: 'Frost Risk',
      desc: 'Protect sensitive crops from cold damage. Cover young plants overnight.'
    });
  }

  // High humidity (disease risk)
  if (humidity >= 80) {
    alerts.push({
      type: 'warning',
      icon: '🍄',
      title: 'High Fungal Disease Risk',
      desc: `Humidity at ${humidity}%. High risk of fungal infections. Inspect crops for early signs.`
    });
  }

  // Wind warning
  if (windSpeed >= 30) {
    alerts.push({
      type: 'danger',
      icon: '💨',
      title: 'Strong Winds — Secure Crops',
      desc: `Wind speed ${windSpeed} km/h. Do not spray. Stake tall plants to prevent lodging.`
    });
  } else if (windSpeed >= 20) {
    alerts.push({
      type: 'warning',
      icon: '💨',
      title: 'Avoid Aerial Spraying',
      desc: `Winds at ${windSpeed} km/h may cause spray drift. Delay foliar applications.`
    });
  }

  // UV warning
  if (uv >= 8) {
    alerts.push({
      type: 'warning',
      icon: '🌞',
      title: 'High UV — Avoid Midday Work',
      desc: 'UV index is very high. Work in early morning or late afternoon for safety.'
    });
  }

  // Harvest timing
  if ([61,63,65,80,81,82].includes(code) && precipToday >= 20) {
    alerts.push({
      type: 'danger',
      icon: '🌾',
      title: 'Harvest Before Heavy Rain',
      desc: 'Heavy rain may damage standing crops. Harvest ripe produce immediately.'
    });
  }

  // Good weather
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      icon: '✅',
      title: 'Good Farming Conditions',
      desc: 'Weather is favorable. Ideal time for sowing, transplanting, and field activities.'
    });
  }

  return alerts;
}

// ── Format daily forecast ─────────────────────
function formatForecast(weatherData) {
  if (!weatherData?.daily) return [];
  const days = weatherData.daily;
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return days.time.map((date, i) => {
    const d = new Date(date);
    const info = getWeatherInfo(days.weather_code[i]);
    return {
      day: i === 0 ? 'Today' : dayNames[d.getDay()],
      icon: info.icon,
      label: info.label,
      max: Math.round(days.temperature_2m_max[i]),
      min: Math.round(days.temperature_2m_min[i]),
      rain: days.precipitation_sum[i]?.toFixed(1) || '0',
      rainProb: days.precipitation_probability_max ? (days.precipitation_probability_max[i] || 0) : 0
    };
  });
}

// ── Fetch Weather for a specific Date ──────────
async function fetchWeatherForDate(lat, lon, dateString) {
  const today = new Date().toISOString().split('T')[0];
  const maxForecastDate = new Date();
  maxForecastDate.setDate(maxForecastDate.getDate() + 16);
  const maxForecastDateStr = maxForecastDate.toISOString().split('T')[0];

  if (dateString > maxForecastDateStr) {
    throw new Error('Forecast is only available up to 16 days in the future.');
  }

  const isPast = dateString < today;
  const baseUrl = isPast
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast';

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    start_date: dateString,
    end_date: dateString,
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'uv_index_max',
      'wind_speed_10m_max'
    ].join(','),
    timezone: 'auto'
  });

  const res = await fetch(`${baseUrl}?${params}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.reason || 'Failed to fetch weather for selected date.');
  }

  const data = await res.json();
  if (!data?.hourly || !data?.daily) {
    throw new Error('No weather data available for this date.');
  }

  const idx = 12; // 12:00 PM index for hourly averages

  const current = {
    temperature_2m:        data.hourly.temperature_2m[idx] ?? data.daily.temperature_2m_max[0],
    relative_humidity_2m:  data.hourly.relative_humidity_2m[idx] ?? 50,
    apparent_temperature:  data.hourly.apparent_temperature[idx] ?? data.daily.temperature_2m_max[0],
    precipitation:         data.daily.precipitation_sum[0] ?? 0,
    weather_code:          data.daily.weather_code[0] ?? data.hourly.weather_code[idx] ?? 0,
    cloud_cover:           data.hourly.cloud_cover[idx] ?? 0,
    wind_speed_10m:        data.hourly.wind_speed_10m[idx] ?? data.daily.wind_speed_10m_max[0],
    wind_direction_10m:    data.hourly.wind_direction_10m[idx] ?? 0,
    uv_index:              data.daily.uv_index_max[0] ?? 0
  };

  const daily = {
    ...data.daily,
    precipitation_probability_max: data.daily.precipitation_probability_max || [0]
  };

  return {
    current,
    daily
  };
}

window.WeatherAPI = {
  fetchWeather,
  getUserLocation,
  getLocationName,
  getWeatherInfo,
  getAgriculturalGuidance,
  formatForecast,
  fetchWeatherForDate
};
