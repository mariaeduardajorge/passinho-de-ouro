/* =====================================================
   PASSINHO DE OURO — main.js v4 (Integrado ao Backend)
   ===================================================== */

'use strict';

/* ---- Configuração da API ---- */
const API_URL = '/api';

/* ---- Utilitários ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ====================================================
   1. NAVEGAÇÃO SPA (Single Page Application)
   ==================================================== */
const pages    = $$('.page');
const navLinks = $$('.nav-link[data-page]');

function showPage(pageId, pushState = true) {
  const target = $(`#${pageId}`);
  if (!target) return;

  // Sai da página atual com animação
  const current = $('.page.active');
  if (current && current !== target) {
    current.classList.add('leaving');
    setTimeout(() => current.classList.remove('leaving', 'active'), 300);
  }

  // Ativa nova página
  pages.forEach(p => p.classList.remove('active'));
  target.classList.add('active');

  // Atualiza nav links
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Scroll para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Fecha menu mobile se aberto
  closeMobileMenu();

  // Dispara animações de reveal na nova página
  setTimeout(() => triggerReveal(), 100);

  // Atualiza URL (hash)
  if (pushState) {
    history.pushState({ page: pageId }, '', `#${pageId}`);
  }
}

// Cliques nos links de navegação
document.addEventListener('click', e => {
  const link = e.target.closest('[data-page]');
  if (link && link.dataset.page) {
    e.preventDefault();
    showPage(link.dataset.page);
  }
});

// Navegação pelo botão voltar/avançar do browser
window.addEventListener('popstate', e => {
  const pageId = e.state?.page || 'home';
  showPage(pageId, false);
});

// Carrega página correta ao abrir o site
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  const validPages = ['home', 'sobre', 'ensino', 'estrutura', 'blog', 'aluno', 'matricula', 'contato'];
  const initial = validPages.includes(hash) ? hash : 'home';
  showPage(initial, false);
});


/* ====================================================
   2. MENU MOBILE
   ==================================================== */
const hamburger  = $('#hamburger');
const mainNav    = $('#main-nav');
const navOverlay = $('#nav-overlay');

