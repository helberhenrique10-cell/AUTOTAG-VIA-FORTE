import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { logEvent } from "@/lib/actions";
import { useRefresh } from "@/hooks/useFleet";
import { fmtDate } from "@/lib/maintenance";
import { TYPES, PRIORITIES, STATUSES } from "./orderMeta";

export default function OrderRow({ o, loco }) {
  const refresh = useRefresh();
  const changeStatus = async (status) => {
    await base44.entities.ServiceOrder.update(o.id, { status });
    if (status === "concluida") {
      await logEvent({ type: "inspecao", title: `${o.number} concluída`, description: `${TYPES[o.type]}${o.component_name ? ` · ${o.component_name}` : ""}`, locomotive_id: o.locomotive_id, component_id: o.component_id, km: loco?.odometer_km });
    }
    refresh();
  };
  return (
    <div className="grid gap-3 md:grid-cols-[120px_1fr_120px_170px] items-center px-5 py-4 border-t border-slate-700/40 hover:bg-slate-800/30 transition">
      <div>
        <p className="font-mono text-sm text-slate-100">{o.number}</p>
        <p className="text-[11px] text-slate-500">{fmtDate(o.created_date)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-200">{TYPES[o.type]}{o.component_name && <span className="text-slate-400"> · {o.component_name}</span>}</p>
        {o.description && <p className="text-xs text-slate-500 truncate">{o.description}</p>}
        <p className="text-xs text-slate-500 mt-0.5">{o.assigned_to ? `Responsável: ${o.assigned_to}` : "Sem responsável"}{o.erp_request_code && <span className="font-mono text-sky-300"> · {o.erp_request_code}</span>}</p>
      </div>
      <span className={`w-fit text-xs rounded-md px-2 py-1 ${PRIORITIES[o.priority]?.cls}`}>Prioridade {PRIORITIES[o.priority]?.label}</span>
      <Select value={o.status} onValueChange={changeStatus}>
        <SelectTrigger className="bg-slate-800/60 border-slate-700 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}