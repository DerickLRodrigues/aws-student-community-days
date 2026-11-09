"use strict";
(function () {
  var A = window.ASCD;
  var secao = document.getElementById("organizacao");
  var lista = document.getElementById("organizacao-lista");
  if (!A || !secao || !lista) return;

  var partes = location.pathname.split("/").filter(function (p) {
    return p && !/\.html?$/i.test(p);
  });
  var edicao = A.porSlug(partes[partes.length - 1]);
  var pessoas = ((edicao && edicao.organizacao) || []).filter(function (p) {
    return p.nome && p.nome !== "PREENCHER";
  });
  if (!pessoas.length) return;

  function iniciais(nome) {
    var p = nome.trim().split(/\s+/);
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  }

  lista.innerHTML = pessoas
    .map(function (p) {
      var foto = p.foto
        ? '<img class="org-foto" src="' +
          A.esc(encodeURI(p.foto)) +
          '" alt="" width="112" height="112" loading="lazy">'
        : '<span class="org-foto org-iniciais" aria-hidden="true">' +
          A.esc(iniciais(p.nome)) +
          "</span>";
      var nome = p.linkedin
        ? '<a class="org-nome" href="' +
          A.esc(p.linkedin) +
          '" target="_blank" rel="noopener noreferrer">' +
          A.esc(p.nome) +
          "</a>"
        : '<strong class="org-nome">' + A.esc(p.nome) + "</strong>";
      return (
        '<li class="org-card">' +
        foto +
        nome +
        (p.funcao
          ? '<span class="org-funcao">' + A.esc(p.funcao) + "</span>"
          : "") +
        "</li>"
      );
    })
    .join("");

  secao.hidden = false;
  var menu = document.getElementById("menu-organizacao");
  if (menu) menu.hidden = false;
})();
// O nome do grupo no card "Quem organiza" vira link para esta seção
if (edicao.organizador) {
  var alvo = Array.prototype.find.call(
    document.querySelectorAll("#edicao-grade *"),
    function (el) {
      return (
        !el.children.length && el.textContent.trim() === edicao.organizador
      );
    },
  );
  if (alvo)
    alvo.innerHTML =
      '<a href="#organizacao">' + A.esc(edicao.organizador) + "</a>";
}
