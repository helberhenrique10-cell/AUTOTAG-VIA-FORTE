import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Panel from "@/components/common/Panel";
import { applyOdometer } from "@/lib/actions";
import { useRefresh } from "@/hooks/useFleet";
import { SECTIONS, fmtKm } from "@/lib/maintenance";

export default function OdometerForm({ loco }) {
  const [km, setKm] = useState("");
  const [section, setSection] = useState("Plano");
  const [fsv, setFsv] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refresh = useRefresh();
  const delta = Number(km) - loco.odometer_km;

  const pickSection = (label) => { setSection(label); setFsv(SECTIONS.find((s) => s.label === label).fsv); };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await applyOdometer(loco, Number(km), Number(fsv), section); setKm(""); refresh(); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <Panel title="Registrar leitura de odômetro">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label>Nova quilometragem total (km)</Label><Input type="number" required value={km} onChange={(e) => setKm(e.target.value)} placeholder={String(Math.round(loco.odometer_km))} className="font-mono mt-1.5" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Trecho percorrido</Label>
            <Select value={section} onValueChange={pickSection}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{SECTIONS.map((s) => <SelectItem key={s.label} value={s.label}>{s.label} · {s.fsv}x</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Fator de Severidade (FSV)</Label><Input type="number" step="0.05" min="1" value={fsv} onChange={(e) => setFsv(e.target.value)} className="font-mono mt-1.5" /></div>
        </div>
        {delta > 0 && (
          <div className="rounded-xl bg-slate-900/60 p-4 text-xs grid grid-cols-2 gap-2">
            <span className="text-slate-500">KM percorrido</span><span className="font-mono text-slate-200">{fmtKm(delta)}</span>
            <span className="text-slate-500">Desgaste aplicado às peças</span><span className="font-mono text-amber-300">{fmtKm(delta * fsv)}</span>
          </div>
        )}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Atualizando..." : "Atualizar odômetro"}</Button>
      </form>
    </Panel>
  );
}