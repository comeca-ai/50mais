import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Briefcase,
  Building2,
  Check,
  Trash2,
  Users,
  Video,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Aba: Aulas
// ---------------------------------------------------------------------------
function AbaAulas() {
  const utils = trpc.useUtils();
  const { data: aulas } = trpc.lessons.listAll.useQuery();
  const { data: modulos } = trpc.lessons.modules.useQuery();
  const { data: cursos } = trpc.lessons.courses.useQuery();
  const [form, setForm] = useState({
    modulo: "",
    titulo: "",
    descricao: "",
    videoUrl: "",
    materialUrl: "",
    duracaoMin: "",
    ordem: "1",
  });
  const [erro, setErro] = useState("");

  const criarModulo = trpc.lessons.createModule.useMutation();
  const criar = trpc.lessons.create.useMutation({
    onSuccess: () => {
      utils.lessons.listAll.invalidate();
      utils.lessons.list.invalidate();
      setForm({
        modulo: form.modulo,
        titulo: "",
        descricao: "",
        videoUrl: "",
        materialUrl: "",
        duracaoMin: "",
        ordem: String(Number(form.ordem) + 1),
      });
      setErro("");
    },
    onError: (e) => setErro(e.message),
  });

  /** Encontra o módulo pelo título; cria se ainda não existir. */
  async function enviarAula() {
    setErro("");
    const tituloModulo = form.modulo.trim();
    let mod = (modulos ?? []).find((m) => m.titulo === tituloModulo);
    if (!mod) {
      const curso = (cursos ?? [])[0];
      if (!curso) {
        setErro("Nenhuma trilha cadastrada ainda. Rode o conteúdo inicial.");
        return;
      }
      try {
        mod = await criarModulo.mutateAsync({
          courseId: curso.id,
          titulo: tituloModulo,
          ordem: (modulos ?? []).length + 1,
        });
        utils.lessons.modules.invalidate();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não consegui criar o módulo.");
        return;
      }
    }
    criar.mutate({
      moduleId: mod.id,
      titulo: form.titulo,
      descricao: form.descricao || undefined,
      videoUrl: form.videoUrl || undefined,
      materialUrl: form.materialUrl || undefined,
      duracaoMin: form.duracaoMin ? Number(form.duracaoMin) : undefined,
      ordem: Number(form.ordem) || 1,
    });
  }
  const excluir = trpc.lessons.delete.useMutation({
    onSuccess: () => {
      utils.lessons.listAll.invalidate();
      utils.lessons.list.invalidate();
    },
  });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Video className="h-6 w-6 text-primary" /> Nova aula
          </h3>
          <div>
            <Label className="text-base font-bold">Módulo</Label>
            <Input
              className="mt-1.5 h-11 text-base"
              placeholder="Ex.: Módulo 1 — Primeiros passos com IA"
              value={form.modulo}
              onChange={(e) => setForm({ ...form, modulo: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-base font-bold">Título da aula</Label>
            <Input
              className="mt-1.5 h-11 text-base"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-base font-bold">Descrição (opcional)</Label>
            <Textarea
              className="mt-1.5 min-h-20 text-base"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-base font-bold">
              Link do vídeo (YouTube, Google Drive, Vimeo ou mp4)
            </Label>
            <Input
              className="mt-1.5 h-11 text-base"
              placeholder="https://…"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-base font-bold">
              Link do material de apoio (opcional)
            </Label>
            <Input
              className="mt-1.5 h-11 text-base"
              placeholder="https://…"
              value={form.materialUrl}
              onChange={(e) =>
                setForm({ ...form, materialUrl: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-bold">Duração (min)</Label>
              <Input
                type="number"
                className="mt-1.5 h-11 text-base"
                value={form.duracaoMin}
                onChange={(e) =>
                  setForm({ ...form, duracaoMin: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-base font-bold">Ordem</Label>
              <Input
                type="number"
                className="mt-1.5 h-11 text-base"
                value={form.ordem}
                onChange={(e) => setForm({ ...form, ordem: e.target.value })}
              />
            </div>
          </div>
          {erro && <p role="alert" className="font-bold text-destructive">{erro}</p>}
          <Button
            size="lg"
            className="h-12 w-full text-base font-bold"
            disabled={criar.isPending || criarModulo.isPending || !form.modulo || !form.titulo}
            onClick={() => void enviarAula()}
          >
            {criar.isPending || criarModulo.isPending ? "Salvando…" : "Publicar aula"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" /> Aulas cadastradas (
            {(aulas ?? []).length})
          </h3>
          <ul className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-2">
            {(aulas ?? []).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{a.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.modulo} · ordem {a.ordem}
                    {a.videoUrl ? " · com vídeo" : " · sem vídeo"}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  aria-label={`Excluir aula ${a.titulo}`}
                  onClick={() => excluir.mutate({ id: a.id })}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Aba: Vagas
// ---------------------------------------------------------------------------
function AbaVagas() {
  const utils = trpc.useUtils();
  const { data: vagas } = trpc.jobs.list.useQuery();
  const [vendo, setVendo] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    empresa: "",
    descricao: "",
    local: "",
    modelo: "remoto" as "remoto" | "hibrido" | "presencial",
    contato: "",
  });

  const criar = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      setForm({
        titulo: "",
        empresa: "",
        descricao: "",
        local: "",
        modelo: "remoto",
        contato: "",
      });
    },
  });
  const excluir = trpc.jobs.delete.useMutation({
    onSuccess: () => utils.jobs.list.invalidate(),
  });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Briefcase className="h-6 w-6 text-primary" /> Nova vaga
          </h3>
          <div>
            <Label className="text-base font-bold">Cargo</Label>
            <Input
              className="mt-1.5 h-11 text-base"
              placeholder="Ex.: Assistente administrativo com IA"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-base font-bold">Empresa</Label>
            <Input
              className="mt-1.5 h-11 text-base"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-base font-bold">Descrição da vaga</Label>
            <Textarea
              className="mt-1.5 min-h-24 text-base"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-bold">Local (opcional)</Label>
              <Input
                className="mt-1.5 h-11 text-base"
                placeholder="Ex.: São Paulo — SP"
                value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-base font-bold">Modelo</Label>
              <Select
                value={form.modelo}
                onValueChange={(v) =>
                  setForm({ ...form, modelo: v as typeof form.modelo })
                }
              >
                <SelectTrigger className="mt-1.5 h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remoto" className="text-base">Remoto</SelectItem>
                  <SelectItem value="hibrido" className="text-base">Híbrido</SelectItem>
                  <SelectItem value="presencial" className="text-base">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-base font-bold">
              Contato da empresa (opcional)
            </Label>
            <Input
              className="mt-1.5 h-11 text-base"
              placeholder="E-mail ou telefone"
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
            />
          </div>
          <Button
            size="lg"
            className="h-12 w-full text-base font-bold"
            disabled={criar.isPending || !form.titulo || !form.empresa}
            onClick={() =>
              criar.mutate({
                ...form,
                local: form.local || undefined,
                contato: form.contato || undefined,
              })
            }
          >
            {criar.isPending ? "Publicando…" : "Publicar vaga"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold">
            Vagas ativas ({(vagas ?? []).length})
          </h3>
          <ul className="mt-4 space-y-3">
            {(vagas ?? []).map((v) => (
              <li key={v.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{v.titulo}</p>
                    <p className="text-sm text-muted-foreground">{v.empresa}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 text-sm font-bold"
                      onClick={() => setVendo(v.id)}
                    >
                      <Users className="mr-1.5 h-4 w-4" /> Candidatos
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-11 w-11"
                      aria-label={`Excluir vaga ${v.titulo}`}
                      onClick={() => excluir.mutate({ id: v.id })}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <CandidatosDialog jobId={vendo} onClose={() => setVendo(null)} />
    </div>
  );
}

function CandidatosDialog({
  jobId,
  onClose,
}: {
  jobId: number | null;
  onClose: () => void;
}) {
  const { data: candidatos } = trpc.jobs.applications.useQuery(
    { jobId: jobId ?? 0 },
    { enabled: jobId !== null },
  );
  return (
    <Dialog open={jobId !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Candidatos interessados ({(candidatos ?? []).length})
          </DialogTitle>
        </DialogHeader>
        <ul className="max-h-96 space-y-3 overflow-y-auto">
          {(candidatos ?? []).map((c) => (
            <li key={c.id} className="rounded-xl border p-4">
              <p className="font-bold">{c.userName ?? "Membro"}</p>
              <p className="text-sm text-muted-foreground">
                {c.userEmail ?? "—"}
                {c.cidade ? ` · ${c.cidade}` : ""}
                {c.faixaEtaria ? ` · ${c.faixaEtaria} anos` : ""}
              </p>
              {c.profissaoAtual && (
                <p className="mt-1 text-sm">Profissão: {c.profissaoAtual}</p>
              )}
              {c.mensagem && (
                <p className="mt-2 rounded-lg bg-secondary p-3 text-sm">
                  “{c.mensagem}”
                </p>
              )}
            </li>
          ))}
          {(candidatos ?? []).length === 0 && (
            <p className="text-muted-foreground">
              Nenhum candidato até o momento.
            </p>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Aba: Empresas
// ---------------------------------------------------------------------------
function AbaEmpresas() {
  const utils = trpc.useUtils();
  const { data: empresas } = trpc.companies.list.useQuery();
  const aprovar = trpc.companies.setStatus.useMutation({
    onSuccess: () => utils.companies.list.invalidate(),
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <Building2 className="h-6 w-6 text-primary" /> Empresas cadastradas (
          {(empresas ?? []).length})
        </h3>
        <ul className="mt-4 space-y-3">
          {(empresas ?? []).map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5"
            >
              <div>
                <p className="text-lg font-bold">{e.nome}</p>
                <p className="text-muted-foreground">
                  {e.contatoNome} · {e.email}
                  {e.segmento ? ` · ${e.segmento}` : ""}
                </p>
                {e.descricao && <p className="mt-2">{e.descricao}</p>}
              </div>
              {e.status === "aprovada" ? (
                <span className="flex items-center gap-2 rounded-full bg-[hsl(140,40%,92%)] px-4 py-2 font-bold text-[hsl(150,60%,22%)]">
                  <Check className="h-5 w-5" /> Aprovada
                </span>
              ) : (
                <Button
                  size="lg"
                  className="h-11 text-base font-bold"
                  onClick={() =>
                    aprovar.mutate({ id: e.id, status: "aprovada" })
                  }
                >
                  <Check className="mr-1.5 h-5 w-5" /> Aprovar parceria
                </Button>
              )}
            </li>
          ))}
          {(empresas ?? []).length === 0 && (
            <p className="text-muted-foreground">
              Nenhuma empresa cadastrada ainda.
            </p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Aba: Espaços da comunidade
// ---------------------------------------------------------------------------
function AbaEspacos() {
  const utils = trpc.useUtils();
  const { data: espacos } = trpc.spaces.list.useQuery();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [acesso, setAcesso] = useState<"publicado" | "membros">("publicado");

  const criar = trpc.spaces.create.useMutation({
    onSuccess: () => {
      utils.spaces.list.invalidate();
      setNome("");
      setDescricao("");
    },
  });
  const excluir = trpc.spaces.delete.useMutation({
    onSuccess: () => utils.spaces.list.invalidate(),
  });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="text-xl font-bold">Novo espaço</h3>
          <div>
            <Label className="text-base font-bold">Nome do espaço</Label>
            <Input
              className="mt-1.5 h-11 text-base"
              placeholder="Ex.: Turma de março"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-base font-bold">Descrição (opcional)</Label>
            <Textarea
              className="mt-1.5 min-h-20 text-base"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-base font-bold">Quem pode ver</Label>
            <Select value={acesso} onValueChange={(v) => setAcesso(v as typeof acesso)}>
              <SelectTrigger className="mt-1.5 h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publicado" className="text-base">
                  Todo mundo (aberto)
                </SelectItem>
                <SelectItem value="membros" className="text-base">
                  Só membros logados (restrito)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              Espaços restritos preparam a futura área paga da comunidade.
            </p>
          </div>
          <Button
            size="lg"
            className="h-12 w-full text-base font-bold"
            disabled={criar.isPending || !nome}
            onClick={() =>
              criar.mutate({
                nome,
                descricao: descricao || undefined,
                ordem: (espacos ?? []).length + 1,
                tipo: acesso,
              })
            }
          >
            {criar.isPending ? "Criando…" : "Criar espaço"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold">
            Espaços existentes ({(espacos ?? []).length})
          </h3>
          <ul className="mt-4 space-y-3">
            {(espacos ?? []).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {e.nome}
                    {e.tipo === "membros" && " 🔒"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Number(e.postCount)} conversas
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  aria-label={`Excluir espaço ${e.nome}`}
                  onClick={() => excluir.mutate({ id: e.id })}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página Admin
// ---------------------------------------------------------------------------
export default function Admin() {
  const { user, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });

  if (isLoading) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold">Acesso restrito</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Esta área é exclusiva do administrador da comunidade.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl font-semibold">
        Painel do administrador
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Gerencie as aulas do curso, as vagas publicadas e as empresas parceiras.
      </p>

      <Tabs defaultValue="aulas" className="mt-10">
        <TabsList className="h-14 flex-wrap gap-2 p-1.5">
          <TabsTrigger value="aulas" className="h-11 px-6 text-base font-bold">
            Aulas e vídeos
          </TabsTrigger>
          <TabsTrigger value="espacos" className="h-11 px-6 text-base font-bold">
            Espaços
          </TabsTrigger>
          <TabsTrigger value="vagas" className="h-11 px-6 text-base font-bold">
            Vagas
          </TabsTrigger>
          <TabsTrigger value="empresas" className="h-11 px-6 text-base font-bold">
            Empresas
          </TabsTrigger>
          <TabsTrigger value="moderacao" className="h-11 px-6 text-base font-bold">
            Moderação
          </TabsTrigger>
        </TabsList>
        <TabsContent value="aulas" className="mt-8">
          <AbaAulas />
        </TabsContent>
        <TabsContent value="espacos" className="mt-8">
          <AbaEspacos />
        </TabsContent>
        <TabsContent value="vagas" className="mt-8">
          <AbaVagas />
        </TabsContent>
        <TabsContent value="empresas" className="mt-8">
          <AbaEmpresas />
        </TabsContent>
        <TabsContent value="moderacao" className="mt-8">
          <AbaModeracao />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Aba: Moderação (denúncias)
// ---------------------------------------------------------------------------
function AbaModeracao() {
  const utils = trpc.useUtils();
  const { data: denuncias, isLoading } = trpc.moderation.list.useQuery({});

  const resolver = trpc.moderation.setStatus.useMutation({
    onSuccess: () => utils.moderation.list.invalidate(),
  });

  const abertas = (denuncias ?? []).filter((d) => d.status === "aberto");
  const fechadas = (denuncias ?? []).filter((d) => d.status !== "aberto");

  function alvoTexto(d: {
    postId: number | null;
    commentId: number | null;
    messageId: number | null;
    reportedUserId: number | null;
  }) {
    if (d.postId) return `Publicação #${d.postId}`;
    if (d.commentId) return `Comentário #${d.commentId}`;
    if (d.messageId) return `Mensagem #${d.messageId}`;
    if (d.reportedUserId) return `Membro #${d.reportedUserId}`;
    return "Conteúdo";
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold">
            Denúncias abertas ({abertas.length})
          </h3>
          {isLoading && (
            <p className="mt-4 text-muted-foreground">Carregando…</p>
          )}
          {!isLoading && abertas.length === 0 && (
            <p className="mt-4 text-muted-foreground">
              Nenhuma denúncia esperando análise. Tudo em paz! 💚
            </p>
          )}
          <ul className="mt-4 space-y-3">
            {abertas.map((d) => (
              <li key={d.id} className="rounded-xl border p-4">
                <p className="font-bold">{alvoTexto(d)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Denunciado por {d.reporterNome ?? "Membro"} em{" "}
                  {new Date(d.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="mt-2 rounded-lg bg-secondary p-3">{d.motivo}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.postId && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/comunidade/post/${d.postId}`}>Ver publicação</a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={resolver.isPending}
                    onClick={() =>
                      resolver.mutate({ id: d.id, status: "resolvido" })
                    }
                  >
                    <Check className="mr-1.5 h-4 w-4" aria-hidden />
                    Marcar como resolvida
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={resolver.isPending}
                    onClick={() =>
                      resolver.mutate({ id: d.id, status: "descartado" })
                    }
                  >
                    Descartar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {fechadas.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">
              Histórico ({fechadas.length})
            </h3>
            <ul className="mt-4 space-y-2">
              {fechadas.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <span>
                    {alvoTexto(d)} — {d.motivo.slice(0, 80)}
                  </span>
                  <span className="font-bold">
                    {d.status === "resolvido" ? "✅ Resolvida" : "🗑️ Descartada"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
