// =============================================
// HISTORY_PAGE.JS — Scan History Page
// =============================================

function renderHistoryPage() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');
  const scans = window.HistoryDB.getScans();

  container.innerHTML = `
    <div class="page page-enter">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md)">
        <h2 style="font-family:var(--font-display);font-weight:800">🗂️ ${t('history_title')}</h2>
        ${scans.length > 0 ? `
          <button class="btn btn-ghost btn-sm" onclick="window.HistoryPage.clearAll()" style="color:var(--danger-light);border-color:rgba(230,57,70,0.3)">
            🗑️ Clear All
          </button>
        ` : ''}
      </div>

      <div id="history-list">
        ${scans.length === 0
          ? `<div class="empty-state">
              <div class="empty-state-icon">📂</div>
              <div class="empty-state-title">${t('history_empty')}</div>
              <div class="empty-state-desc">${t('history_empty_sub')}</div>
              <button class="btn btn-primary btn-sm" onclick="window.AppRouter.navigate('scan')">📷 Scan Crop</button>
            </div>`
          : scans.map((scan, i) => renderScanCard(scan, i)).join('')
        }
      </div>
    </div>
  `;

  // Stagger animate
  UI.staggerAnimate(document.getElementById('history-list'), '.history-item, .history-card');
}

function renderScanCard(scan, index) {
  const r = scan.result || {};
  const confColor = UI.getConfidenceColor(r.confidence || 0);
  const date = new Date(scan.timestamp);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return `
    <div class="card history-card" style="margin-bottom:var(--space-sm);opacity:0;transform:translateY(12px)">
      <div style="display:flex;gap:var(--space-sm);align-items:center">
        <!-- Thumbnail -->
        <div style="width:64px;height:64px;border-radius:var(--radius-sm);overflow:hidden;flex-shrink:0;
          background:var(--surface-3);display:flex;align-items:center;justify-content:center;border:1px solid var(--border)">
          ${scan.imageData
            ? `<img src="${scan.imageData}" style="width:100%;height:100%;object-fit:cover" alt="crop">`
            : '<span style="font-size:28px">🌿</span>'
          }
        </div>

        <!-- Info -->
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:0.9rem;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px">
            ${r.prediction || 'Unknown'}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            ${UI.getSeverityBadge(r.severity)}
            <span style="font-family:var(--font-display);font-size:0.78rem;font-weight:700;color:${confColor}">${r.confidence || 0}%</span>
          </div>
          <div style="font-size:0.7rem;color:var(--text-dim)">📅 ${dateStr}</div>
        </div>

        <!-- Actions -->
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
          <button class="btn btn-sm btn-ghost" style="padding:6px 10px"
            onclick="window.ScanPage.showSavedResult('${scan.id}')">
            👁️
          </button>
          <button class="btn btn-sm" style="padding:6px 10px;background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.3);color:var(--danger-light)"
            onclick="window.HistoryPage.deleteScan('${scan.id}', this)">
            🗑️
          </button>
        </div>
      </div>

      <!-- Preview of recommendation -->
      ${r.recommended_action ? `
      <div style="margin-top:var(--space-sm);padding-top:var(--space-sm);border-top:1px solid var(--border)">
        <div style="font-size:0.76rem;color:var(--text-muted);line-height:1.5;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          ✅ ${r.recommended_action}
        </div>
      </div>` : ''}
    </div>
  `;
}

function deleteScan(id, btn) {
  UI.showModal({
    title: 'Delete Scan',
    message: 'Remove this scan from history?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    danger: true,
    onConfirm: () => {
      window.HistoryDB.deleteScan(id);
      renderHistoryPage();
      UI.showToast('Scan deleted', 'warning');
    }
  });
}

function clearAll() {
  UI.showModal({
    title: window.i18n.t('delete_confirm'),
    message: 'This will permanently remove all your scan history.',
    confirmText: window.i18n.t('yes'),
    cancelText: window.i18n.t('no'),
    danger: true,
    onConfirm: () => {
      window.HistoryDB.clearAllScans();
      renderHistoryPage();
      UI.showToast(window.i18n.t('deleted'), 'warning');
    }
  });
}

window.HistoryPage = { render: renderHistoryPage, deleteScan, clearAll };
