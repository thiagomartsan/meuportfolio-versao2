(() => {
  'use strict';

  const STORAGE_KEY = 'tm21_cookie_choice';
  const GA_ID = 'G-1WBRRW7W12';
  let analyticsLoaded = false;
  let currentChoice = null;

  const getChoice = () => {
    try {
      const choice = localStorage.getItem(STORAGE_KEY);
      return ['necessary', 'analytics'].includes(choice) ? choice : null;
    } catch (error) { return null; }
  };

  const saveChoice = (choice) => {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (error) {}
  };

  const loadAnalytics = () => {
    window[`ga-disable-${GA_ID}`] = false;
    if (analyticsLoaded || document.querySelector(`script[data-tm21-ga="${GA_ID}"]`)) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.dataset.tm21Ga = GA_ID;
    document.head.appendChild(script);
  };

  const disableAnalytics = () => {
    // Stop an already loaded tag as well as the site's custom events immediately.
    window[`ga-disable-${GA_ID}`] = true;
    const names = document.cookie.split(';').map((cookie) => cookie.trim().split('=')[0]);
    const domains = ['', window.location.hostname];
    const parts = window.location.hostname.split('.');
    for (let i = 0; i < parts.length - 1; i += 1) domains.push(parts.slice(i).join('.'));
    names.filter((name) => /^_ga(?:_|$)/.test(name)).forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
  };

  window.tm21AnalyticsAllowed = () => currentChoice === 'analytics'
    && !window[`ga-disable-${GA_ID}`];

  const updateChoiceStatus = () => {
    document.querySelectorAll('[data-cookie-status]').forEach((element) => {
      element.textContent = currentChoice === 'analytics' ? 'Análise ativada neste navegador.'
        : currentChoice === 'necessary' ? 'Análise desativada neste navegador.'
          : 'Você ainda não escolheu. A análise está desativada.';
    });
  };

  const buildBanner = (focus = false) => {
    if (document.querySelector('.cookie-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Preferências de cookies');
    const previousFocus = document.activeElement;
    banner.innerHTML = `
      <div class="cookie-banner__copy">
        <strong>Cookies e medição</strong>
        <p>O Google Analytics só é carregado se você aceitar a análise de visitas e interações. Recusar não impede a navegação nem o contato.</p>
        <a href="/privacidade/#cookies">Detalhes sobre cookies e privacidade</a>
        <p class="cookie-banner__status" data-cookie-status></p>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" class="cookie-banner__secondary" data-cookie-choice="necessary">Recusar análise</button>
        <button type="button" class="cookie-banner__primary" data-cookie-choice="analytics">Aceitar análise</button>
      </div>`;
    document.body.appendChild(banner);
    updateChoiceStatus();

    requestAnimationFrame(() => banner.classList.add('is-visible'));
    if (focus) banner.querySelector('button')?.focus();

    banner.querySelectorAll('[data-cookie-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        const choice = button.dataset.cookieChoice;
        currentChoice = choice;
        saveChoice(choice);
        if (choice === 'analytics') loadAnalytics();
        else disableAnalytics();
        updateChoiceStatus();
        banner.remove();
        if (focus && previousFocus?.isConnected) previousFocus.focus();
      });
    });
  };

  const openPreferences = () => {
    const current = document.querySelector('.cookie-banner');
    if (current) {
      current.classList.add('is-visible');
      current.querySelector('button')?.focus();
      return;
    }
    buildBanner(true);
  };

  window.tm21CookiePreferences = openPreferences;

  currentChoice = getChoice();
  if (currentChoice === 'analytics') loadAnalytics();
  else disableAnalytics();

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    currentChoice = getChoice();
    if (currentChoice === 'analytics') loadAnalytics();
    else disableAnalytics();
    updateChoiceStatus();
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!currentChoice) buildBanner();
    updateChoiceStatus();
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      event.preventDefault();
      openPreferences();
    });
  });
})();
