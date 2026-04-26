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

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
  });

  window.addEventListener('resize', () => goTo(current));
  startAuto();
}());

// ═══════════════════════════════════════════════════════
// ORÁCULO — ESTADO
// ═══════════════════════════════════════════════════════
const agendaState = { dataSelecionada: null, horarioSelecionado: null };
let scheduleCtx = 'chatMessages';

// ═══════════════════════════════════════════════════════
// INLINE CHAT
// ═══════════════════════════════════════════════════════
function openInlineChat() {
  const cta    = document.getElementById('chatCta');
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
  const cta    = document.getElementById('chatCta');
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
    const text  = el.textContent.replace(/^[^\s]+\s/, '');
    input.value = text;
    input.focus();
  }, 350);
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;
  appendUserMessageTo(text, 'chatMessages');
  input.value = '';
  showTyping('chatMessages');
  setTimeout(() => {
    removeTyping('chatMessages');
    processUserInput(text, 'chatMessages');
  }, 900 + Math.random() * 700);
}

function sendQuickMsg(text) {
  appendUserMessageTo(text, 'chatMessages');
  showTyping('chatMessages');
  setTimeout(() => {
    removeTyping('chatMessages');
    processUserInput(text, 'chatMessages');
  }, 900 + Math.random() * 500);
}

// ═══════════════════════════════════════════════════════
// MODAL CHAT (FAB)
// ═══════════════════════════════════════════════════════
function toggleChatModal() {
  const overlay = document.getElementById('chatModalOverlay');
  overlay.classList.contains('visible') ? closeChatModal() : openChatModal();
}

function openChatModal() {
  const overlay = document.getElementById('chatModalOverlay');
  const fab     = document.getElementById('chatFab');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  fab.querySelector('.chat-fab-icon-open').style.display  = 'none';
  fab.querySelector('.chat-fab-icon-close').style.display = '';
  setTimeout(() => document.getElementById('chatModalInput').focus(), 380);
}

function closeChatModal() {
  const overlay = document.getElementById('chatModalOverlay');
  const fab     = document.getElementById('chatFab');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  fab.querySelector('.chat-fab-icon-open').style.display  = '';
  fab.querySelector('.chat-fab-icon-close').style.display = 'none';
}

function handleModalBackdropClick(e) {
  if (e.target === document.getElementById('chatModalOverlay')) closeChatModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('agendaOverlay')) fecharAgendamento();
    else closeChatModal();
  }
});

function handleModalKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendModalMessage(); }
}

function sendModalMessage() {
  const input = document.getElementById('chatModalInput');
  const text  = input.value.trim();
  if (!text) return;
  appendUserMessageTo(text, 'chatModalMessages');
  input.value = '';
  showTyping('chatModalMessages');
  setTimeout(() => {
    removeTyping('chatModalMessages');
    processUserInput(text, 'chatModalMessages');
  }, 900 + Math.random() * 700);
}

function sendModalQuickMsg(text) {
  appendUserMessageTo(text, 'chatModalMessages');
  showTyping('chatModalMessages');
  setTimeout(() => {
    removeTyping('chatModalMessages');
    processUserInput(text, 'chatModalMessages');
  }, 900 + Math.random() * 500);
}

// ═══════════════════════════════════════════════════════
// ORÁCULO — RENDERIZAÇÃO DE MENSAGENS
// ═══════════════════════════════════════════════════════
function appendBotMessage(html, ctx) {
  const container = document.getElementById(ctx);
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const wrapper = document.createElement('div');
  wrapper.className = 'msg msg-bot';
  wrapper.innerHTML = `
    <div class="msg-bot-row">
      <div class="bot-avatar">
        <img src="./images/centro-memoria-logo.png" alt="Oráculo" />
      </div>
      <div class="msg-bubble">${html}</div>
    </div>
    <div class="msg-time">${now}</div>
  `;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return wrapper;
}

