// =============================================
// ADVISOR.JS — AI Advisory Chat Page
// =============================================

let chatMessages = [];
let isTyping = false;

function renderAdvisor() {
  const { t } = window.i18n;
  const container = document.getElementById('page-container');
  const savedHistory = window.HistoryDB.getChatHistory();

  // Rebuild message array from history (limit to last 20)
  chatMessages = savedHistory.slice(-20).map(m => ({ role: m.role, content: m.content }));

  container.innerHTML = `
    <div class="chat-container" style="height:calc(100dvh - var(--header-height) - var(--nav-height))">
      <!-- Chat Messages -->
      <div class="chat-messages" id="chat-messages">
        <!-- Welcome bubble -->
        <div class="chat-bubble ai anim-fade-in">
          <div>🌿 <strong>AgriAI Assistant</strong></div>
          <p style="margin-top:6px">${t('advisor_welcome')}</p>
          <div class="chat-time">Now</div>
        </div>

        <!-- Render chat history -->
        ${chatMessages.map(m => renderBubble(m.role, m.content)).join('')}
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <!-- Suggestions -->
        <div class="suggestions-row" id="suggestions-row">
          ${t('advisor_suggestions').map(s =>
            `<div class="suggestion-chip" onclick="window.AdvisorPage.sendSuggestion(this)">${s}</div>`
          ).join('')}
        </div>

        <div class="chat-input-row">
          <textarea
            id="chat-input"
            class="chat-input"
            placeholder="${t('advisor_placeholder')}"
            rows="1"
            onkeydown="window.AdvisorPage.handleKey(event)"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"
          ></textarea>
          <button class="chat-send-btn" onclick="window.AdvisorPage.sendMessage()" id="send-btn">
            ➤
          </button>
        </div>
      </div>
    </div>
  `;

  // Scroll to bottom
  UI.scrollToBottom(document.getElementById('chat-messages'));
}

function renderBubble(role, content, isNew = false) {
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const isUser = role === 'user';
  const htmlContent = isUser ? content : UI.markdownToHtml(content);

  if (isNew) {
    const container = document.getElementById('chat-messages');
    if (!container) return '';
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user' : 'ai'} anim-fade-in`;
    bubble.innerHTML = `<div>${htmlContent}</div><div class="chat-time">${time}</div>`;
    container.appendChild(bubble);
    UI.scrollToBottom(container);
    return '';
  }

  const time2 = '—';
  return `
    <div class="chat-bubble ${isUser ? 'user' : 'ai'}">
      <div>${isUser ? content : UI.markdownToHtml(content)}</div>
      <div class="chat-time">${time2}</div>
    </div>
  `;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator anim-fade-in';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  container.appendChild(indicator);
  UI.scrollToBottom(container);
}

function hideTyping() {
  document.getElementById('typing-indicator')?.remove();
}

async function sendMessage() {
  if (isTyping) return;
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  // Clear input
  input.value = '';
  input.style.height = 'auto';

  // Hide suggestions after first message
  document.getElementById('suggestions-row')?.style && (document.getElementById('suggestions-row').style.display = 'none');

  // Add user message
  chatMessages.push({ role: 'user', content: text });
  window.HistoryDB.saveChatMessage('user', text);
  renderBubble('user', text, true);

  // Show typing
  isTyping = true;
  const btn = document.getElementById('send-btn');
  if (btn) btn.disabled = true;
  showTyping();

  try {
    // Keep last 12 messages for context
    const contextMessages = chatMessages.slice(-12);
    const reply = await window.GroqAPI.sendChatMessage(contextMessages);

    hideTyping();
    chatMessages.push({ role: 'assistant', content: reply });
    window.HistoryDB.saveChatMessage('assistant', reply);
    renderBubble('assistant', reply, true);
  } catch (err) {
    hideTyping();
    const errMsg = '❌ Sorry, I could not respond right now. Please check your connection and try again.\n\nError: ' + err.message;
    renderBubble('assistant', errMsg, true);
  } finally {
    isTyping = false;
    if (btn) btn.disabled = false;
    input.focus();
  }
}

function sendSuggestion(chip) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = chip.textContent;
    sendMessage();
  }
}

function handleKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

window.AdvisorPage = { render: renderAdvisor, sendMessage, sendSuggestion, handleKey };
