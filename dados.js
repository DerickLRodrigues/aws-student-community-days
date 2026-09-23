/*
 * Todos os dados editáveis do site ficam neste arquivo.
 *
 * REGRA GERAL: cada edição é autônoma. Cotas, patrocinadores, e-mails e redes
 * sociais pertencem à CIDADE, não ao site. Belo Horizonte e uma futura edição
 * em Recife podem ter cotas, contatos e redes completamente diferentes.
 *
 * Campos com 'PREENCHER' estão vazios de propósito: o site esconde o elemento
 * correspondente em vez de apontar para lugar nenhum.
 */
'use strict';

/* ------------------------------------------------------------------
 * 1. O SITE
 * Só o que vale para o movimento inteiro. Contato de cidade fica na edição.
 * ---------------------------------------------------------------- */
window.SITE = {
  // Nome do movimento (plural) e de cada encontro (singular).
  nome: 'AWS Student Community Days Brasil',
  nomeEdicao: 'AWS Student Community Day',

  // Usado nas URLs canônicas e nas tags de compartilhamento. Sem barra no final.
  dominio: 'https://awsstudentcommunitydays.com.br',

  // Contato do movimento como um todo, se um dia existir um.
  // Enquanto estiver PREENCHER, o rodapé do hub mostra o contato da próxima edição.
  emailGeral: 'PREENCHER',
  redesGerais: []
};

/* ------------------------------------------------------------------
 * 2. MODELOS PADRÃO
 * Ponto de partida para uma edição nova. Qualquer edição pode ignorá-los
 * definindo o próprio `cotas` ou `trilhas`.
 * ---------------------------------------------------------------- */

window.COTAS_PADRAO = [
  {
    nome: 'Diamante',
    destaque: true,
    vagas: 2,
    resumo: 'Presença máxima, antes, durante e depois do evento.',
    entregas: [
      'Logo em destaque no palco e na abertura',
      'Espaço de estande na área de convivência',
      'Fala de 5 minutos na abertura do evento',
      'Vaga na banca de seleção de palestras',
      'Divulgação dedicada nas redes da comunidade',
      'Acesso à base de currículos dos participantes inscritos'
    ]
  },
  {
    nome: 'Ouro',
    destaque: false,
    vagas: 4,
    resumo: 'Marca presente no ambiente e no material do evento.',
    entregas: [
      'Logo no site, no palco e nos intervalos',
      'Espaço de estande na área de convivência',
      'Menção nas redes da comunidade',
      'Material promocional no kit dos participantes'
    ]
  },
  {
    nome: 'Prata',
    destaque: false,
    vagas: 6,
    resumo: 'Para quem quer apoiar e ser visto pelos estudantes.',
    entregas: [
      'Logo no site e nos slides de intervalo',
      'Menção nas redes da comunidade',
      'Material promocional no kit dos participantes'
    ]
  },
  {
    nome: 'Apoio',
    destaque: false,
    vagas: 8,
    resumo: 'Apoio em produto, serviço, espaço ou brinde.',
    entregas: [
      'Logo no site e nos slides de intervalo',
      'Agradecimento na abertura e no encerramento'
    ]
  }
];

window.TRILHAS_PADRAO = [
  { nome: 'Arquitetura & Cloud', descricao: 'Serverless, containers e migrações para a AWS.' },
  { nome: 'DevOps, CI/CD & IaC', descricao: 'Pipelines, automação e infraestrutura como código.' },
  { nome: 'IA & GenAI', descricao: 'Modelos, agentes e aplicações de IA generativa na nuvem.' },
  { nome: 'Dados & Arquitetura Orientada a Eventos', descricao: 'Engenharia de dados, streaming e mensageria.' },
  { nome: 'Segurança, DevSecOps & Governança', descricao: 'Identidade, proteção de cargas e boas práticas.' },
  { nome: 'FinOps', descricao: 'Otimização de custo e uso consciente da nuvem.' },
  { nome: 'Observabilidade & Confiabilidade', descricao: 'Métricas, logs, tracing e sistemas que não caem.' },
  { nome: 'Carreira & Comunidade', descricao: 'Primeiro emprego, certificações e construção de rede.' }
];

/* ------------------------------------------------------------------
 * 3. AS EDIÇÕES
 *
 * Cada entrada é uma cidade e carrega TUDO dela:
 *   uf, lat, lon ....... acendem o ponto certo no mapa
 *   email .............. contato geral daquela organização
 *   emailPatrocinio .... para onde vão as propostas de patrocínio
 *   redes .............. redes sociais DAQUELA edição
 *   cotas .............. null usa COTAS_PADRAO; um array substitui por completo
 *   trilhas ............ null usa TRILHAS_PADRAO
 *   patrocinadores ..... quem já fechou nesta edição
 * ---------------------------------------------------------------- */
