(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => [...context.querySelectorAll(selector)];

  // Header state.
  const header = qs('#siteHeader');
  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  // Mobile menu.
  const menuToggle = qs('.menu-toggle');
  const mobileMenu = qs('#mobileMenu');

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('is-open', open);
    body.style.overflow = open ? 'hidden' : '';
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    qsa('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  // Reveal elements.
  const revealItems = qsa('.reveal-item, .reveal-title');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Floating WhatsApp appears after the hero.
  const whatsappFloat = qs('.whatsapp-float');
  const hero = qs('.hero');
  if (whatsappFloat && hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        whatsappFloat.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    heroObserver.observe(hero);
  } else if (whatsappFloat) {
    whatsappFloat.classList.add('is-visible');
  }

  // Hero ambient project mosaic. Animations run only while the section is visible.
  const heroMosaic = qs('#heroMosaic');
  if (heroMosaic) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      heroMosaic.classList.add('is-running');
    } else {
      const mosaicObserver = new IntersectionObserver((entries) => {
        heroMosaic.classList.toggle('is-running', Boolean(entries[0]?.isIntersecting));
      }, { threshold: 0.12 });
      mosaicObserver.observe(heroMosaic);
    }
  }

  // Hero project carousel. Runs only while visible and stops for reduced motion.
  const heroShowcase = qs('#heroShowcase');
  if (heroShowcase) {
    const heroTrack = qs('#heroShowcaseTrack', heroShowcase);
    const heroSlides = qsa('[data-hero-slide]', heroShowcase);
    const heroDots = qsa('[data-hero-slide-target]', heroShowcase);
    let heroIndex = 0;
    let heroTimer = null;
    let heroVisible = true;

    const setHeroSlide = (index, restart = true) => {
      if (!heroSlides.length) return;
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroTrack?.style.setProperty('--hero-slide-index', heroIndex);
      heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));
      heroDots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === heroIndex);
        dot.setAttribute('aria-current', i === heroIndex ? 'true' : 'false');
      });
      if (restart && !reduceMotion) startHeroTimer();
    };

    const stopHeroTimer = () => {
      if (heroTimer) window.clearInterval(heroTimer);
      heroTimer = null;
    };
    const startHeroTimer = () => {
      stopHeroTimer();
      if (reduceMotion || !heroVisible) return;
      heroTimer = window.setInterval(() => setHeroSlide(heroIndex + 1, false), 3800);
    };

    heroDots.forEach((dot) => dot.addEventListener('click', () => setHeroSlide(Number(dot.dataset.heroSlideTarget || 0))));
    heroShowcase.addEventListener('mouseenter', stopHeroTimer);
    heroShowcase.addEventListener('mouseleave', startHeroTimer);
    heroShowcase.addEventListener('focusin', stopHeroTimer);
    heroShowcase.addEventListener('focusout', startHeroTimer);

    if ('IntersectionObserver' in window) {
      const heroSliderObserver = new IntersectionObserver((entries) => {
        heroVisible = entries[0]?.isIntersecting ?? true;
        heroVisible ? startHeroTimer() : stopHeroTimer();
      }, { threshold: .18 });
      heroSliderObserver.observe(heroShowcase);
    } else {
      startHeroTimer();
    }

    setHeroSlide(0, false);
    startHeroTimer();
  }

  // Project accent follows the project currently in view.
  const projectAura = qs('#projectAura');
  const projects = qsa('.project[data-project-color]');
  if (projectAura && projects.length && 'IntersectionObserver' in window) {
    const projectObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        const accent = visible.target.dataset.projectColor;
        root.style.setProperty('--project-accent', accent);
      }
    }, { threshold: [0.18, 0.35, 0.55, 0.75] });

    projects.forEach((project) => projectObserver.observe(project));
  }

  // Portfolio category switch and auto-advancing project preview.
  const portfolioTabs = qsa('[data-portfolio-target]');
  const portfolioGroups = qsa('[data-portfolio-group]');
  const portfolioCarousel = qs('#portfolioCarousel');
  const portfolioSets = qsa('[data-portfolio-carousel-set]');
  const portfolioProgress = qsa('[data-portfolio-slide-target]');
  let portfolioTarget = 'pages';
  let portfolioSlideIndex = 0;
  let portfolioTimer = null;
  let portfolioVisible = true;

  const stopPortfolioTimer = () => {
    if (portfolioTimer) window.clearInterval(portfolioTimer);
    portfolioTimer = null;
  };

  const activePortfolioSet = () => portfolioSets.find((set) => set.dataset.portfolioCarouselSet === portfolioTarget);

  const setPortfolioSlide = (index, restart = true) => {
    const set = activePortfolioSet();
    if (!set) return;
    const slides = qsa('.portfolio-carousel__slide', set);
    if (!slides.length) return;
    portfolioSlideIndex = (index + slides.length) % slides.length;
    qs('.portfolio-carousel__track', set)?.style.setProperty('--portfolio-slide-index', portfolioSlideIndex);
    portfolioProgress.forEach((button, i) => {
      button.classList.toggle('is-active', i === portfolioSlideIndex);
      button.setAttribute('aria-current', i === portfolioSlideIndex ? 'true' : 'false');
    });
    if (restart && !reduceMotion) startPortfolioTimer();
  };

  const startPortfolioTimer = () => {
    stopPortfolioTimer();
    if (reduceMotion || !portfolioVisible || !portfolioCarousel) return;
    portfolioTimer = window.setInterval(() => setPortfolioSlide(portfolioSlideIndex + 1, false), 3800);
  };

  const setPortfolioGroup = (target) => {
    if (!portfolioTabs.length || !portfolioGroups.length) return;
    portfolioTarget = target;
    portfolioSlideIndex = 0;

    portfolioTabs.forEach((tab) => {
      const active = tab.dataset.portfolioTarget === target;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    portfolioGroups.forEach((group) => {
      const active = group.dataset.portfolioGroup === target;
      group.hidden = !active;
      group.classList.toggle('is-active', active);
    });

    portfolioSets.forEach((set) => {
      const active = set.dataset.portfolioCarouselSet === target;
      set.hidden = !active;
      set.classList.toggle('is-active', active);
      if (active) qs('.portfolio-carousel__track', set)?.style.setProperty('--portfolio-slide-index', 0);
    });

    setPortfolioSlide(0, false);
    startPortfolioTimer();

    const firstVisibleProject = qs(`[data-portfolio-group="${target}"] .project[data-project-color]`);
    if (firstVisibleProject) root.style.setProperty('--project-accent', firstVisibleProject.dataset.projectColor);
  };

  portfolioTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setPortfolioGroup(tab.dataset.portfolioTarget));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + portfolioTabs.length) % portfolioTabs.length;
      const nextTab = portfolioTabs[nextIndex];
      setPortfolioGroup(nextTab.dataset.portfolioTarget);
      nextTab.focus();
    });
  });

  portfolioProgress.forEach((button) => button.addEventListener('click', () => setPortfolioSlide(Number(button.dataset.portfolioSlideTarget || 0))));
  if (portfolioCarousel) {
    portfolioCarousel.addEventListener('mouseenter', stopPortfolioTimer);
    portfolioCarousel.addEventListener('mouseleave', startPortfolioTimer);
    portfolioCarousel.addEventListener('focusin', stopPortfolioTimer);
    portfolioCarousel.addEventListener('focusout', startPortfolioTimer);
    if ('IntersectionObserver' in window) {
      const portfolioSliderObserver = new IntersectionObserver((entries) => {
        portfolioVisible = entries[0]?.isIntersecting ?? true;
        portfolioVisible ? startPortfolioTimer() : stopPortfolioTimer();
      }, { threshold: .15 });
      portfolioSliderObserver.observe(portfolioCarousel);
    }
  }

  if (portfolioTabs.length && portfolioGroups.length) {
    const initialTab = portfolioTabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || portfolioTabs[0];
    setPortfolioGroup(initialTab.dataset.portfolioTarget);
  }

  // Process flow cycles through the six stages and remains directly selectable.
  const processFlow = qs('#processFlow');
  if (processFlow) {
    const steps = qsa('[data-process-step]', processFlow);
    const panels = qsa('[data-process-panel]', processFlow);
    let processIndex = 0;
    let processTimer = null;
    let processVisible = true;

    const stopProcessTimer = () => {
      if (processTimer) window.clearInterval(processTimer);
      processTimer = null;
    };
    const startProcessTimer = () => {
      stopProcessTimer();
      if (reduceMotion || !processVisible) return;
      processTimer = window.setInterval(() => setProcessStep(processIndex + 1, false), 3400);
    };
    const setProcessStep = (index, restart = true) => {
      if (!steps.length) return;
      processIndex = (index + steps.length) % steps.length;
      processFlow.style.setProperty('--process-index', processIndex);
      steps.forEach((step, i) => {
        const active = i === processIndex;
        step.classList.toggle('is-active', active);
        step.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel, i) => panel.classList.toggle('is-active', i === processIndex));
      if (restart) startProcessTimer();
    };

    steps.forEach((step) => step.addEventListener('click', () => setProcessStep(Number(step.dataset.processStep || 0))));
    processFlow.addEventListener('mouseenter', stopProcessTimer);
    processFlow.addEventListener('mouseleave', startProcessTimer);
    processFlow.addEventListener('focusin', stopProcessTimer);
    processFlow.addEventListener('focusout', startProcessTimer);
    if ('IntersectionObserver' in window) {
      const processObserver = new IntersectionObserver((entries) => {
        processVisible = entries[0]?.isIntersecting ?? true;
        processVisible ? startProcessTimer() : stopProcessTimer();
      }, { threshold: .2 });
      processObserver.observe(processFlow);
    }
    setProcessStep(0, false);
    startProcessTimer();
  }

  // Timeline progress based on intersection, without continuous scroll calculations.
  const timeline = qs('.timeline');
  if (timeline && 'IntersectionObserver' in window) {
    const items = qsa('.timeline-item', timeline);
    let visibleCount = 0;

    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = '1';
          visibleCount += 1;
          const progress = Math.min(100, (visibleCount / items.length) * 100);
          timeline.style.setProperty('--timeline-progress', `${progress}%`);
          timeline.style.setProperty('--timeline-progress-y', `${progress}%`);
        }
      });
    }, { threshold: 0.4 });

    items.forEach((item) => timelineObserver.observe(item));
  }

  // Contact form: validate, format Brazilian WhatsApp and send without leaving the page.
  const contactForm = qs('#contactForm');
  const feedback = qs('#formFeedback');
  const phoneField = qs('#phone');
  const submitButton = qs('#contactSubmit');
  const submitLabel = qs('.contact-form__submit-label');
  const formEndpoint = 'https://formsubmit.co/ajax/thiagomartsan@gmail.com';

  const onlyDigits = (value = '') => value.replace(/\D/g, '');

  const normalizeBrazilianPhone = (value = '') => {
    let digits = onlyDigits(value);
    if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
    return digits.slice(0, 11);
  };

  const formatBrazilianPhone = (value = '') => {
    const digits = normalizeBrazilianPhone(value);
    if (!digits) return '';
    if (digits.length < 3) return `(${digits}`;

    const area = digits.slice(0, 2);
    const local = digits.slice(2);
    if (!local) return `(${area})`;

    if (digits.length <= 10) {
      const first = local.slice(0, 4);
      const last = local.slice(4, 8);
      return `(${area}) ${first}${last ? `-${last}` : ''}`;
    }

    const first = local.slice(0, 5);
    const last = local.slice(5, 9);
    return `(${area}) ${first}${last ? `-${last}` : ''}`;
  };

  const validatePhone = () => {
    if (!phoneField) return true;
    const digits = normalizeBrazilianPhone(phoneField.value);
    const valid = digits.length === 0 || digits.length === 10 || digits.length === 11;
    phoneField.setCustomValidity(valid ? '' : 'Informe DDD e número com 10 ou 11 dígitos.');
    return valid;
  };

  if (phoneField) {
    phoneField.addEventListener('input', () => {
      phoneField.value = formatBrazilianPhone(phoneField.value);
      validatePhone();
    });

    phoneField.addEventListener('blur', validatePhone);
  }

  if (contactForm) {
    const fields = qsa('input:not(.form-honeypot), select, textarea', contactForm);

    const markValidity = (field) => {
      if (field === phoneField) validatePhone();
      const wrapper = field.closest('.field');
      const valid = field.checkValidity();
      if (wrapper) wrapper.classList.toggle('is-invalid', !valid);
      return valid;
    };

    fields.forEach((field) => {
      field.addEventListener('input', () => markValidity(field));
      field.addEventListener('change', () => markValidity(field));
    });

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      let firstInvalid = null;
      fields.forEach((field) => {
        if (!markValidity(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (feedback) {
          feedback.className = 'form-feedback is-error';
          feedback.textContent = 'Revise os campos obrigatórios antes de enviar.';
        }
        firstInvalid.focus();
        return;
      }

      const data = new FormData(contactForm);
      const phoneDigits = normalizeBrazilianPhone(data.get('phone') || '');
      const phoneFormatted = phoneDigits ? `+55 ${formatBrazilianPhone(phoneDigits)}` : 'Não informado';
      const subjectValue = data.get('subject');
      const payload = {
        _subject: `Novo contato pelo TM21 — ${subjectValue}`,
        _template: 'table',
        _replyto: data.get('email'),
        _honey: data.get('_honey') || '',
        Nome: data.get('name'),
        'Empresa ou projeto': data.get('company') || 'Não informado',
        Email: data.get('email'),
        WhatsApp: phoneFormatted,
        Assunto: subjectValue,
        Mensagem: data.get('message'),
        Origem: window.location.href
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
      }
      if (submitLabel) submitLabel.textContent = 'Enviando...';
      if (feedback) {
        feedback.className = 'form-feedback';
        feedback.textContent = 'Enviando sua mensagem...';
      }

      try {
        const response = await fetch(formEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false) {
          throw new Error(result.message || 'Falha no envio');
        }

        contactForm.reset();
        qsa('.field.is-invalid', contactForm).forEach((field) => field.classList.remove('is-invalid'));
        if (feedback) {
          feedback.className = 'form-feedback is-success';
          feedback.textContent = 'Mensagem enviada. Obrigado pelo contato — retorno assim que possível.';
        }
        window.dispatchEvent(new CustomEvent('tm21:form_success', {
          detail: { leadType: subjectValue || 'site_contact' }
        }));
        if (submitLabel) submitLabel.textContent = 'Mensagem enviada';
      } catch (error) {
        window.dispatchEvent(new CustomEvent('tm21:form_error'));
        if (feedback) {
          feedback.className = 'form-feedback is-error';
          feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale comigo pelo WhatsApp.';
        }
        if (submitLabel) submitLabel.textContent = 'Tentar novamente';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute('aria-busy');
        }
      }
    });
  }

  // Keep internal anchor jumps clear of the fixed header for browsers that ignore scroll-margin.
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = qs(targetId);
      if (!target || reduceMotion) return;
      event.preventDefault();
      const headerOffset = (header?.offsetHeight || 0) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
