// ── TYPEWRITER NAV TITLE ──
(function () {
  const el = document.querySelector('.nav-logo-text');
  const full = el.textContent.trim();
  el.textContent = '';
  el.style.borderRightColor = 'rgba(255,255,255,0.75)';

  let i = 0;
  const type = setInterval(() => {
    el.textContent += full[i];
    i++;
    if (i >= full.length) {
      clearInterval(type);
      let blinks = 0;
      const blink = setInterval(() => {
        el.style.borderRightColor = blinks % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.75)';
        blinks++;
        if (blinks >= 8) {
          clearInterval(blink);
          el.style.borderRight = 'none';
        }
      }, 380);
    }
  }, 100);
}());

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('nav-scrolled', window.scrollY > 10);
});

// ── TIMELINE SCROLL ANIMATIONS ──
(function () {
  const items = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = i * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(item => observer.observe(item));
}());

// ── CAROUSEL ──
(function () {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  const total = dots.length;
  let current = 0;
  let autoTimer;

  function slideWidth() {
    return document.getElementById('carousel').offsetWidth;
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * slideWidth()}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  }

  document.getElementById('carouselNext').addEventListener('click', () => { next(); startAuto(); });
  document.getElementById('carouselPrev').addEventListener('click', () => { prev(); startAuto(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); startAuto(); }));

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
  });

  window.addEventListener('resize', () => goTo(current));

  startAuto();
}());

// ── INLINE CHAT ──
function openInlineChat() {
  const cta = document.getElementById('chatCta');
  const inline = document.getElementById('chatInline');

  cta.classList.add('hiding');
  setTimeout(() => {
    cta.style.display = 'none';
    cta.classList.remove('hiding');
    inline.classList.add('visible');
    document.getElementById('chatInput').focus();
  }, 280);
}

function closeInlineChat() {
  const cta = document.getElementById('chatCta');
  const inline = document.getElementById('chatInline');

  inline.classList.remove('visible');
  setTimeout(() => {
    cta.style.display = '';
    requestAnimationFrame(() => cta.classList.add('showing'));
    setTimeout(() => cta.classList.remove('showing'), 400);
  }, 280);
}

function openChatWithHint(el) {
  openInlineChat();
  setTimeout(() => {
    const input = document.getElementById('chatInput');
    const text = el.textContent.replace(/^[^\s]+\s/, ''); // strip emoji
    input.value = text;
    input.focus();
  }, 350);
}

function sendQuickMsg(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  input.value = '';

  showTyping();
  setTimeout(() => {
    removeTyping();
    appendMessage(getBotReply(text), 'bot');
  }, 1200 + Math.random() * 600);
}

function appendMessage(text, sender) {
  const messages = document.getElementById('chatMessages');
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `msg msg-${sender}`;
  div.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-time">${now}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

// ── FLOATING CHAT MODAL ──
function toggleChatModal() {
  const overlay = document.getElementById('chatModalOverlay');
  if (overlay.classList.contains('visible')) {
    closeChatModal();
  } else {
    openChatModal();
  }
}

function openChatModal() {
  const overlay = document.getElementById('chatModalOverlay');
  const fab = document.getElementById('chatFab');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  fab.querySelector('.chat-fab-icon-open').style.display = 'none';
  fab.querySelector('.chat-fab-icon-close').style.display = '';
  setTimeout(() => document.getElementById('chatModalInput').focus(), 380);
}

function closeChatModal() {
  const overlay = document.getElementById('chatModalOverlay');
  const fab = document.getElementById('chatFab');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  fab.querySelector('.chat-fab-icon-open').style.display = '';
  fab.querySelector('.chat-fab-icon-close').style.display = 'none';
}

function handleModalBackdropClick(e) {
  if (e.target === document.getElementById('chatModalOverlay')) closeChatModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeChatModal(); });

function sendModalQuickMsg(text) {
  document.getElementById('chatModalInput').value = text;
  sendModalMessage();
}

function handleModalKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendModalMessage(); }
}

function sendModalMessage() {
  const input = document.getElementById('chatModalInput');
  const text = input.value.trim();
  if (!text) return;
  appendModalMessage(text, 'user');
  input.value = '';
  showModalTyping();
  setTimeout(() => {
    removeModalTyping();
    appendModalMessage(getBotReply(text), 'bot');
  }, 1200 + Math.random() * 600);
}

function appendModalMessage(text, sender) {
  const messages = document.getElementById('chatModalMessages');
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `msg msg-${sender}`;
  div.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-time">${now}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showModalTyping() {
  const messages = document.getElementById('chatModalMessages');
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.id = 'modalTypingIndicator';
  div.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeModalTyping() {
  const el = document.getElementById('modalTypingIndicator');
  if (el) el.remove();
}

function getBotReply(text) {
  const t = text.toLowerCase();
  if (t.includes('fundação') || t.includes('1870') || t.includes('fundado'))
    return 'O Mackenzie foi fundado em 1870 por George e Mary Chamberlain como Escola Americana. O acervo possui documentos originais desse período, incluindo correspondências e registros das primeiras turmas.';
  if (t.includes('foto') || t.includes('imagem') || t.includes('fotografia'))
    return 'Nosso acervo fotográfico conta com mais de 5.000 imagens catalogadas, cobrindo eventos, formaturas e registros do cotidiano institucional desde o final do século XIX.';
  if (t.includes('document') || t.includes('arquivo'))
    return 'Temos mais de 80.000 documentos digitalizados, incluindo atas, relatórios, correspondências e registros administrativos. Posso ajudá-lo a localizar um documento específico?';
  if (t.includes('aluno') || t.includes('formando') || t.includes('diploma'))
    return 'Os registros acadêmicos incluem históricos escolares e diplomas de alunos desde as primeiras décadas da instituição. Para consultas específicas, entre em contato com nossa equipe de pesquisa.';
  if (t.includes('solicitar') || t.includes('registros acadêmicos'))
    return 'Para solicitar registros acadêmicos históricos, entre em contato com a equipe do Centro de Memória pelo e-mail ou telefone. Há um formulário específico para requisições de pesquisa.';
  return 'Obrigado pela sua pergunta! Nossa equipe está constantemente expandindo o acervo digital. Para pesquisas detalhadas, você pode entrar em contato diretamente com o Centro de Memória ou utilizar nossa base de dados completa.';
}