function closeMobileMenu() {
  hamburger?.classList.remove('open');
  mainNav?.classList.remove('open');
  navOverlay?.classList.remove('visible');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  navOverlay.classList.toggle('visible', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navOverlay?.addEventListener('click', closeMobileMenu);

// Fecha menu ao pressionar Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});


/* ====================================================
   3. TOPBAR — esconde ao rolar para baixo
   ==================================================== */
const topbar     = $('#topbar');
const mainHeader = $('#main-header');
let lastScroll   = 0;
let topbarHidden = false;

window.addEventListener('scroll', () => {
  const current = window.scrollY;

  // Topbar
  if (current > 80 && !topbarHidden) {
    topbar?.classList.add('hidden');
    mainHeader?.classList.add('topbar-hidden');
    topbarHidden = true;
  } else if (current <= 80 && topbarHidden) {
    topbar?.classList.remove('hidden');
    mainHeader?.classList.remove('topbar-hidden');
    topbarHidden = false;
  }

  // Sombra no header
  mainHeader?.classList.toggle('scrolled', current > 10);

  // Back to top
  const backBtn = $('#back-to-top');
  backBtn?.classList.toggle('visible', current > 400);

  lastScroll = current;
}, { passive: true });


/* ====================================================
   4. BACK TO TOP
   ==================================================== */
$('#back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ====================================================
   5. SETA DA HOME — rola para a próxima seção
   ==================================================== */
$('#scroll-to-about')?.addEventListener('click', () => {
  const diferenciais = $('.diferenciais-home');
  if (diferenciais) {
    const offset = diferenciais.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
});


/* ====================================================
   6. REVEAL ON SCROLL — animações ao entrar na viewport
   ==================================================== */
function triggerReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(triggerReveal, 200));


/* ====================================================
   7. CARROSSEL GENÉRICO — fábrica reutilizável
   ==================================================== */
function createCarousel(config) {
  const {
    trackId,
    prevId,
    nextId,
    dotsId,
    progressId,
    autoplay = true,
    interval = 4500,
    slideSelector = null
  } = config;

  const track    = $(`#${trackId}`);
  const prevBtn  = $(`#${prevId}`);
  const nextBtn  = $(`#${nextId}`);
  const dotsWrap = $(`#${dotsId}`);
  const progress = progressId ? $(`#${progressId}`) : null;

  if (!track) return null;

  const slides = slideSelector
    ? $$(slideSelector, track.parentElement)
    : [...track.children];

  let current   = 0;
  let timer     = null;
  let isPlaying = autoplay;
  const total   = slides.length;

  if (total === 0) return null;

  const dots = dotsWrap ? $$('.dot', dotsWrap) : [];

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });

    if (progress) {
      progress.style.width = `${((current + 1) / total) * 100}%`;
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    if (!isPlaying) return;
    clearInterval(timer);
    timer = setInterval(next, interval);
  }

  function pauseAutoplay() { clearInterval(timer); }

  prevBtn?.addEventListener('click', () => { prev(); pauseAutoplay(); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { next(); pauseAutoplay(); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); pauseAutoplay(); startAutoplay(); });
    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { goTo(i); pauseAutoplay(); startAutoplay(); }
    });
  });

  const wrapper = track.closest('[class*="carousel"]') || track.parentElement;
  wrapper?.addEventListener('mouseenter', pauseAutoplay);
  wrapper?.addEventListener('mouseleave', startAutoplay);

  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  wrapper?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
    pauseAutoplay();
  }, { passive: true });

  wrapper?.addEventListener('touchmove', e => {
    if (!isSwiping) return;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchStartX - touchX;
    const diffY = touchStartY - touchY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  wrapper?.addEventListener('touchend', e => {
    if (!isSwiping) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    isSwiping = false;
    startAutoplay();
  }, { passive: true });

  goTo(0);
  if (autoplay) startAutoplay();

  return { goTo, next, prev, current: () => current, total };
}


/* ====================================================
   8. INICIALIZAÇÃO DOS CARROSSÉIS
   ==================================================== */
document.addEventListener('DOMContentLoaded', () => {

  createCarousel({
    trackId:    'carousel-track',
    prevId:     'carousel-prev',
    nextId:     'carousel-next',
    dotsId:     'carousel-dots',
    progressId: 'carousel-progress',
    interval:   4000
  });

  createCarousel({
    trackId:    'carousel-track-estrutura',
    prevId:     'carousel-prev-estrutura',
    nextId:     'carousel-next-estrutura',
    dotsId:     'carousel-dots-estrutura',
    progressId: 'carousel-progress-estrutura',
    interval:   5000
  });

  createCarousel({
    trackId:    'carousel-track-momentos',
    prevId:     'carousel-prev-momentos',
    nextId:     'carousel-next-momentos',
    dotsId:     'carousel-dots-momentos',
    progressId: 'carousel-progress-momentos',
    interval:   3500
  });
});


/* ====================================================
   9. BLOG — Filtros e Modal de Álbum
   ==================================================== */
const albumsGrid = $('#albums-grid');
const filtroBtns = $$('.filtro-btn');

filtroBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filtroBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filtro = btn.dataset.filtro;
    const cards = $$('.album-card', albumsGrid);

    cards.forEach(card => {
      const show = filtro === 'todos' || card.dataset.categoria === filtro;
      card.style.display = show ? '' : 'none';
    });
  });
});

// Modal de Álbum
const modalAlbum = $('#modal-album');
const modalClose = $('#modal-album-close');

$$('.album-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!modalAlbum) return;
    const titulo = card.dataset.titulo || '';
    const data = card.dataset.data || '';
    const fotos = card.dataset.fotos || '';
    const descricao = card.dataset.descricao || '';

    const el = (id) => $(`#${id}`, modalAlbum);
    if (el('modal-album-titulo'))    el('modal-album-titulo').textContent    = titulo;
    if (el('modal-album-data'))      el('modal-album-data').textContent      = data;
    if (el('modal-album-fotos'))     el('modal-album-fotos').textContent     = `${fotos} fotos`;
    if (el('modal-album-descricao')) el('modal-album-descricao').textContent = descricao;

    modalAlbum.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});

modalClose?.addEventListener('click', () => {
  if (modalAlbum) {
    modalAlbum.hidden = true;
    document.body.style.overflow = '';
  }
});

