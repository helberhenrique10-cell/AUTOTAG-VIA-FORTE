import { Repeat } from "lucide-react";
import ComponentIcon from "@/components/common/ComponentIcon";
import LifeBar from "@/components/common/LifeBar";
import StatusBadge from "@/components/common/StatusBadge";
import ErpButton from "./ErpButton";
import { lifeStats, fmtKm, timeAgo, fmtDate } from "@/lib/maintenance";

const Row = ({ k, v, mono }) => (
  <div className="flex justify-between gap-3 text-xs">
    <span className="text-slate-500">{k}</span>
    <span className={`text-slate-300 ${mono ? "font-mono" : ""}`}>{v}</span>
  </div>
);

export default function ComponentCard({ comp, loco, onReplace }) {
  const s = lifeStats(comp, loco);
  
  return (
    <div className="rounded-2xl bg-slate-800/40 ring-1 ring-slate-700/50 p-5 flex flex-col gap-4 hover:ring-slate-600 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ComponentIcon type={comp.type} status={comp.active ? s.status : "normal"} />
          <div>
            <p className="font-medium text-slate-100">{comp.name}</p>
            <p className="font-mono text-xs text-sky-300">{comp.rfid_tag}</p>
          </div>
        </div>
        {comp.active ? (
          <StatusBadge status={s.status} />
        ) : (
          <span className="text-[11px] rounded-full px-2.5 py-1 bg-slate-700/50 text-slate-400">
            Removida
          </span>
        )}
      </div>

      {comp.active && <LifeBar pct={s.pct} status={s.status} />}

      <div className="space-y-1.5">
        <Row k="Código Protheus" v={comp.protheus_code || "—"} mono />
        <Row k="Instalado aos" v={fmtKm(comp.installed_at_km)} mono />
        <Row k="Desgaste efetivo (FSV)" v={`${fmtKm(comp.wear_km)} / ${fmtKm(comp.life_km)}`} mono />
        {comp.active ? (
          <Row k="Última leitura RFID" v={timeAgo(comp.last_read_at)} />
        ) : (
          <>
            <Row k="Removida aos" v={fmtKm(comp.removed_at_km)} mono />
            <Row k="Data de remoção" v={fmtDate(comp.removed_date)} />
            <Row k="Consumo final" v={`${s.pct.toFixed(1)}%`} mono />
          </>
        )}
      </div>

      {comp.active && (
        <div className="flex flex-wrap items-center gap-2 pt-1 mt-auto">
          <button
            onClick={() => onReplace(comp)}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 transition"
          >
            <Repeat className="h-3.5 w-3.5" />
            Substituir peça
          </button>
          {s.status === "critico" && <ErpButton comp={comp} loco={loco} />}
        </div>
      )}
    </div>
  );
}