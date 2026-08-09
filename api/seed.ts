/**
 * Conteúdo inicial (seed) — roda uma única vez, quando o banco está vazio.
 * Tudo em português, com dados fictícios realistas para a comunidade já
 * nascer viva. Nada aqui apaga dados existentes.
 */
import { getDb } from "./queries/connection";
import {
  users,
  profiles,
  spaces,
  spaceMembers,
  posts,
  comments,
  courses,
  modules,
  lessons,
  lessonProgress,
  quizzes,
  events,
  eventRsvps,
  companies,
  jobs,
  pointsLedger,
} from "@db/schema";
import { hashPassword } from "./auth/password";
import { PONTOS } from "./lib/pontos";

const SENHA_DEMO = "recomeca123";

const MEMBROS: Array<{
  nome: string;
  cidade: string;
  profissao: string;
  faixa: "45-49" | "50-54" | "55-59" | "60-64" | "65+";
  objetivo: "recolocacao" | "freelance" | "empreender" | "curiosidade";
  experiencia: "iniciante" | "basico" | "intermediario" | "avancado";
  ensina: string;
  aprende: string;
}> = [
  { nome: "Maria Aparecida Santos", cidade: "São Paulo, SP", profissao: "Aposentada (bancária)", faixa: "60-64", objetivo: "curiosidade", experiencia: "iniciante", ensina: "Organização financeira pessoal", aprende: "Usar a IA no dia a dia" },
  { nome: "João Carlos Ferreira", cidade: "Belo Horizonte, MG", profissao: "Contador", faixa: "55-59", objetivo: "recolocacao", experiencia: "basico", ensina: "Contabilidade para pequenos negócios", aprende: "Ferramentas de IA para escritório" },
  { nome: "Rosa Maria Oliveira", cidade: "Recife, PE", profissao: "Professora aposentada", faixa: "65+", objetivo: "freelance", experiencia: "basico", ensina: "Português e redação", aprende: "Criar conteúdo com IA" },
  { nome: "Antônio Silva", cidade: "Porto Alegre, RS", profissao: "Engenheiro civil", faixa: "60-64", objetivo: "empreender", experiencia: "intermediario", ensina: "Gestão de obras", aprende: "IA para planejamento de projetos" },
  { nome: "Francisca Lima", cidade: "Fortaleza, CE", profissao: "Comerciante", faixa: "50-54", objetivo: "empreender", experiencia: "iniciante", ensina: "Vendas e atendimento", aprende: "Divulgar minha loja com IA" },
  { nome: "Paulo Roberto Costa", cidade: "Curitiba, PR", profissao: "Gerente de logística", faixa: "55-59", objetivo: "recolocacao", experiencia: "basico", ensina: "Logística e estoque", aprende: "Planilhas e relatórios com IA" },
  { nome: "Tereza Cristina Almeida", cidade: "Rio de Janeiro, RJ", profissao: "Enfermeira", faixa: "55-59", objetivo: "recolocacao", experiencia: "iniciante", ensina: "Cuidados com idosos", aprende: "Pesquisar com segurança usando IA" },
  { nome: "Sebastião Souza", cidade: "Salvador, BA", profissao: "Motorista profissional", faixa: "60-64", objetivo: "freelance", experiencia: "iniciante", ensina: "Rotas e direção defensiva", aprende: "Aplicativos e IA para trabalho" },
  { nome: "Helena Rodrigues", cidade: "Campinas, SP", profissao: "Secretária executiva", faixa: "50-54", objetivo: "recolocacao", experiencia: "intermediario", ensina: "Organização de agenda e documentos", aprende: "Escrever e-mails com ajuda da IA" },
  { nome: "Raimundo Nonato", cidade: "São Luís, MA", profissao: "Agricultor", faixa: "65+", objetivo: "curiosidade", experiencia: "iniciante", ensina: "Cultivo e horta", aprende: "Usar o celular com IA" },
  { nome: "Lúcia Helena Martins", cidade: "Goiânia, GO", profissao: "Psicóloga", faixa: "55-59", objetivo: "freelance", experiencia: "basico", ensina: "Escuta e bem-estar", aprende: "Atendimento on-line com apoio de IA" },
  { nome: "Carlos Eduardo Nunes", cidade: "Manaus, AM", profissao: "Técnico em eletrônica", faixa: "50-54", objetivo: "empreender", experiencia: "avancado", ensina: "Conserto de aparelhos", aprende: "Automatizar o atendimento da assistência" },
  { nome: "Vera Lúcia Pereira", cidade: "Florianópolis, SC", profissao: "Costureira", faixa: "60-64", objetivo: "empreender", experiencia: "iniciante", ensina: "Costura e ajustes", aprende: "Vender pela internet com IA" },
  { nome: "José Augusto Ramos", cidade: "Vitória, ES", profissao: "Vendedor", faixa: "55-59", objetivo: "recolocacao", experiencia: "basico", ensina: "Negociação", aprende: "Currículo e entrevistas com IA" },
  { nome: "Sônia Regina Castro", cidade: "Niterói, RJ", profissao: "Bibliotecária aposentada", faixa: "65+", objetivo: "curiosidade", experiencia: "basico", ensina: "Pesquisa e organização de acervos", aprende: "Ferramentas de busca com IA" },
  { nome: "Marcos Vinícius Teixeira", cidade: "Belém, PA", profissao: "Cozinheiro", faixa: "50-54", objetivo: "empreender", experiencia: "iniciante", ensina: "Culinária paraense", aprende: "Cardápio e redes sociais com IA" },
  { nome: "Irene Duarte", cidade: "Maceió, AL", profissao: "Auxiliar administrativa", faixa: "55-59", objetivo: "recolocacao", experiencia: "basico", ensina: "Rotinas de escritório", aprende: "Documentos e planilhas com IA" },
  { nome: "Gilberto Farias", cidade: "Natal, RN", profissao: "Porteiro aposentado", faixa: "65+", objetivo: "curiosidade", experiencia: "iniciante", ensina: "Histórias do bairro", aprende: "Conversar com a IA pelo celular" },
  { nome: "Beatriz Fonseca", cidade: "Ribeirão Preto, SP", profissao: "Farmacêutica", faixa: "50-54", objetivo: "freelance", experiencia: "intermediario", ensina: "Uso correto de medicamentos", aprende: "Consultoria on-line com IA" },
  { nome: "Otávio Moreira", cidade: "Uberlândia, MG", profissao: "Motorista de caminhão", faixa: "60-64", objetivo: "recolocacao", experiencia: "iniciante", ensina: "Viagens longas com segurança", aprende: "Primeiros passos com IA" },
];

