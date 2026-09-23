# AWS Student Community Days Brasil

Site do movimento, em `awsstudentcommunitydays.com.br`. A hospedagem S3 + CloudFront
e a esteira GitHub Actions estão em preparação para substituir o AWS Amplify.

Sem dependências, sem build, sem backend. HTML, CSS e JavaScript puro.

> **Vai mexer no site?** Comece pelo **[INSTRUCOES.md](INSTRUCOES.md)** — tutorial passo a passo para criar uma edição, personalizar cotas, trocar contatos e marcar datas. Este README é a referência técnica.

## Como o site é organizado

- **`/`** — o hub. Mapa do Brasil com as cidades acesas, lista de todas as edições e o convite de patrocínio.
- **`/belo-horizonte/`** — a página da edição. Local, horário, ficha, ingressos, chamada de palestras, cotas de patrocínio e contatos.

São páginas HTML de verdade, não rotas de JavaScript: cada cidade tem `<title>`, descrição e imagem de compartilhamento próprios.

## A regra mais importante: cada edição é autônoma

**Cotas, patrocinadores, e-mails e redes sociais pertencem à cidade, não ao site.**

Belo Horizonte e uma futura edição em Recife podem ter cotas diferentes, contatos diferentes e redes diferentes. Nada é compartilhado a não ser que você queira.

```js
{
  slug: 'belo-horizonte',
  email: 'awscloudclubpucminas@gmail.com',
  emailPatrocinio: 'awscloudclubpucminas@gmail.com',
  redes: [
    { nome: 'LinkedIn',  url: 'https://www.linkedin.com/company/aws-sbg-at-puc-minas' },
    { nome: 'Instagram', url: 'https://www.instagram.com/awssbglpucmg/' }
  ],
  cotas: null,           // null = usa COTAS_PADRAO. Um array substitui por completo.
  trilhas: null,         // null = usa TRILHAS_PADRAO.
  patrocinadores: []
}
```

`COTAS_PADRAO` e `TRILHAS_PADRAO` existem só para uma cidade nova não precisar redigitar tudo. No momento em que a cidade define as próprias, o padrão deixa de valer para ela.

O `window.SITE` guarda só o que é do movimento inteiro: nome, domínio e um contato nacional opcional. Enquanto `emailGeral` estiver como `PREENCHER`, o rodapé do hub mostra o contato da próxima edição, dizendo de qual cidade é.

## Organização por ano

O hub abre sempre nas edições do **ano vigente**. Quando há mais de um ano cadastrado, aparece um seletor acima da lista — que fica escondido enquanto só existir um ano.

Se o ano corrente não tiver edição, o site escolhe sozinho, nesta ordem: o próximo ano que tenha; se não houver ano futuro, o ano mais recente que já teve. Nunca mostra lista vazia por conta do calendário.

O ano escolhido vai para a URL (`/?ano=2027`), então o link é compartilhável. Ano inválido cai no padrão em vez de dar erro.

Edições passadas ficam no `dados.js` e viram histórico, com o selo "Já aconteceu".

A faixa "Próximo encontro" ignora o ano selecionado: ela aponta sempre para a próxima edição futura, de qualquer ano.

## O que o site faz sozinho

- Contagem regressiva para o evento e para o prazo da chamada de palestras.
- A chamada vira "Encerrada" sozinha depois de `prazoPalestras`, e a seção some quando o evento já passou.
- O botão de ingresso some depois que o evento passa.
- Vagas de patrocínio = `vagas` da cota menos os patrocinadores já cadastrados **naquela edição**.

## Adicionar uma cidade

