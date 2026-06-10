// =============================================
// UI.JS — DOM Helpers, Toast, Modal, Utilities
// =============================================

// ── Toast Notifications ───────────────────────
let toastTimer = null;

function showToast(message, type = 'info', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  toastTimer = setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Loading Overlay ───────────────────────────
function showLoader(text = 'Processing...') {
  hideLoader();
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'global-loader';
  overlay.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-text">${text}</div>
    <div style="font-size:0.75rem;color:var(--text-dim);margin-top:4px">This may take a few seconds</div>
  `;
  document.body.appendChild(overlay);
}

function hideLoader() {
  document.getElementById('global-loader')?.remove();
}

function updateLoaderText(text) {
  const el = document.querySelector('#global-loader .loading-text');
  if (el) el.textContent = text;
}

// ── Modal ─────────────────────────────────────
function showModal({ title, message, confirmText = 'OK', cancelText = 'Cancel', onConfirm, onCancel, danger = false }) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position:fixed;inset:0;z-index:2000;
    display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);
    padding:var(--space-lg);
  `;
  modal.innerHTML = `
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-lg);
      padding:var(--space-xl);max-width:320px;width:100%;animation:scaleIn 0.25s ease;">
      <h3 style="font-family:var(--font-display);font-size:1.1rem;color:var(--text);margin-bottom:var(--space-sm)">${title}</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.6;margin-bottom:var(--space-lg)">${message}</p>
      <div style="display:flex;gap:var(--space-sm)">
        <button id="modal-cancel" class="btn btn-secondary" style="flex:1">${cancelText}</button>
        <button id="modal-confirm" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" style="flex:1">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel').onclick  = () => { modal.remove(); onCancel?.(); };
  modal.querySelector('#modal-confirm').onclick = () => { modal.remove(); onConfirm?.(); };
  modal.onclick = (e) => { if (e.target === modal) { modal.remove(); onCancel?.(); } };
}

// ── Confidence Color ──────────────────────────
function getConfidenceClass(confidence) {
  if (confidence >= 75) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

function getConfidenceColor(confidence) {
  if (confidence >= 75) return 'var(--accent)';
  if (confidence >= 50) return 'var(--warning)';
  return 'var(--danger-light)';
}

// ── Severity Badge ────────────────────────────
function getSeverityBadge(severity) {
  const map = {
    'Low':      { class: 'badge-success', icon: '🟢' },
    'Moderate': { class: 'badge-warning', icon: '🟡' },
    'High':     { class: 'badge-danger',  icon: '🔴' },
    'Critical': { class: 'badge-danger',  icon: '🚨' }
  };
  const s = map[severity] || { class: 'badge-neutral', icon: '⚪' };
  return `<span class="badge ${s.class}">${s.icon} ${severity || 'Unknown'}</span>`;
}

// ── Format Date ───────────────────────────────
function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);

  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 7)     return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Animate Number ────────────────────────────
function animateNumber(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Text to simple HTML (markdown-lite) ───────
function markdownToHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/^### (.*?)$/gm,  '<h4 style="color:var(--accent);margin:8px 0 4px">$1</h4>')
    .replace(/^## (.*?)$/gm,   '<h3 style="color:var(--accent);margin:10px 0 4px">$1</h3>')
    .replace(/^# (.*?)$/gm,    '<h3 style="color:var(--text);margin:10px 0 4px">$1</h3>')
    .replace(/^- (.*?)$/gm,    '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs,'<ul style="padding-left:16px;margin:6px 0">$1</ul>')
    .replace(/\n\n/g,          '<br><br>')
    .replace(/\n/g,            '<br>');
}

// ── Scroll to bottom ──────────────────────────
function scrollToBottom(element) {
  if (element) {
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 50);
  }
}

// ── Ripple Effect ─────────────────────────────
function addRipple(element) {
  element.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;border-radius:50%;
      width:40px;height:40px;
      left:${e.clientX - rect.left - 20}px;
      top:${e.clientY - rect.top - 20}px;
      background:rgba(255,255,255,0.2);
      animation:ripple 0.6s ease forwards;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

// ── Stagger animate children ──────────────────
function staggerAnimate(parent, childSelector = '*') {
  const children = parent.querySelectorAll(childSelector);
  children.forEach((child, i) => {
    child.style.opacity = '0';
    child.style.transform = 'translateY(16px)';
    setTimeout(() => {
      child.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      child.style.opacity = '1';
      child.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

window.UI = {
  showToast, showLoader, hideLoader, updateLoaderText,
  showModal,
  getConfidenceClass, getConfidenceColor,
  getSeverityBadge,
  formatDate,
  animateNumber,
  markdownToHtml,
  scrollToBottom,
  addRipple,
  staggerAnimate
};
