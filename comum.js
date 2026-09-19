/*
 * Utilidades e componentes usados pelo hub (hub.js) e pelas páginas de
 * cidade (edicao.js). Carregue sempre depois de dados.js e brasil-mapa.js.
 */
'use strict';

window.ASCD = (function () {
  var SITE = window.SITE || {};
  var EDICOES = window.EDICOES || [];
  var MAPA = window.BRASIL_MAPA;
  var HOJE = new Date();

  /* ── texto e segurança ───────────────────────────────────────────── */

  /* Campo ainda não configurado em dados.js */
  function preenchido(v) {
    return typeof v === 'string' && v.trim() !== '' && v.trim() !== 'PREENCHER';
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Só aceita https, para um link errado em dados.js não virar javascript: */
  function urlSegura(v) {
    if (!preenchido(v)) return null;
    try {
      var u = new URL(v.trim());
      return u.protocol === 'https:' ? u.href : null;
    } catch (e) { return null; }
  }

  function mailto(email, assunto) {
    if (!preenchido(email)) return null;
    return 'mailto:' + email + (assunto ? '?subject=' + encodeURIComponent(assunto) : '');
  }

  /* ── datas ───────────────────────────────────────────────────────── */

  function dia(iso) { return new Date(iso + 'T12:00:00Z'); }

  function formatar(iso, opcoes) {
    return new Intl.DateTimeFormat('pt-BR', Object.assign({ timeZone: 'UTC' }, opcoes)).format(dia(iso));
  }

  function maiuscula(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  /* Dias inteiros até uma data. Negativo quando já passou. */
  function diasAte(iso) {
    var agora = Date.UTC(HOJE.getFullYear(), HOJE.getMonth(), HOJE.getDate(), 12);
    return Math.round((dia(iso).getTime() - agora) / 86400000);
  }

  function dataLonga(iso) {
    return formatar(iso, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function diaSemana(iso) {
    return maiuscula(formatar(iso, { weekday: 'long' }));
  }

  function dataCurta(iso) {
    return formatar(iso, { day: '2-digit' }) + ' ' +
      formatar(iso, { month: 'short' }).replace('.', '') + ' ' +
      formatar(iso, { year: 'numeric' });
  }

  /* '09:00 às 17:00' -> '9h às 17h'. Mantém minutos quando existem. */
  function horario(h) {
    if (!preenchido(h)) return null;
    return h.replace(/(\d{1,2}):00/g, '$1h').replace(/\b0(\d)/g, '$1');
  }

  function plural(n, um, muitos) {
    return n + ' ' + (n === 1 ? um : muitos);
  }

  /* ── DOM ─────────────────────────────────────────────────────────── */

  function el(id) { return document.getElementById(id); }

  function pintar(id, html) {
    var alvo = el(id);
    if (alvo) alvo.innerHTML = html;
    return alvo;
  }

  /* Lembrete visível de campo não configurado. É feio de propósito. */
  function avisoPreencher(campo) {
    return '<p class="aviso-preencher">Falta preencher <code>' + esc(campo) +
      '</code> em <code>dados.js</code> para este link funcionar.</p>';
  }

  /* ── edições ─────────────────────────────────────────────────────── */

  var ordenadas = EDICOES.slice().sort(function (a, b) { return a.data.localeCompare(b.data); });

  function futuras() {
    return ordenadas.filter(function (e) { return diasAte(e.data) >= 0; });
  }

  function proxima() {
    return futuras()[0] || ordenadas[ordenadas.length - 1] || null;
  }

  function porSlug(slug) {
    for (var i = 0; i < EDICOES.length; i++) {
      if (EDICOES[i].slug === slug) return EDICOES[i];
    }
    return null;
  }

  /* ── anos ─────────────────────────────────────────────────────────
     O site é organizado por ano: por padrão mostra o ano vigente. */

  /* Usa o campo `ano`, mas cai para o ano da data se ele faltar */
  function anoDe(e) {
    return Number(e.ano) || Number(String(e.data).slice(0, 4));
  }

  /* Todos os anos que têm edição, em ordem crescente */
  function anos() {
    var vistos = {};
    ordenadas.forEach(function (e) { vistos[anoDe(e)] = true; });
    return Object.keys(vistos).map(Number).sort(function (a, b) { return a - b; });
  }

  /*
   * Qual ano mostrar quando ninguém escolheu:
   *   1. o ano corrente, se tiver edição
   *   2. senão, o próximo ano que tenha
   *   3. senão, o ano mais recente que já teve
   */
  function anoVigente() {
    var atual = HOJE.getFullYear();
    var lista = anos();
    if (!lista.length) return atual;
    if (lista.indexOf(atual) !== -1) return atual;
    var futuros = lista.filter(function (a) { return a > atual; });
    return futuros.length ? futuros[0] : lista[lista.length - 1];
  }

  function edicoesDoAno(ano) {
    return ordenadas.filter(function (e) { return anoDe(e) === Number(ano); });
  }

  /* Caminho da página da cidade, relativo à página atual.
     base '' = estou no hub; base '../' = estou dentro de /cidade/ */
  function caminho(edicao, base) {
    return (base || '') + edicao.slug + '/';
  }

  /* ── o que pertence à cidade ──────────────────────────────────────
     Cada edição pode ter as próprias cotas, trilhas, e-mails e redes.
     Quando o campo é null, cai no modelo padrão de dados.js. */

  function cotasDe(e) {
    return (e && Array.isArray(e.cotas) && e.cotas.length) ? e.cotas : (window.COTAS_PADRAO || []);
  }

  function trilhasDe(e) {
    return (e && Array.isArray(e.trilhas) && e.trilhas.length) ? e.trilhas : (window.TRILHAS_PADRAO || []);
  }

  function patrocinadoresDe(e) {
    return (e && Array.isArray(e.patrocinadores)) ? e.patrocinadores : [];
  }

  function emailDe(e) {
    if (e && preenchido(e.email)) return e.email.trim();
    return preenchido(SITE.emailGeral) ? SITE.emailGeral.trim() : null;
  }

  /* Cai para o e-mail geral da edição se não houver um só de patrocínio */
  function emailPatrocinioDe(e) {
    if (e && preenchido(e.emailPatrocinio)) return e.emailPatrocinio.trim();
    return emailDe(e);
  }

  /* Só redes com URL https válida entram */
  function redesDe(e) {
    var lista = (e && Array.isArray(e.redes) && e.redes.length) ? e.redes : (SITE.redesGerais || []);
    return lista.map(function (r) {
      var u = urlSegura(r.url);
      return u ? { nome: r.nome, url: u } : null;
    }).filter(Boolean);
  }

  /* Estado da chamada de palestras, já resolvido */
  function cfp(edicao) {
    var url = urlSegura(edicao.palestrasUrl);
    if (!edicao.prazoPalestras) return { url: url, aberta: false, dias: null, prazo: null };
    var dias = diasAte(edicao.prazoPalestras);
    return {
      url: url,
      aberta: dias >= 0,
      dias: dias,
      prazo: dataLonga(edicao.prazoPalestras)
    };
  }

  /* ── mapa do Brasil ──────────────────────────────────────────────── */

  /*
   * opcoes = {
   *   alvo:      id do elemento que recebe o mapa
   *   base:      prefixo de caminho para os links ('' no hub, '../' na cidade)
   *   destaque:  slug de uma única edição a acender; ausente = todas
   *   estatico:  true desliga link e balão (mapa só ilustrativo)
   * }
   */
  function montarMapa(opcoes) {
    var palco = el(opcoes.alvo);
    if (!palco || !MAPA || !MAPA.estados) return;

    var caixa = MAPA.viewBox.split(' ');
    var largura = parseFloat(caixa[2]);
    var altura = parseFloat(caixa[3]);

    var lista = opcoes.destaque
      ? EDICOES.filter(function (e) { return e.slug === opcoes.destaque; })
      : (opcoes.ano ? edicoesDoAno(opcoes.ano) : EDICOES);

    /* UF -> edição. Se duas edições caírem no mesmo estado, vence a mais próxima. */
    var acesas = {};
    lista.slice().sort(function (a, b) { return a.data.localeCompare(b.data); })
      .forEach(function (e) { if (e.uf && !acesas[e.uf]) acesas[e.uf] = e; });

    var svg = [];
    /* role="group" e não "img": o mapa contém links focáveis, e role="img"
       apagaria esses links da árvore de acessibilidade. */
    svg.push('<svg class="mapa-svg" viewBox="' + esc(MAPA.viewBox) + '" role="group" aria-label="' +
      esc('Mapa do Brasil. ' + plural(Object.keys(acesas).length, 'edição confirmada', 'edições confirmadas') + '.') + '">');

    svg.push('<defs>' +
      '<radialGradient id="brilho-uf" cx="50%" cy="50%" r="70%">' +
      '<stop offset="0%" stop-color="#4C2E8F"/><stop offset="100%" stop-color="#2A1A4D"/></radialGradient>' +
      '<radialGradient id="halo">' +
      '<stop offset="0%" stop-color="#E879F9" stop-opacity=".30"/>' +
      '<stop offset="55%" stop-color="#8B5CF6" stop-opacity=".10"/>' +
      '<stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient></defs>');

    /* Halo atrás de tudo, um por cidade */
    var pontos = [];
    Object.keys(acesas).forEach(function (uf) {
      var e = acesas[uf];
      if (typeof e.lat !== 'number' || typeof e.lon !== 'number' || !MAPA.projetar) return;
      var p = MAPA.projetar(e.lon, e.lat);
      pontos.push({ edicao: e, x: p.x, y: p.y });
      svg.push('<circle class="mapa-halo" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="118"/>');
    });

    /* Estados sem edição: desenhados, fora do foco e do leitor de tela */
    Object.keys(MAPA.estados).forEach(function (uf) {
      if (acesas[uf]) return;
      svg.push('<path class="uf" d="' + MAPA.estados[uf].d + '" aria-hidden="true"/>');
    });

    /* Estados com edição */
    Object.keys(acesas).forEach(function (uf) {
      var est = MAPA.estados[uf];
      if (!est) return;
      var e = acesas[uf];
      if (opcoes.estatico) {
        svg.push('<path class="uf uf-aceso" d="' + est.d + '" aria-hidden="true"/>');
      } else {
        svg.push(
          '<a class="uf-link" href="' + esc(caminho(e, opcoes.base)) + '" data-slug="' + esc(e.slug) + '" ' +
          'aria-label="' + esc(e.cidade + ', ' + e.estado + ', em ' + dataLonga(e.data) + '. Ver a página da edição.') + '">' +
          '<path class="uf uf-aceso" d="' + est.d + '"/></a>'
        );
      }
    });

    /* Pinos */
    pontos.forEach(function (p) {
      svg.push('<g class="pino" aria-hidden="true">' +
        '<circle class="pino-anel" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="5"/>' +
        '<circle class="pino-nucleo" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4.6"/></g>');
    });

    svg.push('</svg>');

    /* Balões em HTML: texto nítido e sem risco de corte pelo viewBox */
    var baloes = opcoes.estatico ? '' : pontos.map(function (p, i) {
      return '<div class="balao" data-balao="' + esc(p.edicao.slug) + '" id="balao-' + i + '" hidden>' +
        '<strong>' + esc(p.edicao.cidade) + '</strong>' +
        '<span>' + esc(dataCurta(p.edicao.data)) + '</span></div>';
    }).join('');

    palco.innerHTML = svg.join('') + baloes;

    if (opcoes.estatico) return;

    /* Posiciona cada balão em porcentagem, para acompanhar o redimensionamento */
    pontos.forEach(function (p, i) {
      var balao = el('balao-' + i);
      if (!balao) return;
      balao.style.left = (p.x / largura * 100) + '%';
      balao.style.top = (p.y / altura * 100) + '%';

      var link = palco.querySelector('.uf-link[data-slug="' + p.edicao.slug + '"]');
      if (!link) return;
      ['mouseenter', 'focus'].forEach(function (ev) {
        link.addEventListener(ev, function () { balao.hidden = false; });
      });
      ['mouseleave', 'blur'].forEach(function (ev) {
        link.addEventListener(ev, function () { balao.hidden = true; });
      });
    });
  }

  /* ── rodapé, igual nas duas páginas ──────────────────────────────── */

  /*
   * montarRodape(edicao)
   *   edicao presente  -> mostra os contatos daquela cidade
   *   edicao ausente   -> usa o contato geral do movimento; se não houver,
   *                       mostra o da próxima edição, dizendo de qual cidade é
   */
  function montarRodape(edicao) {
    var ano = el('rodape-ano');
    if (ano) ano.textContent = '© ' + HOJE.getFullYear() + ' ' + (SITE.nome || '');

    var caixa = el('rodape-contato');
    if (!caixa) return;

    var alvo = edicao || null;
    var rotulo = null;

    if (!alvo && !preenchido(SITE.emailGeral) && !(SITE.redesGerais || []).length) {
      alvo = proxima();
      if (alvo) rotulo = alvo.cidade;
    }

    var itens = [];
    var email = emailDe(alvo);
    if (email) itens.push({ nome: email, url: 'mailto:' + email, externo: false });
    redesDe(alvo).forEach(function (r) {
      itens.push({ nome: r.nome, url: r.url, externo: true });
    });

    if (!itens.length) return;

    caixa.hidden = false;
    var titulo = caixa.querySelector('.rodape-rotulo');
    if (titulo && rotulo) titulo.textContent = 'Contato — ' + rotulo;

    caixa.insertAdjacentHTML('beforeend', itens.map(function (i) {
      return '<a href="' + esc(i.url) + '"' + (i.externo ? ' target="_blank" rel="noopener"' : '') +
        '>' + esc(i.nome) + '</a>';
    }).join(''));
  }

  return {
    SITE: SITE, EDICOES: EDICOES, ordenadas: ordenadas,
    preenchido: preenchido, esc: esc, urlSegura: urlSegura, mailto: mailto,
    formatar: formatar, dataLonga: dataLonga, diaSemana: diaSemana, dataCurta: dataCurta,
    diasAte: diasAte, horario: horario, plural: plural, maiuscula: maiuscula,
    el: el, pintar: pintar, avisoPreencher: avisoPreencher,
    futuras: futuras, proxima: proxima, porSlug: porSlug, caminho: caminho, cfp: cfp,
    anoDe: anoDe, anos: anos, anoVigente: anoVigente, edicoesDoAno: edicoesDoAno,
    cotasDe: cotasDe, trilhasDe: trilhasDe, patrocinadoresDe: patrocinadoresDe,
    emailDe: emailDe, emailPatrocinioDe: emailPatrocinioDe, redesDe: redesDe,
    montarMapa: montarMapa, montarRodape: montarRodape
  };
})();