window.EDICOES = [
  {
    ano: 2026,
    slug: 'atibaia',
    cidade: 'Atibaia',
    uf: 'SP',
    estado: 'São Paulo',
    lat: -23.1171,
    lon: -46.5563,
    data: '2026-10-31',
    horario: '09:00 às 19:00',
    local: 'UNIFAAT — Centro Universitário de Atibaia',
    detalheLocal: 'Campus Sede',
    endereco: 'Estr. Mun. Jucá Sanches, 1050 — Boa Vista, Atibaia/SP',
    mapaUrl: 'https://www.google.com/maps/search/?api=1&query=UNIFAAT+Estrada+Municipal+Juca+Sanches+1050+Atibaia+SP',
    organizador: 'AWS Student Builder Group Atibaia',

    ingressosUrl: null,
    notaIngresso: 'Consulte o cronograma do evento e participe das palestras/workshop.',
    palestrasUrl: null,
    prazoPalestras: null,

    /* ---- contato desta edição ---- */
    email: 'clubcloudunifaat@gmail.com',
    emailPatrocinio: 'clubcloudunifaat@gmail.com',
    redes: [
      { nome: 'Instagram', url: 'https://www.instagram.com/awscloud_unifaat/' },
      { nome: 'LinkedIn',  url: 'https://www.linkedin.com/in/aws-cloud-club-unifaat-418a353a9/' }
    ],

    /* ---- patrocínio desta edição ---- */
    cotas: null,
    patrocinadores: [],

    trilhas: null,

    resumo: 'O encontro universitário de computação em nuvem de Atibaia.',
    descricao: 'Um dia inteiro de conteúdo técnico sobre AWS e computação em nuvem, organizado por estudantes da UNIFAAT. Palestras, trilhas e muito networking para quem está construindo o futuro na nuvem no interior de São Paulo.',
    formato: '1 hora de duração cada palestra/workshop. (Dúvidas consulte o staff do evento)',
    formatoTitulo: '1 hora cada palestra/workshop por sessão',
    programacao: [],
    palestrantes: []
  },

  {
    ano: 2026,
    slug: 'belo-horizonte',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    estado: 'Minas Gerais',
    // Coordenadas do local, usadas para acender o ponto no mapa.
    lat: -19.9227,
    lon: -43.9938,
    data: '2026-11-14',
    horario: '09:00 às 17:00',
    local: 'PUC Minas — Coração Eucarístico',
    detalheLocal: 'Teatro, Prédio 43',
    endereco: 'Rua Dom José Gaspar, 500 — Belo Horizonte/MG',
    mapaUrl: 'https://www.google.com/maps/search/?api=1&query=PUC+Minas+Cora%C3%A7%C3%A3o+Eucar%C3%ADstico+Rua+Dom+Jos%C3%A9+Gaspar+500',
    organizador: 'AWS Student Builder Group PUC Minas',

    ingressosUrl: 'https://www.sympla.com.br/evento/aws-student-community-day-belo-horizonte/3554710',
    palestrasUrl: 'https://sessionize.com/aws-student-community-day-belo-horizonte/',
    // Prazo para enviar palestra. Depois dessa data o site troca o texto sozinho.
    prazoPalestras: '2026-10-10',

    /* ---- contato desta edição ---- */
    email: 'awscloudclubpucminas@gmail.com',
    emailPatrocinio: 'awscloudclubpucminas@gmail.com',
    redes: [
      { nome: 'LinkedIn', url: 'https://www.linkedin.com/company/aws-sbg-at-puc-minas' },
      { nome: 'Instagram', url: 'https://www.instagram.com/awssbglpucmg/' }
    ],

    /* ---- patrocínio desta edição ---- */
    // null = usa COTAS_PADRAO. Troque por um array para ter cotas próprias.
    cotas: null,
    patrocinadores: [],

    // null = usa TRILHAS_PADRAO.
    trilhas: null,

    resumo: 'O maior encontro universitário de computação em nuvem de Minas Gerais.',
    descricao: 'Um dia inteiro de conteúdo técnico sobre AWS e computação em nuvem, organizado por estudantes da PUC Minas. Duas trilhas simultâneas, palestras de 35 minutos e intervalos pensados para você conversar com quem está construindo as mesmas coisas que você.',
    formato: 'Tem coffee de boas-vindas e intervalos entre os blocos, com tempo de sobra para conversar.',
    programacao: [],
    palestrantes: []
  }
];