const ESPACOS = [
  { nome: "Boas-vindas", descricao: "Comece por aqui: apresente-se e conheça a comunidade.", icone: "👋", ordem: 1 },
  { nome: "Dúvidas do curso", descricao: "Perguntas e respostas sobre as aulas de IA.", icone: "❓", ordem: 2 },
  { nome: "Conquistas da semana", descricao: "Conte o que você aprendeu ou conquistou. Vamos celebrar juntos!", icone: "🎉", ordem: 3 },
  { nome: "IA no dia a dia", descricao: "Dicas práticas para usar inteligência artificial na vida e no trabalho.", icone: "💡", ordem: 4 },
  { nome: "Vagas e oportunidades", descricao: "Vagas amigáveis para profissionais 50+ e bicos para fazer de casa.", icone: "💼", ordem: 5 },
  { nome: "Encontros e eventos", descricao: "Aulas ao vivo, rodas de conversa e encontros da turma.", icone: "📅", ordem: 6 },
];

const CURSO = {
  titulo: "Recomeça — IA para a vida e o trabalho",
  descricao:
    "Curso completo e gratuito de inteligência artificial para quem tem 50 anos ou mais. Sem pressa, sem palavras difíceis: você aprende passo a passo, com exemplos do dia a dia.",
  cargaHoraria: 12,
};

const MODULOS = [
  { titulo: "Módulo 1 — Começando do zero", ordem: 1 },
  { titulo: "Módulo 2 — IA no trabalho", ordem: 2 },
  { titulo: "Módulo 3 — Seu novo recomeço", ordem: 3 },
];

