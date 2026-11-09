/* Grade e programação pessoal de BH. A imagem é gerada no próprio navegador. */
"use strict";
(function () {
  var A = window.ASCD;
  var grade = document.getElementById("agenda-grade");
  if (!A || !grade) return;
  var edicao = A.porSlug("belo-horizonte");
  var blocos = edicao.programacao || [];
  var escolhas = document.getElementById("agenda-escolhas");
  var status = document.getElementById("agenda-status");
  var baixar = document.getElementById("agenda-baixar");
  var canvas = document.getElementById("agenda-imagem");
  var selecionadas = new Set();
  var sessoes = [];
  var chave = "ascd-agenda-" + edicao.slug + "-" + edicao.ano;

  function textoSessao(s) {
    return (
      "<strong>" +
      A.esc(s.titulo) +
      "</strong><span>" +
      A.esc(s.pessoa) +
      "</span>" +
      (s.nota ? "<small>" + A.esc(s.nota) + "</small>" : "")
    );
  }
  function semAcento(t) {
    return t
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  // Aceita palestrante único (foto/linkedin/bio) e dupla (fotoBeatriz, bioJulia...)
  function listaPessoas(s) {
    var sufixos = Object.keys(s)
      .filter(function (k) {
        return /^bio.+/.test(k);
      })
      .map(function (k) {
        return k.slice(3);
      });
    if (!sufixos.length) {
      return s.pessoa
        ? [{ nome: s.pessoa, foto: s.foto, linkedin: s.linkedin, bio: s.bio }]
        : [];
    }
    var nomes = s.pessoa.split(/\s+e\s+/);
    return sufixos.map(function (suf) {
      var nome =
        nomes.find(function (n) {
          return semAcento(n).indexOf(semAcento(suf)) === 0;
        }) || suf;
      return {
        nome: nome,
        foto: s["foto" + suf],
        linkedin: s["linkedin" + suf],
        bio: s["bio" + suf],
      };
    });
  }

  function cartaoSessao(s, b) {
    var ps = listaPessoas(s);
    var fotos = ps
      .filter(function (p) {
        return p.foto;
      })
      .map(function (p) {
        return (
          '<img class="agenda-foto" src="' +
          A.esc(encodeURI(p.foto)) +
          '" alt="" width="56" height="56" loading="lazy">'
        );
      })
      .join("");
    var nomes = ps.length
      ? ps
          .map(function (p) {
            return p.linkedin
              ? '<a class="agenda-nome" href="' +
                  A.esc(p.linkedin) +
                  '" target="_blank" rel="noopener noreferrer">' +
                  A.esc(p.nome) +
                  "</a>"
              : A.esc(p.nome);
          })
          .join(" e ")
      : A.esc(s.pessoa || "");
    var temBio = ps.some(function (p) {
      return p.bio;
    });

    var cabeca =
      (fotos ? '<span class="agenda-fotos">' + fotos + "</span>" : "") +
      '<span class="agenda-info">' +
      "<strong>" +
      A.esc(s.titulo) +
      "</strong>" +
      '<span class="agenda-pessoa">' +
      nomes +
      "</span>" +
      (s.nota
        ? '<small class="agenda-nota">' + A.esc(s.nota) + "</small>"
        : "") +
      (temBio
        ? '<small class="agenda-mais"><span class="mais-abrir">+ Clique para ler a biografia</span>' +
          '<span class="mais-fechar">− Ocultar biografia</span></small>'
        : "") +
      "</span>";

    var palco =
      '<p class="agenda-palco">Palco ' +
      s.palco +
      (b.tipo === "Keynote" ? " · todos juntos" : "") +
      "</p>";

    if (!temBio) {
      return (
        '<article class="agenda-sessao">' +
        palco +
        '<div class="agenda-cabeca">' +
        cabeca +
        "</div></article>"
      );
    }
    var bios = ps
      .filter(function (p) {
        return p.bio;
      })
      .map(function (p) {
        return (
          "<p>" +
          (ps.length > 1 ? "<strong>" + A.esc(p.nome) + "</strong>" : "") +
          A.esc(p.bio) +
          "</p>"
        );
      })
      .join("");
    return (
      '<article class="agenda-sessao">' +
      palco +
      '<details class="agenda-detalhes"><summary class="agenda-cabeca">' +
      cabeca +
      "</summary>" +
      '<div class="agenda-bio">' +
      bios +
      "</div></details></article>"
    );
  }

  var almoco = edicao.almoco || [];

  grade.innerHTML = blocos
    .map(function (b) {
      var horario = A.esc(b.inicio + " – " + b.fim);
      if (!b.sessoes) {
        var conteudo =
          "<span>" +
          horario +
          "</span><strong>" +
          A.esc(b.titulo) +
          "</strong><span>" +
          A.esc(b.local) +
          "</span>";
        // A linha do almoço vira um botão que abre o modal, se houver restaurantes.
        if (almoco.length && /^almo/i.test(b.titulo)) {
          return (
            '<button type="button" class="agenda-intervalo agenda-intervalo-botao" id="almoco-abrir" aria-haspopup="dialog">' +
            conteudo +
            '<span class="agenda-intervalo-dica">Ver opções com desconto</span></button>'
          );
        }
        return '<div class="agenda-intervalo">' + conteudo + "</div>";
      }
      b.sessoes.forEach(function (s) {
        sessoes.push(Object.assign({}, s, { inicio: b.inicio, fim: b.fim }));
      });
      return (
        '<div class="agenda-bloco"><p class="agenda-horario">' +
        horario +
        "<span>" +
        A.esc(b.tipo) +
        '</span></p><div class="agenda-sessoes">' +
        b.sessoes
          .map(function (s) {
            return cartaoSessao(s, b);
          })
          .join("") +
        "</div></div>"
      );
    })
    .join("");

  // Modal "Onde almoçar": abre ao clicar na linha do almoço
  var modalAlmoco = document.getElementById("almoco-modal");
  var abrirAlmoco = document.getElementById("almoco-abrir");
  var listaAlmoco = document.getElementById("almoco-lista");
  if (modalAlmoco && abrirAlmoco && listaAlmoco) {
    listaAlmoco.innerHTML = almoco
      .map(function (l) {
        return (
          '<li class="almoco-card"><h4>' +
          A.esc(l.nome) +
          "</h4><ul>" +
          (l.ofertas || [])
            .map(function (o) {
              return "<li>" + A.esc(o) + "</li>";
            })
            .join("") +
          "</ul>" +
          (l.url
            ? '<a class="almoco-link" href="' +
              A.esc(l.url) +
              '" target="_blank" rel="noopener noreferrer">' +
              A.esc(l.linkTexto || "Ver mais") +
              "</a>"
            : "") +
          "</li>"
        );
      })
      .join("");

    var fecharAlmoco = function () {
      if (typeof modalAlmoco.close === "function") modalAlmoco.close();
      else modalAlmoco.removeAttribute("open");
    };
    abrirAlmoco.addEventListener("click", function () {
      if (typeof modalAlmoco.showModal === "function") modalAlmoco.showModal();
      else modalAlmoco.setAttribute("open", "");
    });
    document
      .getElementById("almoco-fechar")
      .addEventListener("click", fecharAlmoco);
    // Clicar fora da caixa (no fundo escurecido) também fecha
    modalAlmoco.addEventListener("click", function (e) {
      if (e.target === modalAlmoco) fecharAlmoco();
    });
  }

  escolhas.innerHTML = blocos
    .filter(function (b) {
      return b.sessoes;
    })
    .map(function (b) {
      return (
        '<fieldset class="agenda-opcoes"><legend>' +
        A.esc(b.inicio + " – " + b.fim) +
        '</legend><div class="agenda-sessoes">' +
        b.sessoes
          .map(function (s) {
            return (
              '<label class="agenda-opcao"><input type="checkbox" value="' +
              A.esc(s.id) +
              '"><span><small>Palco ' +
              s.palco +
              "</small>" +
              textoSessao(s) +
              "</span></label>"
            );
          })
          .join("") +
        "</div></fieldset>"
      );
    })
    .join("");

  function conflita(a, b) {
    return a.inicio < b.fim && b.inicio < a.fim;
  }
  try {
    var salvas = JSON.parse(localStorage.getItem(chave) || "[]");
    if (Array.isArray(salvas))
      sessoes.forEach(function (s) {
        if (
          salvas.indexOf(s.id) !== -1 &&
          !sessoes.some(function (outra) {
            return selecionadas.has(outra.id) && conflita(s, outra);
          })
        )
          selecionadas.add(s.id);
      });
  } catch (e) {
    /* Armazenamento indisponível não impede a seleção. */
  }

  // Refaz a imagem quando a fonte Archivo (a do site) terminar de carregar
  if (document.fonts && document.fonts.load) {
    document.fonts
      .load("bold 30px Archivo")
      .then(function () {
        atualizar();
      })
      .catch(function () {});
  }

  var LETRA = "Archivo, Arial, sans-serif";
  function letra(peso, tamanho) {
    return (peso ? peso + " " : "") + tamanho + "px " + LETRA;
  }

  // Brasão do grupo (dados.js: brasao). Aparece na imagem assim que carregar.
  var brasao = null;
  if (edicao.brasao) {
    var imagemBrasao = new Image();
    imagemBrasao.onload = function () {
      brasao = imagemBrasao;
      atualizar();
    };
    imagemBrasao.src = encodeURI(edicao.brasao);
  }

  function gerarImagem(lista) {
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível");
    // Medir cada linha antes de definir a altura evita cortes em títulos longos.
    function linhas(texto, fonte, largura) {
      ctx.font = fonte;
      var resultado = [],
        linha = "";
      texto.split(/\s+/).forEach(function (palavra) {
        var teste = linha ? linha + " " + palavra : palavra;
        if (linha && ctx.measureText(teste).width > largura) {
          resultado.push(linha);
          linha = palavra;
        } else linha = teste;
      });
      if (linha) resultado.push(linha);
      return resultado;
    }

    // Pausas (almoço, coffee break) que ficam entre a primeira e a última palestra escolhidas
    var primeiro = lista[0].inicio;
    var ultimo = lista[lista.length - 1].fim;
    var pausas = blocos.filter(function (b) {
      return (
        !b.sessoes &&
        b.tipo === "Intervalo" &&
        b.inicio >= primeiro &&
        b.fim <= ultimo
      );
    });

    // Medidas do layout (em px, imagem de 1080 de largura)
    var largura = 1080;
    var margem = 72;
    var quadroX = margem; // quadro do horário (esquerda)
    var quadroL = 272;
    var cardX = 370; // card da palestra (direita)
    var cardL = largura - margem - cardX;
    var textoX = cardX + 34;
    var textoL = cardL - 34 - 28;
    var topoGrade = 232;
    var espaco = 20; // espaço entre as linhas

    var itens = lista
      .map(function (s) {
        var titulo = linhas(s.titulo, letra("bold", 27), textoL);
        var pessoa = linhas(s.pessoa, letra("", 22), textoL);
        var nota = s.nota ? linhas(s.nota, letra("", 19), textoL) : [];
        return {
          pausa: false,
          inicio: s.inicio,
          fim: s.fim,
          sessao: s,
          titulo: titulo,
          pessoa: pessoa,
          nota: nota,
          altura:
            44 + titulo.length * 34 + pessoa.length * 30 + nota.length * 26,
        };
      })
      .concat(
        pausas.map(function (b) {
          return {
            pausa: true,
            inicio: b.inicio,
            fim: b.fim,
            titulo: b.titulo,
            altura: 44,
          };
        }),
      )
      .sort(function (a, b) {
        return a.inicio < b.inicio ? -1 : a.inicio > b.inicio ? 1 : 0;
      });

    var y = topoGrade;
    itens.forEach(function (item) {
      item.y = y;
      y += item.altura + espaco;
    });
    var rodape = brasao ? 290 : 160;
    var altura = y + rodape;
    canvas.width = largura;
    canvas.height = altura;

    function escrever(texto, x, yy, fonte, cor) {
      ctx.font = fonte;
      ctx.fillStyle = cor;
      ctx.fillText(texto, x, yy);
    }
    // Retângulo com cantos arredondados
    function caixa(x, yy, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, yy);
      ctx.arcTo(x + w, yy, x + w, yy + h, r);
      ctx.arcTo(x + w, yy + h, x, yy + h, r);
      ctx.arcTo(x, yy + h, x, yy, r);
      ctx.arcTo(x, yy, x + w, yy, r);
      ctx.closePath();
    }
    // Etiqueta arredondada com texto; devolve a largura
    function pilula(x, yTopo, texto, tamanho, h, corTexto, corFundo, corBorda) {
      ctx.font = letra("bold", tamanho);
      var w = ctx.measureText(texto).width + h;
      caixa(x, yTopo, w, h, h / 2);
      ctx.fillStyle = corFundo;
      ctx.fill();
      ctx.strokeStyle = corBorda;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      escrever(
        texto,
        x + h / 2,
        yTopo + h / 2 + tamanho * 0.35,
        letra("bold", tamanho),
        corTexto,
      );
      return w;
    }
    // Brasão centralizado em (cx, cy), cabendo numa caixa quadrada de lado "lado"
    function desenharBrasao(cx, cy, lado) {
      if (!brasao) return;
      var halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, lado * 0.9);
      halo.addColorStop(0, "rgba(139,92,246,0.28)");
      halo.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(cx - lado, cy - lado, lado * 2, lado * 2);
      var e = Math.min(lado / brasao.naturalWidth, lado / brasao.naturalHeight);
      var w = brasao.naturalWidth * e;
      var h = brasao.naturalHeight * e;
      ctx.drawImage(brasao, cx - w / 2, cy - h / 2, w, h);
    }

    // ── Fundo em degradê (roxo escuro no topo, quase preto embaixo) ──
    var degrade = ctx.createLinearGradient(0, 0, 0, altura);
    degrade.addColorStop(0, "#170D2E");
    degrade.addColorStop(0.4, "#0C0818");
    degrade.addColorStop(1, "#07050C");
    ctx.fillStyle = degrade;
    ctx.fillRect(0, 0, largura, altura);
    var brilho1 = ctx.createRadialGradient(
      largura - 100,
      120,
      0,
      largura - 100,
      120,
      620,
    );
    brilho1.addColorStop(0, "rgba(139,92,246,0.30)");
    brilho1.addColorStop(1, "rgba(139,92,246,0)");
    ctx.fillStyle = brilho1;
    ctx.fillRect(0, 0, largura, altura);
    var brilho2 = ctx.createRadialGradient(
      0,
      altura * 0.62,
      0,
      0,
      altura * 0.62,
      640,
    );
    brilho2.addColorStop(0, "rgba(232,121,249,0.09)");
    brilho2.addColorStop(1, "rgba(232,121,249,0)");
    ctx.fillStyle = brilho2;
    ctx.fillRect(0, 0, largura, altura);

    // ── Cabeçalho em duas colunas ──────────────────────────
    var colunaDireita = 790;
    escrever(
      "AWS Student Community Day",
      margem,
      88,
      letra("bold", 34),
      "#F4F0FA",
    );
    escrever(
      A.dataLonga(edicao.data) + " - BH",
      margem,
      124,
      letra("", 21),
      "#C4B5FD",
    );
    ctx.textAlign = "center";
    escrever(
      "Minha programação",
      colunaDireita,
      88,
      letra("bold", 34),
      "#F4F0FA",
    );
    escrever(edicao.local, colunaDireita, 124, letra("", 21), "#C4B5FD");
    ctx.textAlign = "left";

    // Resumo e organização
    var palcos = new Set(
      lista.map(function (s) {
        return s.palco;
      }),
    ).size;
    var resumo =
      lista.length +
      (lista.length === 1 ? " palestra" : " palestras") +
      " · " +
      palcos +
      (palcos === 1 ? " palco" : " palcos");
    var larguraResumo = pilula(
      margem,
      156,
      resumo,
      22,
      42,
      "#C4B5FD",
      "rgba(139,92,246,0.18)",
      "rgba(196,181,253,0.55)",
    );
    if (edicao.organizador) {
      var rotulo = "Organizado por ";
      var xOrg = margem + larguraResumo + 22;
      ctx.font = letra("", 22);
      var larguraRotulo = ctx.measureText(rotulo).width;
      escrever(rotulo, xOrg, 185, letra("", 22), "#B3A6CC");
      escrever(
        edicao.organizador,
        xOrg + larguraRotulo,
        185,
        letra("bold", 22),
        "#F4F0FA",
      );
    }

    // ── Linhas: quadro do horário + card da palestra ───────
    var fundoCaixa = "rgba(22,15,38,0.86)";
    var bordaCaixa = "rgba(139,92,246,0.55)";
    itens.forEach(function (item) {
      var yi = item.y;

      if (item.pausa) {
        var rotuloPausa = item.titulo + " · " + item.inicio + " – " + item.fim;
        ctx.font = letra("", 20);
        var lp = ctx.measureText(rotuloPausa).width;
        var meio = largura / 2;
        var yLinha = yi + item.altura / 2;
        ctx.strokeStyle = "rgba(139,92,246,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margem, yLinha);
        ctx.lineTo(meio - lp / 2 - 18, yLinha);
        ctx.moveTo(meio + lp / 2 + 18, yLinha);
        ctx.lineTo(largura - margem, yLinha);
        ctx.stroke();
        ctx.textAlign = "center";
        escrever(rotuloPausa, meio, yLinha + 7, letra("", 20), "#B3A6CC");
        ctx.textAlign = "left";
        return;
      }

      // Quadro do horário (esquerda)
      caixa(quadroX, yi, quadroL, item.altura, 12);
      ctx.fillStyle = fundoCaixa;
      ctx.fill();
      ctx.strokeStyle = bordaCaixa;
      ctx.lineWidth = 2;
      ctx.stroke();
      var centroX = quadroX + quadroL / 2;
      var topoBloco = yi + (item.altura - 80) / 2;
      ctx.textAlign = "center";
      escrever(
        item.inicio + " – " + item.fim,
        centroX,
        topoBloco + 30,
        letra("bold", 30),
        "#F4F0FA",
      );
      ctx.textAlign = "left";
      var rotuloPalco = "PALCO " + item.sessao.palco;
      ctx.font = letra("bold", 17);
      var larguraPalco = ctx.measureText(rotuloPalco).width + 30;
      pilula(
        centroX - larguraPalco / 2,
        topoBloco + 50,
        rotuloPalco,
        17,
        30,
        "#C4B5FD",
        "rgba(139,92,246,0.18)",
        "rgba(196,181,253,0.45)",
      );

      // Card da palestra (direita)
      caixa(cardX, yi, cardL, item.altura, 12);
      ctx.fillStyle = fundoCaixa;
      ctx.fill();
      ctx.strokeStyle = bordaCaixa;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      caixa(cardX, yi, cardL, item.altura, 12);
      ctx.clip();
      ctx.fillStyle = "#8B5CF6";
      ctx.fillRect(cardX, yi, 6, item.altura);
      ctx.restore();

      var linhaY = yi + 44;
      item.titulo.forEach(function (linha) {
        escrever(linha, textoX, linhaY, letra("bold", 27), "#F4F0FA");
        linhaY += 34;
      });
      item.pessoa.forEach(function (linha) {
        escrever(linha, textoX, linhaY, letra("", 22), "#B3A6CC");
        linhaY += 30;
      });
      item.nota.forEach(function (linha) {
        escrever(linha, textoX, linhaY, letra("", 19), "#B3A6CC");
        linhaY += 26;
      });
    });

    // ── Rodapé centralizado, com o brasão embaixo ──────────
    ctx.textAlign = "center";
    escrever(
      "Bora aprender e se encontrar por lá?",
      largura / 2,
      y + 36,
      letra("bold", 28),
      "#C4B5FD",
    );
    escrever(
      "Programação preliminar · Horários de Brasília · Não reserva lugar",
      largura / 2,
      y + 76,
      letra("", 19),
      "#B3A6CC",
    );
    escrever(
      "awsstudentcommunitydays.com.br/belo-horizonte/",
      largura / 2,
      y + 112,
      letra("", 22),
      "#F4F0FA",
    );
    ctx.textAlign = "left";
    desenharBrasao(largura / 2, y + 205, 110);
  }

  function atualizar(mensagem) {
    escolhas.querySelectorAll("input").forEach(function (input) {
      input.checked = selecionadas.has(input.value);
    });
    var lista = sessoes.filter(function (s) {
      return selecionadas.has(s.id);
    });
    baixar.disabled = !lista.length;
    canvas.hidden = !lista.length;
    status.textContent =
      (mensagem || "") +
      (lista.length
        ? lista.length +
          (lista.length === 1
            ? " palestra selecionada."
            : " palestras selecionadas.")
        : "Selecione pelo menos uma palestra para gerar sua imagem.");
    if (lista.length) {
      try {
        gerarImagem(lista);
      } catch (e) {
        baixar.disabled = true;
        canvas.hidden = true;
        status.textContent =
          "Não foi possível gerar a imagem neste navegador. Tente em outro navegador.";
      }
    }
    try {
      localStorage.setItem(chave, JSON.stringify(Array.from(selecionadas)));
    } catch (e) {
      /* Opcional. */
    }
  }

  escolhas.addEventListener("change", function (event) {
    var input = event.target;
    var sessao = sessoes.find(function (s) {
      return s.id === input.value;
    });
    if (!sessao) return;
    var trocou = false;
    if (input.checked) {
      sessoes.forEach(function (outra) {
        if (selecionadas.has(outra.id) && conflita(sessao, outra)) {
          selecionadas.delete(outra.id);
          trocou = true;
        }
      });
      selecionadas.add(sessao.id);
    } else selecionadas.delete(sessao.id);
    atualizar(
      trocou ? "A palestra anterior desse horário foi substituída. " : "",
    );
  });
  document
    .getElementById("agenda-limpar")
    .addEventListener("click", function () {
      selecionadas.clear();
      atualizar();
    });
  baixar.addEventListener("click", function () {
    if (!selecionadas.size) return;
    baixar.disabled = true;
    canvas.toBlob(function (blob) {
      baixar.disabled = !selecionadas.size;
      if (!blob) {
        status.textContent =
          "Não foi possível baixar a imagem. Tente novamente.";
        return;
      }
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "minha-programacao-bh-" + edicao.ano + ".png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 60000);
      status.textContent =
        "Imagem pronta! Compartilhe o PNG baixado com a galera.";
    }, "image/png");
  });
  atualizar();
})();
