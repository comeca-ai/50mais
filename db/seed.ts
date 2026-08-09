import { getDb } from "../api/queries/connection";
import { lessons } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Estrutura de módulos do curso de IA (sem vídeos — o administrador
  // adiciona os links pelo painel ou eles são inseridos depois).
  const existentes = await db.select({ id: lessons.id }).from(lessons);
  if (existentes.length === 0) {
    await db.insert(lessons).values([
      {
        modulo: "Módulo 1 — Desmistificando a inteligência artificial",
        titulo: "O que é IA, afinal? (sem tecniquês)",
        descricao:
          "Uma explicação simples e direta do que é inteligência artificial, de onde ela veio e por que ela é uma oportunidade — não uma ameaça — para profissionais experientes.",
        ordem: 1,
      },
      {
        modulo: "Módulo 1 — Desmistificando a inteligência artificial",
        titulo: "IA no dia a dia: você já usa sem perceber",
        descricao:
          "Do GPS ao banco no celular: reconhecendo onde a IA já está presente na sua vida para perder o medo da novidade.",
        ordem: 2,
      },
      {
        modulo: "Módulo 1 — Desmistificando a inteligência artificial",
        titulo: "Criando sua primeira conta em uma ferramenta de IA",
        descricao:
          "Passo a passo, tela por tela, para criar sua conta e fazer sua primeira pergunta a uma IA.",
        ordem: 3,
      },
      {
        modulo: "Módulo 2 — Conversando com a IA",
        titulo: "Como conversar com a IA e ser entendido",
        descricao:
          "A arte de fazer bons pedidos à IA (o chamado 'prompt') e por que a sua experiência profissional é uma vantagem enorme aqui.",
        ordem: 4,
      },
      {
        modulo: "Módulo 2 — Conversando com a IA",
        titulo: "Pedidos prontos para o trabalho: e-mails, relatórios e apresentações",
        descricao:
          "Exemplos práticos e prontos para copiar: como a IA acelera as tarefas do dia a dia no escritório.",
        ordem: 5,
      },
      {
        modulo: "Módulo 3 — IA aplicada à sua profissão",
        titulo: "Currículo e LinkedIn turbinados com IA",
        descricao:
          "Use a IA para atualizar seu currículo, destacar sua experiência e se apresentar melhor para recrutadores.",
        ordem: 6,
      },
      {
        modulo: "Módulo 3 — IA aplicada à sua profissão",
        titulo: "Simulando entrevistas de emprego com a IA",
        descricao:
          "Treine entrevistas com a IA fazendo o papel de recrutador — e chegue confiante na entrevista de verdade.",
        ordem: 7,
      },
      {
        modulo: "Módulo 4 — Segurança e próximos passos",
        titulo: "Golpes e cuidados: usando IA com segurança",
        descricao:
          "Como identificar golpes que usam IA, proteger seus dados e ensinar a família a fazer o mesmo.",
        ordem: 8,
      },
      {
        modulo: "Módulo 4 — Segurança e próximos passos",
        titulo: "Seu plano de recomeço: da comunidade para o mercado",
        descricao:
          "Como montar seu plano de transição, usar a comunidade a seu favor e se preparar para as vagas das empresas parceiras.",
        ordem: 9,
      },
    ]);
    console.log("Aulas de exemplo criadas.");
  }

  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