function appendUserMessageTo(text, ctx) {
  const container = document.getElementById(ctx);
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'msg msg-user';
  div.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div><div class="msg-time">${now}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendDocCard(data, ctx) {
  const tpl     = document.getElementById('tplDocCard');
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(tpl.content.cloneNode(true));
  const card = tempDiv.firstElementChild;

  card.querySelector('.doc-type-badge').textContent  = data.tipo;
  card.querySelector('.doc-year').textContent         = data.ano;
  card.querySelector('.doc-title').textContent        = data.titulo;
  card.querySelector('.doc-description').textContent  = data.descricao;
  card.querySelector('.doc-ref-text').textContent     = data.referencia;

  const [btnAlta, btnSaber] = card.querySelectorAll('.btn-action');
  btnAlta.addEventListener('click', () => {
    appendBotMessage('🖼️ O acesso à versão em alta resolução está disponível mediante solicitação à equipe do Centro de Memória. Deseja que eu gere um pedido de acesso?', ctx);
    setTimeout(() => appendQuickReplies(['Sim, gerar pedido', 'Não, obrigado'], ctx), 600);
  });
  btnSaber.addEventListener('click', () => {
    appendBotMessage(`📋 <strong>${data.titulo}</strong> faz parte da Coleção ${data.colecao}. ${data.detalhes || 'Este documento é uma das peças mais consultadas do acervo.'}`, ctx);
  });

  const container = document.getElementById(ctx);
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const wrapper = document.createElement('div');
  wrapper.className = 'msg msg-bot';

  const row = document.createElement('div');
  row.className = 'msg-bot-row';

  const avatar = document.createElement('div');
  avatar.className = 'bot-avatar';
  avatar.textContent = 'M';

  row.appendChild(avatar);
  row.appendChild(card);
  wrapper.appendChild(row);

  const timeEl = document.createElement('div');
  timeEl.className = 'msg-time';
  timeEl.textContent = now;
  wrapper.appendChild(timeEl);

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function appendQuickReplies(options, ctx) {
  const container = document.getElementById(ctx);
  const div = document.createElement('div');
  div.className = 'msg msg-bot';

  const repliesDiv = document.createElement('div');
  repliesDiv.className = 'quick-replies';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      repliesDiv.querySelectorAll('.quick-reply-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.5';
      });
      if (ctx === 'chatMessages') sendQuickMsg(opt);
      else sendModalQuickMsg(opt);
    });
    repliesDiv.appendChild(btn);
  });

  div.appendChild(repliesDiv);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping(ctx) {
  const container = document.getElementById(ctx);
  const existing  = container.querySelector('.typing-msg');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'msg msg-bot typing-msg';
  div.innerHTML = `
    <div class="msg-bot-row">
      <div class="bot-avatar">M</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTyping(ctx) {
  const el = document.getElementById(ctx).querySelector('.typing-msg');
  if (el) el.remove();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ═══════════════════════════════════════════════════════
// ORÁCULO — BOAS-VINDAS
// ═══════════════════════════════════════════════════════
function renderBoasVindas(ctx) {
  setTimeout(() => {
    appendBotMessage(
      `Olá! Sou o <strong>Oráculo Digital</strong>, o assistente virtual do Centro de Memória Mackenzie. 📚<br><br>
      Tenho acesso ao nosso acervo de <strong>80.000+ documentos</strong>, mais de <strong>5.000 fotografias</strong> e registros históricos desde 1870.<br><br>
      Como posso ajudá-lo hoje?`,
      ctx
    );
    setTimeout(() => {
      appendQuickReplies([
        '📂 Explorar o acervo',
        '📅 Agendar visita',
        '🔎 Pesquisar por tema',
        '📸 Ver fotografias históricas',
      ], ctx);
    }, 400);
  }, 350);
}

window.addEventListener('DOMContentLoaded', () => {
  renderBoasVindas('chatMessages');
  renderBoasVindas('chatModalMessages');
});

// ═══════════════════════════════════════════════════════
// ORÁCULO — LÓGICA DO BOT
// ═══════════════════════════════════════════════════════
function processUserInput(text, ctx) {
  const t = text.toLowerCase();

  if (t.includes('coreto') || t.includes('praça central')) {
    appendBotMessage('Encontrei <strong>1 resultado</strong> relevante no acervo para "<em>coreto</em>":', ctx);
    setTimeout(() => {
      appendDocCard({
        tipo:      'Fotografia',
        ano:       '1965',
        titulo:    'Praça Central — Coreto do Pátio Mackenzie',
        descricao: 'Fotografia em preto e branco registrando o coreto histórico do pátio central durante festividade acadêmica. Tiragem original em gelatina de prata.',
        referencia:'Coleção Iconográfica · Fundo Fotográfico · Ref. IC-1965-0312',
        colecao:   'Iconográfica',
        detalhes:  'Pertence ao conjunto de registros das festas de confraternização da década de 1960, catalogadas pelo arquivista Hélio Prado em 1988.',
      }, ctx);
      setTimeout(() => {
        appendBotMessage('Deseja refinar a busca ou visualizar documentos relacionados ao mesmo período?', ctx);
        setTimeout(() => appendQuickReplies(['📅 Mais fotos de 1965', '🏛️ Outros locais do campus', '📋 Solicitar acesso'], ctx), 400);
      }, 500);
    }, 300);
    return;
  }

  if (t.includes('fotografia') || t.includes('foto') || t.includes('imagem') || t.includes('ver fotografias') || t.includes('fotografias históricas')) {
    appendBotMessage('Nossa coleção fotográfica conta com <strong>5.218 imagens</strong> catalogadas. Posso mostrar exemplos do acervo. Que período te interessa?', ctx);
    setTimeout(() => appendQuickReplies(['Década de 1870', 'Década de 1920', 'Década de 1960', 'Anos 2000+'], ctx), 400);
    return;
  }

  if (t.includes('1870') || t.includes('fundação') || t.includes('fundado') || t.includes('escola americana') || t.includes('fundação da instituição')) {
    appendBotMessage('O Mackenzie foi fundado em <strong>1870</strong> por George e Mary Chamberlain como <em>Escola Americana</em>. Nosso acervo possui documentos originais desse período, incluindo:', ctx);
    setTimeout(() => {
      appendDocCard({
        tipo:      'Documento Manuscrito',
        ano:       '1870',
        titulo:    'Ata de Fundação — Escola Americana',
        descricao: 'Documento manuscrito original em inglês, registrando a criação da instituição e os primeiros termos de funcionamento assinados pelos fundadores.',
        referencia:'Fundo Histórico · Série Administrativa · Ref. FH-1870-001',
        colecao:   'Histórica',
        detalhes:  'Considerado o documento mais importante do acervo, está sob custódia especial e disponível apenas em cópia digitalizada.',
      }, ctx);
    }, 300);
    return;
  }

  if (t.includes('agendar') || t.includes('agendamento') || t.includes('visita') || t.includes('agendar visita')) {
    appendBotMessage('Claro! Vou abrir o formulário de agendamento. Você poderá escolher data, horário e informar o motivo da visita.', ctx);
    setTimeout(() => triggerAgendamento(ctx), 600);
    return;
  }

  if (t.includes('acervo') || t.includes('explorar') || t.includes('pesquisar') || t.includes('pesquisa') || t.includes('tema')) {
    appendBotMessage(
      `Nosso acervo é organizado em <strong>6 coleções principais</strong>:<br><br>
      📜 <strong>Documentos Históricos</strong> — 80.000+ itens<br>
      📷 <strong>Fotográfico</strong> — 5.218 imagens<br>
      📚 <strong>Publicações e Periódicos</strong> — 3.100+ títulos<br>
      🎓 <strong>Registros Acadêmicos</strong> — desde 1870<br>
      🗺️ <strong>Cartografia e Plantas</strong> — 420 documentos<br>
      🎙️ <strong>Acervo Oral</strong> — 340 depoimentos`,
      ctx
    );
    setTimeout(() => appendQuickReplies(['🔎 Buscar por palavra-chave', '📅 Agendar visita presencial', '📷 Ver fotografias'], ctx), 400);
    return;
  }

  if (t.includes('document') || t.includes('arquivo') || t.includes('ata')) {
    appendBotMessage('Temos <strong>80.000+ documentos</strong> digitalizados, incluindo atas, relatórios, correspondências e registros administrativos. Posso ajudá-lo a localizar algo específico?', ctx);
    setTimeout(() => appendQuickReplies(['📜 Atas administrativas', '📋 Correspondências históricas', '🏛️ Relatórios institucionais'], ctx), 400);
    return;
  }

  if (t.includes('aluno') || t.includes('diploma') || t.includes('formando') || t.includes('registro acadêmico') || t.includes('registros acadêmicos')) {
    appendBotMessage('Os registros acadêmicos incluem históricos escolares e diplomas desde as primeiras décadas. Para consultas específicas, entre em contato com nossa equipe ou agende uma visita.', ctx);
    setTimeout(() => appendQuickReplies(['📅 Agendar visita', '📧 Contato da equipe'], ctx), 400);
    return;
  }

  if (t.includes('contato') || t.includes('email') || t.includes('telefone') || t.includes('equipe')) {
    appendBotMessage(
      `📬 <strong>Contato do Centro de Memória</strong><br><br>
      E-mail: <em>centrodememoria@mackenzie.br</em><br>
      Telefone: (11) 2114-8000<br>
      Endereço: Rua da Consolação, 930 — Consolação, SP<br>
      Horário: Segunda a Sexta, 9h–17h`,
      ctx
    );
    return;
  }

  if (t.includes('sim') || t.includes('gerar pedido') || t.includes('solicitar acesso')) {
    appendBotMessage('✅ Pedido registrado! Nossa equipe entrará em contato em até <strong>2 dias úteis</strong> para enviar o link de acesso seguro ao arquivo em alta resolução.', ctx);
    return;
  }

  if (t.includes('não') || t.includes('obrigado') || t.includes('nao')) {
    appendBotMessage('Tudo bem! Estou aqui se precisar de mais alguma coisa. 🙂', ctx);
    return;
  }

  // Fallback
  appendBotMessage(
    `Entendi sua busca por <em>"${escapeHtml(text)}"</em>. No momento não localizei resultados exatos, mas posso tentar de outra forma.<br><br>
    Tente pesquisar por palavras-chave como <strong>nomes de lugares, datas ou tipos de documento</strong>.`,
    ctx
  );
  setTimeout(() => appendQuickReplies(['📂 Ver coleções disponíveis', '📅 Agendar visita presencial'], ctx), 400);
}

// ═══════════════════════════════════════════════════════
// FLUXO DE AGENDAMENTO
// ═══════════════════════════════════════════════════════
function triggerAgendamento(ctx) {
  scheduleCtx = ctx || 'chatMessages';
  agendaState.dataSelecionada   = null;
  agendaState.horarioSelecionado = null;

  const tpl  = document.getElementById('tplAgendamento');
  const node = tpl.content.cloneNode(true);
  document.body.appendChild(node);

  const overlay = document.getElementById('agendaOverlay');
  overlay.addEventListener('click', e => { if (e.target === overlay) fecharAgendamento(); });

  buildScheduleDates(overlay.querySelector('.agenda-dates'));
}

function buildScheduleDates(container) {
  const dayNames   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const holidays   = new Set(['05-01']); // Dia do Trabalhador

  let count = 0;
  const d = new Date();
  d.setDate(d.getDate() + 1);

  while (count < 5) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const mm  = String(d.getMonth() + 1).padStart(2, '0');
      const dd  = String(d.getDate()).padStart(2, '0');
      const key = `${mm}-${dd}`;
      const isHoliday = holidays.has(key);

      const btn = document.createElement('button');
      btn.className   = 'agenda-date-btn';
      btn.dataset.date = `${dayNames[dow]}, ${dd} de ${monthNames[d.getMonth()]}`;
      btn.innerHTML   = `
        <span class="agenda-date-day">${dd} ${monthNames[d.getMonth()]}</span>
        <span class="agenda-date-weekday">${dayNames[dow]}</span>
      `;

      if (isHoliday) {
        btn.disabled = true;
        btn.title    = 'Feriado Nacional';
      } else {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.agenda-date-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          agendaState.dataSelecionada = btn.dataset.date;
          document.getElementById('btnNextHorario').disabled = false;
        });
      }

      container.appendChild(btn);
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
}

function fecharAgendamento() {
  const overlay = document.getElementById('agendaOverlay');
  if (overlay) overlay.remove();
}

function irParaHorario() {
  document.getElementById('stepData').style.display    = 'none';
  document.getElementById('stepHorario').style.display = '';
  document.getElementById('dataSelecionadaLabel').textContent = agendaState.dataSelecionada;

  document.querySelectorAll('.agenda-time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.agenda-time-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      agendaState.horarioSelecionado = btn.dataset.time;
      verificarFormulario();
    });
  });

  document.getElementById('agendaNome').addEventListener('input', verificarFormulario);
}

function voltarParaData() {
  document.getElementById('stepHorario').style.display = 'none';
  document.getElementById('stepData').style.display    = '';
}

function verificarFormulario() {
  const nome   = document.getElementById('agendaNome')?.value.trim();
  const btnConf = document.getElementById('btnConfirmar');
  if (btnConf) btnConf.disabled = !(nome && agendaState.horarioSelecionado);
}

function confirmarAgendamento() {
  const nome   = document.getElementById('agendaNome')?.value.trim() || '—';

  document.getElementById('successData').textContent    = agendaState.dataSelecionada;
  document.getElementById('successHorario').textContent = agendaState.horarioSelecionado;
  document.getElementById('successNome').textContent    = nome;

  document.getElementById('stepHorario').style.display = 'none';
  document.getElementById('stepSucesso').style.display  = '';

  setTimeout(() => {
    appendBotMessage(
      `✅ Visita agendada com sucesso!<br><br>
      📅 <strong>${agendaState.dataSelecionada}</strong> às <strong>${agendaState.horarioSelecionado}</strong><br>
      👤 <strong>${nome}</strong><br><br>
      Nosso time aguarda sua visita no <em>Centro de Memória · Bloco A, Sala 12</em>. Um e-mail de confirmação foi enviado.`,
      scheduleCtx
    );
  }, 500);
}
