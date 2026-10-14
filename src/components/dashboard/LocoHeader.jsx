import { TrainFront, MapPin, Activity } from "lucide-react";
import LocoSelect from "@/components/common/LocoSelect";
import { timeAgo } from "@/lib/maintenance";

export default function LocoHeader({ locos, loco, onSelect }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-900/40 ring-1 ring-slate-700/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20 grid place-items-center">
              <TrainFront className="h-6 w-6 text-sky-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-mono">Ativo monitorado</p>
              <h1 className="font-heading text-2xl font-semibold text-slate-50 tracking-tight">Locomotiva {loco.code}</h1>
            </div>
          </div>
          <LocoSelect locos={locos} value={loco.id} onChange={onSelect} />
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
          <span>Modelo <b className="text-slate-200 font-medium">{loco.model}</b></span>
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{loco.yard} / {loco.line}</span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" /><span className="relative h-2 w-2 rounded-full bg-emerald-400" /></span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300 capitalize">{loco.status}</span> · última leitura {timeAgo(loco.last_reading_at)}
          </span>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-800/40 ring-1 ring-slate-700/50 p-6 lg:min-w-[280px] flex flex-col justify-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-mono">Odômetro total</p>
        <p className="font-mono text-3xl sm:text-4xl text-slate-50 mt-2 tracking-tight">
          {Math.round(loco.odometer_km).toLocaleString("pt-BR")}<span className="text-base text-slate-500 ml-1.5">km</span>
        </p>
        <p className="text-xs text-slate-500 mt-2">FSV padrão {loco.severity_factor || 1}x · média {loco.avg_daily_km} km/dia</p>
      </div>
    </div>
  );
}