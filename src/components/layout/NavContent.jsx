import { NavLink } from "react-router-dom";
import { LayoutDashboard, Cpu, ClipboardList, Gauge, BarChart3, Users, RadioTower, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const groups = [
  { label: "Operação", items: [
    { to: "/", label: "Painel Operacional", icon: LayoutDashboard },
    { to: "/componentes", label: "Componentes Rastreados", icon: Cpu },
    { to: "/ordens", label: "Ordens de Serviço", icon: ClipboardList },
    { to: "/odometro", label: "Odômetro / Quilometragem", icon: Gauge },
  ]},
  { label: "Gestão", items: [
    { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
    { to: "/equipe", label: "Equipe Técnica", icon: Users },
    { to: "/porticos", label: "API / Pórticos", icon: RadioTower },
  ]},
];

export default function NavContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-7 pb-8">
        <p className="font-heading text-lg font-semibold text-slate-50 tracking-tight">ViaForte</p>
        <p className="font-mono text-[11px] tracking-[0.25em] text-emerald-400 uppercase mt-0.5">AutoTag · RFID</p>
      </div>
      <nav className="flex-1 space-y-7 px-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/"} onClick={onNavigate}
                  className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${isActive ? "bg-emerald-500/10 text-emerald-300" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <button onClick={() => base44.auth.logout()} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition">
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </div>
  );
}