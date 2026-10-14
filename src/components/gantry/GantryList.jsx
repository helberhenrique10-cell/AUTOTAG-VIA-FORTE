import { useState } from "react";
import { Plus, RadioTower } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import Panel from "@/components/common/Panel";
import { useRefresh } from "@/hooks/useFleet";
import { timeAgo } from "@/lib/maintenance";

export default function GantryList({ gantries }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [model, setModel] = useState("RDM6300");
  const refresh = useRefresh();
  const add = async (e) => {
    e.preventDefault();
    await base44.entities.Gantry.create({ name, location, reader_model: model, controller: "ESP32", status: "offline" });
    setName(""); setLocation(""); refresh();
  };
  return (
    <Panel title="Pórticos RFID cadastrados">
      {gantries.map((g) => (
        <div key={g.id} className="flex items-center gap-3 px-5 py-3.5 border-t border-slate-700/40 first:border-0">
          <RadioTower className={`h-4 w-4 ${g.status === "online" ? "text-emerald-300" : "text-slate-500"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-100">{g.name}</p>
            <p className="text-xs text-slate-500">{g.location} · {g.controller} + {g.reader_model}</p>
          </div>
          <span className="text-xs text-slate-500 text-right">{g.status === "online" ? "Online" : "Offline"}<br />{timeAgo(g.last_seen_at)}</span>
        </div>
      ))}
      <form onSubmit={add} className="grid gap-2 sm:grid-cols-[1fr_1fr_130px_auto] p-4 border-t border-slate-700/50">
        <Input required placeholder="Nome do pórtico" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Localização" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select value={model} onValueChange={setModel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RDM6300">RDM6300</SelectItem><SelectItem value="MFRC522">MFRC522</SelectItem></SelectContent></Select>
        <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
      </form>
    </Panel>
  );
}