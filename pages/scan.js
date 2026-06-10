// =============================================
// SCAN.JS — Image Scan & AI Analysis Page
// =============================================

let currentImage = null;
let currentResult = null;

function renderScan() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page page-enter">
      <div style="text-align:center;margin-bottom:var(--space-lg)">
        <h2 style="font-family:var(--font-display);font-weight:800">📷 ${t('scan_title')}</h2>
        <p style="font-size:0.83rem;color:var(--text-muted);margin-top:4px">${t('scan_subtitle')}</p>
      </div>

      <!-- Image Zone -->
      <div id="scan-zone-wrap" style="margin-bottom:var(--space-md)">
        <div id="scan-drop-zone" class="scan-zone" onclick="document.getElementById('scan-zone').click()">
          <div class="scan-corner tl"></div>
          <div class="scan-corner tr"></div>
          <div class="scan-corner bl"></div>
          <div class="scan-corner br"></div>
          <span style="font-size:48px">🌿</span>
          <div style="text-align:center">
            <div style="font-family:var(--font-display);font-weight:600;color:var(--text)">${t('scan_tap')}</div>
            <div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px">Crop disease • Pest • Leaf damage</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div id="scan-action-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);margin-bottom:var(--space-md)">
        <button class="btn btn-secondary" onclick="window.ScanPage.pickGallery()">
          🖼️ ${t('scan_gallery')}
        </button>
        <button class="btn btn-primary" onclick="window.ScanPage.openCamera()">
          📷 ${t('scan_camera')}
        </button>
      </div>

      <!-- Result will render here -->
      <div id="scan-result-area"></div>

      <!-- Disclaimer -->
      <div class="expert-disclaimer" style="margin-top:var(--space-md)">
        ⚠️ ${t('scan_disclaimer')}
      </div>
    </div>
  `;

  // Init drop zone
  const dropZone = document.getElementById('scan-drop-zone');
  if (dropZone) {
    window.CameraUtil.initDropZone(dropZone, (img) => {
      handleImageSelected(img);
    });
  }
}

function openCamera() {
  window.CameraUtil.openCamera((img) => handleImageSelected(img));
}

function pickGallery() {
  window.CameraUtil.openFilePicker((img) => handleImageSelected(img));
}

function handleImageSelected(img) {
  currentImage = img;
  currentResult = null;

  const zone = document.getElementById('scan-zone-wrap');
  if (!zone) return;

  zone.innerHTML = `
    <div class="img-preview-wrap" style="margin-bottom:var(--space-sm)">
      <img src="${img.compressedUrl}" alt="Crop image" id="preview-img">
      <div class="scan-overlay"></div>
      <div class="scan-corner tl"></div>
      <div class="scan-corner tr"></div>
      <div class="scan-corner bl"></div>
      <div class="scan-corner br"></div>
      <div class="img-preview-clear" onclick="window.ScanPage.clearImage()">✕</div>
    </div>
  `;

  const resultArea = document.getElementById('scan-result-area');
  if (resultArea) {
    resultArea.innerHTML = `
      <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md)">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.ScanPage.clearImage()">✕ Clear</button>
        <button class="btn btn-primary" style="flex:2" onclick="window.ScanPage.analyzeNow()" id="analyze-btn">
          🔬 Analyze Crop
        </button>
      </div>
    `;
  }
}

async function analyzeNow() {
  if (!currentImage) return;

  UI.showLoader(window.i18n.t('scan_analyzing'));

  const messages = [
    'Uploading image...',
    'AI is examining the image...',
    'Detecting disease patterns...',
    'Generating recommendations...'
  ];
  let msgIdx = 0;
  const loaderInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length;
    UI.updateLoaderText(messages[msgIdx]);
  }, 1800);

  try {
    const result = await window.GroqAPI.analyzeImage(currentImage.base64, currentImage.mimeType);
    clearInterval(loaderInterval);
    UI.hideLoader();
    currentResult = result;
    renderResult(result);
  } catch (err) {
    clearInterval(loaderInterval);
    UI.hideLoader();
    UI.showToast('Analysis failed: ' + err.message, 'error', 5000);
    console.error('Scan error:', err);
  }
}

function renderResult(result) {
  const { t } = window.i18n;
  const resultArea = document.getElementById('scan-result-area');
  if (!resultArea) return;

  const conf = result.confidence || 0;
  const confClass = UI.getConfidenceClass(conf);
  const confColor = UI.getConfidenceColor(conf);

  // Low confidence warning
  const lowConfWarning = conf < 60 ? `
    <div class="ag-alert warning" style="margin-bottom:var(--space-md)">
      <span class="ag-alert-icon">⚠️</span>
      <div>
        <div class="ag-alert-title">Low Confidence Detection</div>
        <div class="ag-alert-desc">AI confidence is below 60%. Take a clearer photo or consult an expert for accurate diagnosis.</div>
      </div>
    </div>
  ` : '';

  resultArea.innerHTML = `
    ${lowConfWarning}
    <div class="result-card anim-scale-in" style="margin-bottom:var(--space-md)">
      <!-- Header -->
      <div class="result-header">
        <div class="result-icon">🦠</div>
        <div>
          <div class="result-title">${result.prediction || 'Analysis Complete'}</div>
          <div class="result-subtitle">
            ${result.crop_type ? `🌱 ${result.crop_type}` : ''}
            ${result.treatment_urgency ? ` · ⏱️ ${result.treatment_urgency}` : ''}
          </div>
        </div>
        <div style="margin-left:auto">${UI.getSeverityBadge(result.severity)}</div>
      </div>

      <div class="result-body">
        <!-- Confidence -->
        <div class="result-row">
          <div class="result-row-label">🎯 ${t('scan_confidence')}</div>
          <div class="confidence-bar-wrap" style="margin-top:6px">
            <div class="confidence-bar-header">
              <span class="confidence-label">${conf < 60 ? '⚠️ Low confidence' : conf < 80 ? 'Moderate confidence' : 'High confidence'}</span>
              <span class="confidence-value" style="color:${confColor}">${conf}%</span>
            </div>
            <div class="confidence-bar">
              <div class="confidence-fill ${confClass}" id="conf-bar" style="width:0%"></div>
            </div>
          </div>
        </div>

        <!-- Reasoning -->
        <div class="result-row">
          <div class="result-row-label">🧠 ${t('scan_reasoning')}</div>
          <div class="result-row-value">${result.reasoning || 'Visual analysis performed.'}</div>
        </div>

        <!-- Recommended Action -->
        <div class="result-row">
          <div class="result-row-label">✅ ${t('scan_action')}</div>
          <div class="result-row-value" style="color:var(--accent)">${result.recommended_action || 'See recommendations below.'}</div>
        </div>

        <!-- Prevention -->
        <div class="result-row">
          <div class="result-row-label">🛡️ ${t('scan_prevention')}</div>
          <div class="result-row-value">${result.prevention || 'Monitor crop regularly.'}</div>
        </div>

        <!-- Alternatives -->
        ${result.alternatives && result.alternatives.length > 0 ? `
        <div class="result-row">
          <div class="result-row-label">🔀 ${t('scan_alternatives')}</div>
          <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">
            ${result.alternatives.map(a => `<span class="badge badge-neutral">• ${a}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Expert Warning -->
        <div class="expert-warning">
          <span class="expert-warning-icon">👨‍🔬</span>
          <div class="expert-warning-text">
            <strong>Expert Advice: </strong>${result.expert_warning || 'Consult an agricultural expert if the condition worsens or spreads to more than 30% of your crop.'}
          </div>
        </div>
      </div>
    </div>

    <!-- Save & New buttons -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm)">
      <button class="btn btn-secondary" onclick="window.ScanPage.clearImage()">📷 ${t('scan_new')}</button>
      <button class="btn btn-primary" onclick="window.ScanPage.saveResult()" id="save-btn">💾 ${t('scan_save')}</button>
    </div>
  `;

  // Animate confidence bar
  setTimeout(() => {
    const bar = document.getElementById('conf-bar');
    if (bar) bar.style.width = conf + '%';
  }, 300);
}

function saveResult() {
  if (!currentResult || !currentImage) return;
  window.HistoryDB.saveScan({
    imageData: currentImage.thumbnailUrl,
    result: currentResult
  });
  UI.showToast('✅ ' + window.i18n.t('saved'), 'success');
  const btn = document.getElementById('save-btn');
  if (btn) {
    btn.textContent = '✅ Saved!';
    btn.disabled = true;
  }
}

function clearImage() {
  currentImage = null;
  currentResult = null;
  renderScan();
}

function showSavedResult(id) {
  const scan = window.HistoryDB.getScanById(id);
  if (!scan) return;

  currentResult = scan.result;
  if (scan.imageData) {
    currentImage = { thumbnailUrl: scan.imageData, compressedUrl: scan.imageData };
  }

  window.AppRouter.navigate('scan');

  // Wait for render
  setTimeout(() => {
    if (scan.imageData) {
      const zone = document.getElementById('scan-zone-wrap');
      if (zone) {
        zone.innerHTML = `
          <div class="img-preview-wrap" style="margin-bottom:var(--space-sm)">
            <img src="${scan.imageData}" alt="scan">
            <div class="scan-overlay"></div>
          </div>
        `;
      }
    }
    renderResult(scan.result);
    const resultArea = document.getElementById('scan-result-area');
    // Remove analyze button
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) analyzeBtn.remove();
  }, 100);
}

window.ScanPage = { render: renderScan, openCamera, pickGallery, analyzeNow, saveResult, clearImage, showSavedResult };
