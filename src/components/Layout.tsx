import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, MessageSquareText, Sprout, User, LogOut, ShieldCheck, Bell } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/providers/trpc";

function BotaoMensagens() {
  const { data: naoLidas } = trpc.messages.unread.useQuery(undefined, {
    refetchInterval: 20000,
    retry: false,
  });
  return (
    <Link
      to="/mensagens"
      className="relative flex h-12 w-12 items-center justify-center rounded-lg border hover:bg-secondary"
      aria-label={`Mensagens${naoLidas ? `, ${naoLidas} não lidas` : ""}`}
    >
      <MessageSquareText className="h-6 w-6" />
      {(naoLidas ?? 0) > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[hsl(33,92%,46%)] px-1.5 text-xs font-bold text-white">
          {naoLidas}
        </span>
      )}
    </Link>
  );
}

function BotaoNotificacoes() {
  const { data: naoLidas } = trpc.notifications.unread.useQuery(undefined, {
    refetchInterval: 20000,
    retry: false,
  });
  return (
    <Link
      to="/notificacoes"
      className="relative flex h-12 w-12 items-center justify-center rounded-lg border hover:bg-secondary"
      aria-label={`Avisos${naoLidas ? `, ${naoLidas} não lidos` : ""}`}
    >
      <Bell className="h-6 w-6" />
      {(naoLidas ?? 0) > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-white">
          {naoLidas}
        </span>
      )}
    </Link>
  );
}

const NAV = [
  { to: "/", label: "Início" },
  { to: "/aulas", label: "Aulas" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/vagas", label: "Vagas" },
  { to: "/empresas", label: "Para empresas" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Recomeça — página inicial">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Sprout className="h-6 w-6" aria-hidden />
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight">
        Recomeça
      </span>
    </Link>
  );
}

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-4 py-2.5 text-lg font-bold transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-secondary"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Logo />

          {/* Navegação desktop */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated && <BotaoNotificacoes />}
            {isAuthenticated && <BotaoMensagens />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2 text-base">
                    <User className="h-5 w-5" aria-hidden />
                    {user?.name?.split(" ")[0] ?? "Minha conta"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-base">
                  <DropdownMenuItem
                    className="py-3 text-base"
                    onClick={() => navigate("/perfil")}
                  >
                    <User className="mr-2 h-5 w-5" /> Meu perfil
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      className="py-3 text-base"
                      onClick={() => navigate("/admin")}
                    >
                      <ShieldCheck className="mr-2 h-5 w-5" /> Painel do administrador
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-3 text-base" onClick={logout}>
                    <LogOut className="mr-2 h-5 w-5" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="lg"
                className="text-base font-bold"
                onClick={() => navigate("/entrar")}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Menu mobile */}
          <button
            className="flex h-12 w-12 items-center justify-center rounded-lg border lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {open && (
          <nav className="border-t bg-background lg:hidden" aria-label="Navegação móvel">
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <NavLink to="/notificacoes" className={navClass} onClick={() => setOpen(false)}>
                    Avisos
                  </NavLink>
                  <NavLink to="/mensagens" className={navClass} onClick={() => setOpen(false)}>
                    Mensagens
                  </NavLink>
                  <NavLink to="/perfil" className={navClass} onClick={() => setOpen(false)}>
                    Meu perfil
                  </NavLink>
                  <button
                    className="rounded-lg px-4 py-2.5 text-left text-lg font-bold hover:bg-secondary"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <NavLink to="/entrar" className={navClass} onClick={() => setOpen(false)}>
                  Entrar
                </NavLink>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 bg-primary text-primary-foreground">
        <div className="container-page grid gap-10 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Sprout className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-2xl font-semibold">Recomeça</span>
            </div>
            <p className="mt-4 max-w-xs text-primary-foreground/85">
              Comunidade de requalificação em inteligência artificial para
              profissionais 50+. Experiência não tem idade.
            </p>
          </div>
          <nav aria-label="Links do rodapé">
            <h2 className="text-lg font-bold">Comunidade</h2>
            <ul className="mt-3 space-y-2 text-primary-foreground/85">
              <li><Link className="underline-offset-4 hover:underline" to="/aulas">Aulas do curso</Link></li>
              <li><Link className="underline-offset-4 hover:underline" to="/comunidade">Fórum de discussão</Link></li>
              <li><Link className="underline-offset-4 hover:underline" to="/vagas">Vagas de emprego</Link></li>
              <li><Link className="underline-offset-4 hover:underline" to="/termos">Termos de uso e privacidade</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="text-lg font-bold">Empresas</h2>
            <ul className="mt-3 space-y-2 text-primary-foreground/85">
              <li><Link className="underline-offset-4 hover:underline" to="/empresas">Seja uma empresa parceira</Link></li>
              <li><Link className="underline-offset-4 hover:underline" to="/empresas">Contrate talentos 50+</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 py-5 text-center text-sm text-primary-foreground/70">
          recomeca.ia.br — Feito com propósito para quem quer recomeçar.
        </div>
      </footer>
    </div>
  );
}
