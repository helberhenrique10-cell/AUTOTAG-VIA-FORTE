import { useList, useLocomotives } from "@/hooks/useFleet";
import PageHeader from "@/components/common/PageHeader";
import Panel from "@/components/common/Panel";
import GantryList from "@/components/gantry/GantryList";
import SimulateReadingCard from "@/components/gantry/SimulateReadingCard";
import { fmtKm, fmtDate } from "@/lib/maintenance";

const payload = `{
  "gantry_id": "PORTICO-ARQ-01",
  "locomotive": "L-4027",
  "odometer_km": 842615,
  "tags": ["4A8B9C10", "12345678", "A1B2C3D4"],
  "timestamp": "2026-09-27T10:42:00Z"
}`;

export default function Gantries() {
  const { data: gantries = [] } = useList("Gantry", "name");
  const { data: locos = [] } = useLocomotives();
  const { data: readings = [] } = useList("RfidReading", "-created_date", 20);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gestão" title="Configurações de API / Pórticos" subtitle="Leitores RFID (RDM6300 / MFRC522) com ESP32 registram tags, data, hora e KM do odômetro." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SimulateReadingCard gantries={gantries} locos={locos} />
        <div className="space-y-6">
          <GantryList gantries={gantries} />
          <Panel title="Formato do payload (ESP32 → API)">
            <pre className="p-5 text-xs font-mono text-emerald-200/90 overflow-x-auto leading-relaxed">{payload}</pre>
          </Panel>
        </div>
      </div>
      <Panel title="Últimas leituras recebidas">
        {readings.map((r) => (
          <div key={r.id} className="grid gap-1 sm:grid-cols-[160px_140px_1fr_120px] px-5 py-3 border-t border-slate-700/40 first:border-0 text-xs items-center">
            <span className="text-slate-400">{fmtDate(r.read_at)}</span>
            <span className="text-slate-200">{r.gantry_name} · {r.locomotive_code}</span>
            <span className="font-mono text-sky-300 truncate">{(r.tags || []).join("  ")}{r.unknown_tags?.length ? <span className="text-rose-300"> · {r.unknown_tags.length} desconhecida(s)</span> : null}</span>
            <span className="font-mono text-slate-300 sm:text-right">{fmtKm(r.km)}</span>
          </div>
        ))}
        {!readings.length && <p className="py-10 text-center text-sm text-slate-500">Nenhuma leitura recebida.</p>}
      </Panel>
    </div>
  );
}