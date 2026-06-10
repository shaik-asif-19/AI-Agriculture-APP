// =============================================
// RECOMMENDATIONS.JS — Saved Recommendations
// =============================================

function renderRecommendations() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');
  let filter = 'all';

  function getFiltered() {
    const scans = window.HistoryDB.getScans();
    if (filter === 'all') return scans;
    const map = { high: ['High', 'Critical'], mod: ['Moderate'], low: ['Low'] };
    return scans.filter(s => (map[filter] || []).includes(s.result?.severity));
  }

  function renderList() {
    const items = getFiltered();
    const list = document.getElementById('rec-list');
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">${filter === 'all' ? t('rec_empty') : 'No ' + filter + ' severity items'}</div>
          <div class="empty-state-desc">${filter === 'all' ? t('rec_empty_sub') : 'Try a different filter'}</div>
          ${filter === 'all' ? `<button class="btn btn-primary btn-sm" onclick="window.AppRouter.navigate('scan')">📷 Scan Crop</button>` : ''}
        </div>
      `;
      return;
    }

    list.innerHTML = items.map((scan, i) => {
      const r = scan.result || {};
      const conf = r.confidence || 0;
      const confColor = UI.getConfidenceColor(conf);

      return `
        <div class="card card-hover" style="margin-bottom:var(--space-sm);cursor:pointer;opacity:0;transform:translateY(12px)"
          onclick="window.ScanPage.showSavedResult('${scan.id}')"
          data-index="${i}">

          <!-- Header -->
          <div style="display:flex;align-items:flex-start;gap:var(--space-sm);margin-bottom:var(--space-sm)">
            <div style="width:48px;height:48px;border-radius:var(--radius-sm);overflow:hidden;flex-shrink:0;background:var(--surface-3);display:flex;align-items:center;justify-content:center">
              ${scan.imageData
                ? `<img src="${scan.imageData}" style="width:100%;height:100%;object-fit:cover">`
                : '<span style="font-size:24px">🌿</span>'
              }
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:0.92rem;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${r.prediction || 'Unknown Disease'}
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap">
                ${UI.getSeverityBadge(r.severity)}
                <span style="font-size:0.7rem;color:var(--text-dim)">${UI.formatDate(scan.timestamp)}</span>
              </div>
            </div>
            <div style="font-family:var(--font-display);font-size:1rem;font-weight:800;color:${confColor}">
              ${conf}%
            </div>
          </div>

          <!-- Confidence bar -->
          <div class="confidence-bar" style="margin-bottom:var(--space-sm)">
            <div class="confidence-fill ${UI.getConfidenceClass(conf)}"
              style="width:${conf}%;transition:width 0.8s cubic-bezier(0.4,0,0.2,1)"></div>
          </div>

          <!-- Recommendation snippet -->
          <div style="font-size:0.8rem;color:var(--text-muted);line-height:1.5;
            display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
            ✅ ${r.recommended_action || 'View full recommendation →'}
          </div>

          ${r.crop_type ? `
          <div style="margin-top:var(--space-sm)">
            <span class="badge badge-info">🌱 ${r.crop_type}</span>
          </div>` : ''}
        </div>
      `;
    }).join('');

    // Stagger animate
    requestAnimationFrame(() => {
      list.querySelectorAll('.card').forEach((card, i) => {
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 80);
      });
    });
  }

  container.innerHTML = `
    <div class="page page-enter">
      <div style="text-align:center;margin-bottom:var(--space-md)">
        <h2 style="font-family:var(--font-display);font-weight:800">📋 ${t('rec_title')}</h2>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
          ${window.HistoryDB.getScans().length} saved analyses
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="pill-tabs" style="margin-bottom:var(--space-md)" id="filter-tabs">
        <div class="pill-tab active" onclick="window.RecommendationsPage.setFilter('all', this)">
          ${t('rec_filter_all')} (${window.HistoryDB.getScans().length})
        </div>
        <div class="pill-tab" onclick="window.RecommendationsPage.setFilter('high', this)">
          🔴 ${t('rec_filter_high')}
        </div>
        <div class="pill-tab" onclick="window.RecommendationsPage.setFilter('mod', this)">
          🟡 ${t('rec_filter_mod')}
        </div>
        <div class="pill-tab" onclick="window.RecommendationsPage.setFilter('low', this)">
          🟢 ${t('rec_filter_low')}
        </div>
      </div>

      <!-- List -->
      <div id="rec-list"></div>
    </div>
  `;

  renderList();

  window.RecommendationsPage._renderList = renderList;
  window.RecommendationsPage._getFilter = () => filter;
  window.RecommendationsPage.setFilter = (f, tab) => {
    filter = f;
    document.querySelectorAll('#filter-tabs .pill-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderList();
  };
}

window.RecommendationsPage = { render: renderRecommendations };
