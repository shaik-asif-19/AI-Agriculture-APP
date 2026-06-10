// =============================================
// HOME.JS — Dashboard Page
// =============================================

async function renderHome() {
  const { t, getGreeting } = window.i18n;
  const stats = window.HistoryDB.getStats();
  const scans = window.HistoryDB.getScans().slice(0, 3);
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page page-enter">
      <!-- Hero Greeting -->
      <div style="background:linear-gradient(135deg,#0d2b1a 0%,#0a1a0f 100%);
        border-radius:var(--radius-lg);padding:var(--space-lg);margin-bottom:var(--space-md);
        border:1px solid var(--glass-border);position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;
          background:radial-gradient(circle,rgba(82,183,136,0.15) 0%,transparent 70%);"></div>
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-xs)">
          <span style="font-size:28px;animation:float 3s ease-in-out infinite">🌱</span>
          <div>
            <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--text)">
              ${getGreeting()}!
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted)">${t('home_subtitle')}</div>
          </div>
        </div>
        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm);margin-top:var(--space-md)">
          <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:var(--radius-sm);padding:10px;border:1px solid var(--glass-border)">
            <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--accent)" id="stat-scans">0</div>
            <div style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.05em">Scans</div>
          </div>
          <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:var(--radius-sm);padding:10px;border:1px solid var(--glass-border)">
            <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:${stats.highSeverity > 0 ? 'var(--danger-light)' : 'var(--accent)'}" id="stat-alerts">0</div>
            <div style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.05em">Alerts</div>
          </div>
          <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:var(--radius-sm);padding:10px;border:1px solid var(--glass-border)">
            <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--info)" id="stat-days">0</div>
            <div style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.05em">Days</div>
          </div>
        </div>
      </div>

      <!-- Weather Mini Card -->
      <div class="section-header">
        <span class="section-title">🌤️ ${t('home_weather')}</span>
        <span class="see-all-btn" onclick="window.AppRouter.navigate('weather')">${t('see_all')}</span>
      </div>
      <div id="home-weather-card" style="margin-bottom:var(--space-md)">
        <div class="card" style="display:flex;align-items:center;gap:var(--space-md)">
          <div class="skeleton" style="width:60px;height:60px;border-radius:var(--radius-md)"></div>
          <div style="flex:1">
            <div class="skeleton" style="height:20px;width:60%;margin-bottom:8px"></div>
            <div class="skeleton" style="height:14px;width:40%"></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-header">
        <span class="section-title">⚡ ${t('home_quick')}</span>
      </div>
      <div class="quick-actions" style="margin-bottom:var(--space-md)">
        <div class="quick-action-btn" onclick="window.AppRouter.navigate('scan')">
          <div class="quick-action-icon" style="background:rgba(82,183,136,0.15)">📷</div>
          <div>
            <div class="quick-action-label">${t('nav_scan')}</div>
            <div class="quick-action-sub">Analyze crop</div>
          </div>
        </div>
        <div class="quick-action-btn" onclick="window.AppRouter.navigate('advisor')">
          <div class="quick-action-icon" style="background:rgba(76,201,240,0.15)">💬</div>
          <div>
            <div class="quick-action-label">${t('nav_advisor')}</div>
            <div class="quick-action-sub">Ask AI</div>
          </div>
        </div>
        <div class="quick-action-btn" onclick="window.AppRouter.navigate('weather')">
          <div class="quick-action-icon" style="background:rgba(244,162,97,0.15)">🌦️</div>
          <div>
            <div class="quick-action-label">${t('nav_weather')}</div>
            <div class="quick-action-sub">Farm alerts</div>
          </div>
        </div>
        <div class="quick-action-btn" onclick="window.AppRouter.navigate('history')">
          <div class="quick-action-icon" style="background:rgba(150,100,230,0.15)">📋</div>
          <div>
            <div class="quick-action-label">History</div>
            <div class="quick-action-sub">Past scans</div>
          </div>
        </div>
      </div>

      <!-- Recent Scans -->
      <div class="section-header">
        <span class="section-title">🔬 ${t('home_recent')}</span>
        <span class="see-all-btn" onclick="window.AppRouter.navigate('history')">${t('see_all')}</span>
      </div>
      <div id="home-recent-scans">
        ${scans.length === 0
          ? `<div class="empty-state" style="padding:var(--space-xl) 0">
              <div class="empty-state-icon">🌾</div>
              <div class="empty-state-title">${t('home_no_scans')}</div>
              <div class="empty-state-desc">${t('home_scan_first')}</div>
              <button class="btn btn-primary btn-sm" onclick="window.AppRouter.navigate('scan')">📷 ${t('nav_scan')}</button>
            </div>`
          : scans.map(s => renderScanItem(s)).join('')
        }
      </div>

      <!-- Crop Alerts -->
      ${window.HistoryDB.getScans().filter(s => ['High','Critical'].includes(s.result?.severity)).length > 0 ? `
      <div class="section-header" style="margin-top:var(--space-md)">
        <span class="section-title">🚨 ${t('home_alerts')}</span>
      </div>
      <div id="home-alerts">
        ${window.HistoryDB.getScans()
          .filter(s => ['High','Critical'].includes(s.result?.severity))
          .slice(0,3)
          .map(s => `
            <div class="ag-alert danger" style="margin-bottom:var(--space-xs);cursor:pointer"
              onclick="window.AppRouter.navigate('history')">
              <span class="ag-alert-icon">🚨</span>
              <div>
                <div class="ag-alert-title">${s.result?.prediction || 'Unknown Issue'}</div>
                <div class="ag-alert-desc">${UI.formatDate(s.timestamp)} · ${s.result?.severity} severity</div>
              </div>
            </div>
          `).join('')}
      </div>` : ''}

      <!-- Bottom padding -->
      <div style="height:var(--space-lg)"></div>
    </div>
  `;

  // Animate stats
  setTimeout(() => {
    const el1 = document.getElementById('stat-scans');
    const el2 = document.getElementById('stat-alerts');
    const el3 = document.getElementById('stat-days');
    if (el1) UI.animateNumber(el1, stats.totalScans, 800);
    if (el2) UI.animateNumber(el2, stats.highSeverity, 800);
    if (el3) {
      const days = stats.lastScan
        ? Math.floor((Date.now() - new Date(stats.lastScan)) / 86400000)
        : 0;
      UI.animateNumber(el3, days === 0 ? 1 : days, 800);
    }
  }, 100);

  // Load weather mini card
  loadHomeWeather();
}

function renderScanItem(scan) {
  const res = scan.result || {};
  return `
    <div class="history-item stagger-${Math.min(3, 1)}" style="margin-bottom:var(--space-xs)"
      onclick="window.ScanPage.showSavedResult('${scan.id}')">
      <div class="history-thumb">
        ${scan.imageData
          ? `<img src="${scan.imageData}" alt="scan">`
          : '<span>🌿</span>'
        }
      </div>
      <div class="history-info">
        <div class="history-title">${res.prediction || 'Unknown'}</div>
        <div class="history-sub">
          ${UI.getSeverityBadge(res.severity)}
          <span style="margin-left:6px">${UI.formatDate(scan.timestamp)}</span>
        </div>
      </div>
      <div style="color:var(--text-dim);font-size:1.2rem">›</div>
    </div>
  `;
}

async function loadHomeWeather() {
  const card = document.getElementById('home-weather-card');
  if (!card) return;
  try {
    const loc = await WeatherAPI.getUserLocation();
    const [weatherData, locName] = await Promise.all([
      WeatherAPI.fetchWeather(loc.lat, loc.lon),
      WeatherAPI.getLocationName(loc.lat, loc.lon)
    ]);
    const cur = weatherData.current;
    const info = WeatherAPI.getWeatherInfo(cur.weather_code);
    card.innerHTML = `
      <div class="card card-hover" onclick="window.AppRouter.navigate('weather')"
        style="background:linear-gradient(135deg,#0a1628,#0d2137);border-color:rgba(76,201,240,0.2)">
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          <div style="font-size:48px;line-height:1">${info.icon}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:baseline;gap:4px">
              <span style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:#fff">
                ${Math.round(cur.temperature_2m)}°
              </span>
              <span style="color:rgba(255,255,255,0.5);font-size:1rem">C</span>
            </div>
            <div style="font-size:0.8rem;color:rgba(255,255,255,0.6)">${info.label}</div>
            <div style="font-size:0.75rem;color:rgba(76,201,240,0.8);margin-top:2px">📍 ${locName}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.5)">💧 ${cur.relative_humidity_2m}%</div>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.5);margin-top:2px">💨 ${Math.round(cur.wind_speed_10m)} km/h</div>
          </div>
        </div>
      </div>
    `;
  } catch {
    card.innerHTML = `
      <div class="card" style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer"
        onclick="window.AppRouter.navigate('weather')">
        <span style="font-size:24px">🌡️</span>
        <div>
          <div style="font-size:0.85rem;color:var(--text)">Weather unavailable</div>
          <div style="font-size:0.75rem;color:var(--text-dim)">Tap to enable location</div>
        </div>
      </div>
    `;
  }
}

window.HomePage = { render: renderHome };
