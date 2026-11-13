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
    vagas: 5,
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

     /* ---- codigo de conduta ---- */
    condutaUrl: 'conduta.html',
    /* ---- patrocínio desta edição ---- */
    // null = usa COTAS_PADRAO. Troque por um array para ter cotas próprias.
    cotas: null,
    patrocinadores: [
      { nome: 'Editora Novatec', url: 'https://novatec.com.br/', logo: '../assets/belo-horizonte/patrocinadores/logo - novatec.png' },
      { nome: 'ArcelorMittal', url: 'https://brasil.arcelormittal.com/arcelormittalsistemas', logo: '../assets/belo-horizonte/patrocinadores/logo-arcelormittal.png' },
      { nome: 'PUC Minas', url: 'https://www.pucminas.br/destaques/Paginas/default.aspx', logo: '../assets/belo-horizonte/brasao-pucminas-2025_COR.png' },
      { nome: 'Amazon Web Services (AWS)', url: 'https://aws.amazon.com/pt/', logo: '../assets/belo-horizonte/patrocinadores/logo branca - aws.png' },
      { nome: 'Linuxtips', url: 'https://linuxtips.io/', logo: '../assets/belo-horizonte/patrocinadores/logo - linuxtips.png' }
    ],
        /* ---- organização desta edição ---- */
    // Quem estiver com nome 'PREENCHER' não aparece. foto e linkedin são opcionais:
    // sem foto, o card mostra as iniciais.
    organizacao: [
      { nome: 'Derick Rodrigues', funcao: 'Líder Estudantil', foto: '../assets/belo-horizonte/organizadores/Derick.jpeg', linkedin: 'https://www.linkedin.com/in/dericklrodrigues/' },
      { nome: 'Gabriel Lage', funcao: 'Core Team', foto: '../assets/belo-horizonte/organizadores/Gabriel.jpeg', linkedin: 'https://www.linkedin.com/in/gabriel-chagas-lage/' },
      { nome: 'Lilianne Maia', funcao: 'Core Team', foto: '../assets/belo-horizonte/organizadores/Lilianne.png', linkedin: 'https://www.linkedin.com/in/liliannemaia20101982/' },
      { nome: 'Míriam Alves', funcao: 'Core Team', foto: '../assets/belo-horizonte/organizadores/Miriam.jpeg', linkedin: 'https://www.linkedin.com/in/m%C3%ADriam-alves-32a650244/' },
      { nome: 'Otávio Costa', funcao: 'Core Team', foto: '../assets/belo-horizonte/organizadores/Otavio.jpeg', linkedin: 'https://www.linkedin.com/in/ot%C3%A1vio-costa-420833201/' },
      { nome: 'Vinícius de Andrade ', funcao: 'Core Team', foto: '../assets/belo-horizonte/organizadores/Vinicius.jpeg', linkedin: 'https://www.linkedin.com/in/vinic-andrade/' }
    ],
    
        /* ---- almoço com desconto (é só apresentar o crachá do evento) ---- */
    almoco: [
      {
        nome: 'A Granel',
        url: 'https://www.instagram.com/agranelrestaurante',
        linkTexto: 'Ver no Instagram',
        ofertas: ['5% de desconto', 'A 3 min a pé do campus']
      },
      {
        nome: 'Coreu Food Drinks',
        url: 'https://www.instagram.com/coreufooddrink/',
        linkTexto: 'Ver no Instagram',
        ofertas: ['7% de desconto no cartão de crédito ou débito', '12% de desconto no dinheiro', 'A 1 min a pé do campus']
      },
      {
        nome: 'Coreu Bar e Restaurante',
        url: 'https://www.instagram.com/coreu.barerestaurante/',
        linkTexto: 'Ver no Instagram',
        ofertas: ['Almoço a R$ 26,90, sem balança', 'A 4 min a pé do campus']
      }
    ],

        brasao: '../assets/belo-horizonte/brasao - awssbgbh.png',
        
    // null = usa TRILHAS_PADRAO.
    trilhas: null,

    resumo: 'O maior encontro universitário de computação em nuvem de Minas Gerais.',
    descricao: 'Um dia inteiro de conteúdo técnico sobre AWS e computação em nuvem, organizado por estudantes da PUC Minas. Duas trilhas simultâneas, palestras de 35 minutos e intervalos pensados para você conversar com quem está construindo as mesmas coisas que você.',
    formato: 'Tem coffee de boas-vindas e intervalos entre os blocos, com tempo de sobra para conversar.',
    programacao: [
      { inicio: '09:00', fim: '09:30', tipo: 'Recepção', titulo: 'Credenciamento + coffee break 1', local: 'Recepção comum' },
      { inicio: '09:30', fim: '09:40', tipo: 'Plenária', titulo: 'Abertura', local: 'Todos no palco 1' },
      { inicio: '09:40', fim: '09:50', tipo: 'Plenária', titulo: 'Agradecimento aos patrocinadores', local: 'Todos no palco 1' },
      { inicio: '09:50', fim: '10:25', tipo: 'Keynote', sessoes: [
        { id: 'abertura', palco: 1, titulo: 'Construa seu primeiro aplicativo gratuitamente na nuvem', pessoa: 'Ramsés Mata', nota: 'Keynote de abertura', foto: '../assets/belo-horizonte/palestrantes/Ramses Mata.jpg', linkedin:'https://www.linkedin.com/in/ramses-mata/', bio:'Associate Developer Advocate, Ramsés vai conduzir uma jornada prática e descontraída para quem quer começar a construir com a AWS' }
      ] },
      { inicio: '10:30', fim: '11:05', tipo: 'Palestras', sessoes: [
        { id: 'arcelormittal', palco: 1, titulo: 'ArcelorMittal · carreira, estágio e trainee', pessoa: 'Bruna do Carmo', nota: 'Carreiras' },
        { id: 'durable-functions', palco: 2, titulo: 'Orquestrações Stateful com AWS Lambda Durable Functions', pessoa: 'Phillip Prudêncio',  foto: '../assets/belo-horizonte/palestrantes/Phillip Prudencio.jpg', linkedin:'https://www.linkedin.com/in/phillip-prudencio/', bio:'Tech Lead em Engenharia de Plataforma Cloud no Itaú Unibanco, especialista em arquitetura, redes e serviços AWS. Possui mais de 15 anos de experiência em tecnologia, 12 certificações AWS, o reconhecimento AWS Golden Jacket e atua como AWS Community Builder. Também é mentor, palestrante e criador do Método AWS 30D®.' }
      ] },
      { inicio: '11:10', fim: '11:45', tipo: 'Palestras', sessoes: [
        { id: 'carreira-ti', palco: 1, titulo: 'Construindo uma Carreira em TI: Conselhos para Juniores e Profissionais em Transição', pessoa: 'Douglas Fernandes', foto: '../assets/belo-horizonte/palestrantes/Douglas Fernandes.png', linkedin:'https://www.linkedin.com/in/douglasfernandesaws/', bio:'Professor de Pós-Graduação na PUC Minas, com atuação em Arquitetura Cloud, DevOps, DevSecOps, SRE e Engenharia de Software. É Arquiteto de Soluções e Engenheiro DevOps/DevSecOps na ForceOne IT, parceiro AWS, e possui certificações AWS. Também é AWS Academy Certified Educator e fundador da Escola AWS, iniciativa gratuita que já impactou mais de mil participantes em todo o Brasil, promovendo a capacitação em computação em nuvem.' },
        { id: 'legado-ia', palco: 2, titulo: 'Do legado à IA: como modernizar sistemas críticos sem começar do zero', pessoa: 'Gustavo Lepri' , foto: '../assets/belo-horizonte/palestrantes/Gustavo Lepri.png', linkedin:'https://www.linkedin.com/in/gustavo-lepri/', bio:'Gustavo Alves Lepri é Head of Development na Webtel, com mais de 20 anos de experiência em tecnologia. Sua trajetória inclui segurança da informação, infraestrutura, Linux, desenvolvimento de software, arquitetura e DevOps. Possui experiência no desenvolvimento e na evolução de sistemas e plataformas de grande escala, incluindo projetos para o setor público, com atuação em software livre, Python e interoperabilidade entre sistemas. Atualmente, trabalha no desenvolvimento de plataformas digitais em ambiente internacional.' }
      ] },
      { inicio: '11:45', fim: '13:00', tipo: 'Intervalo', titulo: 'Almoço', local: 'Intervalo comum' },
      { inicio: '13:00', fim: '13:05', tipo: 'Retorno', titulo: 'Retorno e avisos', local: 'Preparação para as palestras' },
      { inicio: '13:05', fim: '13:40', tipo: 'Palestras', sessoes: [
        { id: 'finops', palco: 1, titulo: 'FinOps do Zero: Como Não Levar um Susto na Primeira Fatura da AWS', pessoa: 'Edson Marques' , foto: '../assets/belo-horizonte/palestrantes/Edson Marques.png', linkedin:'https://www.linkedin.com/in/edsonmarquesio/', bio:'Líder de IA, SRE, Cloud & Platform Engineering no Itaú, onde coordena um time de 22 engenheiros entre as áreas de Crédito e IA (Programa Jed.AI). Com mais de 15 anos de experiência em TI, já atuou como Arquiteto de Soluções Cloud e Site Reliability Engineer em instituições como C6 Bank e BS2, liderando projetos de alta disponibilidade, FinOps e observabilidade. É AWS Community Builder, cursa MBA Executivo em Inteligência Artificial pela Faculdade Exame, pós-graduação em Cloud Computing, e já palestrou no AWS User Group MG. Hoje dedica parte do seu tempo a ajudar novos profissionais a darem os primeiros passos com IA generativa na nuvem.' },
        { id: 'ia-producao', palco: 2, titulo: 'Do protótipo ao ROI: como orquestrar soluções de IA em produção', pessoa: 'Giselle Falcão', foto: '../assets/belo-horizonte/palestrantes/Giselle Falcao.jpg', linkedin:'https://www.linkedin.com/in/giselle-falcao-phd/', bio:'É ex-Mercedez-Benz, doutora em Modelagem Matemática e Computacional, arquiteta de dados, cientista de dados, professora e pesquisadora. Possui mais de 11 anos de experiência na concepção, desenvolvimento e liderança de soluções de Dados e Inteligência Artificial aplicadas a logística, indústria, saúde, finanças e educação. Atuou em organizações como Mercedes-Benz, Unimed Seguros, Walmart e UNESCO, conectando fundamentação matemática, engenharia e aplicação empresarial. É criadora da Metodologia CEOD e autora do manuscrito IA na Prática, dedicado ao ciclo completo das soluções de IA, do diagnóstico e dos dados à produção, ao monitoramento e à desativação responsável.' }
      ] },
      { inicio: '13:45', fim: '14:20', tipo: 'Palestras', sessoes: [
        { id: 'produto', palco: 1, titulo: 'Do código ao produto: como transformar tecnologia em soluções que resolvem problemas reais', pessoa: 'Bruno Dayrell' , foto: '../assets/belo-horizonte/palestrantes/Bruno Dayrell.jpg', linkedin:'https://www.linkedin.com/in/brunodayrell/', bio:'Bruno Alípio Dayrell é Technical Product Manager, com mais de 8 anos de experiência em produtos de tecnologia, AWS e infraestrutura. Engenheiro Eletrônico e de Telecomunicações pela PUC Minas, atua como Product Manager na XTAM, empresa americana de outsourcing. Possui experiência na liderança de produtos, plataformas e iniciativas de automação e eficiência operacional, além de ser AWS Certified. Sua trajetória une engenharia, gestão de produtos e tecnologia, transformando desafios complexos em soluções alinhadas às necessidades dos usuários e aos objetivos de negócio.' },
        { id: 'kubernetes', palco: 2, titulo: 'Code - Cloud - Cluster: Provisionando e operando Kubernetes na AWS com Terraform', pessoa: 'Caio Miranda' , foto: '../assets/belo-horizonte/palestrantes/Caio Miranda.jpg', linkedin:'https://www.linkedin.com/in/caioormiranda/', bio:'SRE/DevOps, entusiasta de automação de práticas de desenvolvimento e para sempre um estudante. É isso o que costumo ser em horário comercial, no tempo livre gosto de bons jogos e da prática de esportes. Entendo que como profissionais DevOps, buscamos o equilíbrio entre eficiência e velocidade, sendo assim, carrego em mente a seguinte frase: “Não tenhamos pressa, mas não percamos tempo”.' }
      ] },
      { inicio: '14:25', fim: '15:00', tipo: 'Palestras', sessoes: [
        { id: 'kafka', palco: 1, titulo: 'AWS MSK: Desmistificando Kafka', pessoa: 'Victor Franca' , foto: '../assets/belo-horizonte/palestrantes/Victor França.jpg', linkedin:'https://www.linkedin.com/in/victorfranca23/', bio:'Um cara de humanas que caiu no mundo da cloud e nunca mais quis voltar. Misturo empatia, caos e observabilidade pra deixar sistemas mais humanos.' },
        { id: 'multi-regiao', palco: 2, titulo: 'Construindo uma Aplicação em Três Camadas Multi-Região na AWS', pessoa: 'Aramis Oliveira' , foto: '../assets/belo-horizonte/palestrantes/Aramis Oliveira.jpg', linkedin:'https://www.linkedin.com/in/aramis-de-oliveira-5b3b9924/', bio:'Aramis Rocha é Arquiteto de Soluções Sênior na Forceone, com 17 anos de experiência em infraestrutura e computação em nuvem. Atua no design e na implementação de arquiteturas na AWS e no desenvolvimento de automações DevOps, com foco em alta disponibilidade, resiliência e Infraestrutura como Código. Possui as certificações AWS Solutions Architect Professional, DevOps Engineer Professional, Advanced Networking Specialty e Security Specialty, entre outras.' }
      ] },
      { inicio: '15:05', fim: '15:40', tipo: 'Palestras', sessoes: [
        { id: 'ia-solucoes', palco: 1, titulo: 'Resultado primeiro, IA depois', pessoa: 'Filipe Barreto', nota: '' , foto: '../assets/belo-horizonte/palestrantes/Filipe Barretto.jpeg', linkedin:'https://www.linkedin.com/in/filipebarretto/', bio:'Filipe Barretto fundou uma empresa parceira Advanced da AWS, vendida a uma multinacional em 2022, e atuou na liderança de vendas de soluções de Cloud Computing até dezembro de 2024. Atualmente, dedica-se à sua empresa de mergulho em Búzios e à aplicação de tecnologia para a transformação dos negócios. É também um dos AWS Heroes do Brasil.' },
        { id: 'carreira-estrategica', palco: 2, titulo: 'Você não precisa saber tudo: como construir sua carreira em tecnologia de forma estratégica', pessoa: 'Beatriz Coura e Júlia Roberta',  fotoBeatriz: '../assets/belo-horizonte/palestrantes/Beatriz Coura.jpg', fotoJulia: '../assets/belo-horizonte/palestrantes/Julia Roberta.jpg', linkedinBeatriz:'https://www.linkedin.com/in/beatriz-coura/', linkedinJulia:'https://www.linkedin.com/in/juliarobertasouza/', bioBeatriz:'Beatriz Coura é Lead de QA e estudante de Sistemas de Informação na PUC Minas, com experiência em estratégia de testes, testes funcionais e exploratórios, validação de APIs e melhoria de processos de qualidade. Certificada CTFL e CPRE Foundation Level, busca aprimoramento contínuo em qualidade de software, automação e liderança técnica, conectando conhecimento acadêmico e experiência prática para construir sua trajetória em tecnologia.', bioJulia:'Júlia Roberta é Data Product Owner na 123 Milhas, formada em Análise e Desenvolvimento de Sistemas e pós-graduanda em Analytics e Business Intelligence pela PUC Minas. Possui experiência em produtos de dados, jornada do cliente, chatbots, SaaS e soluções B2B e B2C. Desenvolvedora por formação e profissional de produto por paixão, conecta tecnologia, estratégia de negócio e necessidades dos usuários. Acredita no aprendizado contínuo, no networking e na construção consciente de trajetórias profissionais únicas.' }
        
      ] },
      { inicio: '15:40', fim: '16:10', tipo: 'Intervalo', titulo: 'Coffee break 2', local: 'Intervalo comum' },
      { inicio: '16:10', fim: '16:50', tipo: 'Keynote', sessoes: [
        { id: 'encerramento', palco: 1, titulo: 'A Definir', pessoa: 'Paloma Lataliza', nota: 'Keynote de encerramento' , foto: '../assets/belo-horizonte/palestrantes/Paloma.jpeg', linkedin:'https://www.linkedin.com/in/palomalataliza/', bio:'Paloma é Senior Cloud Engineer na Caylent, formada em Ciência da Computação pela FUMEC, pós-graduada em Cloud Computing pela PUC Minas e mestranda em TICGC. AWS HERO, lidera o AWS User Group BH, é Embaixadora do Women Techmakers e cofundadora do projeto Mulheres na Nuvem MG. Também organizou o primeiro AWSomeWomenCommunity Summit Brasil e atua incentivando a participação feminina na tecnologia e na computação em nuvem. Entusiasta de containers, é apaixonada por compartilhar conhecimento e fã de Cavaleiros do Zodíaco.' }
      ] },
      { inicio: '16:50', fim: '17:00', tipo: 'Plenária', titulo: 'Encerramento e agradecimentos', local: 'Todos no palco 1' }
    ],
    palestrantes: []
  }
];
