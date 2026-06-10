// =============================================
// APP.JS — SPA Router & State Management
// =============================================

// ── Global State ──────────────────────────────
window.AppState = {
  currentPage: 'home',
  language:    window.HistoryDB?.getSetting('language', 'en') || 'en',
  location:    null,
  weatherCache: null
};

// ── Router ────────────────────────────────────
const PAGES = {
  home:            { render: () => window.HomePage.render(),            label: () => window.i18n.t('nav_home'),    icon: '🏠' },
  scan:            { render: () => window.ScanPage.render(),            label: () => window.i18n.t('nav_scan'),    icon: '📷' },
  advisor:         { render: () => window.AdvisorPage.render(),         label: () => window.i18n.t('nav_advisor'), icon: '💬' },
  weather:         { render: () => window.WeatherPage.render(),         label: () => window.i18n.t('nav_weather'), icon: '🌤️' },
  recommendations: { render: () => window.RecommendationsPage.render(), label: () => 'Recs',                        icon: '📋' },
  history:         { render: () => window.HistoryPage.render(),         label: () => window.i18n.t('history_title'), icon: '🗂️' },
  settings:        { render: () => window.SettingsPage.render(),        label: () => window.i18n.t('settings_title'), icon: '⚙️' },
  about:           { render: () => window.AboutPage.render(),           label: () => 'About',                       icon: 'ℹ️' }
};

// Bottom nav items (5 visible)
const NAV_ITEMS = [
  { page: 'home',    icon: '🏠', labelKey: 'nav_home',    isScan: false },
  { page: 'scan',    icon: '📷', labelKey: 'nav_scan',    isScan: true  },
  { page: 'advisor', icon: '💬', labelKey: 'nav_advisor', isScan: false },
  { page: 'weather', icon: '🌤️', labelKey: 'nav_weather', isScan: false },
  { page: 'settings',icon: '⚙️', labelKey: 'nav_more',   isScan: false }
];

function navigate(page) {
  if (!PAGES[page]) return;
  window.AppState.currentPage = page;
  window.location.hash = '#' + page;
  PAGES[page].render();
  updateNav();
  document.getElementById('page-container')?.scrollTo(0, 0);
  updateHeader();
}

function updateNav() {
  NAV_ITEMS.forEach(item => {
    const el = document.getElementById('nav-' + item.page);
    if (el) {
      el.classList.toggle('active', window.AppState.currentPage === item.page);
    }
  });
}

function updateHeader() {
  const title = document.getElementById('header-page-title');
  if (title) {
    const page = PAGES[window.AppState.currentPage];
    const label = page?.label() || 'AgriAI';
    title.textContent = label === window.i18n.t('nav_home') ? '' : label;
  }
}

// ── Build Bottom Nav ──────────────────────────
function buildNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  nav.innerHTML = NAV_ITEMS.map(item => {
    if (item.isScan) {
      return `
        <div class="nav-item nav-scan" id="nav-${item.page}" onclick="AppRouter.navigate('${item.page}')">
          <div class="nav-icon-wrap">📷</div>
          <span class="nav-label" style="font-size:0.58rem">${window.i18n.t(item.labelKey)}</span>
        </div>
      `;
    }
    return `
      <div class="nav-item" id="nav-${item.page}" onclick="AppRouter.navigate('${item.page}')">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${window.i18n.t(item.labelKey)}</span>
      </div>
    `;
  }).join('');
}

// ── Build Header ──────────────────────────────
function buildHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;
  header.innerHTML = `
    <div class="header-logo" onclick="AppRouter.navigate('home')">
      <div class="header-logo-icon">🌱</div>
      <span class="header-logo-text">AgriAI</span>
    </div>
    <span id="header-page-title" style="font-family:var(--font-display);font-size:0.88rem;font-weight:600;color:var(--text-muted)"></span>
    <div class="header-actions">
      <div class="header-btn" onclick="AppRouter.navigate('history')" title="History">📂</div>
      <div class="header-btn" onclick="AppRouter.navigate('settings')" title="Settings">⚙️</div>
    </div>
  `;
}

// ── Hash-based routing ────────────────────────
function handleHashChange() {
  const hash = window.location.hash.replace('#', '') || 'home';
  if (PAGES[hash] && hash !== window.AppState.currentPage) {
    navigate(hash);
  }
}

// ── Init ──────────────────────────────────────
function init() {
  // Apply saved language
  const savedLang = window.HistoryDB.getSetting('language', 'en');
  window.AppState.language = savedLang;
  document.documentElement.lang = savedLang;

  // Load saved location
  window.AppState.location = window.HistoryDB.getSetting('location', null);

  buildHeader();
  buildNav();

  // Route to initial page
  const hash = window.location.hash.replace('#', '') || 'home';
  const startPage = PAGES[hash] ? hash : 'home';
  navigate(startPage);

  window.addEventListener('hashchange', handleHashChange);
}

window.AppRouter = { navigate, updateNav, updateHeader, buildNav, buildHeader };

// ── Wait for DOM & modules ────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all page scripts are loaded
  setTimeout(init, 50);
});
