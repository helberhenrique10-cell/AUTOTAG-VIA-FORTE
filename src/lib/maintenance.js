import { Gauge, Fan, Droplets, Wind, Cog } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const COMPONENT_TYPES = {
  governador: { label: "Governador de Potência", life: 100000, icon: Gauge },
  turbo: { label: "Turboalimentador", life: 150000, icon: Fan },
  injetor: { label: "Injetor de Combustível", life: 200000, icon: Droplets },
  compressor: { label: "Compressor de Ar", life: 150000, icon: Wind },
  outro: { label: "Outro", life: 100000, icon: Cog },
};

export const STATUS = {
  normal: { label: "Normal", badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30", bar: "bg-emerald-400", text: "text-emerald-300", soft: "bg-emerald-500/10" },
  atencao: { label: "Atenção", badge: "bg-amber-500/10 text-amber-300 ring-amber-500/30", bar: "bg-amber-400", text: "text-amber-300", soft: "bg-amber-500/10" },
  critico: { label: "Crítico", badge: "bg-rose-500/10 text-rose-300 ring-rose-500/30", bar: "bg-rose-400", text: "text-rose-300", soft: "bg-rose-500/10" },
};

export const SECTIONS = [
  { label: "Plano", fsv: 1 },
  { label: "Ondulado", fsv: 1.1 },
  { label: "Aclive / Serra", fsv: 1.2 },
  { label: "Serra severa", fsv: 1.35 },
];

export const statusFromPct = (p) => (p >= 90 ? "critico" : p > 70 ? "atencao" : "normal");

export function lifeStats(c, loco) {
  const pct = c.life_km ? ((c.wear_km || 0) / c.life_km) * 100 : 0;
  const remaining = Math.max(0, (c.life_km || 0) - (c.wear_km || 0));
  const daily = (loco?.avg_daily_km || 600) * (loco?.severity_factor || 1);
  return { pct, remaining, days: Math.round(remaining / daily), status: statusFromPct(pct) };
}

export const fmtKm = (n) => `${Math.round(n || 0).toLocaleString("pt-BR")} km`;

export const parseDate = (d) => {
  if (!d) return null;
  const s = String(d);
  return new Date(/Z$|[+-]\d\d:?\d\d$/.test(s) ? s : s + "Z");
};

export const timeAgo = (d) => (d ? formatDistanceToNow(parseDate(d), { addSuffix: true, locale: ptBR }) : "—");
export const fmtDate = (d) => (d ? format(parseDate(d), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—");