import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useSelectedLoco } from "@/hooks/useFleet";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import Panel from "@/components/common/Panel";
import LocoSelect from "@/components/common/LocoSelect";
import OdometerForm from "@/components/odometer/OdometerForm";
import { fmtKm, fmtDate } from "@/lib/maintenance";

export default function Odometer() {
  const { locos, loco, select, isLoading } = useSelectedLoco();
  const { data: logs = [] } = useQuery({
    queryKey: ["odolog", loco?.id], enabled: !!loco,
    queryFn: () => base44.entities.OdometerLog.filter({ locomotive_id: loco.id }, "-created_date", 50),
  });
  if (isLoading) return <PageLoader />;
  if (!loco) return null;
  return (
    <div>
      <PageHeader eyebrow="Operação" title="Odômetro / Quilometragem" subtitle="Cada KM percorrido é convertido em desgaste conforme o Fator de Severidade da Via.">
        <LocoSelect locos={locos} value={loco.id} onChange={select} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-800/40 ring-1 ring-slate-700/50 p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-mono">Quilometragem atual · {loco.code}</p>
            <p className="font-mono text-4xl text-slate-50 mt-2">{Math.round(loco.odometer_km).toLocaleString("pt-BR")}<span className="text-base text-slate-500 ml-1.5">km</span></p>
          </div>
          <OdometerForm loco={loco} />
        </div>
        <Panel title="Histórico de leituras">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                {["Data", "Anterior", "Nova", "Percorrido", "Trecho / FSV", "Desgaste", "Origem"].map((h) => <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-slate-700/40 font-mono text-xs text-slate-300">
                    <td className="px-4 py-3 whitespace-nowrap font-sans text-slate-400">{fmtDate(l.created_date)}</td>
                    <td className="px-4 whitespace-nowrap">{fmtKm(l.previous_km)}</td>
                    <td className="px-4 whitespace-nowrap text-slate-100">{fmtKm(l.new_km)}</td>
                    <td className="px-4 whitespace-nowrap">+{fmtKm(l.delta_km)}</td>
                    <td className="px-4 whitespace-nowrap font-sans">{l.section || "—"} · {l.fsv}x</td>
                    <td className="px-4 whitespace-nowrap text-amber-300">{fmtKm(l.effective_km)}</td>
                    <td className="px-4 font-sans capitalize">{l.source === "portico" ? "Pórtico RFID" : "Manual"}</td>
                  </tr>
                ))}
                {!logs.length && <tr><td colSpan={7} className="py-12 text-center text-slate-500">Nenhuma leitura registrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}