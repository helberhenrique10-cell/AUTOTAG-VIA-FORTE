import { useState } from "react";
import { Radio, ScanLine, Loader2, Check, CircleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { COMPONENT_TYPES, fmtKm } from "@/lib/maintenance";
import { logEvent } from "@/lib/actions";
import { useList, useRefresh } from "@/hooks/useFleet";
import { useToast } from "@/components/ui/use-toast";

const randomTag = () => Array.from({ length: 8 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");

export default function RfidSensorDialog({ loco, onClose }) {
  const { data: gantries = [] } = useList("Gantry", "name");
  const [gantryId, setGantryId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(null);
  const [saving, setSaving] = useState(false);
  const refresh = useRefresh();
  const { toast } = useToast();
  const gantry = gantries.find((g) => g.id === gantryId);
  const fresh = detected ? detected.filter((d) => !d.known) : [];

  const scan = async () => {
    setScanning(true);
    setDetected(null);
    await new Promise((r) => setTimeout(r, 1600));
    const comps = await base44.entities.Component.filter({ locomotive_id: loco.id, active: true });
    const existing = comps.map((c) => ({ tag: c.rfid_tag, known: true, name: c.name }));
    setDetected([
      ...existing,
      ...Array.from({ length: 2 }, () => ({
        tag: randomTag(),
        known: false,
        type: "governador",
        life_km: 100000,
        protheus_code: "",
      })),
    ]);
    setScanning(false);
  };

  const setRow = (tag, patch) => setDetected(detected.map((d) => (d.tag === tag ? { ...d, ...patch } : d)));
  const setType = (tag) => (t) => setRow(tag, { type: t, life_km: COMPONENT_TYPES[t].life });

  const register = async () => {
    setSaving(true);
    const created = await base44.entities.Component.bulkCreate(
      fresh.map((d) => ({
        name: COMPONENT_TYPES[d.type].label,
        type: d.type,
        rfid_tag: d.tag,
        protheus_code: d.protheus_code,
        locomotive_id: loco.id,
        installed_at_km: loco.odometer_km,
        installed_date: new Date().toISOString(),
        life_km: Number(d.life_km),
        wear_km: 0,
        active: true,
      }))
    );
    await base44.entities.RfidReading.create({
      gantry_id: gantry.id,
      gantry_name: gantry.name,
      locomotive_id: loco.id,
      locomotive_code: loco.code,
      tags: detected.map((d) => d.tag),
      unknown_tags: [],
      km: loco.odometer_km,
      read_at: new Date().toISOString(),
    });
    await base44.entities.Gantry.update(gantry.id, { last_seen_at: new Date().toISOString(), status: "online" });
    await logEvent({
      type: "cadastro",
      title: "Componentes registrados via sensor RFID",
      description: `${created.length} nova(s) tag(s) · ${gantry.name}`,
      locomotive_id: loco.id,
      km: loco.odometer_km,
    });
    setSaving(false);
    refresh();
    onClose();
    toast({
      title: "Componentes registrados",
      description: `${created.length} novo(s) componente(s) vinculados a ${loco.code}.`,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-300" />
            Registrar via Sensor RFID
          </DialogTitle>
          <DialogDescription>
            Apresente as tags ao leitor do pórtico. Tags novas são registradas e vinculadas à {loco.code}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1.5">Leitor / pórtico</p>
            <Select value={gantryId} onValueChange={setGantryId}>
              <SelectTrigger className="bg-slate-800/60 border-slate-700">
                <SelectValue placeholder="Selecione o pórtico" />
              </SelectTrigger>
              <SelectContent>
                {gantries.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name} · {g.reader_model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={scan} disabled={!gantryId || scanning} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Escaneando...
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4 mr-2" />
                Iniciar leitura
              </>
            )}
          </Button>
        </div>
        {scanning && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 py-10 text-center">
            <Radio className="h-6 w-6 text-emerald-300 mx-auto animate-pulse" />
            <p className="text-sm text-emerald-200 mt-3">Sensor ativo · aguardando tags...</p>
          </div>
        )}
        {detected && (
          <div className="space-y-2">
            {detected.map((d) => (
              <div
                key={d.tag}
                className={`rounded-xl p-3 ring-1 ${
                  d.known ? "bg-slate-800/40 ring-slate-700/50" : "bg-emerald-500/5 ring-emerald-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-sky-300">{d.tag}</span>
                  {d.known ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-300" />
                      Já vinculado · {d.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                      <CircleAlert className="h-3 w-3" />
                      Tag nova
                    </span>
                  )}
                </div>
                {!d.known && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Select value={d.type} onValueChange={setType(d.tag)}>
                      <SelectTrigger className="bg-slate-800/60 border-slate-700 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMPONENT_TYPES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Código Protheus"
                      value={d.protheus_code}
                      onChange={(e) => setRow(d.tag, { protheus_code: e.target.value })}
                      className="font-mono text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Vida útil (km)"
                      value={d.life_km}
                      onChange={(e) => setRow(d.tag, { life_km: e.target.value })}
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
            <p className="text-[11px] text-slate-500">
              Instalação da(s) peça(s) nova(s) registrada aos {fmtKm(loco.odometer_km)} · odômetro da peça zerado.
            </p>
          </div>
        )}
        {detected && (
          <Button onClick={register} disabled={saving || !fresh.length} className="w-full">
            {saving ? "Registrando..." : `Registrar ${fresh.length} componente(s)`}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}