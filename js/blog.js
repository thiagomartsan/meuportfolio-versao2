(() => {
  const search = document.querySelector('#blogSearch');
  const filters = [...document.querySelectorAll('[data-blog-filter]')];
  const entries = [...document.querySelectorAll('[data-blog-entry]')];
  const slides = [...document.querySelectorAll('[data-feature-slide]')];
  const empty = document.querySelector('#blogEmpty');
  const status = document.querySelector('#blogFilterStatus');
  const caption = document.querySelector('#blogShowcaseCaption');
  const catalogContext = document.querySelector('#blogCatalogContext');
  const prev = document.querySelector('#blogFeaturePrev');
  const next = document.querySelector('#blogFeatureNext');
  const dots = document.querySelector('#blogFeatureDots');
  const carousel = document.querySelector('#blogFeatureCarousel');
  const loadMore = document.querySelector('#blogLoadMore');
  if (!entries.length || !slides.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labels = {
    all: 'Todos',
    seo: 'SEO',
    processos: 'Processos',
    criacao: 'Criação de sites',
    custos: 'Custos',
    posicionamento: 'Posicionamento digital',
    ferramentas: 'Ferramentas digitais',
    automacao: 'Automação',
    ia: 'IA aplicada',
    produto: 'Produto digital'
  };

  const PAGE_SIZE = 3;
  let displayLimit = PAGE_SIZE;
  let topic = 'all';
  let allowedSlides = slides.slice();
  let activeIndex = 0;
  let timer = null;
  let paused = false;
  let inViewport = true;

  const normalize = (value = '') => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const matches = (node, query) => {
    const nodeTopic = node.dataset.topic || '';
    const haystack = normalize(node.dataset.search || node.textContent);
    const matchTopic = topic === 'all' || nodeTopic === topic;
    const matchQuery = !query || haystack.includes(query);
    return matchTopic && matchQuery;
  };

  function buildDots() {
    if (!dots) return;
    dots.replaceChildren();
    allowedSlides.forEach((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'blog-feature-dot';
      button.setAttribute('aria-label', `Abrir destaque ${index + 1}`);
      button.addEventListener('click', () => {
        activeIndex = index;
        showSlide();
        restartAutoplay();
      });
      dots.appendChild(button);
    });
  }

  function showSlide() {
    slides.forEach((slide) => {
      const active = allowedSlides[activeIndex] === slide;
      slide.classList.toggle('is-active', active);
      slide.hidden = !active;
    });
    if (dots) {
      [...dots.children].forEach((dot, index) => {
        const active = index === activeIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }
    const disabled = allowedSlides.length <= 1;
    if (prev) prev.disabled = disabled;
    if (next) next.disabled = disabled;
    carousel?.classList.remove('is-advancing');
    requestAnimationFrame(() => carousel?.classList.add('is-advancing'));
  }

  function step(direction = 1) {
    if (!allowedSlides.length) return;
    activeIndex = (activeIndex + direction + allowedSlides.length) % allowedSlides.length;
    showSlide();
  }

  function stopAutoplay() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function startAutoplay() {
    stopAutoplay();
    if (reduceMotion || paused || !inViewport || allowedSlides.length <= 1) return;
    timer = window.setInterval(() => step(1), 5200);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function updateCatalog(query, raw) {
    const matched = entries.filter((entry) => matches(entry, query));
    entries.forEach((entry) => { entry.hidden = true; });
    matched.slice(0, displayLimit).forEach((entry) => { entry.hidden = false; });

    const total = matched.length;
    const shown = Math.min(displayLimit, total);
    if (empty) empty.hidden = total !== 0;

    if (loadMore) {
      const remaining = Math.max(total - shown, 0);
      loadMore.hidden = remaining === 0;
      loadMore.textContent = remaining > 0 ? `Carregar mais${remaining < PAGE_SIZE ? ` ${remaining}` : ''}` : 'Carregar mais';
    }

    let message = `${total} ${total === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}`;
    if (raw.trim()) message += ` para “${raw.trim()}”`;
    else if (topic !== 'all') message += ` em ${labels[topic] || topic}`;
    else message = `${total} conteúdos disponíveis`;
    if (shown < total) message += ` · ${shown} exibidos`;
    if (status) status.textContent = message;

    if (catalogContext) {
      if (raw.trim()) catalogContext.textContent = total ? `Resultados para “${raw.trim()}”.` : 'Nenhum artigo corresponde à busca atual.';
      else if (topic !== 'all') catalogContext.textContent = `Artigos em ${labels[topic] || topic}.`;
      else catalogContext.textContent = 'Exibindo os conteúdos mais recentes. Use a busca ou as categorias para refinar.';
    }

    return total;
  }

  function applyFilters({ resetLimit = false } = {}) {
    if (resetLimit) displayLimit = PAGE_SIZE;
    const raw = search?.value || '';
    const query = normalize(raw);
    const visible = updateCatalog(query, raw);

    allowedSlides = slides.filter((slide) => matches(slide, query));
    activeIndex = 0;
    buildDots();

    if (allowedSlides.length) {
      carousel?.removeAttribute('hidden');
      showSlide();
    } else {
      slides.forEach((slide) => {
        slide.hidden = true;
        slide.classList.remove('is-active');
      });
      carousel?.setAttribute('hidden', '');
    }

    if (caption) {
      if (raw.trim()) caption.textContent = visible ? `Destaques relacionados a “${raw.trim()}”.` : 'Nenhum destaque corresponde a essa busca.';
      else if (topic !== 'all') caption.textContent = `Destaques em ${labels[topic] || topic}.`;
      else caption.textContent = 'Uma seleção dos conteúdos publicados na TM21.';
    }

    restartAutoplay();
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      topic = button.dataset.blogFilter || 'all';
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyFilters({ resetLimit: true });
    });
    button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
  });

  search?.addEventListener('input', () => applyFilters({ resetLimit: true }));
  search?.addEventListener('search', () => applyFilters({ resetLimit: true }));
  loadMore?.addEventListener('click', () => {
    displayLimit += PAGE_SIZE;
    applyFilters();
  });

  prev?.addEventListener('click', () => { step(-1); restartAutoplay(); });
  next?.addEventListener('click', () => { step(1); restartAutoplay(); });

  carousel?.addEventListener('mouseenter', () => { paused = true; stopAutoplay(); });
  carousel?.addEventListener('mouseleave', () => { paused = false; startAutoplay(); });
  carousel?.addEventListener('focusin', () => { paused = true; stopAutoplay(); });
  carousel?.addEventListener('focusout', () => { paused = false; startAutoplay(); });

  if ('IntersectionObserver' in window && carousel) {
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = Boolean(entry?.isIntersecting);
      if (inViewport) startAutoplay(); else stopAutoplay();
    }, { threshold: 0.18 });
    observer.observe(carousel);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay(); else startAutoplay();
  });

  applyFilters({ resetLimit: true });
})();
