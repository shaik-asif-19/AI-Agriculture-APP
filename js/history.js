// =============================================
// HISTORY.JS — LocalStorage Data Persistence
// =============================================

const KEYS = {
  scans:    'agriai_scans',
  settings: 'agriai_settings',
  chat:     'agriai_chat'
};

// ── Scan History ──────────────────────────────
function getScans() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.scans) || '[]');
  } catch { return []; }
}

function saveScan(scanData) {
  const scans = getScans();
  const entry = {
    id:        Date.now().toString(),
    timestamp: new Date().toISOString(),
    imageData: scanData.imageData || null,   // base64 thumbnail
    result:    scanData.result,
    location:  scanData.location || null
  };
  scans.unshift(entry);
  // Keep last 50 scans
  if (scans.length > 50) scans.splice(50);
  try {
    localStorage.setItem(KEYS.scans, JSON.stringify(scans));
  } catch (e) {
    // Storage full — remove oldest, try again
    scans.splice(30);
    localStorage.setItem(KEYS.scans, JSON.stringify(scans));
  }
  return entry;
}

function getScanById(id) {
  return getScans().find(s => s.id === id) || null;
}

function deleteScan(id) {
  const scans = getScans().filter(s => s.id !== id);
  localStorage.setItem(KEYS.scans, JSON.stringify(scans));
}

function clearAllScans() {
  localStorage.removeItem(KEYS.scans);
}

// ── Settings ──────────────────────────────────
function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.settings) || '{}');
  } catch { return {}; }
}

function saveSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  localStorage.setItem(KEYS.settings, JSON.stringify(s));
}

function getSetting(key, defaultValue = null) {
  return getSettings()[key] ?? defaultValue;
}

// ── Chat History ──────────────────────────────
function getChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.chat) || '[]');
  } catch { return []; }
}

function saveChatMessage(role, content) {
  const history = getChatHistory();
  history.push({ role, content, timestamp: Date.now() });
  // Keep last 100 messages
  if (history.length > 100) history.splice(0, history.length - 100);
  try {
    localStorage.setItem(KEYS.chat, JSON.stringify(history));
  } catch { /* ignore */ }
}

function clearChatHistory() {
  localStorage.removeItem(KEYS.chat);
}

// ── Stats ─────────────────────────────────────
function getStats() {
  const scans = getScans();
  const high = scans.filter(s => ['High','Critical'].includes(s.result?.severity)).length;
  return {
    totalScans: scans.length,
    highSeverity: high,
    lastScan: scans[0]?.timestamp || null
  };
}

window.HistoryDB = {
  getScans, saveScan, getScanById, deleteScan, clearAllScans,
  getSettings, saveSetting, getSetting,
  getChatHistory, saveChatMessage, clearChatHistory,
  getStats
};
