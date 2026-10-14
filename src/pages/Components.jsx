import { useState } from "react";
import { Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectedLoco, useComponents } from "@/hooks/useFleet";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import LocoSelect from "@/components/common/LocoSelect";
import ComponentCard from "@/components/components/ComponentCard";
import ReplaceDialog from "@/components/components/ReplaceDialog";
import ComponentFormDialog from "@/components/components/ComponentFormDialog";
import RfidSensorDialog from "@/components/components/RfidSensorDialog";

export default function Components() {
  const { locos, loco, select, isLoading } = useSelectedLoco();
  const [tab, setTab] = useState("ativos");
  const [replacing, setReplacing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [sensor, setSensor] = useState(false);
  const { data: comps = [], isLoading: loadingComps } = useComponents(loco?.id, tab === "ativos");
  if (isLoading) return <PageLoader />;
  if (!loco) return null;
  return (
    <div>
      <PageHeader eyebrow="Operação" title="Componentes Rastreados" subtitle="Peças com Tag RFID vinculadas à locomotiva e histórico de substituições.">
        <LocoSelect locos={locos} value={loco.id} onChange={select} />
        <Button variant="outline" className="border-slate-700 bg-slate-800/60 hover:bg-slate-800" onClick={() => setSensor(true)}><Radio className="h-4 w-4 mr-1.5 text-emerald-300" />Registrar via sensor RFID</Button>
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Vincular componente</Button>
      </PageHeader>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="bg-slate-800/60">
          <TabsTrigger value="ativos">Instalados</TabsTrigger>
          <TabsTrigger value="historico">Histórico / Auditoria</TabsTrigger>
        </TabsList>
      </Tabs>
      {loadingComps ? <PageLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {comps.map((c) => <ComponentCard key={c.id} comp={c} loco={loco} onReplace={setReplacing} />)}
          {!comps.length && <p className="text-slate-500 text-sm col-span-full py-16 text-center">Nenhum registro.</p>}
        </div>
      )}
      {replacing && <ReplaceDialog comp={replacing} loco={loco} onClose={() => setReplacing(null)} />}
      {adding && <ComponentFormDialog loco={loco} onClose={() => setAdding(false)} />}
      {sensor && <RfidSensorDialog locos={locos} loco={loco} onClose={() => setSensor(false)} />}
    </div>
  );
}