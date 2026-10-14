import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, OctagonAlert, CheckCircle2, Gauge, Radio, Repeat, FileOutput, Plus, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Panel from "@/components/common/Panel";
import { timeAgo, fmtKm } from "@/lib/maintenance";

const ICONS = {
  alerta_atencao: [AlertTriangle, "text-amber-300 bg-amber-500/10"],
  alerta_critico: [OctagonAlert, "text-rose-300 bg-rose-500/10"],
  inspecao: [CheckCircle2, "text-emerald-300 bg-emerald-500/10"],
  odometro: [Gauge, "text-sky-300 bg-sky-500/10"],
  leitura_rfid: [Radio, "text-violet-300 bg-violet-500/10"],
  substituicao: [Repeat, "text-emerald-300 bg-emerald-500/10"],
  erp: [FileOutput, "text-rose-300 bg-rose-500/10"],
  cadastro: [Plus, "text-slate-300 bg-slate-500/10"],
  relatorio: [Mail, "text-sky-300 bg-sky-500/10"],
};

export default function EventFeed({ locoId }) {
  const { data: events = [] } = useQuery({
    queryKey: ["events", locoId],
    queryFn: () => base44.entities.MaintenanceEvent.filter({ locomotive_id: locoId }, "-created_date", 25),
  });
  return (
    <Panel title="Histórico recente de eventos" className="xl:sticky xl:top-10 h-fit">
      <ul className="p-3 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {events.map((e) => {
          const [Icon, cls] = ICONS[e.type] || ICONS.cadastro;
          return (
            <li key={e.id} className="flex gap-3 rounded-xl p-3 hover:bg-slate-800/50 transition">
              <div className={`h-8 w-8 shrink-0 rounded-lg grid place-items-center ${cls}`}><Icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="text-sm text-slate-200 leading-snug">{e.title}</p>
                {e.description && <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>}
                <p className="text-[11px] text-slate-600 mt-1 font-mono">{timeAgo(e.created_date)}{e.km ? ` · ${fmtKm(e.km)}` : ""}</p>
              </div>
            </li>
          );
        })}
        {!events.length && <li className="py-10 text-center text-sm text-slate-500">Sem eventos registrados.</li>}
      </ul>
    </Panel>
  );
}