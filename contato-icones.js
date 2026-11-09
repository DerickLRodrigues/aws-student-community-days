/* Põe um ícone ao lado do rótulo de cada card da seção de contato. */
"use strict";
(function () {
  var ATRIBUTOS =
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

  var ICONES = {
    "e-mail":
      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    ingressos:
      '<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    palestras:
      '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    linkedin:
      '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    instagram:
      '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  };

  function aplicar() {
    var grade = document.getElementById("contato-grade");
    if (!grade) return false;
    var rotulos = grade.querySelectorAll(".contato-rotulo");
    if (!rotulos.length) return false;
    rotulos.forEach(function (rotulo) {
      if (rotulo.querySelector(".contato-icone")) return;
      var desenho = ICONES[rotulo.textContent.trim().toLowerCase()];
      if (desenho) {
        rotulo.insertAdjacentHTML(
          "afterbegin",
          '<svg class="contato-icone" ' + ATRIBUTOS + ">" + desenho + "</svg>",
        );
      }
      if (rotulo.textContent.trim().toLowerCase() === "e-mail") {
        var cartao = rotulo.closest(".contato");
        if (cartao) cartao.classList.add("contato-largo");
      }
    });
    return true;
  }

  if (!aplicar()) {
    var alvo = document.getElementById("contato-grade");
    if (alvo) {
      var obs = new MutationObserver(function () {
        if (aplicar()) obs.disconnect();
      });
      obs.observe(alvo, { childList: true });
    }
  }
})();
