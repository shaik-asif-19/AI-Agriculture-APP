// =============================================
// ABOUT.JS — AI Models & Technology Explanation
// =============================================

function renderAbout() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page page-enter">
      <!-- Hero -->
      <div style="text-align:center;padding:var(--space-lg) 0;margin-bottom:var(--space-md)">
        <div style="font-size:56px;margin-bottom:var(--space-sm);animation:float 3s ease-in-out infinite">🌾</div>
        <h2 style="font-family:var(--font-display);font-weight:800;font-size:1.5rem;
          background:linear-gradient(135deg,var(--accent-light),#95d5b2);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
          ${t('about_title')}
        </h2>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;max-width:300px;margin-left:auto;margin-right:auto;line-height:1.6">
          ${t('about_desc')}
        </p>
      </div>

      <!-- AI Models -->
      <div class="section-header">
        <span class="section-title">🤖 ${t('about_models')}</span>
      </div>

      <div class="model-card stagger-1" style="margin-bottom:var(--space-sm)">
        <div class="model-icon" style="background:rgba(82,183,136,0.12);border:1px solid rgba(82,183,136,0.2)">🦙</div>
        <div>
          <div class="model-name">LLaMA 4 Scout 17B Vision</div>
          <div style="display:flex;gap:4px;margin:4px 0">
            <span class="badge badge-success">Image Analysis</span>
            <span class="badge badge-info">Vision AI</span>
          </div>
          <div class="model-desc">
            Meta's LLaMA 4 Scout model with 17B parameters and multi-modal vision capabilities.
            Used for analyzing crop images, detecting diseases, pests, and plant health issues.
            Processes visual patterns to identify leaf spots, fungal infections, and pest damage.
          </div>
        </div>
      </div>

      <div class="model-card stagger-2" style="margin-bottom:var(--space-sm)">
        <div class="model-icon" style="background:rgba(76,201,240,0.12);border:1px solid rgba(76,201,240,0.2)">🧠</div>
        <div>
          <div class="model-name">LLaMA 3.3 70B Versatile</div>
          <div style="display:flex;gap:4px;margin:4px 0">
            <span class="badge badge-info">Advisory Chat</span>
            <span class="badge badge-neutral">Agriculture AI</span>
          </div>
          <div class="model-desc">
            Meta's LLaMA 3.3 70B large language model, specialized for agricultural advisory.
            Provides detailed farming guidance, fertilizer recommendations, pest management strategies,
            and answers complex farming questions with regional Indian farming knowledge.
          </div>
        </div>
      </div>

      <div class="model-card stagger-3" style="margin-bottom:var(--space-md)">
        <div class="model-icon" style="background:rgba(244,162,97,0.12);border:1px solid rgba(244,162,97,0.2)">🚀</div>
        <div>
          <div class="model-name">Groq AI Inference Platform</div>
          <div style="display:flex;gap:4px;margin:4px 0">
            <span class="badge badge-warning">Ultra-Fast</span>
            <span class="badge badge-neutral">LPU™ Powered</span>
          </div>
          <div class="model-desc">
            Groq's Language Processing Unit (LPU™) delivers industry-leading inference speeds —
            up to 500+ tokens/second. This ensures real-time AI analysis without long waiting times,
            critical for field farmers who need quick results.
          </div>
        </div>
      </div>

      <!-- APIs & Services -->
      <div class="section-header">
        <span class="section-title">🌐 ${t('about_apis')}</span>
      </div>

      <div class="model-card stagger-4" style="margin-bottom:var(--space-sm)">
        <div class="model-icon" style="background:rgba(76,201,240,0.12);border:1px solid rgba(76,201,240,0.2)">🌤️</div>
        <div>
          <div class="model-name">Open-Meteo Weather API</div>
          <div style="display:flex;gap:4px;margin:4px 0">
            <span class="badge badge-success">Free · No Key</span>
          </div>
          <div class="model-desc">
            Open-source weather API providing hyperlocal forecasts using GPS coordinates.
            Delivers temperature, humidity, wind speed, UV index, precipitation probability, and
            7-day forecasts to generate agriculture-specific farming guidance.
          </div>
        </div>
      </div>

      <div class="model-card stagger-5" style="margin-bottom:var(--space-md)">
        <div class="model-icon" style="background:rgba(150,100,230,0.12);border:1px solid rgba(150,100,230,0.2)">📍</div>
        <div>
          <div class="model-name">OpenStreetMap Nominatim</div>
          <div style="display:flex;gap:4px;margin:4px 0">
            <span class="badge badge-success">Free</span>
          </div>
          <div class="model-desc">
            Used for reverse geocoding GPS coordinates into human-readable location names
            (village, town, district) to display personalized local weather information.
          </div>
        </div>
      </div>

      <!-- How AI Works -->
      <div class="section-header">
        <span class="section-title">⚙️ How It Works</span>
      </div>

      <div class="card" style="margin-bottom:var(--space-md)">
        ${[
          { step: '1', icon: '📷', title: 'Capture Image', desc: 'User takes a photo or uploads a crop image from their device.' },
          { step: '2', icon: '🗜️', title: 'Image Processing', desc: 'Image is compressed locally on device to optimize API transmission.' },
          { step: '3', icon: '🤖', title: 'AI Vision Analysis', desc: 'LLaMA 4 Scout analyzes visual patterns — leaf spots, fungal growth, pest damage, color changes.' },
          { step: '4', icon: '📊', title: 'Structured Results', desc: 'AI returns prediction, confidence %, severity, reasoning, and actionable recommendations.' },
          { step: '5', icon: '💾', title: 'Local Storage', desc: 'Results are saved on your device only — no external database.' }
        ].map(item => `
          <div style="display:flex;gap:var(--space-md);align-items:flex-start;margin-bottom:var(--space-md)">
            <div style="width:36px;height:36px;background:var(--accent-glow);border:1px solid var(--glass-border);
              border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;
              font-family:var(--font-display);font-weight:800;color:var(--accent);flex-shrink:0">
              ${item.step}
            </div>
            <div>
              <div style="font-family:var(--font-display);font-weight:600;color:var(--text);font-size:0.88rem">
                ${item.icon} ${item.title}
              </div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;line-height:1.5">${item.desc}</div>
            </div>
          </div>
        `).join('<div style="height:1px;background:var(--border);margin-bottom:var(--space-md)"></div>')}
      </div>

      <!-- Privacy -->
      <div class="section-header">
        <span class="section-title">🔒 ${t('about_privacy')}</span>
      </div>

      <div class="ag-alert info" style="margin-bottom:var(--space-sm)">
        <span class="ag-alert-icon">🔒</span>
        <div>
          <div class="ag-alert-title">Your Data is Safe</div>
          <div class="ag-alert-desc">${t('about_privacy_text')}</div>
        </div>
      </div>

      <div class="ag-alert warning" style="margin-bottom:var(--space-md)">
        <span class="ag-alert-icon">⚠️</span>
        <div>
          <div class="ag-alert-title">AI Disclaimer</div>
          <div class="ag-alert-desc">
            AgriAI provides AI-generated recommendations for informational purposes.
            Always verify severe diagnoses with a certified agricultural expert or your local
            Krishi Vigyan Kendra (KVK) before applying chemical treatments.
          </div>
        </div>
      </div>

      <!-- XAI — Explainable AI -->
      <div class="section-header">
        <span class="section-title">🧪 Explainable AI (XAI)</span>
      </div>
      <div class="card" style="margin-bottom:var(--space-md)">
        <p style="font-size:0.83rem;color:var(--text-muted);line-height:1.6">
          AgriAI follows Explainable AI (XAI) principles. Every prediction includes:
        </p>
        <ul style="margin-top:var(--space-sm);padding-left:var(--space-md)">
          ${[
            '🎯 <strong>Confidence Score</strong> — How certain the AI is (0-100%)',
            '🧠 <strong>Reasoning</strong> — What visual symptoms led to the diagnosis',
            '⚠️ <strong>Alternatives</strong> — Other possible diagnoses considered',
            '🛡️ <strong>Prevention</strong> — How to stop recurrence',
            '👨‍🔬 <strong>Expert Trigger</strong> — When to seek professional help',
            '🚨 <strong>Safety Warnings</strong> — Chemical handling cautions'
          ].map(item => `<li style="font-size:0.82rem;color:var(--text-muted);margin:6px 0;line-height:1.5">${item}</li>`).join('')}
        </ul>
      </div>

      <!-- Credits -->
      <div class="card" style="text-align:center;padding:var(--space-lg);margin-bottom:var(--space-md)">
        <div style="font-size:0.8rem;color:var(--text-dim);line-height:1.8">
          Built for Indian Farmers 🇮🇳<br>
          Powered by Groq AI + Open-Meteo<br>
          <strong style="color:var(--accent)">AgriAI v1.0</strong> — AI Agriculture Intelligence<br>
          🌱 Improving agricultural productivity through AI
        </div>
      </div>
    </div>
  `;

  UI.staggerAnimate(container, '.model-card');
}

window.AboutPage = { render: renderAbout };