const AULAS: Array<{ modulo: number; titulo: string; descricao: string; duracaoMin: number }> = [
  { modulo: 1, titulo: "Boas-vindas ao Recomeça", descricao: "O que você vai aprender, como o curso funciona e por que nunca é tarde para recomeçar.", duracaoMin: 8 },
  { modulo: 1, titulo: "O que é inteligência artificial, sem palavras difíceis", descricao: "Uma explicação simples, com exemplos que você já conhece do dia a dia.", duracaoMin: 12 },
  { modulo: 1, titulo: "Sua primeira conversa com a IA", descricao: "Passo a passo para criar sua conta e conversar com a IA pela primeira vez.", duracaoMin: 15 },
  { modulo: 1, titulo: "Conversando com a IA: como pedir o que você quer", descricao: "Como escrever bons pedidos para a IA responder do jeito que você precisa.", duracaoMin: 14 },
  { modulo: 2, titulo: "IA para escrever e-mails e mensagens", descricao: "Escreva mensagens claras e educadas em segundos, sem travar na frente da tela.", duracaoMin: 12 },
  { modulo: 2, titulo: "IA para organizar documentos e planilhas", descricao: "Resuma textos longos, organize informações e ganhe tempo no escritório.", duracaoMin: 15 },
  { modulo: 2, titulo: "Currículo novo com ajuda da IA", descricao: "Monte um currículo atualizado que valoriza toda a sua experiência.", duracaoMin: 16 },
  { modulo: 2, titulo: "Preparando-se para entrevistas", descricao: "Treine respostas para entrevistas de emprego com a IA como sua parceira.", duracaoMin: 14 },
  { modulo: 3, titulo: "Trabalhando por conta própria com IA", descricao: "Como usar a IA para oferecer serviços e conseguir seus primeiros clientes.", duracaoMin: 15 },
  { modulo: 3, titulo: "Divulgando seu trabalho na internet", descricao: "Textos, ideias de publicações e imagens para mostrar seu trabalho ao mundo.", duracaoMin: 13 },
  { modulo: 3, titulo: "Cuidados e segurança ao usar IA", descricao: "Golpes comuns, senhas, dados pessoais e como se proteger on-line.", duracaoMin: 12 },
  { modulo: 3, titulo: "Seu plano de recomeço", descricao: "Junte tudo o que aprendeu em um plano simples para os próximos 90 dias.", duracaoMin: 10 },
];

