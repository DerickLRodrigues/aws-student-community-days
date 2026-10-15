/* Grade e programação pessoal de BH. A imagem é gerada no próprio navegador. */
'use strict';
(function () {
  var A = window.ASCD;
  var grade = document.getElementById('agenda-grade');
  if (!A || !grade) return;
  var edicao = A.porSlug('belo-horizonte');
  var blocos = edicao.programacao || [];
  var escolhas = document.getElementById('agenda-escolhas');
  var status = document.getElementById('agenda-status');
  var baixar = document.getElementById('agenda-baixar');
  var canvas = document.getElementById('agenda-imagem');
  var selecionadas = new Set();
  var sessoes = [];
  var chave = 'ascd-agenda-' + edicao.slug + '-' + edicao.ano;

  function textoSessao(s) {
    return '<strong>' + A.esc(s.titulo) + '</strong><span>' + A.esc(s.pessoa) + '</span>' +
      (s.nota ? '<small>' + A.esc(s.nota) + '</small>' : '');
  }

  grade.innerHTML = blocos.map(function (b) {
    var horario = A.esc(b.inicio + ' – ' + b.fim);
    if (!b.sessoes) {
      return '<div class="agenda-intervalo"><span>' + horario + '</span><strong>' +
        A.esc(b.titulo) + '</strong><span>' + A.esc(b.local) + '</span></div>';
    }
    b.sessoes.forEach(function (s) {
      sessoes.push(Object.assign({}, s, { inicio: b.inicio, fim: b.fim }));
    });
    return '<div class="agenda-bloco"><p class="agenda-horario">' + horario +
      '<span>' + A.esc(b.tipo) + '</span></p><div class="agenda-sessoes">' +
      b.sessoes.map(function (s) {
        return '<article class="agenda-sessao"><p class="agenda-palco">Palco ' + s.palco +
          (b.tipo === 'Keynote' ? ' · todos juntos' : '') + '</p>' + textoSessao(s) + '</article>';
      }).join('') + '</div></div>';
  }).join('');

  escolhas.innerHTML = blocos.filter(function (b) { return b.sessoes; }).map(function (b) {
    return '<fieldset class="agenda-opcoes"><legend>' + A.esc(b.inicio + ' – ' + b.fim) +
      '</legend><div class="agenda-sessoes">' + b.sessoes.map(function (s) {
        return '<label class="agenda-opcao"><input type="checkbox" value="' + A.esc(s.id) +
          '"><span><small>Palco ' + s.palco + '</small>' + textoSessao(s) + '</span></label>';
      }).join('') + '</div></fieldset>';
  }).join('');

  function conflita(a, b) { return a.inicio < b.fim && b.inicio < a.fim; }
  try {
    var salvas = JSON.parse(localStorage.getItem(chave) || '[]');
    if (Array.isArray(salvas)) sessoes.forEach(function (s) {
      if (salvas.indexOf(s.id) !== -1 && !sessoes.some(function (outra) {
        return selecionadas.has(outra.id) && conflita(s, outra);
      })) selecionadas.add(s.id);
    });
  } catch (e) { /* Armazenamento indisponível não impede a seleção. */ }

  function gerarImagem(lista) {
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponível');
    // Medir cada linha antes de definir a altura evita cortes em títulos longos.
    function linhas(texto, fonte, largura) {
      ctx.font = fonte;
      var resultado = [], linha = '';
      texto.split(/\s+/).forEach(function (palavra) {
        var teste = linha ? linha + ' ' + palavra : palavra;
        if (linha && ctx.measureText(teste).width > largura) {
          resultado.push(linha); linha = palavra;
        } else linha = teste;
      });
      if (linha) resultado.push(linha);
      return resultado;
    }
    var itens = lista.map(function (s) {
      var titulo = linhas(s.titulo, 'bold 30px Arial', 864);
      var pessoa = linhas(s.pessoa, '24px Arial', 864);
      var nota = s.nota ? linhas(s.nota, '20px Arial', 864) : [];
      return { sessao: s, titulo: titulo, pessoa: pessoa, nota: nota,
        altura: 100 + titulo.length * 38 + pessoa.length * 32 + nota.length * 28 };
    });
    canvas.width = 1080;
    canvas.height = 430 + itens.reduce(function (soma, item) { return soma + item.altura + 18; }, 0);
    ctx.fillStyle = '#07050C'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#8B5CF6'; ctx.fillRect(0, 0, 1080, 14);
    function escrever(texto, x, y, fonte, cor) {
      ctx.font = fonte; ctx.fillStyle = cor; ctx.fillText(texto, x, y);
    }
    escrever('AWS STUDENT COMMUNITY DAY', 72, 78, 'bold 24px Arial', '#C4B5FD');
    escrever('Minha programação em BH', 72, 146, 'bold 48px Arial', '#F4F0FA');
    escrever(A.dataLonga(edicao.data) + ' · Belo Horizonte', 72, 194, '26px Arial', '#C4B5FD');
    escrever(edicao.local, 72, 234, '24px Arial', '#B3A6CC');
    var y = 278;
    itens.forEach(function (item) {
      ctx.fillStyle = '#191128'; ctx.fillRect(72, y, 936, item.altura);
      ctx.fillStyle = '#8B5CF6'; ctx.fillRect(72, y, 5, item.altura);
      escrever(item.sessao.inicio + ' – ' + item.sessao.fim + '  ·  PALCO ' + item.sessao.palco,
        108, y + 38, 'bold 22px Arial', '#C4B5FD');
      var linhaY = y + 80;
      item.titulo.forEach(function (linha) { escrever(linha, 108, linhaY, 'bold 30px Arial', '#F4F0FA'); linhaY += 38; });
      item.pessoa.forEach(function (linha) { escrever(linha, 108, linhaY, '24px Arial', '#B3A6CC'); linhaY += 32; });
      item.nota.forEach(function (linha) { escrever(linha, 108, linhaY, '20px Arial', '#B3A6CC'); linhaY += 28; });
      y += item.altura + 18;
    });
    escrever('Bora aprender e se encontrar por lá?', 72, y + 34, 'bold 28px Arial', '#C4B5FD');
    escrever('Programação preliminar · Horários de Brasília · Não reserva lugar', 72, y + 74, '20px Arial', '#B3A6CC');
    escrever('awsstudentcommunitydays.com.br/belo-horizonte/', 72, y + 110, '22px Arial', '#F4F0FA');
  }

  function atualizar(mensagem) {
    escolhas.querySelectorAll('input').forEach(function (input) { input.checked = selecionadas.has(input.value); });
    var lista = sessoes.filter(function (s) { return selecionadas.has(s.id); });
    baixar.disabled = !lista.length;
    canvas.hidden = !lista.length;
    status.textContent = (mensagem || '') + (lista.length
      ? lista.length + (lista.length === 1 ? ' palestra selecionada.' : ' palestras selecionadas.')
      : 'Selecione pelo menos uma palestra para gerar sua imagem.');
    if (lista.length) {
      try { gerarImagem(lista); }
      catch (e) { baixar.disabled = true; canvas.hidden = true; status.textContent = 'Não foi possível gerar a imagem neste navegador. Tente em outro navegador.'; }
    }
    try { localStorage.setItem(chave, JSON.stringify(Array.from(selecionadas))); } catch (e) { /* Opcional. */ }
  }

  escolhas.addEventListener('change', function (event) {
    var input = event.target;
    var sessao = sessoes.find(function (s) { return s.id === input.value; });
    if (!sessao) return;
    var trocou = false;
    if (input.checked) {
      sessoes.forEach(function (outra) {
        if (selecionadas.has(outra.id) && conflita(sessao, outra)) {
          selecionadas.delete(outra.id); trocou = true;
        }
      });
      selecionadas.add(sessao.id);
    } else selecionadas.delete(sessao.id);
    atualizar(trocou ? 'A palestra anterior desse horário foi substituída. ' : '');
  });
  document.getElementById('agenda-limpar').addEventListener('click', function () {
    selecionadas.clear(); atualizar();
  });
  baixar.addEventListener('click', function () {
    if (!selecionadas.size) return;
    baixar.disabled = true;
    canvas.toBlob(function (blob) {
      baixar.disabled = !selecionadas.size;
      if (!blob) { status.textContent = 'Não foi possível baixar a imagem. Tente novamente.'; return; }
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'minha-programacao-bh-' + edicao.ano + '.png';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      status.textContent = 'Imagem pronta! Compartilhe o PNG baixado com a galera.';
    }, 'image/png');
  });
  atualizar();
})();
