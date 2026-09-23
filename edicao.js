/*
 * Página de uma cidade. A página define window.EDICAO_SLUG antes de carregar
 * este arquivo; tudo o mais vem de dados.js.
 */
'use strict';
(function () {
  var A = window.ASCD;
  if (!A) return;

  /*
   * O slug vem da própria pasta: /belo-horizonte/ -> 'belo-horizonte'.
   * Assim a página não precisa de <script> inline (que exigiria
   * 'unsafe-inline' na CSP) e copiar a pasta já traz o slug certo.
   * window.EDICAO_SLUG continua valendo como override manual.
   */
  function slugDaURL() {
    var partes = location.pathname.split('/').filter(Boolean);
    var ultima = partes[partes.length - 1] || '';
    if (/\.html?$/i.test(ultima)) ultima = partes[partes.length - 2] || '';
    return ultima;
  }

  var slug = window.EDICAO_SLUG || slugDaURL();
  var edicao = A.porSlug(slug);

  /* Slug que não existe em dados.js: avisa em vez de renderizar meia página */
  if (!edicao) {
    var main = document.getElementById('conteudo');
    if (main) {
      main.innerHTML = '<div class="faixa vazio-pagina">' +
        '<h1>Edição não encontrada</h1>' +
        '<p>Não existe nenhuma edição com o identificador <code>' +
        A.esc(String(slug)) + '</code> em <code>dados.js</code>.</p>' +
        '<a class="botao botao-primario" href="../">Ver todas as edições</a></div>';
    }
    A.montarRodape(edicao);
    return;
  }

  var ingressos  = A.urlSegura(edicao.ingressosUrl);
  var notaIngresso = edicao.notaIngresso || null;
  var comoChegar = A.urlSegura(edicao.mapaUrl);
  var c = A.cfp(edicao);
  var diasEvento = A.diasAte(edicao.data);
  var passou = diasEvento < 0;

  /* ── capa ────────────────────────────────────────────────────────── */

  function montarCapa() {
    A.el('capa-cidade').textContent = edicao.cidade;

    var uf = A.el('capa-uf');
    if (uf) uf.textContent = edicao.estado;

    A.el('capa-resumo').textContent = edicao.descricao
      ? edicao.descricao.split('.')[0] + '.'
      : edicao.resumo;

    A.el('capa-quando').innerHTML =
      '<time datetime="' + A.esc(edicao.data) + '">' +
      A.esc(A.diaSemana(edicao.data) + ', ' + A.dataLonga(edicao.data)) + '</time>' +
      (A.horario(edicao.horario) ? ', das ' + A.esc(A.horario(edicao.horario)) : '');

    var acoes = [];
    if (ingressos && !passou) {
      acoes.push('<a class="botao botao-primario" href="' + A.esc(ingressos) +
        '" target="_blank" rel="noopener">Garantir ingresso</a>');
    }
    if (c.url && c.aberta) {
      acoes.push('<a class="botao botao-secundario" href="#palestrar">Enviar uma palestra</a>');
    } else {
      acoes.push('<a class="botao botao-secundario" href="#edicao">Ver os detalhes</a>');
    }
    A.pintar('capa-acoes', acoes.join(''));

    var cta = A.el('cta-cabecalho');
    if (cta) {
      if (ingressos && !passou) {
        cta.href = ingressos;
        cta.target = '_blank';
        cta.rel = 'noopener';
      } else {
        cta.hidden = true;
      }
    }
  }

  /* ── faixa de fatos ──────────────────────────────────────────────── */

  function montarBarra() {
    var itens = [
      { r: 'Quando', v: A.esc(A.formatar(edicao.data, { day: '2-digit', month: 'long' })) +
        ', ' + A.esc(A.horario(edicao.horario) || 'horário em breve') },
      { r: 'Onde', v: comoChegar
        ? '<a href="' + A.esc(comoChegar) + '" target="_blank" rel="noopener">' + A.esc(edicao.local) + '</a>'
        : A.esc(edicao.local) },
      { r: 'Formato', v: 'Duas trilhas, palestras de 35 minutos' }
    ];

    if (c.aberta && c.url) {
      itens.push({ r: 'Chamada de palestras', v: '<span class="aviso-vivo">Aberta</span> até ' + A.esc(c.prazo) });
    } else if (diasEvento >= 0) {
      itens.push({ r: 'Faltam', v: A.esc(A.plural(diasEvento, 'dia', 'dias')) });
    }

    A.pintar('barra', itens.map(function (i) {
      return '<div class="barra-item"><span class="barra-rotulo">' + i.r +
        '</span><span class="barra-valor">' + i.v + '</span></div>';
    }).join(''));
  }

  /* ── a edição ────────────────────────────────────────────────────── */

  function montarEdicao() {
    A.el('edicao-intro').textContent = edicao.descricao;

    var fichas = [
      { r: 'Data', v: A.esc(A.diaSemana(edicao.data) + ', ' + A.dataLonga(edicao.data)),
        e: A.horario(edicao.horario) ? 'Das ' + A.esc(A.horario(edicao.horario)) : null },
      { r: 'Local', v: comoChegar
          ? '<a href="' + A.esc(comoChegar) + '" target="_blank" rel="noopener">' + A.esc(edicao.local) + '</a>'
          : A.esc(edicao.local),
        e: [edicao.detalheLocal, edicao.endereco].filter(Boolean).map(A.esc).join('<br>') },
      { r: 'Como funciona', v: edicao.formatoTitulo ? A.esc(edicao.formatoTitulo) : 'Duas trilhas, palestras de 35 minutos', e: A.esc(edicao.formato) },
      { r: 'Quem organiza', v: A.esc(edicao.organizador),
        e: 'Com apoio da comunidade AWS em ' + A.esc(edicao.cidade) + '.' }
    ];

    A.pintar('edicao-grade',
      '<div class="ficha"><div class="ficha-lista">' +
      fichas.map(function (f) {
        return '<div class="ficha-item"><span class="ficha-rotulo">' + f.r + '</span>' +
          '<span class="ficha-valor">' + f.v + '</span>' +
          (f.e ? '<span class="ficha-extra">' + f.e + '</span>' : '') + '</div>';
      }).join('') + '</div></div>' + montarCompra());
  }

  function montarCompra() {
    var p = ['<div class="compra">'];
    p.push('<p class="compra-titulo">' + (passou ? 'Esta edição já aconteceu' : 'Garanta seu lugar') + '</p>');

    if (diasEvento > 0) {
      p.push('<span class="contagem">Faltam ' + A.esc(A.plural(diasEvento, 'dia', 'dias')) + '</span>');
    } else if (diasEvento === 0) {
      p.push('<span class="contagem">É hoje</span>');
    }

    if (passou) {
      p.push('<p class="compra-nota">Obrigado a todo mundo que apareceu. A próxima edição será anunciada na página inicial.</p>');
      p.push('<a class="botao botao-secundario botao-largo" href="../">Ver as edições</a>');
    } else {
      p.push('<p class="compra-nota">' + (notaIngresso ? A.esc(notaIngresso) : 'A venda é pelo Sympla, que mostra os lotes e as formas de pagamento disponíveis.') + '</p>');
      if (ingressos) {
        p.push('<a class="botao botao-primario botao-largo" href="' + A.esc(ingressos) +
          '" target="_blank" rel="noopener">Garantir ingresso no Sympla</a>');
      } else {
        p.push('<p class="compra-nota">As inscrições abrem em breve.</p>');
      }
      if (comoChegar) {
        p.push('<a class="botao botao-secundario botao-largo" href="' + A.esc(comoChegar) +
          '" target="_blank" rel="noopener">Ver como chegar</a>');
      }
    }

    p.push('</div>');
    return p.join('');
  }

  /* ── chamada de palestras ────────────────────────────────────────── */

  function montarPalestras() {
    var secao = A.el('palestrar');

    /* Evento passado: a seção inteira perde o sentido */
    if (passou && secao) { secao.hidden = true; return; }

    var celulas = A.trilhasDe(edicao).map(function (t) {
      return '<div class="trilha"><p class="trilha-nome">' + A.esc(t.nome) +
        '</p><p class="trilha-desc">' + A.esc(t.descricao) + '</p></div>';
    });

    if (c.aberta) {
      celulas.push('<div class="trilha trilha-convite"><p class="trilha-nome">E a sua?</p>' +
        '<p class="trilha-desc">Seu tema não está na lista? Manda mesmo assim, a gente lê tudo.</p></div>');
    }
    A.pintar('trilhas', celulas.join(''));

    var p = [];
    if (c.aberta) {
      p.push('<p class="cfp-estado aviso-vivo">Chamada aberta</p>');
      p.push('<p class="cfp-titulo">' +
        (c.dias === 0 ? 'Último dia para enviar' : 'Faltam ' + A.plural(c.dias, 'dia', 'dias')) + '</p>');
      p.push('<p class="cfp-texto">As propostas vão até ' + A.esc(c.prazo) +
        '. Você pode enviar mais de uma ideia.</p>');
      if (c.url) {
        p.push('<a class="botao botao-primario botao-largo" href="' + A.esc(c.url) +
          '" target="_blank" rel="noopener">Enviar no Sessionize</a>');
      }
    } else {
      p.push('<p class="cfp-estado">Chamada encerrada</p>');
      p.push('<p class="cfp-titulo">Obrigado a quem enviou</p>');
      p.push('<p class="cfp-texto">A seleção foi feita e a programação será publicada aqui.</p>');
    }
    p.push('<p class="cfp-formato">Palestras de 35 minutos, sendo 30 de apresentação e 5 de perguntas. ' +
      'É presencial em ' + A.esc(edicao.cidade) + ', e o evento não cobre viagem nem hospedagem.</p>');

    A.pintar('cfp', p.join(''));
  }

  /* ── patrocínio ──────────────────────────────────────────────────── */

  function montarPatrocinio() {
    var COTAS = A.cotasDe(edicao);
    var PATROCINADORES = A.patrocinadoresDe(edicao);
    var email = A.emailPatrocinioDe(edicao);
    var assunto = 'Patrocínio — ' + (A.SITE.nomeEdicao || 'AWS Student Community Day') + ' ' +
      edicao.cidade + ' ' + edicao.ano;
    var link = A.mailto(email, assunto);

    /* Chamada */
    var chamada = ['<p class="cfp-titulo">Quer conversar?</p>'];
    if (link) {
      chamada.push('<p>Mande um e-mail e a gente responde com o material completo das cotas.</p>');
      chamada.push('<a class="botao botao-primario botao-largo" href="' + A.esc(link) + '">Quero patrocinar</a>');
      chamada.push('<p class="patrocinio-email">' + A.esc(email) + '</p>');
    } else {
      chamada.push('<p>Este é o botão que leva a empresa até vocês.</p>');
      chamada.push(A.avisoPreencher(edicao.slug + '.emailPatrocinio'));
    }
    A.pintar('patrocinio-chamada', chamada.join(''));

    /* Cotas — cada uma com o próprio e-mail, já com a cota no assunto */
    A.pintar('cotas', COTAS.map(function (q) {
      var usadas = PATROCINADORES.filter(function (x) { return x.cota === q.nome; }).length;
      var restam = Math.max(0, (q.vagas || 0) - usadas);
      var linkCota = A.mailto(email, assunto + ' — cota ' + q.nome);

      return '<article class="cota' + (q.destaque ? ' cota-destaque' : '') + '">' +
        '<div class="cota-topo"><h3 class="cota-nome">' + A.esc(q.nome) + '</h3>' +
        '<span class="cota-vagas' + (restam === 0 ? ' cota-esgotado' : '') + '">' +
        (restam === 0 ? 'Esgotada' : A.plural(restam, 'vaga', 'vagas')) + '</span></div>' +
        '<p class="cota-resumo">' + A.esc(q.resumo) + '</p>' +
        '<ul class="cota-entregas">' +
        (q.entregas || []).map(function (x) {
          return '<li class="cota-entrega"><span class="cota-marca" aria-hidden="true">—</span><span>' +
            A.esc(x) + '</span></li>';
        }).join('') + '</ul>' +
        (restam > 0 && linkCota
          ? '<a class="cota-cta" href="' + A.esc(linkCota) + '">Quero a cota ' + A.esc(q.nome) + '</a>'
          : '') +
        '</article>';
    }).join(''));

    /* Vitrine: confirmados primeiro, depois os espaços livres */
    var total = COTAS.reduce(function (s, q) { return s + (q.vagas || 0); }, 0);
    var livres = Math.max(0, total - PATROCINADORES.length);
    var visiveis = Math.min(livres, 6);

    var celulas = PATROCINADORES.map(function (x) {
      var u = A.urlSegura(x.url);
      var img = '<img src="' + A.esc(x.logo) + '" alt="' + A.esc(x.nome) + '" loading="lazy">';
      return u
        ? '<a class="logo-patrocinador" href="' + A.esc(u) + '" target="_blank" rel="noopener">' + img + '</a>'
        : '<div class="logo-patrocinador">' + img + '</div>';
    });

    for (var i = 0; i < visiveis; i++) {
      celulas.push(link
        ? '<a class="vaga" href="' + A.esc(link) + '">Seu logo aqui</a>'
        : '<span class="vaga">Seu logo aqui</span>');
    }

    A.pintar('vitrine',
      '<h3 class="vitrine-titulo">' +
        (PATROCINADORES.length ? 'Quem apoia esta edição' : 'Nenhuma cota fechada ainda') + '</h3>' +
      '<p class="vitrine-nota">' +
        (PATROCINADORES.length
          ? 'E ainda ' + (livres === 1 ? 'há 1 espaço livre.' : 'há ' + livres + ' espaços livres.')
          : 'Sua marca pode ser a primeira que estes estudantes vão ver ao entrar.') + '</p>' +
      '<div class="vitrine-grade">' + celulas.join('') + '</div>');
  }

  /* ── contatos ────────────────────────────────────────────────────── */

  function montarContato() {
    var itens = [];
    var email = A.emailDe(edicao);

    if (email) {
      itens.push({ r: 'E-mail', v: A.esc(email), url: 'mailto:' + email, externo: false });
    }
    if (ingressos) itens.push({ r: 'Ingressos', v: 'Sympla', url: ingressos, externo: true });
    if (c.url) itens.push({ r: 'Palestras', v: 'Sessionize', url: c.url, externo: true });

    /* Redes desta edição, não do site */
    A.redesDe(edicao).forEach(function (r) {
      itens.push({ r: r.nome, v: 'Seguir', url: r.url, externo: true });
    });

    if (!itens.length) {
      A.pintar('contato-grade', A.avisoPreencher(edicao.slug + '.email'));
      return;
    }

    A.pintar('contato-grade', itens.map(function (i) {
      return '<a class="contato" href="' + A.esc(i.url) + '"' +
        (i.externo ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<span class="contato-rotulo">' + A.esc(i.r) + '</span>' +
        '<span class="contato-valor">' + A.esc(i.v) + '</span></a>';
    }).join(''));
  }

  /* ── vai ─────────────────────────────────────────────────────────── */

  montarCapa();
  A.montarMapa({ alvo: 'mapa-palco', base: '../', destaque: edicao.slug, estatico: true });
  montarBarra();
  montarEdicao();
  montarPalestras();
  montarPatrocinio();
  montarContato();
  A.montarRodape(edicao);
})();
