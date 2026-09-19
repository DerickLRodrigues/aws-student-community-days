'use strict';
(() => {
  const events = window.STUDENT_DAYS_EVENTS || [];
  const years = [...new Set(events.map(event => event.year))].sort((a, b) => b - a);
  const home = document.getElementById('home-view');
  const detail = document.getElementById('detail-view');
  const yearSelect = document.getElementById('year-select');
  const eventList = document.getElementById('event-list');
  const baseTitle = 'AWS Student Community Days Brasil';
  const baseDescription = document.querySelector('meta[name="description"]').content;
  let selectedYear = years[0];
  let detailIsOpen = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dateParts = event => {
    const date = new Date(`${event.date}T12:00:00Z`);
    const format = options => new Intl.DateTimeFormat('pt-BR', {...options, timeZone:'UTC'}).format(date);
    return { day:format({day:'2-digit'}), month:format({month:'long'}), weekday:format({weekday:'long'}), full:format({day:'numeric',month:'long',year:'numeric'}) };
  };
  const safeUrl = value => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
  };
  function renderEditions(year) {
    selectedYear = Number(year);
    yearSelect.value = String(selectedYear);
    const matching = events.filter(event => event.year === selectedYear).sort((a,b)=>a.date.localeCompare(b.date));
    document.getElementById('event-count').textContent = `${matching.length} ${matching.length === 1 ? 'cidade confirmada' : 'cidades confirmadas'}`;
    eventList.innerHTML = matching.length ? matching.map(event => {
      const date = dateParts(event);
      return `<a class="event-card" href="#/${event.year}/${escape(event.slug)}" aria-label="Ver edição de ${escape(event.city)}, ${date.full}"><div class="ticket-date"><span>${date.month.toUpperCase()}</span><strong>${date.day}</strong><span>${date.weekday.toUpperCase()} · ${event.year}</span></div><div class="ticket-body"><span class="status">DATA CONFIRMADA</span><h3>${escape(event.city)}<span>${escape(event.state)}</span></h3><p>${escape(event.summary)}</p><div class="ticket-details"><span>${escape(event.stateName)}</span><span>${escape(event.venue || 'Local em breve')}</span></div></div><div class="ticket-action"><span class="round-arrow" aria-hidden="true">↗</span><span>Ver edição</span></div></a>`;
    }).join('') : '<div class="empty-state"><h3>Nenhuma edição anunciada para este ano.</h3><p>As novas cidades aparecerão aqui assim que forem confirmadas.</p></div>';
  }
  function renderDetail(event) {
    const date = dateParts(event);
    const registrationUrl = safeUrl(event.registrationUrl);
    const schedule = event.schedule.length ? `<ul class="schedule-list">${event.schedule.map(item=>`<li><time>${escape(item.time)}</time><div><h3>${escape(item.title)}</h3>${item.speaker ? `<p>${escape(item.speaker)}</p>` : ''}</div></li>`).join('')}</ul>` : '<p class="pending-text">A programação está sendo preparada. Os horários e as atividades serão publicados aqui.</p>';
    const speakers = event.speakers.length ? `<ul class="speaker-list">${event.speakers.map(person=>`<li><h3>${escape(person.name)}</h3><p>${escape(person.bio)}</p></li>`).join('')}</ul>` : '<p class="pending-text">Em breve, conheça as pessoas que vão compartilhar conhecimento com a comunidade.</p>';
    detail.innerHTML = `<div class="detail-hero"><div class="shell"><a class="back-link" href="#edicoes"><span aria-hidden="true">←</span> Todas as edições</a><div class="detail-hero-row"><div><p class="eyebrow">AWS STUDENT COMMUNITY DAYS · ${event.year}</p><h1 id="detail-title" tabindex="-1">${escape(event.city)}<span class="title-dot">.</span></h1><p class="detail-location">${escape(event.stateName)} · Brasil</p></div><div class="detail-date"><span>${date.month.toUpperCase()}</span><strong>${date.day}</strong><span>${date.weekday.toUpperCase()} · ${event.year}</span></div></div><div class="detail-tags"><span>EDIÇÃO ${event.year}</span><span>FEITO PELA COMUNIDADE</span></div></div></div><div class="detail-content section-light"><div class="shell detail-columns"><div class="detail-main"><section aria-labelledby="edition-about"><p class="eyebrow">O ENCONTRO</p><h2 id="edition-about">Bora construir essa<br>conexão em ${escape(event.city === 'Belo Horizonte' ? 'BH' : event.city)}?</h2><p class="detail-description">${escape(event.description)}</p></section><section class="detail-section" aria-labelledby="schedule-title"><div class="detail-section-heading"><h2 id="schedule-title">Programação</h2>${event.schedule.length ? '' : '<span class="pending-badge">EM BREVE</span>'}</div>${schedule}</section><section class="detail-section" aria-labelledby="speakers-title"><div class="detail-section-heading"><h2 id="speakers-title">Palestrantes</h2>${event.speakers.length ? '' : '<span class="pending-badge">EM BREVE</span>'}</div>${speakers}</section></div><aside class="event-info" aria-labelledby="info-title"><div class="info-top"><span class="status">DATA CONFIRMADA</span><h2 id="info-title">Anota aí.</h2></div><dl><div><dt>QUANDO</dt><dd><time datetime="${escape(event.date)}">${date.full}</time><small>${date.weekday.charAt(0).toUpperCase()+date.weekday.slice(1)}${event.time ? ` · ${escape(event.time)}` : ' · Horário em breve'}</small></dd></div><div><dt>ONDE</dt><dd>${escape(event.city)} · ${escape(event.state)}<small>${escape(event.venue || 'Local a ser anunciado')}${event.address ? `<br>${escape(event.address)}` : ''}</small></dd></div></dl><div class="registration">${registrationUrl ? `<a class="button button-orange" href="${escape(registrationUrl)}" target="_blank" rel="noopener noreferrer">Inscreva-se <span aria-hidden="true">↗</span></a>` : '<span class="registration-status">Inscrições em breve</span><p>O link de inscrição será divulgado nesta página.</p>'}</div></aside></div><div class="shell detail-bottom"><span>Uma comunidade. Muitas possibilidades.</span><a href="#sobre">Conheça o movimento <span aria-hidden="true">↗</span></a></div></div>`;
    document.title = `${event.city} ${event.year} | ${baseTitle}`;
    document.querySelector('meta[name="description"]').content = `${baseTitle} em ${event.city}, ${date.full}. Confira local, programação e inscrições da edição.`;
  }
  function route() {
    const hash = location.hash;
    const cityRoute = hash.match(/^#\/(\d{4})\/([a-z0-9-]+)$/);
    if (cityRoute) {
      const event = events.find(item => item.year === Number(cityRoute[1]) && item.slug === cityRoute[2]);
      home.hidden = true;
      detail.hidden = false;
      detailIsOpen = true;
      if (event) {
        renderEditions(event.year);
        renderDetail(event);
      } else {
        detail.innerHTML = '<div class="shell missing-event"><p class="eyebrow">EDIÇÕES</p><h1 id="detail-title" tabindex="-1">Edição não encontrada.</h1><p>Esta cidade ainda não tem uma edição anunciada para o ano selecionado.</p><a class="button button-orange" href="#edicoes">Ver edições disponíveis</a></div>';
        document.title = `Edição não encontrada | ${baseTitle}`;
      }
      window.scrollTo({top:0,behavior:'instant'});
      document.getElementById('detail-title').focus({preventScroll:true});
      return;
    }
    const yearRoute = hash.match(/^#\/edicoes\/(\d{4})$/);
    const returning = detailIsOpen;
    detailIsOpen = false;
    home.hidden = false;
    detail.hidden = true;
    document.title = baseTitle;
    document.querySelector('meta[name="description"]').content = baseDescription;
    if (yearRoute) renderEditions(Number(yearRoute[1]));
    const targetId = yearRoute ? 'edicoes' : hash.slice(1) || 'inicio';
    const target = document.getElementById(targetId);
    if (target && (returning || yearRoute || hash)) {
      target.scrollIntoView({behavior:'instant',block:'start'});
      if (returning) {
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
      }
    }
  }
  yearSelect.innerHTML = years.map(year=>`<option value="${year}">${year}</option>`).join('');
  yearSelect.addEventListener('change', () => { location.hash = `/edicoes/${yearSelect.value}`; });
  window.addEventListener('hashchange', route);
  renderEditions(selectedYear);
  route();
})();
