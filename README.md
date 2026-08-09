# Recomeça 50+

Comunidade de requalificação em inteligência artificial para pessoas com 50
anos ou mais — curso em vídeo, fórum, eventos, mensagens, gamificação, vagas
e empresas parceiras. Tudo em português simples, com acessibilidade como
requisito (fonte grande, contraste AA, alvos de toque generosos).

## Stack

- **Frontend**: React 19 + Vite 7 + Tailwind 3 + shadcn/ui + react-router 7
- **Backend**: Hono + tRPC 11 (mesmo processo, mesma porta)
- **Banco**: PostgreSQL + Drizzle ORM (migrações versionadas + boot idempotente)
- **Autenticação própria** (zero dependência de plataforma externa de
  identidade): e-mail + senha (argon2id) **e** código de 6 números por e-mail
  (link mágico). Sessões JWT (`jose`) em cookie `HttpOnly; SameSite=Lax;
  Secure` com registro no banco (permite "sair de todos os aparelhos").
- **E-mail**: Resend (sem chave, os e-mails saem no log do servidor)
- **Uploads**: S3-compatível (sem credenciais, os botões de anexo ficam
  desligados na interface)
- **Testes**: Vitest

## Rodando local

```bash
npm ci
cp .env.example .env        # preencha APP_SECRET e DATABASE_URL
npm run db:push             # cria as tabelas no Postgres (desenvolvimento)
npm run dev                 # http://localhost:3000
```

Sem `DATABASE_URL`, o servidor sobe mesmo assim e responde "banco
desligado" em `/health`. Sem `RESEND_API_KEY`, os códigos de e-mail são
impressos no log do servidor — útil para testar o login local.

### Contas de demonstração (seed)

Na primeira subida com banco vazio, o conteúdo inicial é carregado:
1 trilha com 3 módulos e 12 aulas, 6 espaços, 20 membros fictícios,
30 publicações, 3 eventos, 5 vagas e 2 empresas. Todos os membros de
demonstração usam a senha `recomeca123` (ex.: `membro1@exemplo.com`).

Para virar **administrador**, defina `OWNER_EMAIL` com o seu e-mail e faça
login (senha ou código): o primeiro acesso com esse e-mail recebe o papel de
admin automaticamente.

## Variáveis de ambiente

Veja `.env.example`. Resumo:

| Variável | Obrigatória? | Para quê |
|---|---|---|
| `APP_SECRET` | Sim (login) | Assinatura dos JWT de sessão |
| `DATABASE_URL` | Não* | Postgres. Sem ela, o site sobe sem banco |
| `APP_URL` | Não | Links em e-mails |
| `OWNER_EMAIL` | Não | Vira admin no primeiro login |
| `RESEND_API_KEY` | Não | Sem ela, e-mails saem no log |
| `S3_*` | Não | Sem elas, anexos ficam desligados |
| `PORT` | Não | Porta do servidor (padrão 3000) |

\* **Degradação elegante**: nenhuma variável ausente derruba o processo —
nunca chamamos `process.exit` nem lançamos exceção no boot.

## Migrações

- **Desenvolvimento**: `npm run db:push` (sincroniza o schema direto).
- **Produção / versionadas**: `npm run db:generate` gera o SQL em
  `db/migrations/`. No build, `scripts/embed-migrations.mjs` embute o SQL no
  bundle e, **no boot**, o servidor aplica os statements de forma idempotente
  (erros de "já existe" são ignorados). Falha de banco no boot não derruba o
  processo — o healthcheck continua respondendo.

## Deploy no Railway

1. Crie o projeto **recomeca-50mais** no Railway.
2. Adicione o template **PostgreSQL** ao projeto.
3. Conecte o repositório GitHub (deploy automático a cada push na `main`).
4. Nas variáveis do serviço web, configure:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `APP_SECRET` = saída de `openssl rand -base64 32`
   - `APP_URL` = o domínio público (ex.: `https://recomeca-50mais.up.railway.app`)
   - `OWNER_EMAIL` = seu e-mail
   - `RESEND_API_KEY` (quando tiver) e `RESEND_FROM`
   - `NODE_ENV` = `production`
5. O `railway.toml`/`nixpacks.toml` já configuram Node 22, build
   (`npm ci && npm run build`), start (`npm start`), healthcheck em
   `/health` e restart automático. A porta vem de `PORT` (injetada pelo
   Railway).
6. Abra o domínio público gerado. O primeiro boot cria as tabelas e carrega
   o conteúdo inicial sozinho.

Para apontar `recomeca.ia.br`: adicione o domínio customizado nas
configurações do serviço no Railway e crie o registro CNAME indicado no seu
provedor de DNS.

## Testes

```bash
npm run test
```

Cobrem: papéis e planos (membro/moderador/admin, plano Membro), cálculo de
pontos (razão append-only), progresso da trilha, elegibilidade de
certificado e limites de tentativa da autenticação.

## Estrutura

```
api/            Hono + tRPC (routers, auth, lib, queries)
  boot.ts       entrada do servidor (health, trpc, estáticos)
  ensure-schema.ts  migrações idempotentes no boot
  seed.ts       conteúdo inicial em português
contracts/      tipos/constantes compartilhados front ↔ back
db/             schema Drizzle + migrações SQL
src/            React (pages, components, hooks)
scripts/        embed-migrations (build)
```

## Papéis e planos

- **Papéis**: `membro` (padrão), `moderador`, `admin` (dono via `OWNER_EMAIL`).
- **Planos**: `gratuito` (padrão) e `membro` — a estrutura de cobrança futura
  já existe (`plans`, `subscriptions` e o ponto de extensão
  `api/lib/payment.ts` — `PaymentProvider` stub), mas hoje tudo é gratuito.

## LGPD

- Cadastro exige aceite explícito dos termos (registrado com data/hora).
- Em **Perfil → Privacidade**, o membro pode **exportar todos os seus dados**
  (JSON) e **excluir a conta** (exclusão lógica com remoção de sessões).