modalAlbum?.addEventListener('click', e => {
  if (e.target === modalAlbum) {
    modalAlbum.hidden = true;
    document.body.style.overflow = '';
  }
});


/* ====================================================
   10. ANIMAÇÃO DE CONTADORES
   ==================================================== */
function animateCounters() {
  $$('[data-target]').forEach(el => {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

const heroObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = $('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);


/* ====================================================
   11. PORTAL DO ALUNO — Login integrado ao backend
   ==================================================== */

(function () {
  'use strict';

  /* ---------- Elementos ---------- */
  const loginForm       = $('#login-form');
  const inputUsuario    = $('#login-usuario');
  const inputSenha      = $('#login-senha');
  const btnLogin        = $('#btn-login');
  const btnLoginText    = btnLogin?.querySelector('.btn-login-text');
  const btnLoginLoading = btnLogin?.querySelector('.btn-login-loading');
  const loginErro       = $('#login-erro');
  const loginErroSpan   = loginErro?.querySelector('span');
  const toggleSenhaBtn  = $('#toggle-senha');
  const toggleSenhaIcon = $('#toggle-senha-icon');
  const btnForgot       = $('#btn-forgot-senha');

  /* Modal recuperar senha */
  const modalRecuperar        = $('#modal-recuperar-senha');
  const modalRecuperarClose   = $('#modal-recuperar-close');
  const formRecuperar         = $('#form-recuperar-senha');
  const inputRecuperarEmail   = $('#recuperar-email');
  const btnRecuperar          = $('#btn-recuperar');
  const btnRecuperarText      = btnRecuperar?.querySelector('.btn-login-text');
  const btnRecuperarLoading   = btnRecuperar?.querySelector('.btn-login-loading');
  const recuperarErro         = $('#recuperar-erro');
  const recuperarFormState    = $('#recuperar-form-state');
  const recuperarSucessoState = $('#recuperar-sucesso-state');
  const btnRecuperarFechar    = $('#btn-recuperar-fechar');

  /* ---------- Utilitários ---------- */
  function setLoading(btn, textEl, loadingEl, state) {
    if (!btn) return;
    btn.disabled = state;
    if (textEl)    textEl.hidden    = state;
    if (loadingEl) loadingEl.hidden = !state;
  }

  function showErro(el, msg) {
    if (!el) return;
    if (msg && el.querySelector('span')) {
      el.querySelector('span').textContent = msg;
    }
    el.hidden = false;
    el.style.animation = 'none';
    requestAnimationFrame(() => { el.style.animation = ''; });
  }

  function hideErro(el) {
    if (el) el.hidden = true;
  }

  function markInputError(input, hasError) {
    if (!input) return;
    input.classList.toggle('input-erro', hasError);
  }

  /* ---------- Mostrar / Ocultar Senha ---------- */
  toggleSenhaBtn?.addEventListener('click', () => {
    if (!inputSenha) return;
    const isPassword = inputSenha.type === 'password';
    inputSenha.type = isPassword ? 'text' : 'password';
    if (toggleSenhaIcon) {
      toggleSenhaIcon.className = isPassword
        ? 'fa-solid fa-eye-slash'
        : 'fa-solid fa-eye';
    }
    toggleSenhaBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    inputSenha.focus();
  });

  /* ---------- Limpar erro ao digitar ---------- */
  inputUsuario?.addEventListener('input', () => {
    hideErro(loginErro);
    markInputError(inputUsuario, false);
    markInputError(inputSenha, false);
  });

  inputSenha?.addEventListener('input', () => {
    hideErro(loginErro);
    markInputError(inputUsuario, false);
    markInputError(inputSenha, false);
  });

  /* ---------- Submit do Login — INTEGRADO AO BACKEND ---------- */
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = inputUsuario?.value.trim() ?? '';
    const senha   = inputSenha?.value ?? '';

    if (!usuario || !senha) {
      markInputError(inputUsuario, !usuario);
      markInputError(inputSenha, !senha);
      showErro(loginErro, 'Preencha todos os campos.');
      if (!usuario) inputUsuario?.focus();
      else inputSenha?.focus();
      return;
    }

    hideErro(loginErro);
    markInputError(inputUsuario, false);
    markInputError(inputSenha, false);

    setLoading(btnLogin, btnLoginText, btnLoginLoading, true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });

      const data = await response.json();

      setLoading(btnLogin, btnLoginText, btnLoginLoading, false);

      if (response.ok) {
        // Salvar sessão no localStorage
        localStorage.setItem('passinho_token', data.token);
        localStorage.setItem('passinho_user', JSON.stringify({
          _id: data._id,
          nome: data.nome,
          email: data.email,
          ra: data.ra,
          tipo: data.tipo,
          aluno_id: data.aluno_id
        }));

        // Feedback visual de sucesso
        if (btnLogin) {
          btnLogin.style.background = 'linear-gradient(135deg, #2e7d32, #43a047)';
          btnLoginText.innerHTML = '<i class="fa-solid fa-check"></i> Acesso liberado!';
          btnLoginText.hidden = false;
        }

        // Redirecionar com base no tipo de usuário
        setTimeout(() => {
          if (data.tipo === 'aluno' || data.tipo === 'responsavel') {
            window.location.href = 'portal-aluno.html';
          } else if (data.tipo === 'professor') {
            window.location.href = 'portal-professor.html';
          } else if (data.tipo === 'admin') {
            window.location.href = 'admin.html';
          }
        }, 1000);

      } else {
        markInputError(inputUsuario, true);
        markInputError(inputSenha, true);
        showErro(loginErro, data.message || 'Usuário ou senha incorretos.');
        if (inputSenha) {
          inputSenha.value = '';
          inputSenha.type = 'password';
          if (toggleSenhaIcon) toggleSenhaIcon.className = 'fa-solid fa-eye';
        }
        inputUsuario?.focus();
      }
    } catch (err) {
      setLoading(btnLogin, btnLoginText, btnLoginLoading, false);
      markInputError(inputUsuario, true);
      markInputError(inputSenha, true);
      showErro(loginErro, 'Erro de conexão ou usuário não encontrado.');
      console.error('Erro no login:', err);
    }
  });

  /* ---------- Modal: Recuperar Senha ---------- */

  function openModalRecuperar() {
    if (!modalRecuperar) return;
    if (recuperarFormState)    recuperarFormState.hidden    = false;
    if (recuperarSucessoState) recuperarSucessoState.hidden = true;
    if (inputRecuperarEmail)   inputRecuperarEmail.value    = '';
    hideErro(recuperarErro);
    markInputError(inputRecuperarEmail, false);

    modalRecuperar.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => inputRecuperarEmail?.focus(), 100);
  }

  function closeModalRecuperar() {
    if (!modalRecuperar) return;
    modalRecuperar.hidden = true;
    document.body.style.overflow = '';
    btnForgot?.focus();
  }

  btnForgot?.addEventListener('click', (e) => {
    e.preventDefault();
    openModalRecuperar();
  });

  modalRecuperarClose?.addEventListener('click', closeModalRecuperar);
  btnRecuperarFechar?.addEventListener('click', closeModalRecuperar);

  modalRecuperar?.addEventListener('click', (e) => {
    if (e.target === modalRecuperar) closeModalRecuperar();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalRecuperar && !modalRecuperar.hidden) {
      closeModalRecuperar();
    }
  });

  /* ---------- Submit: Recuperar Senha ---------- */
  formRecuperar?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = inputRecuperarEmail?.value.trim() ?? '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      markInputError(inputRecuperarEmail, true);
      showErro(recuperarErro, 'Por favor, informe um e-mail válido.');
      inputRecuperarEmail?.focus();
      return;
    }

    hideErro(recuperarErro);
    markInputError(inputRecuperarEmail, false);

    setLoading(btnRecuperar, btnRecuperarText, btnRecuperarLoading, true);

    // Simula envio (funcionalidade de e-mail pode ser adicionada ao backend)
    setTimeout(() => {
      setLoading(btnRecuperar, btnRecuperarText, btnRecuperarLoading, false);
      if (recuperarFormState)    recuperarFormState.hidden    = true;
      if (recuperarSucessoState) recuperarSucessoState.hidden = false;
      setTimeout(() => btnRecuperarFechar?.focus(), 100);
    }, 1500);
  });

  inputRecuperarEmail?.addEventListener('input', () => {
    hideErro(recuperarErro);
    markInputError(inputRecuperarEmail, false);
  });

})();
