"use strict";
(function () {
  var reduzir =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VELOCIDADE = 40; // pixels por segundo

  function iniciar(grade) {
    if (grade.dataset.pronto) return;
    grade.dataset.pronto = "1";

    var originais = Array.from(grade.children);
    var n = originais.length;
    originais.forEach(function (el, i) {
      el.dataset.i = i;
    });

    // Clique: só um card selecionado por vez; clicar de novo desmarca.
    grade.addEventListener("click", function (e) {
      var card = e.target.closest(".logo-patrocinador");
      if (!card || !grade.contains(card)) return;
      var jaSelecionado = card.classList.contains("selecionado");
      grade.querySelectorAll(".selecionado").forEach(function (el) {
        el.classList.remove("selecionado");
      });
      if (!jaSelecionado) {
        grade
          .querySelectorAll('[data-i="' + card.dataset.i + '"]')
          .forEach(function (el) {
            el.classList.add("selecionado");
          });
      }
    });

    // Sem overflow (poucos cards) ou com "reduzir movimento": não anima.
    if (reduzir || n < 2 || grade.scrollWidth <= grade.clientWidth + 1) return;

    // Duplica os cards para o loop ser contínuo.
    originais.forEach(function (el) {
      var copia = el.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      copia.setAttribute("tabindex", "-1");
      copia.querySelectorAll("a, button").forEach(function (x) {
        x.setAttribute("tabindex", "-1");
      });
      grade.appendChild(copia);
    });
    grade.classList.add("vitrine-animada");
    grade.style.scrollSnapType = "none"; // o snap brigaria com a rolagem automática

    var ciclo = 0;
    function medir() {
      ciclo = grade.children[n].offsetLeft - grade.children[0].offsetLeft;
    }
    medir();
    window.addEventListener("resize", medir);

    var pausas = {
      hover: false,
      foco: false,
      toque: false,
      botao: false,
      fora: false,
    };
    function pausado() {
      return (
        pausas.hover ||
        pausas.foco ||
        pausas.toque ||
        pausas.botao ||
        pausas.fora
      );
    }
    var pos = grade.scrollLeft,
      ultimo = null;
    function pausar(k) {
      pausas[k] = true;
    }
    function retomar(k) {
      pausas[k] = false;
      if (!pausado()) pos = grade.scrollLeft;
    }

    grade.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") pausar("hover");
    });
    grade.addEventListener("pointerleave", function () {
      retomar("hover");
    });
    grade.addEventListener("focusin", function (e) {
      if (e.target.matches(":focus-visible")) pausar("foco");
    });
    grade.addEventListener("focusout", function () {
      retomar("foco");
    });
    grade.addEventListener(
      "touchstart",
      function () {
        pausar("toque");
      },
      { passive: true },
    );
    ["touchend", "touchcancel"].forEach(function (ev) {
      grade.addEventListener(
        ev,
        function () {
          setTimeout(function () {
            retomar("toque");
          }, 2000);
        },
        { passive: true },
      );
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) retomar("fora");
        else pausar("fora");
      }).observe(grade);
    }

    // Botão de pausa (acessibilidade: movimento automático precisa poder parar).
    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "vitrine-pausa";
    botao.textContent = "Pausar";
    botao.addEventListener("click", function () {
      if (pausas.botao) {
        retomar("botao");
        botao.textContent = "Pausar";
      } else {
        pausar("botao");
        botao.textContent = "Retomar";
      }
    });
    grade.parentNode.insertBefore(botao, grade);

    function quadro(t) {
      if (ultimo === null) ultimo = t;
      var dt = Math.min(t - ultimo, 50);
      ultimo = t;
      if (!pausado()) {
        pos += (VELOCIDADE * dt) / 1000;
        if (pos >= ciclo) pos -= ciclo;
        grade.scrollLeft = pos;
      }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }

  function tentar() {
    var grade = document.querySelector("#vitrine .vitrine-grade");
    if (grade && grade.children.length) {
      iniciar(grade);
      return true;
    }
    return false;
  }
  if (!tentar()) {
    var alvo = document.getElementById("vitrine");
    if (alvo) {
      var obs = new MutationObserver(function () {
        if (tentar()) obs.disconnect();
      });
      obs.observe(alvo, { childList: true, subtree: true });
    }
  }
})();
