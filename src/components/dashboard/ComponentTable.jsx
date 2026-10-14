import Panel from "@/components/common/Panel";
import ComponentIcon from "@/components/common/ComponentIcon";
import LifeBar from "@/components/common/LifeBar";
import StatusBadge from "@/components/common/StatusBadge";
import ErpButton from "@/components/components/ErpButton";
import { COMPONENT_TYPES, fmtKm } from "@/lib/maintenance";

const cols = ["Componente", "Tag RFID (UID)", "Código Protheus", "KM desde instalação", "Vida útil restante", "Previsão de troca", "Status"];

export default function ComponentTable({ stats, loco }) {
  return (
    <Panel title="Rastreabilidade de Componentes">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              {cols.map((c) => <th key={c} className="px-4 py-3 font-medium whitespace-nowrap first:pl-5">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {stats.map(({ c, s }) => (
              <tr key={c.id} className="border-t border-slate-700/40 hover:bg-slate-800/40 transition-colors">
                <td className="py-4 pl-5 pr-4">
                  <div className="flex items-center gap-3">
                    <ComponentIcon type={c.type} status={s.status} />
                    <div className="min-w-[140px]">
                      <p className="font-medium text-slate-100">{c.name}</p>
                      <p className="text-xs text-slate-500">{COMPONENT_TYPES[c.type]?.label}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 font-mono text-xs text-sky-300">{c.rfid_tag}</td>
                <td className="px-4 font-mono text-xs text-slate-300">{c.protheus_code}</td>
                <td className="px-4 font-mono text-xs text-slate-300 whitespace-nowrap">{fmtKm(loco.odometer_km - c.installed_at_km)}</td>
                <td className="px-4"><LifeBar pct={s.pct} status={s.status} /></td>
                <td className="px-4 whitespace-nowrap">
                  <p className="text-slate-200">{s.days} dias</p>
                  <p className="text-xs text-slate-500 font-mono">{fmtKm(s.remaining)}</p>
                </td>
                <td className="px-4 pr-5">
                  <div className="flex flex-col items-start gap-2">
                    <StatusBadge status={s.status} />
                    {s.status === "critico" && <ErpButton comp={c} loco={loco} />}
                  </div>
                </td>
              </tr>
            ))}
            {!stats.length && <tr><td colSpan={7} className="py-12 text-center text-slate-500">Nenhum componente vinculado.</td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}