const POSTS: Array<{ espaco: number; titulo: string; conteudo: string }> = [
  { espaco: 1, titulo: "Prazer, sou a Maria de São Paulo!", conteudo: "Tenho 62 anos, trabalhei 35 anos no banco e hoje quero aprender essa tal de inteligência artificial. Confesso que tinha medo, mas as aulas são tão calmas que já fiz minha primeira conversa com a IA. Muito feliz de estar aqui!" },
  { espaco: 1, titulo: "Me apresentando: João, contador de BH", conteudo: "Fui desligado há 6 meses e decidi que não vou ficar parado. Quero voltar ao mercado e sei que a IA pode me ajudar. Alguém mais aqui na mesma situação?" },
  { espaco: 1, titulo: "Nunca é tarde: 67 anos e começando", conteudo: "Sou o Raimundo, de São Luís. Mexi a vida inteira com a terra. Meu neto me mostrou a IA e fiquei encantado. Vim aprender a usar o celular direito. Aceito dicas de quem já sabe!" },
  { espaco: 1, titulo: "Professora aposentada chegando", conteudo: "Sou a Rosa, do Recife. Ensinei português a vida toda e agora quero aprender a criar conteúdo com IA para dar aulas particulares on-line. Vamos juntas e juntos!" },
  { espaco: 1, titulo: "Da costura para o mundo digital", conteudo: "Meu nome é Vera, tenho 61 anos e costuro desde os 15. Quero aprender a vender meus trabalhos pela internet. Essa comunidade é um presente." },
  { espaco: 2, titulo: "A IA erra muito? Como conferir as respostas?", conteudo: "Estou na aula 3 e percebi que às vezes a IA inventa coisas. Como vocês fazem para conferir se a resposta está certa?" },
  { espaco: 2, titulo: "Não consigo criar a conta no celular, alguém ajuda?", conteudo: "Tentei seguir a aula 3 pelo celular e travei na parte do e-mail. Alguém pode me dar uma força? Uso um Samsung." },
  { espaco: 2, titulo: "Diferença entre a IA gratuita e a paga?", conteudo: "Vale a pena pagar alguma ferramenta de IA no começo, ou a versão gratuita já resolve? Quem tem experiência, conta pra gente." },
  { espaco: 2, titulo: "Como faço a IA escrever do meu jeito?", conteudo: "Quando peço um texto, ele sai muito formal. Tem como a IA escrever mais simples, do meu jeito de falar?" },
  { espaco: 2, titulo: "IA responde em português de Portugal, e agora?", conteudo: "Às vezes a resposta vem com palavras de Portugal. É só pedir para responder em português do Brasil?" },
  { espaco: 3, titulo: "Consegui! Escrevi meu primeiro e-mail com IA", conteudo: "Seguindo a aula 5, pedi para a IA me ajudar com um e-mail difícil para um cliente. Em 2 minutos estava pronto e ficou melhor que o meu. Estou radiante!" },
  { espaco: 3, titulo: "Meu currículo novo ficou pronto!", conteudo: "Depois da aula 7, refiz meu currículo inteiro com a IA. Mostrei para minha filha e ela não acreditou que fui eu que fiz. Amanhã já começo a enviar." },
  { espaco: 3, titulo: "Primeira semana completa de curso!", conteudo: "Terminei o módulo 1 inteiro. Para quem achava que IA era coisa de jovem, estou provando o contrário. Bora para o módulo 2!" },
  { espaco: 3, titulo: "Vendi meu primeiro bolo encomendado pela internet", conteudo: "Usei a IA para escrever o anúncio dos meus bolos no bairro. Primeira encomenda saiu hoje! Obrigada, comunidade!" },
  { espaco: 3, titulo: "Ensinei minha irmã de 70 anos a usar IA", conteudo: "Depois de aprender aqui, ensinei minha irmã mais velha. Ela chorou de alegria quando a IA escreveu uma carta para a neta. Isso não tem preço." },
  { espaco: 4, titulo: "Uso a IA para lembrar dos remédios", conteudo: "Pedi para a IA montar uma tabelinha simples com os horários dos meus remédios e imprimi. Coloquei na geladeira. Dica para quem toma vários!" },
  { espaco: 4, titulo: "Receita nova toda semana", conteudo: "Peço para a IA sugerir receitas com o que tenho na geladeira. Economizo e ainda vario o cardápio. Alguém mais faz isso?" },
  { espaco: 4, titulo: "IA me ajudou a entender o exame médico", conteudo: "Colei as palavras difíceis do laudo e pedi para a IA explicar de um jeito simples. Fui ao médico muito mais tranquila. Sempre confirmem com o médico, viu!" },
  { espaco: 4, titulo: "Planejando viagem com IA", conteudo: "A IA montou um roteiro de 5 dias para o Nordeste com preços e tudo. Só ajustei os horários. Viagem marcada!" },
  { espaco: 4, titulo: "Cuidado: golpe do falso neto no WhatsApp", conteudo: "Quase caí num golpe de alguém se passando por meu neto pedindo dinheiro. A aula de segurança me salvou. Fiquem atentos e confirmem sempre por ligação!" },
  { espaco: 5, titulo: "Alguém conseguiu vaga depois do curso?", conteudo: "Estou quase terminando o módulo 2 e queria saber: alguém aqui já conseguiu trabalho usando o que aprendeu? Conta a experiência para animar a turma!" },
  { espaco: 5, titulo: "Vagas para quem tem mais de 50 existem?", conteudo: "Vejo muita vaga pedindo jovem. Estou confiante, mas queria dicas de onde procurar vagas que valorizam experiência." },
  { espaco: 5, titulo: "Freela de organização financeira, como começar?", conteudo: "Trabalhei 30 anos com finanças. Quero oferecer organização financeira para aposentados. Por onde começo a divulgar?" },
  { espaco: 5, titulo: "Aula de português on-line: primeiros alunos", conteudo: "Consegui meus dois primeiros alunos de reforço escolar on-line! Usei a IA para montar o material. Se alguém quiser dicas, pergunta aqui." },
  { espaco: 5, titulo: "Currículo: coloco a idade ou não?", conteudo: "Dúvida sincera: vocês colocam idade no currículo? A IA me sugeriu focar na experiência e nas conquistas. O que acham?" },
  { espaco: 6, titulo: "Quem vai na aula ao vivo de sexta?", conteudo: "Já marquei presença na aula ao vivo! Vamos tirar dúvidas juntos. Quem mais vai?" },
  { espaco: 6, titulo: "Sugestão: encontro por cidade", conteudo: "E se a gente marcasse encontros presenciais por cidade? Sou de São Paulo e toparia um café com a turma daqui." },
  { espaco: 6, titulo: "Gravação do encontro passado já está disponível?", conteudo: "Perdi a roda de conversa da semana passada. A gravação já foi publicada? Onde encontro?" },
  { espaco: 6, titulo: "Ideia: grupo de estudo semanal", conteudo: "Que tal um grupo que se encontra toda quarta para estudar uma aula junto? Eu animo organizar. Quem entra?" },
  { espaco: 6, titulo: "Agradecimento pela roda de conversa", conteudo: "A roda de conversa de ontem foi emocionante. Obrigada a todos que compartilharam suas histórias. Não estamos sozinhos!" },
];

