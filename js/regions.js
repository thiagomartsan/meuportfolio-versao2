(() => {
  'use strict';
  const dataNode = document.getElementById('rs-coverage-data');
  if (!dataNode) return;
  let data;
  try { data = JSON.parse(dataNode.textContent); } catch { return; }
  if (!data.stateName || !data.stateCode || !data.online) return;
  const mapCard = document.querySelector('.rs-map-card');
  const controls = document.querySelector('.rs-region-controls');
  const panelName = document.getElementById('region-name');
  const mode = document.getElementById('region-mode');
  const examples = document.getElementById('region-examples');
  const description = document.getElementById('region-description');
  const initialPanel = { name: panelName.innerText, examples: examples.textContent, description: description.textContent };
  const contact = document.getElementById('region-contact');
  const motion = document.getElementById('rs-motion');
  const form = document.getElementById('rs-city-lookup');
  const input = document.getElementById('rs-city');
  const result = document.getElementById('rs-city-result');
  const initialResult = result.textContent;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim().replace(/\s+/g, ' ');
  const citiesByName = new Map(data.cities.map(city => [normalize(city.name), city]));
  data.cities.forEach(city => (city.aliases || []).forEach(alias => citiesByName.set(normalize(alias), city)));
  const options = document.getElementById('rs-city-options');
  const fragment = document.createDocumentFragment();
  data.cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.name;
    fragment.appendChild(option);
  });
  options.appendChild(fragment);

  const selectRegion = (region, cityName = '') => {
    if (!['all', 'online', ...Object.keys(data.zones)].includes(region)) return;
    controls.querySelectorAll('[data-region]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.region === region));
    });
    mapCard.dataset.selection = region === 'all' ? 'all' : region === 'online' ? 'online' : 'region';
    mapCard.querySelectorAll('[data-map-region]').forEach(path => {
      path.classList.toggle('is-selected', path.dataset.mapRegion === region);
    });
    const online = region === 'online';
    mode.textContent = online ? 'ATENDIMENTO ONLINE' : 'PRESENCIAL SOB COMBINAÇÃO + ONLINE';
    if (region === 'all') {
      panelName.textContent = initialPanel.name;
      examples.textContent = initialPanel.examples;
      description.textContent = initialPanel.description;
    } else if (online) {
      panelName.textContent = cityName || data.online.name;
      examples.textContent = cityName ? `${cityName}, ${data.stateName}. Atendimento online do briefing à publicação.` : data.online.examples;
      description.textContent = data.online.description;
    } else {
      const zone = data.zones[region];
      panelName.textContent = cityName || zone.name;
      examples.textContent = cityName ? `${cityName}, na área de ${zone.name}. Visita sujeita à agenda e ao alinhamento prévio dos custos de viagem; projeto completo também online.` : zone.examples;
      description.textContent = zone.description;
    }
    const place = cityName ? `${cityName}, ${data.stateCode}` : region === 'all' ? data.stateName : online ? `${data.stateCode}, com atendimento online` : `${data.zones[region].name}, ${data.stateCode}`;
    contact.href = `https://wa.me/5551997890145?text=${encodeURIComponent(`Olá, Thiago. Vi a página da TM21 sobre criação de sites em ${data.stateName}. Meu negócio fica em ${place} e gostaria de conversar sobre um projeto.`)}`;
  };
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-region]');
    if (!button) return;
    selectRegion(button.dataset.region);
    // Only a fixed region code is tracked; city searches and free text are never sent.
    window.tm21Track?.('region_select', { region: button.dataset.region, state: data.stateCode });
  });
  mapCard.addEventListener('click', event => {
    const path = event.target.closest('[data-map-region]');
    if (!path) return;
    selectRegion(path.dataset.mapRegion);
    const button = controls.querySelector(`[data-region="${path.dataset.mapRegion}"]`);
    button?.focus({ preventScroll: true });
    window.tm21Track?.('region_select', { region: path.dataset.mapRegion, state: data.stateCode });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const city = citiesByName.get(normalize(input.value));
    result.classList.toggle('is-match', Boolean(city));
    if (!city) {
      result.textContent = `Não encontrei esse município de ${data.stateName}. Confira o nome completo nas sugestões ou converse pelo WhatsApp.`;
      return;
    }
    input.value = city.name;
    selectRegion(city.zone, city.name);
    result.textContent = city.zone === 'online' ? `${city.name}: atendimento online em todas as etapas do projeto.` : `${city.name}: online e possibilidade de visita sob combinação, com agenda e custos de viagem alinhados previamente.`;
  });
  input.addEventListener('input', () => {
    result.textContent = initialResult;
    result.classList.remove('is-match');
  });
  let userPaused = false;
  const syncMotion = () => {
    const paused = reduced.matches || userPaused;
    mapCard.classList.toggle('is-paused', paused);
    motion.setAttribute('aria-pressed', String(paused));
    motion.disabled = reduced.matches;
    motion.textContent = reduced.matches ? 'Movimento reduzido' : paused ? 'Retomar animação' : 'Pausar animação';
  };
  motion.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  reduced.addEventListener('change', syncMotion);
  syncMotion();
  document.body.classList.add('rs-enhanced');
  controls.hidden = false;
  motion.hidden = false;
  form.hidden = false;
})();
