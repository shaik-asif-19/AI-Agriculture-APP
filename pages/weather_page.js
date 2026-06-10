// =============================================
// WEATHER_PAGE.JS — Detailed Weather Page
// =============================================

async function renderWeatherPage() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page page-enter">
      <div style="text-align:center;margin-bottom:var(--space-md)">
        <h2 style="font-family:var(--font-display);font-weight:800">🌤️ ${t('weather_title')}</h2>
      </div>
      <div id="weather-content">
        <div style="text-align:center;padding:var(--space-2xl) 0">
          <div class="spinner" style="margin:0 auto var(--space-md)"></div>
          <div style="font-size:0.85rem;color:var(--text-muted)">${t('weather_loading')}</div>
        </div>
      </div>
    </div>
  `;

  try {
    let lat, lon, locName;
    try {
      const loc = await WeatherAPI.getUserLocation();
      lat = loc.lat;
      lon = loc.lon;
      locName = await WeatherAPI.getLocationName(lat, lon);
      window.AppState.location = { lat, lon, name: locName };
    } catch {
      // Use stored location or default (India center)
      const stored = window.AppState.location;
      lat  = stored?.lat  || 20.5937;
      lon  = stored?.lon  || 78.9629;
      locName = stored?.name || 'India (Default)';
    }

    const lang = window.AppState.language || 'en';
    const localeMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
    const locale = localeMap[lang] || 'en-IN';

    let weatherData;
    let isCustomDate = false;
    let displayDateString = '';

    if (window.WeatherPage.selectedDate) {
      isCustomDate = true;
      weatherData = await WeatherAPI.fetchWeatherForDate(lat, lon, window.WeatherPage.selectedDate);
      const d = new Date(window.WeatherPage.selectedDate);
      displayDateString = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      weatherData = await WeatherAPI.fetchWeather(lat, lon);
      displayDateString = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });
    }

    const cur      = weatherData.current;
    const info     = WeatherAPI.getWeatherInfo(cur.weather_code);
    const alerts   = WeatherAPI.getAgriculturalGuidance(weatherData);
    const forecast = isCustomDate ? [] : WeatherAPI.formatForecast(weatherData);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 16);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    document.getElementById('weather-content').innerHTML = `
      <!-- Current Weather Hero -->
      <div class="weather-hero anim-fade-in-up" style="margin-bottom:var(--space-md)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:var(--space-sm)">
          <div>
            <div style="display:flex;align-items:baseline;gap:6px">
              <span class="weather-temp">${Math.round(cur.temperature_2m)}<span class="weather-temp-unit">°C</span></span>
              <span style="font-size:40px">${info.icon}</span>
            </div>
            <div class="weather-desc">${info.label}</div>
            <div class="weather-location">📍 ${locName}</div>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:2px">
              Feels like ${Math.round(cur.apparent_temperature)}°C
            </div>
          </div>
          <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end">
            <!-- Calendar Picker -->
            <div style="position:relative; display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); padding:5px 10px; border-radius:var(--radius-sm); margin-bottom:8px; cursor:pointer; transition:background var(--transition-fast);"
              onmouseover="this.style.background='rgba(255,255,255,0.2)'"
              onmouseout="this.style.background='rgba(255,255,255,0.12)'">
              <span style="font-size:0.7rem; color:#fff; font-weight:600; display:flex; align-items:center; gap:4px">
                📅 ${lang === 'hi' ? 'कैलेंडर' : lang === 'te' ? 'క్యాలెండర్' : 'Calendar'}
              </span>
              <input type="date" id="weather-date-picker" value="${window.WeatherPage.selectedDate || ''}" max="${maxDateStr}" min="1940-01-01"
                style="position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%" 
                onchange="window.WeatherPage.handleDateChange(this.value)">
            </div>
            <div style="font-size:0.75rem; color:rgba(255,255,255,0.5)">${displayDateString}</div>
          </div>
        </div>

        <!-- Weather Stats Grid -->
        <div class="weather-stats">
          <div class="weather-stat">
            <div class="weather-stat-icon">💧</div>
            <div class="weather-stat-value">${cur.relative_humidity_2m}%</div>
            <div class="weather-stat-label">${t('weather_humidity')}</div>
          </div>
          <div class="weather-stat">
            <div class="weather-stat-icon">💨</div>
            <div class="weather-stat-value">${Math.round(cur.wind_speed_10m)}<span style="font-size:0.6rem"> km/h</span></div>
            <div class="weather-stat-label">${t('weather_wind')}</div>
          </div>
          <div class="weather-stat">
            <div class="weather-stat-icon">☀️</div>
            <div class="weather-stat-value">${cur.uv_index || 0}</div>
            <div class="weather-stat-label">${t('weather_uv')}</div>
          </div>
          <div class="weather-stat">
            <div class="weather-stat-icon">🌡️</div>
            <div class="weather-stat-value">${Math.round(cur.apparent_temperature)}°</div>
            <div class="weather-stat-label">Feels Like</div>
          </div>
          <div class="weather-stat">
            <div class="weather-stat-icon">☁️</div>
            <div class="weather-stat-value">${cur.cloud_cover}%</div>
            <div class="weather-stat-label">Cloud Cover</div>
          </div>
          <div class="weather-stat">
            <div class="weather-stat-icon">🌧️</div>
            <div class="weather-stat-value">${(cur.precipitation || 0).toFixed(1)}<span style="font-size:0.6rem">mm</span></div>
            <div class="weather-stat-label">${t('weather_rain')}</div>
          </div>
        </div>
      </div>

      <!-- 7-Day Forecast / Custom Date Reset Banner -->
      ${isCustomDate ? `
        <div class="card anim-scale-in" style="background:var(--surface-2); border-color:var(--glass-border); display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-md); padding:12px var(--space-md);">
          <div style="display:flex; align-items:center; gap:var(--space-sm)">
            <span style="font-size:20px">📅</span>
            <div>
              <div style="font-family:var(--font-display); font-size:0.85rem; font-weight:600; color:var(--text)">
                ${lang === 'hi' ? 'कस्टम तारीख मौसम सक्रिय' : lang === 'te' ? 'కస్టమ్ తేదీ వాతావరణం క్రియాశీలకంగా ఉంది' : 'Custom Date Active'}
              </div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px">
                ${lang === 'hi' ? 'इस दिन की ऐतिहासिक / पूर्वानुमान रिपोर्ट दिखाई दे रही है।' : lang === 'te' ? 'ఈ రోజు యొక్క వాతావరణ వివరాలు చూపించబడుతున్నాయి.' : 'Showing historical/forecast report for this specific day.'}
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.WeatherPage.clearDateFilter()">
            🔄 ${lang === 'hi' ? 'आज का मौसम' : lang === 'te' ? 'నేటి వాతావరణం' : 'Reset Today'}
          </button>
        </div>
      ` : `
        <div class="section-header">
          <span class="section-title">📅 ${t('weather_forecast')}</span>
        </div>
        <div class="forecast-strip" style="margin-bottom:var(--space-md)">
          ${forecast.map((day, i) => `
            <div class="forecast-item stagger-${Math.min(i+1, 6)}">
              <div class="forecast-day">${day.day}</div>
              <div class="forecast-icon">${day.icon}</div>
              <div class="forecast-temp">${day.max}° / ${day.min}°</div>
              <div class="forecast-rain">${day.rainProb}% 🌧️</div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Agricultural Guidance -->
      <div class="section-header">
        <span class="section-title">🌾 ${t('weather_guidance')}</span>
      </div>
      <div id="ag-alerts" style="margin-bottom:var(--space-md)">
        ${alerts.map(alert => {
          const escapedTitle = alert.title.replace(/'/g, "\\'");
          return `
            <div class="ag-alert ${alert.type}" onclick="window.WeatherPage.showAlertDetail('${escapedTitle}')" 
              style="cursor:pointer;transition:transform 0.2s ease,border-color 0.2s ease;" 
              onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--accent)'" 
              onmouseout="this.style.transform='translateY(0)';this.style.borderColor=''">
              <span class="ag-alert-icon">${alert.icon}</span>
              <div style="flex:1">
                <div class="ag-alert-title" style="display:flex;align-items:center;justify-content:space-between;gap:6px">
                  <span>${alert.title}</span>
                  <span style="font-size:0.7rem;color:var(--text-dim);font-weight:normal;margin-left:auto">Tap for details ›</span>
                </div>
                <div class="ag-alert-desc">${alert.desc}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Crop Calendar Tip -->
      <div class="card card-hover" onclick="window.WeatherPage.showTwelveMonthsTips()" 
        style="background:linear-gradient(135deg,var(--surface-2),var(--surface));margin-bottom:var(--space-md);cursor:pointer;position:relative">
        <div style="display:flex;gap:var(--space-sm);align-items:flex-start">
          <span style="font-size:24px">📆</span>
          <div style="flex:1">
            <div style="font-family:var(--font-display);font-weight:600;color:var(--text);font-size:0.9rem;display:flex;align-items:center;justify-content:space-between">
              <span>Seasonal Farming Tip</span>
              <span style="font-size:0.7rem;color:var(--text-dim);font-weight:normal;margin-left:auto">View Calendar ›</span>
            </div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;line-height:1.5">
              ${getSeasonalTip()}
            </div>
          </div>
        </div>
      </div>

      <!-- Refresh -->
      <button class="btn btn-ghost btn-full" onclick="window.WeatherPage.render()">
        🔄 Refresh Weather
      </button>
    `;

    // Stagger animate
    UI.staggerAnimate(document.getElementById('ag-alerts'), '.ag-alert');

  } catch (err) {
    document.getElementById('weather-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🌡️</div>
        <div class="empty-state-title">${t('weather_error')}</div>
        <div class="empty-state-desc">${err.message}</div>
        <button class="btn btn-primary" onclick="window.WeatherPage.render()">
          📍 ${t('weather_enable')}
        </button>
      </div>
    `;
  }
}

// ── Alert Details Dictionary (Multilingual) ──
const ALERT_DETAILS = {
  en: {
    'Avoid Spraying Pesticides': {
      title: 'Avoid Spraying Pesticides',
      science: 'Expected rainwater will wash away pesticide sprays, rendering them completely ineffective and wasting effort/cost. Furthermore, runoff contaminates local soil and water sources.',
      actions: [
        'Check hourly rain forecast for the next 4-6 hours.',
        'Delay pesticide spray until weather is clear and dry.',
        'If spraying is urgent, use a rain-resistant adjuvant (sticker) to improve chemical retention.'
      ]
    },
    'Delay Irrigation': {
      title: 'Delay Irrigation',
      science: 'Sufficient rainfall is predicted. Over-irrigating before rainfall leads to waterlogging, reducing soil aeration and promoting root rot and fungal growth.',
      actions: [
        'Avoid operating irrigation pumps today to save water and energy.',
        'Allow the natural rainfall to irrigate the fields.',
        'Monitor soil moisture levels after the rain before restarting irrigation.'
      ]
    },
    'Extreme Heat — Protect Crops': {
      title: 'Extreme Heat Protection',
      science: 'Temperatures above 38°C cause severe transpiration, leading to moisture loss, wilting, leaf burn, and aborted flowers.',
      actions: [
        'Irrigate fields during early morning (4 AM - 8 AM) or late evening to reduce evaporative loss.',
        'Apply thick organic mulch (straw/leaves) around crop roots to retain soil moisture.',
        'Provide shade using green shade nets (50% or 75%) for young seedlings.'
      ]
    },
    'Heat Stress Risk': {
      title: 'Heat Stress Risk Management',
      science: 'High temperatures (34°C - 38°C) increase water consumption by crops and can trigger thermal stress, reducing photosynthesis and overall yield.',
      actions: [
        'Avoid major activities like weeding or transplanting during peak sunlight hours.',
        'Keep the soil damp through frequent, light irrigations or sprinkler use.',
        'Ensure livestock have access to shade and fresh, cool drinking water.'
      ]
    },
    'Frost Risk': {
      title: 'Frost Risk Mitigation',
      science: 'Temperatures below 8°C pose severe frost risks, especially on clear, windless nights. Freezing damages plant cells, causing tissue death.',
      actions: [
        'Apply a light irrigation in the evening; wet soil releases heat slowly overnight, warming the micro-climate.',
        'Cover valuable and young plants with plastic sheets, straw, or crop covers.',
        'Burn agricultural residue (dry grass/weeds) on the windward side of fields to create a warm smoke screen.'
      ]
    },
    'High Fungal Disease Risk': {
      title: 'Fungal Disease Risk',
      science: 'High relative humidity (>80%) creates warm, damp conditions ideal for fungal spores to germinate and spread rapidly.',
      actions: [
        'Inspect crop leaves, stems, and fruits closely for spots, powdery residue, or rust.',
        'Ensure proper pruning and spacing to allow adequate ventilation and sunlight penetration.',
        'Avoid overhead sprinkler irrigation; apply water directly to the soil root zone.'
      ]
    },
    'Strong Winds — Secure Crops': {
      title: 'Strong Wind Safety',
      science: 'Winds above 30 km/h cause physical damage (branch breaking, lodging/bending of crops) and complete drift of chemical sprays.',
      actions: [
        'Stake and support tall crops (like banana, papaya, maize, sugarcane).',
        'Strictly do not spray any pesticides or fertilizers as the wind will blow it away.',
        'Check and secure green-house covers, net-houses, and farm structures.'
      ]
    },
    'Avoid Aerial Spraying': {
      title: 'Avoid Aerial Spraying',
      science: 'Wind speeds above 20 km/h cause spray drift, carrying chemicals to nearby fields, water bodies, or homes, causing environmental damage and poor crop coverage.',
      actions: [
        'Delay aerial spraying or high-pressure mist spraying.',
        'Use ground sprayers equipped with drift-reduction/low-drift nozzles if spraying is critical.',
        'Spray only during early morning or late evening when the wind is calm (< 10 km/h).'
      ]
    },
    'High UV — Avoid Midday Work': {
      title: 'High UV Risk',
      science: 'Extreme UV index (>8) can cause severe sunburn, dehydration, heat stroke, and visual strain for farm workers.',
      actions: [
        'Schedule field labor for early morning (before 11 AM) and late afternoon (after 3 PM).',
        'Wear protective broad-brimmed hats, light-colored long sleeves, and sunglasses.',
        'Keep clean drinking water readily available and take regular breaks under shade.'
      ]
    },
    'Harvest Before Heavy Rain': {
      title: 'Pre-Rain Harvest Alert',
      science: 'Heavy rainfall can ruin mature crops, causing grains to shatter, fruits to split, or roots to rot in stagnant water.',
      actions: [
        'Harvest mature crops, especially grains (wheat, rice) and ready-to-pick vegetables, immediately.',
        'Transport harvested crops to a raised, dry, and secure storage shed.',
        'Clear field drainage channels to allow fast drainage of excessive rainwater.'
      ]
    },
    'Good Farming Conditions': {
      title: 'Good Farming Conditions',
      science: 'Optimal temperature, low wind speed, and moderate humidity represent ideal weather conditions for agricultural operations.',
      actions: [
        'Ideal time to sow new seeds or transplant seedlings.',
        'Apply fertilizers, pesticides, and foliar sprays for maximum absorption.',
        'Carry out general weeding, tilling, and pruning activities.'
      ]
    }
  },
  hi: {
    'Avoid Spraying Pesticides': {
      title: 'कीटनाशकों के छिड़काव से बचें',
      science: 'बारिश का पानी छिड़काव किए गए रसायनों को धो देता है, जिससे वे बेअसर हो जाते हैं और मेहनत/पैसा बर्बाद होता है। इसके अलावा, बहकर जाने वाला पानी मिट्टी और जल स्रोतों को प्रदूषित करता है।',
      actions: [
        'अगले 4-6 घंटों के लिए स्थानीय बारिश के पूर्वानुमान की जांच करें।',
        'मौसम साफ और सूखा होने तक कीटनाशक के छिड़काव में देरी करें।',
        'यदि छिड़काव बहुत जरूरी है, तो रसायन के चिपकने में सुधार के लिए बारिश प्रतिरोधी गोंद (स्टीकर) का उपयोग करें।'
      ]
    },
    'Delay Irrigation': {
      title: 'सिंचाई में देरी करें',
      science: 'पर्याप्त बारिश की भविष्यवाणी है। बारिश से ठीक पहले अधिक सिंचाई करने से जलभराव हो जाता है, जिससे मिट्टी की हवा बंद हो जाती है और जड़ें सड़ने लगती हैं।',
      actions: [
        'पानी और बिजली बचाने के लिए पानी के पंप न चलाएं।',
        'आज बारिश को खेतों की प्राकृतिक रूप से सिंचाई करने दें।',
        'सिंचाई दोबारा शुरू करने से पहले बारिश के बाद मिट्टी की नमी के स्तर की जांच करें।'
      ]
    },
    'Extreme Heat — Protect Crops': {
      title: 'अत्यधिक गर्मी - फसलों की सुरक्षा',
      science: '38°C से ऊपर का तापमान पौधों में अत्यधिक वाष्पीकरण का कारण बनता है, जिससे नमी की कमी, मुरझाना, पत्तियां जलना और फूल झड़ना शुरू हो जाता है।',
      actions: [
        'वाष्पीकरण को कम करने के लिए सुबह जल्दी (4 से 8 बजे) या देर शाम खेतों की सिंचाई करें।',
        'मिट्टी की नमी बनाए रखने के लिए पौधों की जड़ों के आसपास सूखी घास/पुआल (मल्च) लगाएं।',
        'छोटे पौधों/नर्सरी के लिए हरे रंग की छायादार नेट (50% या 75%) का उपयोग करके छाया प्रदान करें।'
      ]
    },
    'Heat Stress Risk': {
      title: 'गर्मी का तनाव जोखिम प्रबंधन',
      science: 'उच्च तापमान (34°C - 38°C) फसलों द्वारा पानी की खपत को बढ़ाता है और थर्मल तनाव पैदा कर सकता है, जिससे प्रकाश संश्लेषण और समग्र उपज प्रभावित होती है।',
      actions: [
        'तेज धूप के दौरान निराई या रोपाई जैसी प्रमुख गतिविधियों से बचें।',
        'हल्की सिंचाई या फव्वारे (स्प्रिंकलर) के उपयोग से मिट्टी को नम रखें।',
        'पशुओं को छायादार स्थान और पीने के लिए ताजा, ठंडा पानी उपलब्ध कराएं।'
      ]
    },
    'Frost Risk': {
      title: 'पाले के खतरे से बचाव',
      science: '8°C से कम तापमान पाले (ठंड) का गंभीर खतरा पैदा करता है, विशेष रूप से साफ, बिना हवा वाली रातों में। पाले से पौधों की कोशिकाएं जम जाती हैं और पत्तियां काली पड़कर नष्ट हो जाती हैं।',
      actions: [
        'शाम को हल्की सिंचाई करें; गीली मिट्टी रात भर धीरे-धीरे गर्मी छोड़ती है, जिससे आसपास का तापमान थोड़ा बढ़ जाता है।',
        'नाजुक और छोटे पौधों को प्लास्टिक शीट, पुआल या फसल कवर से ढकें।',
        'खेतों की हवा की दिशा में कृषि अवशेषों (सूखी घास/खरपतवार) को जलाकर धुआं करें ताकि गर्माहट बनी रहे।'
      ]
    },
    'High Fungal Disease Risk': {
      title: 'कवक (फंगल) रोग का खतरा',
      science: 'अधिक आर्द्रता (>80%) कवक के बीजाणुओं को अंकुरित होने और तेजी से फैलने के लिए अनुकूल नम वातावरण प्रदान करती है।',
      actions: [
        'फसल की पत्तियों, तनों और फलों की बारीकी से जांच करें कि कहीं धब्बे, पाउडर जैसी परत या जंग (रस्ट) तो नहीं है।',
        'हवा के बहाव और धूप के प्रवेश के लिए पौधों के बीच उचित दूरी और छंटाई सुनिश्चित करें।',
        'फव्वारा सिंचाई से बचें; पानी सीधे मिट्टी में जड़ों के पास दें।'
      ]
    },
    'Strong Winds — Secure Crops': {
      title: 'तेज हवा सुरक्षा',
      science: '30 किमी/घंटा से अधिक की हवाएं फसलों को गिरा सकती हैं, शाखाएं तोड़ सकती हैं और रसायनों के छिड़काव को पूरी तरह से उड़ा देती हैं।',
      actions: [
        'ऊंची फसलों (जैसे केला, पपीता, मक्का, गन्ना) को बांस या लकड़ी का सहारा दें।',
        'किसी भी कीटनाशक या उर्वरक का छिड़काव बिल्कुल न करें क्योंकि हवा इसे उड़ा देगी।',
        'ग्रीन-हाउस कवर, नेट-हाउस और कृषि ढांचों की जांच कर उन्हें मजबूत करें।'
      ]
    },
    'Avoid Aerial Spraying': {
      title: 'हवाई छिड़काव से बचें',
      science: '20 किमी/घंटा से अधिक की हवा की गति रसायनों को उड़कर पड़ोसी खेतों, जल निकायों या घरों तक पहुंचा देती है, जिससे पर्यावरण को नुकसान होता है और फसल पर दवा का असर नहीं होता।',
      actions: [
        'हवाई छिड़काव या उच्च दबाव वाले मिस्ट स्प्रेयर से छिड़काव टालें।',
        'यदि छिड़काव बहुत आवश्यक है, तो कम हवा वाले नोजल (लो-ड्रिफ्ट नोजल) वाले ग्राउंड स्प्रेयर का उपयोग करें।',
        'सुबह जल्दी या देर शाम को छिड़काव करें जब हवा शांत हो (< 10 किमी/घंटा)।'
      ]
    },
    'High UV — Avoid Midday Work': {
      title: 'उच्च यूवी (UV) जोखिम',
      science: 'अत्यधिक यूवी सूचकांक (>8) कृषि श्रमिकों के लिए त्वचा की गंभीर क्षति, निर्जलीकरण, हीट स्ट्रोक और आंखों में खिंचाव का कारण बन सकता है।',
      actions: [
        'खेत के काम सुबह जल्दी (11 बजे से पहले) और दोपहर बाद (3 बजे के बाद) के लिए तय करें।',
        'चौड़े किनारे वाली टोपियां, हल्के रंग की पूरी आस्तीन के कपड़े और धूप का चश्मा पहनें।',
        'पीने का साफ पानी हमेशा पास रखें और छाया में नियमित रूप से आराम लें।'
      ]
    },
    'Harvest Before Heavy Rain': {
      title: 'बारिश से पहले कटाई का अलर्ट',
      science: 'भारी बारिश पकी फसलों को बर्बाद कर सकती है, जिससे अनाज बिखर सकता है, फल फट सकते हैं या जलभराव से जड़ें सड़ सकती हैं।',
      actions: [
        'पकी फसलों, विशेष रूप से अनाज (गेहूं, धान) और तैयार सब्जियों की तुरंत कटाई करें।',
        'कटी हुई फसलों को ऊंचे, सूखे और सुरक्षित भंडारण शेड में ले जाएं।',
        'खेत में पानी जमा होने से रोकने के लिए जल निकासी नालियों को साफ करें।'
      ]
    },
    'Good Farming Conditions': {
      title: 'खेती के लिए अनुकूल परिस्थितियां',
      science: 'अनुकूल तापमान, धीमी हवा और सामान्य आर्द्रता कृषि कार्यों के लिए सबसे बेहतरीन मौसम दर्शाती है।',
      actions: [
        'नए बीज बोने या पौधों की रोपाई करने का यह सही समय है।',
        'अधिकतम असर के लिए उर्वरक, कीटनाशक और पर्णीय (फोलियर) स्प्रे का छिड़काव करें।',
        'सामान्य निराई, जुताई और छंटाई के काम पूरे करें।'
      ]
    }
  },
  te: {
    'Avoid Spraying Pesticides': {
      title: 'కీటకనాశన పిచికారీ నివారించండి',
      science: 'వర్షపు నీరు పిచికారీ చేసిన రసాయనాలను కడిగివేస్తుంది, దీనివల్ల శ్రమ, ఖర్చు వృధా అవుతాయి. అంతేకాక, రసాయనాలు కొట్టుకుపోయి నేల, నీటి వనరులను కలుషితం చేస్తాయి.',
      actions: [
        'తదుపరి 4-6 గంటల పాటు స్థానిక వర్ష సూచనను తనిఖీ చేయండి.',
        'వాతావరణం పొడిగా, ప్రశాంతంగా ఉండే వరకు పిచికారీని వాయిదా వేయండి.',
        'పిచికారీ అత్యవసరమైతే, రసాయనం ఆకులకు అంటుకోవడానికి వర్ష నిరోధక జిగురు (స్టిక్కర్) ఉపయోగించండి।'
      ]
    },
    'Delay Irrigation': {
      title: 'నీటిపారుదల వాయిదా వేయండి',
      science: 'తగినంత వర్షం పడే అవకాశం ఉంది. వర్షానికి ముందు ఎక్కువ నీరు పెడితే పొలంలో నీరు నిలిచిపోయి, వేర్లకు గాలి అందక కుళ్ళిపోతాయి.',
      actions: [
        'నీరు మరియు విద్యుత్ ఆదా చేయడానికి నీటి పంపులను ఆపండి.',
        'ఈ రోజు వర్షపు నీటితో పొలాలు సహజంగా తడిసేలా చూడండి.',
        'వర్షం పడిన తర్వాత నేలలోని తేమను తనిఖీ చేసిన పిమ్మటనే మరలా నీరు పెట్టండి।'
      ]
    },
    'Extreme Heat — Protect Crops': {
      title: 'తీవ్రమైన ఎండ - పంటల రక్షణ',
      science: '38°C కంటే ఎక్కువ ఉష్ణోగ్రత పంటల్లో నీటి ఆవిరిని పెంచుతుంది, దీనివల్ల పంటలు వాడిపోవడం, ఆకులు ఎండిపోవడం, పూత రాలడం జరుగుతుంది.',
      actions: [
        'ఆవిరిని తగ్గించడానికి తెల్లవారుజామున (ఉదయం 4 - 8 గంటల మధ్య) లేదా సాయంత్రం వేళల్లో నీరు పెట్టండి.',
        'నేల తేమను కాపాడటానికి పంట మొదళ్ల వద్ద ఎండుగడ్డి లేదా ఆకులతో మల్చింగ్ చేయండి.',
        'చిన్న మొక్కలు/నారుమళ్లకు పచ్చటి నీడ వలలు (50% లేదా 75% షేడ్ నెట్) ఉపయోగించండి।'
      ]
    },
    'Heat Stress Risk': {
      title: 'ఎండ తీవ్రత నివారణ',
      science: 'అధిక ఉష్ణోగ్రతలు (34°C - 38°C) పంటల నీటి అవసరాన్ని పెంచుతాయి మరియు కిరణజన్య సంయోగక్రియను తగ్గించి దిగుబడిని దెబ్బతీస్తాయి.',
      actions: [
        'ఎండ ఎక్కువగా ఉన్నప్పుడు కలుపు తీయడం లేదా మొక్కలు నాటడం వంటి పనులు చేయకండి.',
        'తేలికపాటి తడులు లేదా స్ప్రింక్లర్లతో నేలను ఎల్లప్పుడూ తేమగా ఉంచండి.',
        'పశువులకు నీడ మరియు చల్లటి త్రాగునీటిని అందుబాటులో ఉంచండి।'
      ]
    },
    'Frost Risk': {
      title: 'మంచు ముప్పు నివారణ',
      science: '8°C కంటే తక్కువ ఉష్ణోగ్రతలు పంటలపై మంచు ముప్పును కలిగిస్తాయి. దీనివల్ల మొక్కల కణాలు గడ్డకట్టి, ఆకులు నల్లబడి చనిపోతాయి.',
      actions: [
        'సాయంత్రం వేళ తేలికపాటి తడి ఇవ్వండి; తడి నేల రాత్రి వేళ వేడిని నిలిపి ఉంచి పంటను కాపాడుతుంది.',
        'లేత మొక్కలను ప్లాస్టిక్ షీట్లు లేదా గడ్డితో కప్పండి.',
        'పొలం చుట్టూ గాలి వచ్చే దిశలో ఎండుగడ్డి తగలబెట్టి పొగ వేయడం ద్వారా పొలాన్ని వెచ్చగా ఉంచవచ్చు।'
      ]
    },
    'High Fungal Disease Risk': {
      title: 'బూజు తెగుళ్ల ముప్పు',
      science: 'అధిక తేమ (>80%) బూజు మరియు శిలీంధ్రాల వ్యాప్తికి అత్యంత అనుకూలమైన వాతావరణాన్ని సృష్టిస్తుంది.',
      actions: [
        'పంట ఆకులు, కాండం మరియు కాయలపై మచ్చలు లేదా బూడిద రంగు పొరలను నిశితంగా గమనించండి.',
        'గాలి, వెలుతురు బాగా ప్రసరించడానికి మొక్కల మధ్య తగినంత దూరం ఉండేలా ప్రూనింగ్ చేయండి.',
        'స్ప్రింక్లర్లతో పైనుండి నీరు జల్లడం ఆపి, నేరుగా వేర్ల వద్ద నీరు పెట్టండి।'
      ]
    },
    'Strong Winds — Secure Crops': {
      title: 'ఈదురు గాలుల నుండి రక్షణ',
      science: 'గంటకు 30 కి.మీ కంటే ఎక్కువ వేగంతో వీచే గాలులు పంటలు పడిపోవడానికి, కొమ్మలు విరగడానికి మరియు మందుల పిచికారీ కొట్టుకుపోవడానికి కారణమవుతాయి.',
      actions: [
        'ఎత్తుగా పెరిగే పంటలకు (అరటి, బొప్పాయి, మొక్కజొన్న, చెరకు) కర్రలతో మద్దతు ఇవ్వండి.',
        'ఎటువంటి పిచికారీ పనులు చేయకండి, ఎందుకంటే గాలికి మందులు కొట్టుకుపోతాయి.',
        'గ్రీన్-హౌస్లు మరియు పంట పందిళ్లను గట్టిగా భద్రపరచండి।'
      ]
    },
    'Avoid Aerial Spraying': {
      title: 'గాలిలో పిచికారీ నివారించండి',
      science: 'గంటకు 20 కి.మీ కంటే ఎక్కువ వేగంతో వీచే గాలుల వల్ల పిచికారీ మందులు పక్క పొలాలకు, జలాశయాలకు లేదా ఇళ్లకు కొట్టుకుపోయి పర్యావరణ నష్టం కలిగిస్తాయి మరియు పంటకు అందవు.',
      actions: [
        'గాలిలో పిచికారీ చేయడం లేదా ఎక్కువ ఒత్తిడితో కూడిన మిస్ట్ పిచికారీని వాయిదా వేయండి.',
        'పిచికారీ తప్పనిసరైతే, లో-డ్రిఫ్ట్ నాజిళ్లు ఉన్న నేల స్ప్రేయర్లను మాత్రమే వాడండి.',
        'గాలి వేగం తక్కువగా ఉన్నప్పుడు (ఉదయం లేదా సాయంత్రం < 10 కి.మీ వేగంలో) పిచికారీ చేయండి।'
      ]
    },
    'High UV — Avoid Midday Work': {
      title: 'అధిక యూవీ (UV) ప్రభావం',
      science: 'అధిక యూవీ ఇండెక్స్ (>8) వ్యవసాయ కూలీలకు చర్మ వ్యాధులు, వడదెబ్బ, డీహైడ్రేషన్ మరియు కంటి అలసటను కలిగిస్తుంది.',
      actions: [
        'పొలం పనులను ఉదయం 11 గంటల లోపు మరియు సాయంత్రం 3 గంటల తర్వాత మాత్రమే షెడ్యూల్ చేయండి.',
        'వెడల్పాటి అంచులు ఉన్న టోపీలు, లేత రంగు పొడుగు చేతుల దుస్తులు ధరించండి.',
        'మంచినీటిని ఎల్లప్పుడూ అందుబాటులో ఉంచుకోండి, నీడలో విశ్రాంతి తీసుకోండి।'
      ]
    },
    'Harvest Before Heavy Rain': {
      title: 'భారీ వర్షానికి ముందే కోతలు',
      science: 'భారీ వర్షాల వల్ల పండిన పంటలు దెబ్బతినడం, గింజలు రాలిపోవడం లేదా నిలిచిన నీటిలో కుళ్ళిపోవడం జరుగుతుంది.',
      actions: [
        'పండిన పంటలను (వరి, గోధుమ) మరియు కోతకు సిద్ధంగా ఉన్న కూరగాయలను వెంటనే కోయండి.',
        'కోసిన పంటను ఎత్తైన, పొడిగా మరియు సురక్షيتమైన నిల్వ స్థలానికి తరలించండి.',
        'పొలంలో నీరు నిలువకుండా మురుగునీటి కాలువలను శుభ్రం చేయండి।'
      ]
    },
    'Good Farming Conditions': {
      title: 'వ్యవసాయానికి అనుకూల వాతావరణం',
      science: 'సరైన ఉష్ణోగ్రత, తక్కువ గాలి వేగం మరియు అనుకూలమైన తేమ వ్యవసాయ పనులకు అత్యంత అనువైన సమయాన్ని సూచిస్తాయి.',
      actions: [
        'కొత్త విత్తనాలు విత్తడానికి లేదా నారు నాటడానికి ఇది సరైన సమయం.',
        'ఎరువులు లేదా పిచికారీ మందులు చల్లడానికి అనుకూలం, తద్వారా పంట బాగా గ్రహిస్తుంది.',
        'సాధారణ కలుపు తీయడం మరియు పొలం దున్నడం వంటి పనులు పూర్తి చేసుకోండి।'
      ]
    }
  }
};

// ── Seasonal Tips Dictionary (Multilingual) ──
const SEASONAL_TIPS = {
  en: {
    1:  'January: Good time for harvesting Rabi crops like wheat. Start nursery for summer vegetables.',
    2:  'February: Harvest mustard and gram. Prepare fields for summer sowing.',
    3:  'March: Plant summer gourds, melons, and cucumbers. Monitor for aphids on vegetables.',
    4:  'April: Irrigate frequently in rising heat. Harvest wheat before late rains.',
    5:  'May: Prepare for Kharif season. Treat seeds before sowing. Manage heat stress.',
    6:  'June: Monsoon sowing begins — rice, maize, soybean, groundnut. Check drainage.',
    7:  'July: Peak Kharif growth stage. Apply top dressing fertilizer. Monitor pests in humid conditions.',
    8:  'August: Watch for fungal diseases in high humidity. Apply protective fungicide sprays.',
    9:  'September: Prepare Rabi fields. Harvest early Kharif crops.',
    10: 'October: Sow Rabi crops — wheat, mustard, chickpea. Optimal planting month in North India.',
    11: 'November: Wheat is in early growth stage. Irrigate 20-21 days after sowing.',
    12: 'December: Protect Rabi crops from cold and frost. Apply light irrigation on cold nights.'
  },
  hi: {
    1:  'जनवरी: गेहूं जैसी रबी फसलों की कटाई का अच्छा समय है। गर्मी की सब्जियों के लिए नर्सरी शुरू करें।',
    2:  'फरवरी: सरसों और चने की कटाई करें। गर्मी की बुवाई के लिए खेत तैयार करें।',
    3:  'मार्च: गर्मी के खरबूजे, तरबूज और खीरे लगाएं। सब्जियों पर माहू (एफिड्स) की निगरानी करें।',
    4:  'अप्रैल: बढ़ती गर्मी में बार-बार सिंचाई करें। देर से होने वाली बारिश से पहले गेहूं की कटाई करें।',
    5:  'मई: खरीफ मौसम की तैयारी करें। बुवाई से पहले बीजों का उपचार करें। गर्मी के तनाव का प्रबंधन करें।',
    6:  'जून: मानसून की बुवाई शुरू — धान, मक्का, सोयाबीन, मूंगफली। जल निकासी की जांच करें।',
    7:  'जुलाई: खरीफ की मुख्य वृद्धि का चरण। यूरिया/खाद की टॉप ड्रेसिंग करें। उमस में कीटों की निगरानी करें।',
    8:  'अगस्त: उच्च आर्द्रता में कवक (फंगल) रोगों से बचें। सुरक्षात्मक कवकनाशी स्प्रे करें।',
    9:  'सितंबर: रबी खेतों को तैयार करें। अगेती खरीफ फसलों की कटाई करें।',
    10: 'अक्टूबर: रबी फसलें बोएं — गेहूं, सरसों, चना। उत्तर भारत में बुवाई के लिए सर्वोत्तम महीना।',
    11: 'नवंबर: गेहूं शुरुआती विकास के चरण में है। बुवाई के 20-21 दिन बाद पहली सिंचाई करें।',
    12: 'दिसंबर: रबी फसलों को ठंड और पाले से बचाएं। ठंडी रातों में हल्की सिंचाई करें।'
  },
  te: {
    1:  'జనవరి: గోధుమ వంటి రబీ పంటల కోతకు మంచి సమయం. వేసవి కూరగాయల నారు మళ్లను ప్రారంభించండి.',
    2:  'ఫిబ్రవరి: ఆవాలు మరియు శనగలు కోయండి. వేసవి సాగుకు పొలాలను సిద్ధం చేయండి.',
    3:  'మార్చి: వేసవి గుమ్మడి, కర్బూజా మరియు దోసకాయలు నాటండి. కూరగాయలపై పేనుబంక తెగులును గమనించండి.',
    4:  'ఏప్రిల్: పెరుగుతున్న ఎండలలో తరచుగా నీరు పెట్టండి. వర్షాల కంటే ముందే గోధుమ కోతలు పూర్తి చేయండి.',
    5:  'మే: ఖరీఫ్ సీజన్ కోసం పొలాన్ని సిద్ధం చేయండి. విత్తన శుద్ధి చేయండి. ఎండ తీవ్రతను తట్టుకునేలా చూడండి.',
    6:  'జూన్: వర్షాకాలపు విత్తనాలు నాటడం ప్రారంభం — వరి, మొక్కజొన్న, సోయాబీన్, వేరుశనగ. మురుగునీటి కాలువలను తనిీ చేయండి.',
    7:  'జూలై: ఖరీఫ్ పంట ఎదుగుదల దశ. ఎరువుల పైపాటు వేయండి. తేమ వాతావరణంలో తెగుళ్లను గమనించండి.',
    8:  'ఆగస్టు: అధిక తేమ వల్ల వచ్చే బూజు తెగుళ్ల పట్ల జాగ్రత్త. నివారణ బూజు మందులను పిచికారీ చేయండి.',
    9:  'సెప్టెంబర్: రబీ పొలాలను సిద్ధం చేయండి. ముందస్తు ఖరీఫ్ పంటల కోత పూర్తి చేయండి.',
    10: 'అక్టోబర్: రబీ పంటలు నాటండి — గోధుమ, ఆవాలు, శనగలు. ఉత్తర భారతదేశంలో విత్తడానికి అనువైన నెల.',
    11: 'నవంబర్: గోధుమ పంట తొలి దశలో ఉంది. విత్తిన 20-21 రోజుల తర్వాత నీటి తడి ఇవ్వండి.',
    12: 'డిసెంబర్: చలి మరియు మంచు నుండి రబీ పంటలను రక్షించండి. చలి రాత్రులలో తేలికపాటి తడులు ఇవ్వండి.'
  }
};

function getSeasonalTip() {
  const lang = window.AppState?.language || 'en';
  const month = new Date().getMonth() + 1;
  const activeLang = SEASONAL_TIPS[lang] ? lang : 'en';
  return SEASONAL_TIPS[activeLang][month] || 'Monitor your crops regularly and maintain good irrigation practices.';
}

// ── Detailed Alert Modal ──
function showAlertDetail(title) {
  const lang = window.AppState?.language || 'en';
  const details = ALERT_DETAILS[lang]?.[title] || ALERT_DETAILS['en']?.[title] || {
    title: title,
    science: 'Detailed explanation for this condition is currently under review by our agronomy experts.',
    actions: ['Monitor local conditions closely.', 'Consult with local agriculture extension officers if situation degrades.']
  };

  const modal = document.createElement('div');
  modal.className = 'anim-fade-in';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 2100;
    display: flex; align-items: center; justify-content: center;
    background: rgba(10, 15, 13, 0.85); backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px); padding: var(--space-md);
  `;

  const icons = {
    'Avoid Spraying Pesticides': '🌧️',
    'Delay Irrigation': '💧',
    'Extreme Heat — Protect Crops': '🌡️',
    'Heat Stress Risk': '☀️',
    'Frost Risk': '🥶',
    'High Fungal Disease Risk': '🍄',
    'Strong Winds — Secure Crops': '💨',
    'Avoid Aerial Spraying': '💨',
    'High UV — Avoid Midday Work': '🌞',
    'Harvest Before Heavy Rain': '🌾',
    'Good Farming Conditions': '✅'
  };
  const icon = icons[title] || '🌾';

  modal.innerHTML = `
    <div class="anim-scale-in" style="background:var(--surface-2); border:1px solid var(--glass-border);
      border-radius:var(--radius-lg); padding:var(--space-lg); max-width:400px; width:100%;
      max-height:85vh; overflow-y:auto; box-shadow:var(--shadow-lg); display:flex; flex-direction:column; gap:16px;">
      
      <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--border); padding-bottom:12px">
        <span style="font-size:32px; line-height:1">${icon}</span>
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:var(--text)">
            ${details.title}
          </h3>
          <span style="font-size:0.75rem; color:var(--accent); text-transform:uppercase; letter-spacing:0.05em; font-weight:600">
            AgriAI Guidance
          </span>
        </div>
      </div>

      <div>
        <div style="font-family:var(--font-display); font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent); margin-bottom:6px">
          🔬 ${lang === 'hi' ? 'वैज्ञानिक कारण' : lang === 'te' ? 'శాస్త్రీయ వివరణ' : 'Scientific Explanation'}
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6">
          ${details.science}
        </p>
      </div>

      <div>
        <div style="font-family:var(--font-display); font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--warning); margin-bottom:8px">
          🚜 ${lang === 'hi' ? 'सिफारिश की गई कार्रवाइयां' : lang === 'te' ? 'సిఫారసు చేసిన చర్యలు' : 'Recommended Actions'}
        </div>
        <ul style="padding-left:0; margin:0; list-style:none; display:flex; flex-direction:column; gap:8px">
          ${details.actions.map(action => `
            <li style="font-size:0.82rem; color:var(--text); line-height:1.5; position:relative; padding-left:22px">
              <span style="position:absolute; left:0; color:var(--accent)">✔</span>
              ${action}
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="margin-top:8px">
        <button class="btn btn-secondary btn-full" id="close-detail-modal">
          ${lang === 'hi' ? 'बंद करें' : lang === 'te' ? 'మూసివేయి' : 'Close'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('#close-detail-modal').onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

// ── 12-Month Farming Calendar Modal ──
function showTwelveMonthsTips() {
  const lang = window.AppState?.language || 'en';
  const currentMonth = new Date().getMonth() + 1; // 1 to 12

  const monthNames = {
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    hi: [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ],
    te: [
      'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
      'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'
    ]
  };

  const activeLang = monthNames[lang] ? lang : 'en';

  const modal = document.createElement('div');
  modal.className = 'anim-fade-in';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 2100;
    display: flex; align-items: center; justify-content: center;
    background: rgba(10, 15, 13, 0.85); backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px); padding: var(--space-md);
  `;

  const tipsListHtml = Array.from({ length: 12 }, (_, i) => {
    const mNum = i + 1;
    const isCurrent = mNum === currentMonth;
    const mName = monthNames[activeLang][i];
    const tipText = SEASONAL_TIPS[activeLang][mNum];
    
    const itemStyle = isCurrent
      ? `background: linear-gradient(135deg, rgba(82,183,136,0.15) 0%, rgba(45,106,79,0.1) 100%);
         border: 1px solid var(--accent);
         box-shadow: 0 0 12px rgba(82,183,136,0.15);`
      : `background: var(--surface-3);
         border: 1px solid var(--border);`;

    return `
      <div style="${itemStyle} border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; gap:4px; transition: all 0.2s;"
        ${isCurrent ? 'id="current-month-tip-card"' : ''}>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:var(--font-display); font-size:0.85rem; font-weight:800; color:${isCurrent ? 'var(--accent)' : 'var(--text)'}">
            ${mName}
          </span>
          ${isCurrent ? `
            <span style="background:var(--accent); color:var(--text-on-accent); font-family:var(--font-display); font-size:0.6rem; font-weight:800; padding:2px 8px; border-radius:var(--radius-full); text-transform:uppercase;">
              ${lang === 'hi' ? 'चालू माह' : lang === 'te' ? 'ప్రస్తుత నెల' : 'Current Month'}
            </span>
          ` : ''}
        </div>
        <p style="font-size:0.78rem; color:${isCurrent ? 'var(--text)' : 'var(--text-muted)'}; line-height:1.45; margin:0">
          ${tipText}
        </p>
      </div>
    `;
  }).join('');

  modal.innerHTML = `
    <div class="anim-scale-in" style="background:var(--surface-2); border:1px solid var(--glass-border);
      border-radius:var(--radius-lg); padding:var(--space-lg); max-width:440px; width:100%;
      max-height:85vh; display:flex; flex-direction:column; gap:16px; box-shadow:var(--shadow-lg);">
      
      <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--border); padding-bottom:12px">
        <span style="font-size:32px; line-height:1">📆</span>
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:var(--text)">
            ${lang === 'hi' ? '12-महीने का कृषि कैलेंडर' : lang === 'te' ? '12 నెలల వ్యవసాయ క్యాలెండర్' : '12-Month Crop Calendar'}
          </h3>
          <span style="font-size:0.75rem; color:var(--accent); text-transform:uppercase; letter-spacing:0.05em; font-weight:600">
            ${lang === 'hi' ? 'वार्षिक मौसमी सुझाव' : lang === 'te' ? 'వార్షిక కాలాల సూచనలు' : 'Annual Seasonal Guidelines'}
          </span>
        </div>
      </div>

      <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:4px;" id="tips-scroll-container">
        ${tipsListHtml}
      </div>

      <div style="margin-top:8px">
        <button class="btn btn-secondary btn-full" id="close-calendar-modal">
          ${lang === 'hi' ? 'बंद करें' : lang === 'te' ? 'మూసివేయి' : 'Close'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Scroll current month into view
  setTimeout(() => {
    const activeCard = document.getElementById('current-month-tip-card');
    const scrollContainer = document.getElementById('tips-scroll-container');
    if (activeCard && scrollContainer) {
      const topPos = activeCard.offsetTop - scrollContainer.offsetTop - 8;
      scrollContainer.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  }, 100);

  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('#close-calendar-modal').onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

window.WeatherPage = {
  render: renderWeatherPage,
  showAlertDetail: showAlertDetail,
  showTwelveMonthsTips: showTwelveMonthsTips
};
