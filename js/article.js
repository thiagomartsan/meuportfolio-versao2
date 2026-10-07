(() => {
  const tocs = [...document.querySelectorAll('.article-toc')];

  const setupToc = (toc) => {
    const links = [...toc.querySelectorAll('nav a[href^="#"]')];
    const targets = links
      .map((link) => {
        const id = decodeURIComponent(link.getAttribute('href').slice(1));
        const target = document.getElementById(id);
        return target ? { link, target } : null;
      })
      .filter(Boolean);
    if (!targets.length) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const header = document.querySelector('.site-header');
      const offset = (header?.getBoundingClientRect().height || 72) + 44;
      const y = window.scrollY + offset;

      let active = 0;
      targets.forEach(({ target }, index) => {
        if (target.offsetTop <= y) active = index;
      });

      targets.forEach(({ link }, index) => {
        const current = index === active;
        link.classList.toggle('is-active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });

      const firstTop = targets[0].target.offsetTop;
      const lastTarget = targets[targets.length - 1].target;
      const article = lastTarget.closest('.article-content--v21') || document.querySelector('.article-content--v21');
      const end = article ? article.offsetTop + article.offsetHeight : lastTarget.offsetTop + lastTarget.offsetHeight;
      const range = Math.max(end - firstTop, 1);
      const progress = Math.min(100, Math.max(0, ((window.scrollY + offset - firstTop) / range) * 100));
      toc.style.setProperty('--toc-progress', `${progress.toFixed(1)}%`);
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
  };

  tocs.forEach(setupToc);

  const form = document.querySelector('[data-channel-diagnostic]');
  if (!form) return;
  const result = form.querySelector('[data-diagnostic-result]');
  const button = form.querySelector('[data-diagnostic-submit]');

  const scoreOption = (select) => {
    const option = select.options[select.selectedIndex];
    return {
      site: Number(option?.dataset.site || 0),
      insta: Number(option?.dataset.insta || 0)
    };
  };

  button?.addEventListener('click', () => {
    const selects = [...form.querySelectorAll('select[data-score]')];
    const missing = selects.filter((select) => !select.value);
    selects.forEach((select) => select.removeAttribute('aria-invalid'));

    if (missing.length) {
      missing.forEach((select) => select.setAttribute('aria-invalid', 'true'));
      missing[0].focus();
      if (result) {
        result.hidden = false;
        result.innerHTML = '<strong>Faltam algumas respostas.</strong><p>Preencha os campos para gerar uma leitura do cenário.</p>';
      }
      return;
    }

    const totals = selects.reduce((acc, select) => {
      const score = scoreOption(select);
      acc.site += score.site;
      acc.insta += score.insta;
      return acc;
    }, { site: 0, insta: 0 });

    let title = 'Prioridade combinada';
    let copy = 'O cenário pede funções complementares. Instagram pode concentrar descoberta e prova social; site e Google podem organizar busca, informação permanente e conversão para WhatsApp.';

    if (totals.site >= totals.insta + 4) {
      title = 'Prioridade: site + Google';
      copy = 'Há sinais de busca, comparação ou complexidade de informação suficientes para justificar uma presença própria mais cedo. O Instagram continua útil para conteúdo, prova social e relacionamento.';
    } else if (totals.insta >= totals.site + 3) {
      title = 'Prioridade: Instagram, com base mínima no Google';
      copy = 'O negócio depende mais de descoberta visual, relacionamento e frequência. Um site pode entrar depois, de forma enxuta, quando aparecerem demanda de busca, perguntas repetidas, campanhas ou necessidade de organizar melhor a oferta.';
    }

    if (result) {
      result.hidden = false;
      result.innerHTML = `<span>LEITURA DO CENÁRIO</span><strong>${title}</strong><p>${copy}</p><small>Este diagnóstico organiza critérios de decisão. Ele não estima vendas nem substitui análise de demanda do nicho.</small>`;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  });
})();