const COMENTARIOS = [
  "Que alegria ter você aqui! Seja muito bem-vinda.",
  "Estou na mesma situação. Vamos nos ajudar!",
  "Parabéns pela coragem. O primeiro passo é o mais importante.",
  "Eu também tinha esse medo. Com a prática, passa rapidinho.",
  "Ótima pergunta! Também quero saber a resposta.",
  "Eu faço assim: sempre confiro as informações importantes em outra fonte.",
  "Tenta de novo com calma que dá certo. Qualquer coisa, pergunta aqui.",
  "Eu uso só a gratuita e resolve tudo por enquanto.",
  "Parabéns! Você merece. Conta mais como foi.",
  "Que história linda. Me emocionei aqui.",
  "Anotado! Vou fazer isso também.",
  "Obrigada por compartilhar, ajudou muito.",
  "Eu entro! Me avisa quando marcar.",
  "Verdade, aquela aula foi muito esclarecedora.",
];

export async function seed(): Promise<void> {
  const db = getDb();
  if (!db) return;

  const existentes = await db.select({ id: users.id }).from(users).limit(1);
  if (existentes.length > 0) return; // banco já tem dados — não duplica

  console.log("[seed] banco vazio — carregando conteúdo inicial...");

  const senhaHash = await hashPassword(SENHA_DEMO);

  // 1) Membros + perfis
  const userIds: number[] = [];
  for (let i = 0; i < MEMBROS.length; i++) {
    const m = MEMBROS[i];
    const email = `membro${i + 1}@exemplo.com`;
    const [u] = await db
      .insert(users)
      .values({
        email,
        name: m.nome,
        passwordHash: senhaHash,
        emailVerificadoEm: new Date(),
        aceitouTermosEm: new Date(),
      })
      .returning({ id: users.id });
    userIds.push(u.id);
    await db.insert(profiles).values({
      userId: u.id,
      faixaEtaria: m.faixa,
      cidade: m.cidade,
      profissaoAtual: m.profissao,
      objetivoTipo: m.objetivo,
      experienciaTech: m.experiencia,
      bio: `${m.profissao} em ${m.cidade}, recomeçando com inteligência artificial.`,
      podeEnsinar: m.ensina,
      estaAprendendo: m.aprende,
      concluido: true,
    });
  }

  // 2) Espaços
  const spaceIds: number[] = [];
  for (const e of ESPACOS) {
    const [s] = await db
      .insert(spaces)
      .values({ ...e, tipo: "publicado", formato: "forum" })
      .returning({ id: spaces.id });
    spaceIds.push(s.id);
  }

  // Todos os membros entram nos 4 primeiros espaços
  for (const uid of userIds) {
    for (let s = 0; s < 4; s++) {
      await db.insert(spaceMembers).values({ spaceId: spaceIds[s], userId: uid });
    }
  }

  // 3) Curso: 1 trilha, 3 módulos, 12 aulas
  const [curso] = await db.insert(courses).values(CURSO).returning({ id: courses.id });
  const moduleIds: number[] = [];
  for (const mod of MODULOS) {
    const [m] = await db
      .insert(modules)
      .values({ courseId: curso.id, titulo: mod.titulo, ordem: mod.ordem })
      .returning({ id: modules.id });
    moduleIds.push(m.id);
  }
  const lessonIds: number[][] = [[], [], []];
  const ordensPorModulo = [0, 0, 0];
  for (const a of AULAS) {
    const idx = a.modulo - 1;
    ordensPorModulo[idx]++;
    const [l] = await db
      .insert(lessons)
      .values({
        moduleId: moduleIds[idx],
        titulo: a.titulo,
        descricao: a.descricao,
        duracaoMin: a.duracaoMin,
        ordem: ordensPorModulo[idx],
        publicada: true,
      })
      .returning({ id: lessons.id });
    lessonIds[idx].push(l.id);
  }

  // 3b) Avaliações (uma por módulo, 3 perguntas cada)
  const QUIZZES: Array<{
    modulo: number;
    titulo: string;
    perguntas: Array<{ pergunta: string; opcoes: string[]; correta: number }>;
  }> = [
    {
      modulo: 1,
      titulo: "Avaliação do Módulo 1 — Começando do zero",
      perguntas: [
        {
          pergunta: "O que é inteligência artificial, no jeito simples de explicar?",
          opcoes: [
            "Um robô que vai dominar o mundo",
            "Um programa de computador que aprende com exemplos e ajuda em tarefas do dia a dia",
            "Uma rede social nova",
          ],
          correta: 1,
        },
        {
          pergunta: "Para a IA responder do jeito que você precisa, o ideal é…",
          opcoes: [
            "Escrever pedidos claros, dizendo o que você quer e para quê",
            "Escrever o menor texto possível",
            "Gritar com o computador",
          ],
          correta: 0,
        },
        {
          pergunta: "Se a IA responder algo estranho ou inventado, você deve…",
          opcoes: [
            "Acreditar em tudo, porque a máquina sempre acerta",
            "Conferir a informação em outra fonte antes de usar",
            "Desligar a internet para sempre",
          ],
          correta: 1,
        },
      ],
    },
    {
      modulo: 2,
      titulo: "Avaliação do Módulo 2 — IA no trabalho",
      perguntas: [
        {
          pergunta: "Como a IA pode ajudar na hora de escrever um e-mail difícil?",
          opcoes: [
            "Escrevendo uma primeira versão para você ajustar com seu jeito",
            "Enviando o e-mail sem você ler",
            "Não pode ajudar em nada",
          ],
          correta: 0,
        },
        {
          pergunta: "No currículo, o que vale mais destacar depois dos 50?",
          opcoes: [
            "Esconder a idade e fingir ser mais novo",
            "Sua experiência, conquistas e o que você sabe fazer bem",
            "Só a última empresa onde trabalhou",
          ],
          correta: 1,
        },
        {
          pergunta: "Antes de uma entrevista de emprego, a IA pode…",
          opcoes: [
            "Ir no seu lugar",
            "Ajudar você a treinar respostas para as perguntas mais comuns",
            "Garantir que você será contratado",
          ],
          correta: 1,
        },
      ],
    },
    {
      modulo: 3,
      titulo: "Avaliação do Módulo 3 — Seu novo recomeço",
      perguntas: [
        {
          pergunta: "Para conseguir os primeiros clientes trabalhando por conta, a IA ajuda a…",
          opcoes: [
            "Escrever anúncios, montar orçamentos e organizar o atendimento",
            "Obrigar as pessoas a comprarem",
            "Trabalhar sem fazer nada",
          ],
          correta: 0,
        },
        {
          pergunta: "Alguém se passa por seu neto no WhatsApp pedindo dinheiro. O que fazer?",
          opcoes: [
            "Transferir na hora, é emergência",
            "Ligar para a pessoa e confirmar antes de qualquer pagamento",
            "Mandar metade só para testar",
          ],
          correta: 1,
        },
        {
          pergunta: "Um bom plano de recomeço tem…",
          opcoes: [
            "Passos pequenos e prazos possíveis para os próximos 90 dias",
            "Promessas gigantes para daqui a 10 anos",
            "Nada anotado, só na cabeça",
          ],
          correta: 0,
        },
      ],
    },
  ];
  for (const qz of QUIZZES) {
    await db.insert(quizzes).values({
      moduleId: moduleIds[qz.modulo - 1],
      titulo: qz.titulo,
      perguntas: JSON.stringify(qz.perguntas),
    });
  }

  // 4) Publicações (30) + comentários
  const postIds: number[] = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const authorId = userIds[i % userIds.length];
    const diasAtras = (POSTS.length - i) * 2;
    const criado = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
    const [post] = await db
      .insert(posts)
      .values({
        spaceId: spaceIds[p.espaco - 1],
        authorId,
        titulo: p.titulo,
        conteudo: p.conteudo,
        fixado: i === 0,
        createdAt: criado,
      })
      .returning({ id: posts.id });
    postIds.push(post.id);

    // Pontos do autor pela publicação
    await db.insert(pointsLedger).values({
      userId: authorId,
      acao: "post",
      pontos: PONTOS.post,
      refTipo: "post",
      refId: post.id,
    });
  }

  for (let i = 0; i < COMENTARIOS.length; i++) {
    const authorId = userIds[(i * 3 + 1) % userIds.length];
    const postId = postIds[i % postIds.length];
    const [c] = await db
      .insert(comments)
      .values({ postId, authorId, conteudo: COMENTARIOS[i] })
      .returning({ id: comments.id });
    await db.insert(pointsLedger).values({
      userId: authorId,
      acao: "comentario",
      pontos: PONTOS.comentario,
      refTipo: "comment",
      refId: c.id,
    });
  }

  // 5) Progresso de aulas (alguns membros já avançaram) + pontos
  for (let u = 0; u < 12; u++) {
    const concluidas = 2 + (u % 7); // entre 2 e 8 aulas
    let n = 0;
    for (const modulo of lessonIds) {
      for (const lessonId of modulo) {
        if (n >= concluidas) break;
        await db.insert(lessonProgress).values({
          userId: userIds[u],
          lessonId,
          status: "concluido",
        });
        await db.insert(pointsLedger).values({
          userId: userIds[u],
          acao: "aulaConcluida",
          pontos: PONTOS.aulaConcluida,
          refTipo: "lesson",
          refId: lessonId,
        });
        n++;
      }
      if (n >= concluidas) break;
    }
  }

  // 6) Eventos (futuros) + presenças
  const emDias = (d: number, h: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    dt.setHours(h, 0, 0, 0);
    return dt;
  };
  const EVENTOS = [
    {
      titulo: "Aula ao vivo de boas-vindas",
      descricao: "Encontro on-line para conhecer a turma, tirar dúvidas sobre o curso e fazer a primeira conversa com a IA juntos.",
      dataHora: emDias(5, 19),
      duracaoMin: 60,
      link: "https://meet.google.com/recomeca-boasvindas",
    },
    {
      titulo: "Roda de conversa: IA no trabalho depois dos 50",
      descricao: "Bate-papo aberto com histórias reais de quem voltou ao mercado usando inteligência artificial.",
      dataHora: emDias(12, 19),
      duracaoMin: 90,
      link: "https://meet.google.com/recomeca-roda",
    },
    {
      titulo: "Oficina: currículo novo com IA",
      descricao: "Oficina prática: traga seu currículo antigo e saia com um currículo novo, feito com ajuda da IA. Vagas limitadas!",
      dataHora: emDias(20, 15),
      duracaoMin: 120,
      local: "On-line (link enviado por e-mail)",
      limiteVagas: 30,
    },
  ];
  for (const ev of EVENTOS) {
    const [e] = await db.insert(events).values(ev).returning({ id: events.id });
    for (let u = 0; u < 8; u++) {
      await db.insert(eventRsvps).values({
        eventId: e.id,
        userId: userIds[u],
        status: u % 4 === 3 ? "talvez" : "vou",
      });
      if (u % 4 !== 3) {
        await db.insert(pointsLedger).values({
          userId: userIds[u],
          acao: "presencaEvento",
          pontos: PONTOS.presencaEvento,
          refTipo: "event",
          refId: e.id,
        });
      }
    }
  }

  // 7) Empresas + vagas
  const EMPRESAS = [
    {
      nome: "Café Sabor & História",
      contatoNome: "Dona Marta",
      email: "contato@cafesaborehistoria.com.br",
      segmento: "Alimentação",
      descricao: "Rede de cafeterias que valoriza atendimento experiente e acolhedor.",
      status: "aprovada" as const,
    },
    {
      nome: "Contábil Parceira",
      contatoNome: "Dr. Ricardo",
      email: "vagas@contabilparceira.com.br",
      segmento: "Contabilidade",
      descricao: "Escritório contábil que contrata profissionais experientes para atendimento a pequenos empresários.",
      status: "aprovada" as const,
    },
  ];
  for (const emp of EMPRESAS) {
    await db.insert(companies).values(emp);
  }

  const VAGAS = [
    {
      titulo: "Atendente de cafeteria (meio período)",
      empresa: "Café Sabor & História",
      descricao: "Atendimento ao cliente, organização do salão e apoio no caixa. Valorizamos experiência e simpatia. Treinamento completo.",
      local: "São Paulo, SP",
      modelo: "presencial" as const,
      faixaSalarial: "R$ 1.800 a R$ 2.200",
      requisitos: "Boa comunicação. Não exige experiência com tecnologia.",
    },
    {
      titulo: "Assistente administrativo remoto",
      empresa: "Contábil Parceira",
      descricao: "Organização de documentos, resposta a e-mails e apoio à equipe contábil, tudo de casa. Usamos ferramentas simples com ajuda de IA.",
      local: "Remoto",
      modelo: "remoto" as const,
      faixaSalarial: "R$ 2.500 a R$ 3.200",
      requisitos: "Organização e atenção. Concluir o curso Recomeça é diferencial.",
    },
    {
      titulo: "Organizador(a) financeiro de aposentados (freelance)",
      empresa: "Contábil Parceira",
      descricao: "Ajude aposentados a organizar contas e benefícios. Trabalho por projeto, horários flexíveis.",
      local: "Remoto",
      modelo: "remoto" as const,
      faixaSalarial: "R$ 150 a R$ 300 por cliente",
      requisitos: "Experiência com finanças ou banco. Paciência para explicar.",
    },
    {
      titulo: "Monitor(a) de aulas de informática para 50+",
      empresa: "Café Sabor & História",
      descricao: "Ensine o básico de celular e internet para turmas de iniciantes, em encontros semanais presenciais.",
      local: "São Paulo, SP",
      modelo: "hibrido" as const,
      faixaSalarial: "R$ 80 por encontro",
      requisitos: "Ter concluído o curso Recomeça. Didática e paciência.",
    },
    {
      titulo: "Revisor(a) de textos (freelance)",
      empresa: "Contábil Parceira",
      descricao: "Revise relatórios e comunicados escritos com apoio de IA. Trabalho sob demanda, 100% remoto.",
      local: "Remoto",
      modelo: "remoto" as const,
      faixaSalarial: "R$ 50 a R$ 120 por texto",
      requisitos: "Boa escrita em português.",
    },
  ];
  for (const v of VAGAS) {
    await db.insert(jobs).values({ ...v, etariaFriendly: true, ativa: true });
  }

  console.log(
    `[seed] pronto: ${MEMBROS.length} membros, ${ESPACOS.length} espaços, ${AULAS.length} aulas, ${POSTS.length} publicações, ${EVENTOS.length} eventos, ${VAGAS.length} vagas.`,
  );
}
