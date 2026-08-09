import { NavLink } from "react-router";

const ABAS = [
  { to: "/comunidade", label: "Discussões", end: true },
  { to: "/comunidade/eventos", label: "Eventos", end: false },
  { to: "/comunidade/membros", label: "Membros", end: false },
  { to: "/comunidade/ranking", label: "Ranking", end: false },
];

export default function ComunidadeNav() {
  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 border-b pb-4"
      aria-label="Seções da comunidade"
    >
      {ABAS.map((a) => (
        <NavLink
          key={a.to}
          to={a.to}
          end={a.end}
          className={({ isActive }) =>
            `rounded-full px-5 py-2.5 text-base font-bold transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-border"
            }`
          }
        >
          {a.label}
        </NavLink>
      ))}
    </nav>
  );
}
