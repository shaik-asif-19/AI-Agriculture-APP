// =============================================
// GROQ.JS — Groq API Integration
// =============================================

// API Key is stored securely in browser localStorage.
// Users must enter their Groq API key in the Settings page of the app.
// Reads fresh from localStorage on every call so saving the key takes effect immediately.
const getApiKey = () => localStorage.getItem('groq_api_key') || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Models
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'; // supports vision
const CHAT_MODEL   = 'llama-3.3-70b-versatile';

// ── Agriculture System Prompts ────────────────
const SYSTEM_PROMPT_VISION = `You are an expert AI agriculture analyst and plant pathologist. 
Analyze the provided crop/plant image and return a structured JSON response.

Your JSON must have EXACTLY these fields:
{
  "prediction": "Name of disease, pest, or health condition",
  "confidence": 87,
  "severity": "Low|Moderate|High|Critical",
  "reasoning": "Detailed explanation of visual symptoms observed",
  "recommended_action": "Immediate steps the farmer should take",
  "prevention": "Preventive measures to avoid recurrence",
  "expert_warning": "When the farmer should consult an agricultural expert",
  "alternatives": ["Alternative diagnosis 1", "Alternative diagnosis 2"],
  "crop_type": "Identified crop type if visible",
  "treatment_urgency": "Immediate|Within 24h|Within a week|Monitor only"
}

Rules:
- confidence must be a number 0-100
- Be specific and practical for rural farmers
- Use simple language
- If image is not a plant/crop, set prediction to "Not a crop image" with confidence 0
- Always include safety warnings for chemical treatments
- Return ONLY the JSON object, no markdown, no explanation outside JSON`;

const SYSTEM_PROMPT_CHAT = `You are AgriAI, an expert agriculture and environmental intelligence assistant designed to help farmers and rural communities.

Your expertise includes:
- Crop diseases, pests, and plant health
- Soil management and fertilization
- Irrigation and water management
- Pest control (organic and chemical)
- Weather-based farming guidance
- Sustainable farming practices
- Local and traditional farming methods
- Environmental conservation

Guidelines:
- Use simple, clear language suitable for farmers with minimal technical knowledge
- Provide step-by-step actionable recommendations
- Always include safety warnings for chemical treatments
- Mention when expert consultation is needed
- Be encouraging and supportive
- Provide confidence level for recommendations
- Consider local Indian farming practices
- Include traditional/organic alternatives when available
- Format responses with clear sections using emoji headers
- Keep responses concise but complete

Always end critical advice with: "⚠️ Consult your local agricultural extension officer for severe cases."`;

// ── Image Analysis ────────────────────────────
async function analyzeImage(base64Data, mimeType = 'image/jpeg') {
  const lang = window.AppState?.language || 'en';
  const langNote = lang !== 'en' ? ` Provide the reasoning and recommendations in ${lang === 'hi' ? 'Hindi' : 'Telugu'} language, but keep JSON keys in English.` : '';

  const payload = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT_VISION + langNote
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this crop/plant image and provide a detailed agricultural assessment. Return only the JSON response.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`
            }
          }
        ]
      }
    ],
    temperature: 0.3,
    max_tokens: 1024
  };

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Parse JSON from response
  try {
    // Strip markdown code blocks if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Try extracting JSON from text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); }
      catch (e2) { /* fall through */ }
    }
    console.error('Failed to parse vision response:', content);
    throw new Error('AI response could not be parsed. Please try again.');
  }
}

// ── Chat Message ──────────────────────────────
async function sendChatMessage(messages) {
  const lang = window.AppState?.language || 'en';
  const langInstruction = lang === 'hi'
    ? ' Always respond in Hindi (Devanagari script).'
    : lang === 'te'
    ? ' Always respond in Telugu script.'
    : '';

  const payload = {
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT_CHAT + langInstruction
      },
      ...messages
    ],
    temperature: 0.5,
    max_tokens: 1024,
    stream: false
  };

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// ── Test API Connection ───────────────────────
async function testConnection() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${getApiKey()}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

window.GroqAPI = { analyzeImage, sendChatMessage, testConnection };
