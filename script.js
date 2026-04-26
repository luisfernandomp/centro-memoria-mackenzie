let chatOpen = false;

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('nav-scrolled', window.scrollY > 10);
});

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

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('chatPanel');
  const badge = document.getElementById('chatBadge');
  panel.classList.toggle('open', chatOpen);
  if (chatOpen) {
    badge.style.display = 'none';
    document.getElementById('chatInput').focus();
  }
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
  return 'Obrigado pela sua pergunta! Nossa equipe está constantemente expandindo o acervo digital. Para pesquisas detalhadas, você pode entrar em contato diretamente com o Centro de Memória ou utilizar nossa base de dados completa.';
}
