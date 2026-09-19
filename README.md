# AWS Student Community Days Brasil

Site estático do evento, com a edição de Belo Horizonte em 14 de novembro de 2026. Local, horário, programação, palestrantes e inscrições aguardam confirmação.

## Arquivos

- `index.html`: página inicial, conteúdo do movimento, destaque da próxima edição e metadados.
- `styles.css`: aparência e adaptação para celular.
- `events.js`: informações das edições, organizadas por ano e cidade.
- `app.js`: navegação, lista de cidades e páginas dos eventos.
- `assets/cloud-hero.png`: ilustração original da página inicial, gerada com IA.
- `.nojekyll`: permite servir o conteúdo diretamente no GitHub Pages.

## Usar e publicar

Envie o conteúdo desta pasta para a raiz do seu repositório, mantendo a pasta `assets`. Não é necessário instalar dependências ou compilar. Os caminhos dos arquivos são relativos e funcionam também quando o site está em um subdiretório.

Para conferir localmente, abra `index.html` no navegador. Para disponibilizar o site online, use uma hospedagem de arquivos estáticos, como o GitHub Pages.

## Atualizar os eventos

Edite os dados em `events.js`. Cada evento possui ano, cidade, estado, data, local, horário, endereço, link de inscrição, descrição, programação e palestrantes. Mantenha `null` nos campos ainda não confirmados e listas vazias quando as informações não estiverem disponíveis.

Ao adicionar uma edição, use uma combinação única de `year` e `slug`. O seletor de anos, a lista de cidades e os detalhes de cada evento são gerados a partir desses dados. Para programação, cada item recebe `time`, `title` e, opcionalmente, `speaker`. Para palestrantes, use `name` e `bio`. Links de inscrição devem começar com `https://`.

Ao mudar a edição em destaque, atualize também a faixa do próximo encontro, o ano do destaque e os metadados em `index.html`.

As fontes Barlow Condensed e DM Sans são carregadas do Google Fonts; há fontes locais de reserva caso o serviço esteja indisponível. Este projeto não contém backend, formulário de cadastro nem credenciais do Sites.
