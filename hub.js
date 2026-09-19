/*
 * Página inicial: o mapa, as edições do ano e o convite de patrocínio.
 * O site é organizado por ano e abre sempre no ano vigente.
 */
'use strict';
(function () {
  var A = window.ASCD;
  if (!A) return;

  var ANOS = A.anos();
  var proxima = A.proxima();
  var anoAtivo = anoInicial();

  /* Ano da URL (?ano=2027), se for um ano que existe. Senão, o vigente. */
  function anoInicial() {
    var pedido = Number(new URLSearchParams(location.search).get('ano'));
    return (pedido && ANOS.indexOf(pedido) !== -1) ? pedido : A.anoVigente();
  }

  /* ── capa ────────────────────────────────────────────────────────── */

  function montarCapa() {
    var acoes = [];
    acoes.push('<a class="botao botao-primario" href="#edicoes">Ver as edições</a>');
    if (proxima) {
      acoes.push('<a class="botao botao-secundario" href="' + A.esc(A.caminho(proxima)) + '">' +
        A.esc(proxima.cidade) + ', ' +
        A.esc(A.formatar(proxima.data, { day: 'numeric', month: 'long' })) + '</a>');
    }
    A.pintar('capa-acoes', acoes.join(''));
  }

  /* ── faixa do próximo encontro ───────────────────────────────────── */
  /* Sempre a próxima de verdade, independente do ano que estiver sendo visto */

  function montarBarra() {
    if (!proxima) return;
    var dias = A.diasAte(proxima.data);
    var itens = [
      { r: 'Próximo encontro', v: A.esc(proxima.cidade + ', ' + proxima.uf) },
      { r: 'Quando', v: A.esc(A.formatar(proxima.data, { day: '2-digit', month: 'long', year: 'numeric' })) },
      { r: 'Onde', v: A.esc(proxima.local) }
    ];
    if (dias >= 0) {
      itens.push({ r: 'Contagem', v: dias === 0 ? 'É hoje' : A.esc('Faltam ' + A.plural(dias, 'dia', 'dias')) });
    }
    A.pintar('barra', itens.map(function (i) {
      return '<div class="barra-item"><span class="barra-rotulo">' + i.r +
        '</span><span class="barra-valor">' + i.v + '</span></div>';
    }).join(''));
  }

  /* ── seletor de ano ──────────────────────────────────────────────── */

  /* Desenha os botões UMA vez. Trocar de ano só atualiza o estado deles:
     recriar os botões descartaria o elemento que está com o foco do
     teclado, e quem navega por Tab perderia a posição ao escolher um ano. */
  function montarAnos() {
    var caixa = A.el('anos');
    if (!caixa) return;

    /* Com um ano só, o seletor não informa nada */
    if (ANOS.length < 2) { caixa.hidden = true; return; }

    caixa.hidden = false;
    caixa.innerHTML = '<span class="anos-rotulo" id="anos-rotulo">Ano</span>' +
      ANOS.slice().reverse().map(function (a) {
        return '<button type="button" class="ano" data-ano="' + a + '" aria-pressed="false">' +
          a + '</button>';
      }).join('');

    caixa.querySelectorAll('.ano').forEach(function (b) {
      b.addEventListener('click', function () { trocarAno(Number(b.dataset.ano)); });
    });

    marcarAnoAtivo();
  }

  function marcarAnoAtivo() {
    var caixa = A.el('anos');
    if (!caixa) return;
    caixa.querySelectorAll('.ano').forEach(function (b) {
      var ativo = Number(b.dataset.ano) === anoAtivo;
      b.classList.toggle('ano-ativo', ativo);
      b.setAttribute('aria-pressed', String(ativo));
    });
  }

  function trocarAno(ano) {
    if (ano === anoAtivo) return;
    anoAtivo = ano;

    /* Deixa o ano na URL para o link ser compartilhável, sem recarregar */
    var url = new URL(location.href);
    url.searchParams.set('ano', ano);
    history.replaceState(null, '', url);

    marcarAnoAtivo();
    montarEdicoes();
    montarPatrocinio();
    A.montarMapa({ alvo: 'mapa-palco', base: '', ano: anoAtivo });
  }

  /* ── lista de edições do ano ─────────────────────────────────────── */

  function montarEdicoes() {
    var doAno = A.edicoesDoAno(anoAtivo);

    var titulo = A.el('edicoes-titulo');
    if (titulo) titulo.textContent = 'As edições de ' + anoAtivo;

    var contagem = A.el('edicoes-contagem');
    if (contagem) {
      contagem.textContent = doAno.length
        ? A.plural(doAno.length, 'edição em ' + anoAtivo, 'edições em ' + anoAtivo)
        : 'nenhuma edição em ' + anoAtivo;
    }

    var legenda = A.el('mapa-legenda');
    if (legenda) {
      legenda.textContent = doAno.length === 1
        ? 'Por enquanto, um ponto aceso no mapa.'
        : A.plural(doAno.length, 'cidade no mapa', 'cidades no mapa') + '.';
    }

    if (!doAno.length) {
      A.pintar('edicoes-lista',
        '<p class="vazio">Nenhuma edição anunciada para ' + anoAtivo + '. ' +
        'Use o seletor acima para ver os outros anos.</p>');
      return;
    }

    A.pintar('edicoes-lista', doAno.map(function (e) {
      var dias = A.diasAte(e.data);
      var passou = dias < 0;
      var c = A.cfp(e);

      var selos = [];
      if (passou) selos.push('<span class="selo selo-passado">Já aconteceu</span>');
      else if (dias === 0) selos.push('<span class="selo selo-hoje">É hoje</span>');
      else selos.push('<span class="selo">Faltam ' + A.plural(dias, 'dia', 'dias') + '</span>');
      if (!passou && c.aberta) selos.push('<span class="selo selo-cfp">Chamada de palestras aberta</span>');

      return '<a class="cartao" href="' + A.esc(A.caminho(e)) + '">' +
        '<div class="cartao-data" aria-hidden="true">' +
          '<span>' + A.esc(A.formatar(e.data, { month: 'short' }).replace('.', '').toUpperCase()) + '</span>' +
          '<strong>' + A.esc(A.formatar(e.data, { day: '2-digit' })) + '</strong>' +
          '<span>' + A.esc(String(A.anoDe(e))) + '</span>' +
        '</div>' +
        '<div class="cartao-corpo">' +
          '<div class="cartao-selos">' + selos.join('') + '</div>' +
          '<h3 class="cartao-cidade">' + A.esc(e.cidade) +
            '<span class="cartao-uf">' + A.esc(e.uf) + '</span></h3>' +
          '<p class="cartao-resumo">' + A.esc(e.resumo) + '</p>' +
          '<p class="cartao-local">' + A.esc(e.local) +
            (e.horario ? ', ' + A.esc(A.horario(e.horario)) : '') + '</p>' +
        '</div>' +
        '<span class="cartao-ir">Ver a edição</span>' +
      '</a>';
    }).join(''));
  }

  /* ── patrocínio ──────────────────────────────────────────────────── */
  /* Patrocínio é por cidade: cada edição tem cotas, e-mail e contato
     próprios. O hub não centraliza nada, só encaminha. */

  function montarPatrocinio() {
    var abertas = A.edicoesDoAno(anoAtivo).filter(function (e) { return A.diasAte(e.data) >= 0; });

    if (!abertas.length) {
      A.pintar('patrocinio-acoes',
        '<p class="cotas-resumo">Nenhuma edição de ' + anoAtivo +
        ' está aberta a patrocínio. Veja os outros anos na lista de edições.</p>');
      return;
    }

    var partes = ['<p class="cotas-resumo">Cada edição tem cotas e contato próprios, ' +
      'porque quem organiza é a comunidade de cada universidade. Escolha onde quer estar.</p>'];

    abertas.forEach(function (e) {
      var email = A.emailPatrocinioDe(e);
      var cotas = A.cotasDe(e);
      var livres = cotas.reduce(function (t, c) { return t + (c.vagas || 0); }, 0) -
        A.patrocinadoresDe(e).length;

      partes.push('<div class="patrocinio-cidade">' +
        '<p class="patrocinio-cidade-nome">' + A.esc(e.cidade) + '</p>' +
        '<p class="patrocinio-cidade-nota">' +
          A.esc(A.plural(cotas.length, 'cota', 'cotas')) + ', ' +
          A.esc(A.plural(Math.max(0, livres), 'espaço livre', 'espaços livres')) + '</p>' +
        '<a class="botao botao-primario botao-largo" href="' + A.esc(A.caminho(e)) +
          '#patrocinio">Ver as cotas de ' + A.esc(e.cidade) + '</a>' +
        (email
          ? '<p class="patrocinio-email">' + A.esc(email) + '</p>'
          : A.avisoPreencher(e.slug + '.emailPatrocinio')) +
      '</div>');
    });

    A.pintar('patrocinio-acoes', partes.join(''));
  }

  /* ── vai ─────────────────────────────────────────────────────────── */

  montarCapa();
  montarAnos();
  montarEdicoes();
  montarPatrocinio();
  A.montarMapa({ alvo: 'mapa-palco', base: '', ano: anoAtivo });
  montarBarra();
  A.montarRodape(null);
})();
