# Como mexer no site

Tutorial passo a passo. Para a visão geral do projeto, veja o [README](README.md).

Você não precisa saber JavaScript. Quase tudo é editar um arquivo de texto e copiar uma pasta.

**Antes de começar**, abra o site na sua máquina para ver as mudanças acontecendo:

```sh
python3 -m http.server 8000
```

E deixe `http://localhost:8000` aberto no navegador. A cada edição, recarregue a página (`Cmd+Shift+R` para ignorar o cache).

---

## Índice

1. [Criar uma edição nova](#1-criar-uma-edição-nova)
2. [Como funcionam as datas e os anos](#2-como-funcionam-as-datas-e-os-anos)
3. [Personalizar as cotas de patrocínio](#3-personalizar-as-cotas-de-patrocínio)
4. [Adicionar um patrocinador que fechou](#4-adicionar-um-patrocinador-que-fechou)
5. [Trocar contatos e redes sociais](#5-trocar-contatos-e-redes-sociais)
6. [Personalizar as trilhas](#6-personalizar-as-trilhas)
7. [Mudar textos fixos e cores](#7-mudar-textos-fixos-e-cores)
8. [Erros comuns](#8-erros-comuns)

---

## 1. Criar uma edição nova

Vamos criar, como exemplo, uma edição em **Recife, 15 de maio de 2027**.

### Passo 1 — descubra a latitude e a longitude do local

É o que acende o ponto certo no mapa do Brasil.

Abra o Google Maps, clique com o botão direito no local do evento e clique no primeiro item do menu (os números). Ele copia algo assim:

```
-8.052240, -34.951050
```

O primeiro número é a **latitude** (`lat`), o segundo é a **longitude** (`lon`). No Brasil os dois são negativos.

### Passo 2 — adicione a edição no `dados.js`

Abra `dados.js`, procure por `window.EDICOES = [` e cole um bloco novo logo depois do colchete:

```js
window.EDICOES = [
  {
    ano: 2027,
    slug: 'recife',
    cidade: 'Recife',
    uf: 'PE',
    estado: 'Pernambuco',
    lat: -8.052240,
    lon: -34.951050,
    data: '2027-05-15',
    horario: '09:00 às 17:00',
    local: 'UFPE — Centro de Informática',
    detalheLocal: 'Auditório do CIn',
    endereco: 'Av. Jornalista Aníbal Fernandes, s/n — Recife/PE',
    mapaUrl: 'https://www.google.com/maps/search/?api=1&query=UFPE+Centro+de+Informatica',
    organizador: 'AWS Student Builder Group UFPE',

    ingressosUrl: 'https://www.sympla.com.br/evento/SEU-EVENTO/000000',
    palestrasUrl: 'https://sessionize.com/SEU-EVENTO/',
    prazoPalestras: '2027-04-10',

    email: 'contato@exemplo.com',
    emailPatrocinio: 'patrocinio@exemplo.com',
    redes: [
      { nome: 'LinkedIn',  url: 'https://www.linkedin.com/company/SEU-PERFIL' },
      { nome: 'Instagram', url: 'https://www.instagram.com/SEU-PERFIL/' }
    ],

    cotas: null,
    patrocinadores: [],
    trilhas: null,

    resumo: 'O encontro universitário de nuvem de Pernambuco.',
    descricao: 'Um dia inteiro de conteúdo técnico sobre AWS e computação em nuvem, organizado por estudantes da UFPE. A primeira frase desta descrição vira o subtítulo da capa.',
    formato: 'Tem coffee de boas-vindas e intervalos entre os blocos.',
    programacao: [],
    palestrantes: []
  },

  /* ...a edição de Belo Horizonte continua aqui embaixo... */
```

Repare na **vírgula** depois da chave `}` que fecha o bloco. Sem ela, o site não carrega.

Campos importantes:

| Campo | Regra |
|---|---|
| `slug` | Só letras minúsculas e hífen. **Tem que ser igual ao nome da pasta** do passo 3. |
| `data` | Sempre no formato `AAAA-MM-DD`. |
| `ano` | O ano do evento. É o que agrupa as edições no seletor de ano. |
| `uf` | Sigla de duas letras maiúsculas. É o que acende o estado no mapa. |
| `prazoPalestras` | Último dia para enviar palestra. Depois dele o site fecha a chamada sozinho. |
| `descricao` | A **primeira frase** aparece na capa. Escreva uma primeira frase que funcione sozinha. |

Se algum link ainda não existe (o Sympla, por exemplo), apague a linha inteira ou deixe `null`. O site esconde o botão em vez de apontar para lugar nenhum. Nunca deixe uma URL inventada.

### Passo 3 — copie a pasta

No terminal, dentro da pasta do projeto:

```sh
cp -R belo-horizonte recife
```

O nome da pasta **precisa ser exatamente o `slug`**. É de lá que o site descobre qual edição mostrar — você não precisa declarar isso em lugar nenhum.

### Passo 4 — ajuste os 3 blocos do `recife/index.html`

Abra o arquivo. Tem três comentários marcados com `TROCAR`. Troque só eles.

**TROCAR 1** — o que aparece na aba do navegador e quando o link é colado no WhatsApp:

```html
<title>AWS Student Community Day Recife — 15 de maio de 2027</title>
<meta name="description" content="Um dia de computação em nuvem na UFPE, no Recife, em 15 de maio de 2027...">
<link rel="canonical" href="https://awsstudentcommunitydays.com.br/recife/">
<meta property="og:url" content="https://awsstudentcommunitydays.com.br/recife/">
<meta property="og:title" content="AWS Student Community Day Recife 2027">
<meta property="og:description" content="15 de maio de 2027, UFPE Centro de Informática...">
```

**TROCAR 2** — o bloco `application/ld+json`. É o que o Google lê para mostrar data e local direto na busca. Ajuste `name`, `startDate`, `endDate`, o endereço, o `organizer`, a `url` e a `offers.url`.

As datas aqui usam outro formato: `2027-05-15T09:00:00-03:00` (o `-03:00` é o fuso de Brasília).

**TROCAR 3** — o `<noscript>` no fim do arquivo. Atualize cidade, data e local.

> Contato **não** aparece no HTML de propósito. Ele vive só no `dados.js`, para que uma pasta copiada nunca mande e-mail para a cidade errada.

### Passo 5 — acrescente no `sitemap.xml`

```xml
<url>
  <loc>https://awsstudentcommunitydays.com.br/recife/</loc>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

### Passo 6 — confira

Abra `http://localhost:8000/recife/`. Você deve ver a página completa.

Se aparecer **"Edição não encontrada"**, o nome da pasta não bate com o `slug` do `dados.js`. Confira os dois.

Volte para `http://localhost:8000/` e veja se o novo estado acendeu no mapa e se o cartão apareceu na lista.

---

## 2. Como funcionam as datas e os anos

### O site abre sempre no ano vigente

A página inicial mostra, por padrão, **as edições do ano corrente**. Em 2027, quem entrar vê as edições de 2027.

Quando existe mais de um ano cadastrado, aparece um seletor de ano acima da lista. Ele fica escondido enquanto só houver um ano — um seletor com uma opção só não informa nada.

### Quando o ano corrente não tem edição

O site não mostra uma lista vazia. Ele escolhe assim, nesta ordem:

1. O ano corrente, se tiver alguma edição.
2. Se não tiver, o **próximo ano** que tenha.
3. Se não houver nenhum ano futuro, o **ano mais recente** que já teve.

Ou seja: em janeiro de 2027, com a próxima edição só em 2028, o site já abre em 2028 sozinho. Você não precisa fazer nada.

### Link direto para um ano

```
https://awsstudentcommunitydays.com.br/?ano=2026
```

Serve para divulgar um ano específico. Se o ano não existir, o site volta para o comportamento padrão em vez de dar erro.

### O que muda sozinho conforme a data passa

Você **não precisa** editar texto quando as datas chegarem:

| O que | Quando muda |
|---|---|
| "Faltam 56 dias" | Todo dia, sozinho. Vira "É hoje" no dia. |
| Selo "Já aconteceu" | No dia seguinte ao evento. |
| Chamada de palestras | Vira "Encerrada" no dia seguinte ao `prazoPalestras`. |
| Seção "Suba no palco" | Some quando o evento já passou. |
| Faixa "Próximo encontro" | Aponta sempre para a próxima edição futura, de qualquer ano. |
| Botão "Garantir ingresso" | Some depois que o evento passa. |

A única coisa que você precisa fazer depois do evento é cadastrar a edição seguinte.

### Edição que já aconteceu

Não apague. Deixe no `dados.js` e mantenha a pasta. Ela vira o histórico: aparece com o selo "Já aconteceu" quando alguém escolhe aquele ano no seletor.

---

## 3. Personalizar as cotas de patrocínio

**Cada cidade tem as próprias cotas.** Belo Horizonte e Recife podem ter níveis, preços e contrapartidas completamente diferentes.

### Usando o modelo padrão

Com `cotas: null`, a edição usa o `COTAS_PADRAO` do `dados.js` (Diamante, Ouro, Prata, Apoio). É o caminho mais fácil: mexa no `COTAS_PADRAO` e vale para todas as cidades que estiverem com `null`.

### Cotas só daquela cidade

Troque o `null` por um array. A partir daí, o padrão não vale mais para ela:

```js
cotas: [
  {
    nome: 'Patrocinador Master',
    destaque: true,          // desenha a borda roxa de destaque
    vagas: 1,                // quantos espaços de logo existem
    resumo: 'Uma linha explicando o nível.',
    entregas: [
      'Logo no palco',
      'Estande na entrada',
      'Fala de 10 minutos na abertura'
    ]
  },
  {
    nome: 'Apoio',
    destaque: false,
    vagas: 5,
    resumo: 'Apoio em produto ou serviço.',
    entregas: ['Logo no site']
  }
]
```

`destaque: true` em mais de uma cota tira o sentido do destaque — use em uma só.

Cada cota ganha automaticamente um botão "Quero a cota X" que abre o e-mail com o assunto já preenchido, incluindo o nome da cota. A empresa chega qualificada.

### Sobre valores em reais

O site não mostra preço de propósito: a tabela vende o que a empresa recebe, e o valor vai na conversa. Isso preserva sua margem de negociação. Se quiser mostrar, acrescente uma linha em `entregas`.

---

## 4. Adicionar um patrocinador que fechou

1. Coloque o arquivo do logo em `assets/`. Prefira **SVG** ou **PNG com fundo transparente**. O site exibe com até 54px de altura.

2. No `dados.js`, dentro da edição:

```js
patrocinadores: [
  { nome: 'Empresa', url: 'https://empresa.com.br', logo: '../assets/empresa.svg', cota: 'Ouro' }
]
```

O caminho começa com `../` porque a página da cidade está uma pasta abaixo da raiz.

O campo `cota` precisa ser **exatamente igual** ao `nome` da cota. É assim que o contador de vagas sabe qual nível diminuir.

O que acontece sozinho: o espaço "Seu logo aqui" some, o contador de vagas daquela cota cai, e quando acabarem as vagas a cota mostra "Esgotada".

---

## 5. Trocar contatos e redes sociais

**Contato é por cidade.** Fica dentro da edição, no `dados.js`:

```js
email: 'contato@exemplo.com',
emailPatrocinio: 'patrocinio@exemplo.com',
redes: [
  { nome: 'LinkedIn',  url: 'https://www.linkedin.com/company/...' },
  { nome: 'Instagram', url: 'https://www.instagram.com/.../' },
  { nome: 'Discord',   url: 'https://discord.gg/...' }
]
```

Regras:

- A URL precisa começar com **`https://`**. Se começar com `http://` ou vier sem o protocolo, o link é ignorado por segurança.
- Se não tiver `emailPatrocinio`, o site usa o `email`.
- Rede que você não usa: apague a linha. Deixar `'PREENCHER'` faz o link sumir, o que também funciona, mas apagar é mais limpo.
- O `nome` pode ser qualquer coisa: `Twitch`, `YouTube`, `Telegram`. Não tem lista fechada.

### E o contato do site inteiro?

No topo do `dados.js` existe `window.SITE.emailGeral`, hoje como `'PREENCHER'`. Ele é para um contato **nacional**, do movimento, que ainda não existe.

Enquanto estiver assim, o rodapé da página inicial mostra o contato da próxima edição, escrito **"Contato — Belo Horizonte"**, para ninguém achar que é um contato geral.

---

## 6. Personalizar as trilhas

Mesma lógica das cotas. Com `trilhas: null`, a edição usa o `TRILHAS_PADRAO`. Para trilhas próprias:

```js
trilhas: [
  { nome: 'Arquitetura & Cloud', descricao: 'Serverless, containers e migrações.' },
  { nome: 'IA & GenAI', descricao: 'Modelos, agentes e aplicações.' }
]
```

Mantenha as trilhas do site iguais às categorias abertas no Sessionize. Se divergirem, a pessoa escolhe uma trilha no site que não existe no formulário.

---

## 7. Mudar textos fixos e cores

### Textos

Os textos que não mudam por cidade (o "Por que a gente faz isso", a explicação da chamada de palestras) estão direto no HTML:

- `index.html` para a página inicial
- `belo-horizonte/index.html` para a página da cidade

Procure o texto no arquivo e edite. É HTML comum.

### Cores

Todas estão no topo do `styles.css`, no bloco `:root`. Trocar uma linha ali muda o site inteiro.

**Antes de trocar qualquer cor, leia isto.** Duas combinações já reprovaram no teste de contraste e foram corrigidas:

- Texto branco sobre o roxo `#8B5CF6` dá **3,77:1** e reprova no padrão de acessibilidade (o mínimo é 4,5:1). Por isso o botão principal é texto quase-preto sobre roxo claro.
- O traço do mapa era `#241A38` sobre `#150E28`, o que dá **1,14:1** — o contorno do Brasil era invisível na prática.

Se for mexer, confira o contraste antes em [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/). O mínimo é 4,5:1 para texto normal e 3:1 para elementos de interface.

### Não use `style=` no HTML

A política de segurança do site (CSP) bloqueia estilo e script escritos direto na tag. Isso é proposital: protege o site contra injeção de código. Use classes no `styles.css`.

Pelo mesmo motivo, **nunca adicione um `<script>` com código dentro do HTML** — ele será bloqueado e a página quebra em silêncio. Se precisar de código novo, coloque num arquivo `.js` e use `<script src="...">`.

---

## 8. Erros comuns

### A página ficou em branco

Quase sempre é vírgula faltando ou sobrando no `dados.js`. Abra o console do navegador (`F12` → aba Console) e procure a mensagem em vermelho — ela diz a linha.

Erro clássico: esquecer a vírgula entre duas edições.

```js
window.EDICOES = [
  { ...recife... }     // ← falta a vírgula aqui
  { ...belo horizonte... }
];
```

### "Edição não encontrada"

O nome da pasta não bate com o `slug`. Pasta `recife/` exige `slug: 'recife'`. Confira maiúsculas, acentos e hífens — `são-paulo` e `sao-paulo` são coisas diferentes. **Nunca use acento no slug nem no nome da pasta.**

### O ponto não apareceu no mapa

Três causas possíveis:

1. `uf` errado ou minúsculo. Tem que ser a sigla em maiúsculas: `PE`, não `pe` nem `Pernambuco`.
2. `lat` e `lon` trocados. No Brasil, latitude fica entre -34 e +5; longitude entre -74 e -34. Se a longitude estiver perto de -8, você inverteu.
3. Esqueceu o sinal de menos.

### O logo do patrocinador não aparece

O caminho na página da cidade precisa do `../` na frente: `'../assets/empresa.svg'`.

### A contagem de vagas não bate

O campo `cota` do patrocinador precisa ser idêntico ao `nome` da cota, incluindo maiúsculas e acentos. `'Ouro'` e `'ouro'` não são a mesma coisa.

### Mudei o CSS e nada aconteceu

Cache do navegador. Recarregue com `Cmd+Shift+R` (Mac) ou `Ctrl+F5` (Windows).

Em produção isso não acontece: o `customHttp.yml` manda o navegador revalidar os arquivos a cada visita.

### Abri o `index.html` clicando duas vezes e quebrou

Use sempre `python3 -m http.server 8000`. Aberto como arquivo (`file://`), o navegador não consegue ler o caminho da URL e o site não descobre qual edição mostrar.