Resumo. O passo a passo completo, com exemplo, está no [INSTRUCOES.md](INSTRUCOES.md#1-criar-uma-edição-nova).

**1.** Acrescente a edição em `window.EDICOES`, no `dados.js`, com `slug`, `ano`, `uf`, `lat`, `lon` e os contatos próprios da cidade.

**2.** Copie a pasta `belo-horizonte/` com o nome do slug (`recife/`) e troque os **3 blocos marcados com `TROCAR`** dentro do `index.html`:

1. `<title>`, `description`, `canonical` e as tags `og:`
2. o bloco `application/ld+json` (data, local, organizador)
3. o `<noscript>` no fim do arquivo

**O slug não precisa ser declarado**: ele vem do nome da pasta. E contato nenhum aparece no HTML — tudo vem do `dados.js`, então uma pasta copiada nunca aponta e-mail para a cidade errada.

Se o slug não existir no `dados.js`, a página avisa em vez de renderizar pela metade.

## Adicionar um patrocinador

No `dados.js`, dentro da edição:

```js
patrocinadores: [
  { nome: 'Empresa', url: 'https://empresa.com.br', logo: '../assets/empresa.svg', cota: 'Ouro' }
]
```

O espaço "Seu logo aqui" correspondente some e o contador de vagas se ajusta.

## Rodar local

```sh
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Use o servidor, não `file://`, porque o slug é lido do caminho da URL.

## Publicar com GitHub Actions

O workflow [deploy.yml](.github/workflows/deploy.yml) publica automaticamente após
push para `main`, usando S3 privado + CloudFront e autenticação OIDC, sem secrets
de usuário AWS. Pull requests executam somente validação.

Consulte [infra/DEPLOY.md](infra/DEPLOY.md) para os recursos, configuração, testes,
publicação local e o procedimento de migração do domínio. Os identificadores reais
ficam em [infra/deploy-config.json](infra/deploy-config.json).

**Mantenha o Amplify até concluir e verificar o corte do domínio.** O script de
migração tem modo de simulação por padrão e não exclui o app Amplify.

## Hospedagem anterior: Amplify

Os arquivos de configuração já estão prontos na raiz:

| Arquivo | Para quê |
|---|---|
| `amplify.yml` | Build spec. Sem etapa de build: publica a raiz como está. |
| `customHttp.yml` | Cache e cabeçalhos de segurança. |
| `redirects-amplify.json` | Regras de redirect — **não é lido do repositório**, cole no console. |
| `infra/01-route53-hosted-zone.yaml` | Cria a hosted zone no Route 53. |
| `infra/02-amplify-domain.yaml` | Associa o domínio ao app. |
| `verificar-site.sh` | Confere rotas, cabeçalhos e cache do site publicado. |
| `verificar-dns.sh` | Confere a delegação de DNS e o certificado. |

Ordem: subir para o GitHub → conectar no Amplify → validar na URL `.amplifyapp.com` → só então mexer no DNS.

A ordem do DNS é obrigatória: **crie a hosted zone antes** de trocar os servidores no Registro.br, porque o Registro.br só aceita a delegação depois de verificar que os NS já respondem. São **4** name servers, não 2, e sem o ponto final.

Antes de delegar, rode `./verificar-dns.sh` e confira o item 3: se houver registro DS publicado (DNSSEC) e a zona do Route 53 não estiver assinada, o domínio some da internet para quem valida DNSSEC.

## Duas coisas para não quebrar sem querer

**A CSP é estrita.** O `customHttp.yml` não tem `unsafe-inline` em `script-src` nem em `style-src` — testado, zero violações. Isso só é possível porque o site não tem nenhum `<script>` inline executável e nenhum atributo `style=` inline. Se você adicionar um, ele será **bloqueado** e a página quebra em silêncio. É por isso que o slug vem da pasta em vez de um `<script>window.EDICAO_SLUG=...</script>`. O bloco `application/ld+json` não conta: é dado, não script.

**Contraste.** Texto branco sobre o roxo `#8B5CF6` dá 3,77:1 e reprova no WCAG AA. Por isso o botão principal é texto quase-preto sobre roxo claro (10,98:1) e a faixa roxa usa `#5C14C4` com texto claro (7,95:1).

**O traço do mapa** usa `vector-effect: non-scaling-stroke` com espessura em pixels de tela. Sem isso a espessura escala com o SVG e o contorno do Brasil vira meio pixel no celular.

## Arquivos do site

| Arquivo | O que é |
|---|---|
| `index.html` | O hub |
| `belo-horizonte/index.html` | Casca e metadados da edição |
| `dados.js` | **Os dados. É aqui que você edita.** |
| `comum.js` | Utilidades, mapa e rodapé, usados pelas duas páginas |
| `hub.js` / `edicao.js` | Montam o hub e a página de cidade |
| `brasil-mapa.js` | Contornos dos 27 estados em SVG |
| `styles.css` | Toda a identidade visual |
| `404.html`, `robots.txt`, `sitemap.xml` | Ao adicionar cidade, acrescente a URL no sitemap |
| `INSTRUCOES.md` | Tutorial de edição do site |

`assets/cloud-hero.png` não é mais usado — pode apagar. `.nojekyll` é resto do GitHub Pages e não tem efeito no Amplify.

## Sobre a identidade

Roxo e preto, própria, sem imitar o `awscommunityday.com.br`.

O elemento principal é o **mapa do Brasil** no hub: os 27 estados em roxo escuro e só as cidades com edição acesas. Enquanto houver uma cidade só, o mapa conta isso com honestidade em vez de fingir cobertura nacional.

O mapa é ativo próprio: gerado de GeoJSON público dos limites estaduais do IBGE, projetado em Mercator e simplificado por Douglas-Peucker.

Tipografia: **Archivo**, uma família só, usando o eixo de largura variável para separar título de texto corrido.

## Nomenclatura

O domínio é plural e o evento é singular, de propósito:

- **AWS Student Community Days Brasil** — o movimento, o hub, o domínio.
- **AWS Student Community Day Belo Horizonte** — um encontro, igual ao Sympla e ao Sessionize.
