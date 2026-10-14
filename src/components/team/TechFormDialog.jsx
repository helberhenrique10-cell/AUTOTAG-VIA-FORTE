/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useRefresh } from "@/hooks/useFleet";

export const SHIFTS = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

export default function TechFormDialog({ onClose }) {
  const [f, setF] = useState({ name: "", role: "", specialty: "", registration: "", phone: "", shift: "manha" });
  const [busy, setBusy] = useState(false);
  const refresh = useRefresh();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await base44.entities.Technician.create(f);
    refresh();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle>Novo técnico</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input required value={f.name} onChange={set("name")} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cargo</Label>
              <Input value={f.role} onChange={set("role")} className="mt-1.5" />
            </div>
            <div>
              <Label>Especialidade</Label>
              <Input value={f.specialty} onChange={set("specialty")} className="mt-1.5" />
            </div>
            <div>
              <Label>Matrícula</Label>
              <Input value={f.registration} onChange={set("registration")} className="mt-1.5" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={f.phone} onChange={set("phone")} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Turno</Label>
            <Select value={f.shift} onValueChange={(v) => setF({ ...f, shift: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SHIFTS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Salvando..." : "Adicionar técnico"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}