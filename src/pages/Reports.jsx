import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { base44 } from "@/api/base44Client";
import { useSelectedLoco, useList } from "@/hooks/useFleet";
import PageHeader from "@/components/common/PageHeader";
import Panel from "@/components/common/Panel";
import PageLoader from "@/components/common/PageLoader";
import LocoSelect from "@/components/common/LocoSelect";
import EmailReportCard from "@/components/reports/EmailReportCard";
import { lifeStats, fmtKm, fmtDate } from "@/lib/maintenance";

const COLORS = { normal: "#34d399", atencao: "#fbbf24", critico: "#fb7185" };
const tip = { contentStyle: { background: "#0F172A", border: "1px solid #334155", borderRadius: 10, fontSize: 12 } };

export default function Reports() {
  const { locos, loco, select, isLoading } = useSelectedLoco();
  const { data: all = [] } = useQuery({ queryKey: ["allcomps", loco?.id], enabled: !!loco, queryFn: () => base44.entities.Component.filter({ locomotive_id: loco.id }) });
  const { data: readings = [] } = useList("RfidReading", "-created_date", 200);
  if (isLoading) return <PageLoader />;
  if (!loco) return null;
  const active = all.filter((c) => c.active);
  const removed = all.filter((c) => !c.active);
  const bars = active.map((c) => { const s = lifeStats(c, loco); return { name: c.name, pct: +s.pct.toFixed(1), status: s.status }; });
  const pie = ["normal", "atencao", "critico"].map((k) => ({ name: k, value: bars.filter((b) => b.status === k).length })).filter((p) => p.value);
  const kpis = [["Componentes ativos", active.length], ["Substituições registradas", removed.length], ["Leituras RFID", readings.filter((r) => r.locomotive_id === loco.id).length]];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gestão" title="Relatórios" subtitle="Consumo de vida útil, distribuição de status e auditoria de substituições.">
        <LocoSelect locos={locos} value={loco.id} onChange={select} />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map(([l, v]) => <div key={l} className="rounded-2xl bg-slate-800/40 ring-1 ring-slate-700/50 p-5"><p className="font-heading text-3xl text-slate-50">{v}</p><p className="text-xs text-slate-400 mt-1">{l}</p></div>)}
      </div>
      <EmailReportCard loco={loco} comps={active} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Vida útil consumida (%)">
          <div className="h-72 p-4"><ResponsiveContainer><BarChart data={bars}><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip {...tip} cursor={{ fill: "#1e293b" }} /><Bar dataKey="pct" radius={[6, 6, 0, 0]}>{bars.map((b) => <Cell key={b.name} fill={COLORS[b.status]} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Distribuição de status">
          <div className="h-72 p-4"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={4} stroke="none">{pie.map((p) => <Cell key={p.name} fill={COLORS[p.name]} />)}</Pie><Tooltip {...tip} /></PieChart></ResponsiveContainer></div>
        </Panel>
      </div>
      <Panel title="Auditoria de peças removidas">
        {removed.map((c) => (
          <div key={c.id} className="flex flex-wrap justify-between gap-2 px-5 py-3 border-t border-slate-700/40 text-sm first:border-0">
            <span className="text-slate-200">{c.name} <span className="font-mono text-xs text-sky-300 ml-2">{c.rfid_tag}</span></span>
            <span className="font-mono text-xs text-slate-400">{fmtKm(c.installed_at_km)} → {fmtKm(c.removed_at_km)} · {lifeStats(c).pct.toFixed(1)}% · {fmtDate(c.removed_date)}</span>
          </div>
        ))}
        {!removed.length && <p className="py-10 text-center text-sm text-slate-500">Nenhuma substituição registrada.</p>}
      </Panel>
    </div>
  );
}