import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useComponents, useList, useRefresh } from "@/hooks/useFleet";
import { TYPES, PRIORITIES } from "./orderMeta";

const Pick = ({ label, value, onChange, options }) => (
  <div><Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
      <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

export default function OrderFormDialog({ loco, onClose }) {
  const { data: comps = [] } = useComponents(loco.id);
  const { data: techs = [] } = useList("Technician", "name");
  const [f, setF] = useState({ type: "inspecao", priority: "media", component_id: "", assigned_to: "", description: "" });
  const [busy, setBusy] = useState(false);
  const refresh = useRefresh();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const comp = comps.find((c) => c.id === f.component_id);
    await base44.entities.ServiceOrder.create({ ...f, locomotive_id: loco.id, component_name: comp?.name, status: "aberta", number: `OS-${Date.now().toString().slice(-6)}` });
    refresh(); onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader><DialogTitle>Nova Ordem de Serviço · {loco.code}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Pick label="Tipo" value={f.type} onChange={(v) => setF({ ...f, type: v })} options={Object.entries(TYPES)} />
            <Pick label="Prioridade" value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={Object.entries(PRIORITIES).map(([k, v]) => [k, v.label])} />
          </div>
          <Pick label="Componente" value={f.component_id} onChange={(v) => setF({ ...f, component_id: v })} options={comps.map((c) => [c.id, `${c.name} · ${c.rfid_tag}`])} />
          <Pick label="Técnico responsável" value={f.assigned_to} onChange={(v) => setF({ ...f, assigned_to: v })} options={techs.map((t) => [t.name, t.name])} />
          <div><Label>Descrição</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1.5" /></div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Criando..." : "Abrir OS"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}