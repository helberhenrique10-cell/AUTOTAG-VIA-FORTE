import { useState } from "react";
import { Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import Panel from "@/components/common/Panel";
import { processRfidReading } from "@/lib/actions";
import { useRefresh } from "@/hooks/useFleet";
import { SECTIONS } from "@/lib/maintenance";

export default function SimulateReadingCard({ gantries, locos }) {
  const [gid, setGid] = useState("");
  const [lid, setLid] = useState("");
  const [tags, setTags] = useState("");
  const [km, setKm] = useState("");
  const [section, setSection] = useState("Plano");
  const [busy, setBusy] = useState(false);
  const refresh = useRefresh();
  const { toast } = useToast();
  const loco = locos.find((l) => l.id === lid);

  const pickLoco = async (id) => {
    setLid(id);
    const l = locos.find((x) => x.id === id);
    setKm(String(Math.round(l.odometer_km)));
    const comps = await base44.entities.Component.filter({ locomotive_id: id, active: true });
    setTags(comps.map((c) => c.rfid_tag).join("\n"));
  };

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const list = tags.split(/[\s,;]+/).map((t) => t.trim().toUpperCase()).filter(Boolean);
    const fsv = SECTIONS.find((s) => s.label === section).fsv;
    const r = await processRfidReading(gantries.find((g) => g.id === gid), loco, list, Number(km), fsv, section);
    setBusy(false); refresh();
    toast({ title: "Leitura registrada", description: `${r.known} tag(s) reconhecida(s)${r.unknown.length ? ` · desconhecidas: ${r.unknown.join(", ")}` : ""}` });
  };

  return (
    <Panel title="Simular leitura do pórtico">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Pórtico</Label><Select value={gid} onValueChange={setGid}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{gantries.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Locomotiva</Label><Select value={lid} onValueChange={pickLoco}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{locos.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label>Tags lidas (UID, uma por linha)</Label><Textarea required rows={4} value={tags} onChange={(e) => setTags(e.target.value)} className="font-mono text-xs mt-1.5" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>KM no momento da leitura</Label><Input type="number" required value={km} onChange={(e) => setKm(e.target.value)} className="font-mono mt-1.5" /></div>
          <div><Label>Trecho (FSV)</Label><Select value={section} onValueChange={setSection}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{SECTIONS.map((s) => <SelectItem key={s.label} value={s.label}>{s.label} · {s.fsv}x</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Button type="submit" disabled={busy || !gid || !loco} className="w-full"><Radio className="h-4 w-4 mr-1.5" />{busy ? "Processando..." : "Enviar leitura"}</Button>
      </form>
    </Panel>
  );
}