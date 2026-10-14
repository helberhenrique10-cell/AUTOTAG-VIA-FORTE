import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { COMPONENT_TYPES } from "@/lib/maintenance";
import { logEvent } from "@/lib/actions";
import { useRefresh } from "@/hooks/useFleet";

export default function ComponentFormDialog({ loco, onClose }) {
  const [f, setF] = useState({ type: "governador", name: COMPONENT_TYPES.governador.label, rfid_tag: "", protheus_code: "", installed_at_km: loco.odometer_km, life_km: 100000 });
  const [busy, setBusy] = useState(false);
  const refresh = useRefresh();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setType = (t) => setF({ ...f, type: t, name: COMPONENT_TYPES[t].label, life_km: COMPONENT_TYPES[t].life });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const installed = Number(f.installed_at_km);
    const c = await base44.entities.Component.create({
      ...f, rfid_tag: f.rfid_tag.trim().toUpperCase(), locomotive_id: loco.id, installed_at_km: installed,
      life_km: Number(f.life_km), wear_km: Math.max(0, loco.odometer_km - installed), active: true, installed_date: new Date().toISOString(),
    });
    await logEvent({ type: "cadastro", title: `Componente vinculado: ${c.name}`, description: `Tag ${c.rfid_tag}`, locomotive_id: loco.id, component_id: c.id, km: loco.odometer_km });
    refresh(); onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader><DialogTitle>Vincular componente à {loco.code}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Tipo</Label>
            <Select value={f.type} onValueChange={setType}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(COMPONENT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Nome</Label><Input required value={f.name} onChange={set("name")} className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tag RFID</Label><Input required value={f.rfid_tag} onChange={set("rfid_tag")} className="font-mono mt-1.5" /></div>
            <div><Label>Código Protheus</Label><Input value={f.protheus_code} onChange={set("protheus_code")} className="font-mono mt-1.5" /></div>
            <div><Label>Instalado aos (km)</Label><Input type="number" required value={f.installed_at_km} onChange={set("installed_at_km")} className="mt-1.5" /></div>
            <div><Label>Vida útil (km)</Label><Input type="number" required value={f.life_km} onChange={set("life_km")} className="mt-1.5" /></div>
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Salvando..." : "Vincular componente"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}