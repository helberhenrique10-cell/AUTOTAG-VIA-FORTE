import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { replaceComponent } from "@/lib/actions";
import { useRefresh } from "@/hooks/useFleet";
import { fmtKm, lifeStats } from "@/lib/maintenance";

export default function ReplaceDialog({ comp, loco, onClose }) {
  const [form, setForm] = useState({ rfid_tag: "", protheus_code: comp.protheus_code || "", life_km: comp.life_km, notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refresh = useRefresh();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await replaceComponent(comp, loco, { ...form, rfid_tag: form.rfid_tag.trim().toUpperCase(), life_km: Number(form.life_km) });
      refresh(); onClose();
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle>Checkout / Substituição de peça</DialogTitle>
          <DialogDescription>A tag antiga será desvinculada e mantida no histórico de auditoria.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-slate-800/60 p-4 text-sm grid grid-cols-2 gap-2">
          <span className="text-slate-500">Peça atual</span><span className="text-slate-200">{comp.name}</span>
          <span className="text-slate-500">Tag antiga</span><span className="font-mono text-sky-300">{comp.rfid_tag}</span>
          <span className="text-slate-500">Desgaste acumulado</span><span className="font-mono">{fmtKm(comp.wear_km)} ({lifeStats(comp).pct.toFixed(1)}%)</span>
          <span className="text-slate-500">Instalação da nova</span><span className="font-mono">{fmtKm(loco.odometer_km)}</span>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Nova Tag RFID (UID)</Label><Input required value={form.rfid_tag} onChange={set("rfid_tag")} placeholder="Ex: 9F3A21BC" className="font-mono mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Código Protheus</Label><Input value={form.protheus_code} onChange={set("protheus_code")} className="font-mono mt-1.5" /></div>
            <div><Label>Vida útil (km)</Label><Input type="number" required value={form.life_km} onChange={set("life_km")} className="mt-1.5" /></div>
          </div>
          <div><Label>Observações</Label><Input value={form.notes} onChange={set("notes")} className="mt-1.5" /></div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Registrando..." : "Confirmar substituição"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}