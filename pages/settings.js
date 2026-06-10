// =============================================
// SETTINGS.JS — Settings Page
// =============================================

function renderSettings() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');
  const currentLang = window.AppState.language || 'en';

  container.innerHTML = `
    <div class="page page-enter">
      <div style="text-align:center;margin-bottom:var(--space-lg)">
        <h2 style="font-family:var(--font-display);font-weight:800">⚙️ ${t('settings_title')}</h2>
      </div>

      <!-- Language -->
      <div class="settings-section">
        <div class="settings-section-title">🌐 Language / भाषा / భాష</div>
        <div class="card" style="padding:var(--space-md)">
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:var(--space-sm)">${t('settings_lang_desc')}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm)">
            ${[
              { code: 'en', label: '🇬🇧 English', sublabel: 'English' },
              { code: 'hi', label: '🇮🇳 हिन्दी',  sublabel: 'Hindi' },
              { code: 'te', label: '🌿 తెలుగు',   sublabel: 'Telugu' }
            ].map(lang => `
              <button class="btn ${currentLang === lang.code ? 'btn-primary' : 'btn-secondary'}"
                id="lang-${lang.code}"
                onclick="window.SettingsPage.setLanguage('${lang.code}')"
                style="flex-direction:column;gap:2px;padding:12px 8px">
                <span style="font-size:1.1rem">${lang.label.split(' ')[0]}</span>
                <span style="font-size:0.78rem">${lang.sublabel}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- API Info -->
      <div class="settings-section">
        <div class="settings-section-title">🤖 AI Configuration</div>

        <!-- API Key Input -->
        <div class="card" style="padding:var(--space-md);margin-bottom:var(--space-sm)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:20px">🔑</span>
            <div>
              <div style="font-size:0.88rem;font-weight:700;color:var(--text)">Groq API Key</div>
              <div style="font-size:0.72rem;color:var(--text-dim)">Required to use AI features</div>
            </div>
            ${localStorage.getItem('groq_api_key') 
              ? `<span class="badge badge-success" style="margin-left:auto">✅ Saved</span>` 
              : `<span class="badge badge-danger" style="margin-left:auto;background:rgba(220,53,69,0.2);color:#ff6b6b;border:1px solid rgba(220,53,69,0.3)">❌ Missing</span>`}
          </div>
          <div style="position:relative;display:flex;gap:8px;align-items:center">
            <input 
              type="password" 
              id="groq-api-key-input"
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
              value="${localStorage.getItem('groq_api_key') || ''}"
              style="flex:1;background:var(--surface-3);border:1px solid var(--border);border-radius:var(--radius-sm);
                padding:10px 40px 10px 12px;font-size:0.82rem;color:var(--text);outline:none;
                font-family:monospace;transition:border 0.2s;"
              onfocus="this.style.borderColor='var(--accent)'"
              onblur="this.style.borderColor='var(--border)'"
            />
            <button 
              onclick="window.SettingsPage.toggleKeyVisibility()" 
              id="toggle-key-btn"
              style="position:absolute;right:8px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--text-muted)"
              title="Show/Hide Key">👁️</button>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="window.SettingsPage.saveApiKey()">
              💾 Save Key
            </button>
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.SettingsPage.clearApiKey()">
              🗑️ Clear
            </button>
          </div>
          <div style="margin-top:10px;font-size:0.72rem;color:var(--text-muted);line-height:1.5;background:rgba(82,183,136,0.07);border-radius:var(--radius-sm);padding:8px">
            💡 Get your free API key at <strong style="color:var(--accent)">console.groq.com</strong><br>
            🔒 Key is saved only in your browser (localStorage)
          </div>
        </div>

        <!-- Models Info -->
        <div class="card" style="padding:var(--space-md)">
          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm)">
            <div style="width:36px;height:36px;background:rgba(82,183,136,0.15);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:18px">🚀</div>
            <div>
              <div style="font-size:0.88rem;font-weight:600;color:var(--text)">Groq AI</div>
              <div style="font-size:0.74rem;color:var(--text-dim)">Powered by Meta LLaMA</div>
            </div>
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.5">
            <div>🔬 <strong>Vision Model:</strong> LLaMA 4 Scout 17B</div>
            <div style="margin-top:4px">💬 <strong>Chat Model:</strong> LLaMA 3.3 70B Versatile</div>
          </div>
          <button class="btn btn-ghost btn-sm btn-full" style="margin-top:var(--space-sm)" onclick="window.SettingsPage.testConnection()">
            🔗 Test Connection
          </button>
        </div>
      </div>

      <!-- Location -->
      <div class="settings-section">
        <div class="settings-section-title">📍 Location</div>
        <div class="settings-item" style="border-radius:var(--radius-md)" onclick="window.SettingsPage.openLocationMap()">
          <div class="settings-item-left">
            <div class="settings-item-icon blue">📍</div>
            <div>
              <div class="settings-item-title">${t('settings_gps')}</div>
              <div class="settings-item-desc" id="location-status">
                ${window.AppState.location?.name ? '✅ ' + window.AppState.location.name : t('settings_gps_desc')}
              </div>
            </div>
          </div>
          <div class="settings-item-right">›</div>
        </div>
      </div>

      <!-- Data -->
      <div class="settings-section">
        <div class="settings-section-title">💾 Data & Privacy</div>
        <div class="settings-item" style="border-radius:var(--radius-md) var(--radius-md) 0 0" onclick="window.AppRouter.navigate('about')">
          <div class="settings-item-left">
            <div class="settings-item-icon purple">ℹ️</div>
            <div>
              <div class="settings-item-title">${t('settings_about')}</div>
              <div class="settings-item-desc">${t('settings_about_desc')}</div>
            </div>
          </div>
          <div class="settings-item-right">›</div>
        </div>
        <div class="settings-item" onclick="window.SettingsPage.clearHistory()">
          <div class="settings-item-left">
            <div class="settings-item-icon red">🗑️</div>
            <div>
              <div class="settings-item-title">${t('settings_history')}</div>
              <div class="settings-item-desc">${window.HistoryDB.getScans().length} scans stored</div>
            </div>
          </div>
          <div class="settings-item-right" style="color:var(--danger-light)">›</div>
        </div>
        <div class="settings-item" style="border-radius:0 0 var(--radius-md) var(--radius-md)">
          <div class="settings-item-left">
            <div class="settings-item-icon green">💬</div>
            <div>
              <div class="settings-item-title">Clear Chat History</div>
              <div class="settings-item-desc">${window.HistoryDB.getChatHistory().length} messages</div>
            </div>
          </div>
          <div class="settings-item-right">
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();window.SettingsPage.clearChat()">Clear</button>
          </div>
        </div>
      </div>

      <!-- App Info -->
      <div class="card" style="text-align:center;padding:var(--space-lg)">
        <div style="font-size:48px;margin-bottom:var(--space-sm);animation:float 3s ease-in-out infinite">🌱</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:1.2rem;
          background:linear-gradient(135deg,var(--accent-light),#95d5b2);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
          AgriAI
        </div>
        <div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px">${t('settings_version')}</div>
        <div style="font-size:0.72rem;color:var(--text-dim);margin-top:8px;line-height:1.5">
          AI Agriculture & Environment Intelligence<br>
          Built for Indian Farmers 🇮🇳
        </div>
      </div>

      <div style="height:var(--space-lg)"></div>
    </div>
  `;
}

async function setLanguage(code) {
  window.AppState.language = code;
  window.HistoryDB.saveSetting('language', code);
  document.documentElement.lang = code === 'hi' ? 'hi' : code === 'te' ? 'te' : 'en';
  renderSettings();
  // Re-render header
  window.AppRouter.updateHeader();
  UI.showToast('Language updated', 'success');
}

function openLocationMap() {
  const lang = window.AppState?.language || 'en';
  
  // Default coordinates: selected location, or default to India center
  let lat = window.AppState.location?.lat || 20.5937;
  let lon = window.AppState.location?.lon || 78.9629;
  let selectedName = window.AppState.location?.name || '';
  
  const modal = document.createElement('div');
  modal.className = 'anim-fade-in';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 2100;
    display: flex; align-items: center; justify-content: center;
    background: rgba(10, 15, 13, 0.85); backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px); padding: var(--space-md);
  `;
  
  modal.innerHTML = `
    <div class="anim-scale-in" style="background:var(--surface-2); border:1px solid var(--glass-border);
      border-radius:var(--radius-lg); padding:var(--space-lg); max-width:440px; width:100%;
      display:flex; flex-direction:column; gap:12px; box-shadow:var(--shadow-lg);">
      
      <div style="display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border); padding-bottom:8px">
        <span style="font-size:24px">📍</span>
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.05rem; font-weight:800; color:var(--text)">
            ${lang === 'hi' ? 'मानचित्र पर स्थान चुनें' : lang === 'te' ? 'మ్యాప్‌లో స్థానాన్ని ఎంచుకోండి' : 'Select Location on Map'}
          </h3>
          <span style="font-size:0.75rem; color:var(--accent); font-weight:600">
            ${lang === 'hi' ? 'सटीक मौसम और कृषि सलाह के लिए' : lang === 'te' ? 'ఖచ్చితమైన వాతావరణం మరియు సలహా కోసం' : 'For accurate weather & farming advice'}
          </span>
        </div>
      </div>

      <!-- Selected Address Box -->
      <div style="background:var(--surface-3); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; display:flex; flex-direction:column; gap:4px">
        <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--text-dim); font-weight:700">
          ${lang === 'hi' ? 'चयनित स्थान' : lang === 'te' ? 'ఎంచుకున్న స్థానం' : 'Selected Location'}
        </div>
        <div id="modal-location-name" style="font-size:0.83rem; color:var(--text); font-weight:600">
          ${selectedName || (lang === 'hi' ? 'खोज रहे हैं...' : lang === 'te' ? 'శోధిస్తోంది...' : 'Locating...')}
        </div>
        <div id="modal-location-coords" style="font-size:0.72rem; color:var(--text-muted)">
          ${lat.toFixed(4)}, ${lon.toFixed(4)}
        </div>
      </div>

      <!-- Leaflet Map Canvas -->
      <div id="map-selection-canvas" style="width:100%; height:240px; border-radius:var(--radius-md); border:1px solid var(--border); z-index:1"></div>

      <!-- Quick Actions / GPS -->
      <button class="btn btn-ghost btn-sm btn-full" id="modal-gps-btn" style="gap:6px">
        🎯 ${lang === 'hi' ? 'मेरी वर्तमान स्थिति (GPS) का उपयोग करें' : lang === 'te' ? 'నా ప్రస్తుత స్థానాన్ని ఉపయోగించు (GPS)' : 'Use My Current GPS'}
      </button>

      <!-- Buttons -->
      <div style="display:flex; gap:var(--space-sm); margin-top:4px">
        <button class="btn btn-secondary" id="close-map-modal" style="flex:1">
          ${lang === 'hi' ? 'रद्द करें' : lang === 'te' ? 'రద్దు చేయి' : 'Cancel'}
        </button>
        <button class="btn btn-primary" id="confirm-map-location" style="flex:1">
          ${lang === 'hi' ? 'स्थान की पुष्टि करें' : lang === 'te' ? 'స్థానాన్ని నిర్ధారించు' : 'Confirm Location'}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  let map, marker;
  
  async function updateLocationDisplay(newLat, newLon) {
    lat = newLat;
    lon = newLon;
    
    const coordsEl = document.getElementById('modal-location-coords');
    if (coordsEl) coordsEl.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    
    const nameEl = document.getElementById('modal-location-name');
    if (nameEl) nameEl.innerHTML = `<span class="spinner spinner-sm" style="display:inline-block; margin-right:6px"></span>${lang === 'hi' ? 'खोज रहे हैं...' : lang === 'te' ? 'శోధిస్తోంది...' : 'Locating...'}`;
    
    try {
      const name = await WeatherAPI.getLocationName(newLat, newLon);
      selectedName = name;
      if (nameEl) nameEl.textContent = name;
    } catch {
      selectedName = 'Selected Position';
      if (nameEl) nameEl.textContent = selectedName;
    }
  }

  setTimeout(() => {
    // Initialize Leaflet Map
    map = L.map('map-selection-canvas', {
      zoomControl: true,
      attributionControl: false
    }).setView([lat, lon], window.AppState.location ? 13 : 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    // Custom Pin Emoji Icon to avoid image asset loading issues
    const customIcon = L.divIcon({
      html: `<div style="font-size:32px; transform:translate(-50%, -100%); position:absolute; left:50%; top:0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">📍</div>`,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    
    marker = L.marker([lat, lon], {
      draggable: true,
      icon: customIcon
    }).addTo(map);
    
    if (!selectedName) {
      updateLocationDisplay(lat, lon);
    }
    
    map.on('click', function(e) {
      const { lat: newLat, lng: newLon } = e.latlng;
      marker.setLatLng(e.latlng);
      updateLocationDisplay(newLat, newLon);
    });
    
    marker.on('dragend', function(e) {
      const pos = marker.getLatLng();
      updateLocationDisplay(pos.lat, pos.lng);
    });
    
    map.invalidateSize();
  }, 200);

  const gpsBtn = modal.querySelector('#modal-gps-btn');
  gpsBtn.onclick = async () => {
    gpsBtn.disabled = true;
    const originalText = gpsBtn.innerHTML;
    gpsBtn.innerHTML = `<span class="spinner spinner-sm" style="display:inline-block; margin-right:6px"></span>${lang === 'hi' ? 'GPS प्राप्त कर रहे हैं...' : lang === 'te' ? 'స్థానాన్ని పొందుతోంది...' : 'Acquiring GPS...'}`;
    
    try {
      const loc = await WeatherAPI.getUserLocation();
      gpsBtn.disabled = false;
      gpsBtn.innerHTML = originalText;
      
      if (map && marker) {
        map.setView([loc.lat, loc.lon], 13);
        marker.setLatLng([loc.lat, loc.lon]);
      }
      
      updateLocationDisplay(loc.lat, loc.lon);
    } catch (err) {
      gpsBtn.disabled = false;
      gpsBtn.innerHTML = originalText;
      UI.showToast(lang === 'hi' ? 'GPS स्थान विफल रहा' : lang === 'te' ? 'GPS విఫలమైంది' : 'GPS acquisition failed', 'error');
    }
  };

  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('#close-map-modal').onclick = closeModal;
  modal.querySelector('#confirm-map-location').onclick = () => {
    window.AppState.location = { lat, lon, name: selectedName };
    window.HistoryDB.saveSetting('location', window.AppState.location);
    
    const el = document.getElementById('location-status');
    if (el) el.textContent = '✅ ' + selectedName;
    
    UI.showToast(lang === 'hi' ? 'स्थान सहेजा गया' : lang === 'te' ? 'స్థానం సేవ్ చేయబడింది' : 'Location updated successfully', 'success');
    closeModal();
  };
  
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

async function testConnection() {
  UI.showToast('Testing Groq API...', 'info');
  try {
    const ok = await window.GroqAPI.testConnection();
    if (ok) UI.showToast('✅ Groq API connected!', 'success');
    else     UI.showToast('❌ API connection failed', 'error');
  } catch {
    UI.showToast('❌ Connection test failed', 'error');
  }
}

function clearHistory() {
  UI.showModal({
    title: window.i18n.t('delete_confirm'),
    message: 'All scan history and images will be permanently deleted.',
    confirmText: window.i18n.t('yes'),
    cancelText: window.i18n.t('no'),
    danger: true,
    onConfirm: () => {
      window.HistoryDB.clearAllScans();
      UI.showToast(window.i18n.t('deleted'), 'warning');
      renderSettings();
    }
  });
}

function clearChat() {
  window.HistoryDB.clearChatHistory();
  UI.showToast('Chat history cleared', 'success');
  renderSettings();
}

function saveApiKey() {
  const input = document.getElementById('groq-api-key-input');
  const key = input ? input.value.trim() : '';
  if (!key) {
    UI.showToast('❌ Please enter a valid API key', 'error');
    return;
  }
  if (!key.startsWith('gsk_')) {
    UI.showToast('⚠️ Key should start with gsk_', 'warning');
  }
  localStorage.setItem('groq_api_key', key);
  UI.showToast('✅ API Key saved successfully!', 'success');
  // Re-render to update the badge
  renderSettings();
}

function clearApiKey() {
  localStorage.removeItem('groq_api_key');
  UI.showToast('🗑️ API Key cleared', 'warning');
  renderSettings();
}

function toggleKeyVisibility() {
  const input = document.getElementById('groq-api-key-input');
  const btn = document.getElementById('toggle-key-btn');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

window.SettingsPage = { render: renderSettings, setLanguage, openLocationMap, testConnection, clearHistory, clearChat, saveApiKey, clearApiKey, toggleKeyVisibility };
