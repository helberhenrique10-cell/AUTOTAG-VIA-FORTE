import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectedLoco, useList } from "@/hooks/useFleet";
import PageHeader from "@/components/common/PageHeader";
import Panel from "@/components/common/Panel";
import PageLoader from "@/components/common/PageLoader";
import OrderRow from "@/components/orders/OrderRow";
import OrderFormDialog from "@/components/orders/OrderFormDialog";
import { STATUSES } from "@/components/orders/orderMeta";

export default function ServiceOrders() {
  const { locos, loco } = useSelectedLoco();
  const { data: orders = [], isLoading } = useList("ServiceOrder");
  const [tab, setTab] = useState("todas");
  const [adding, setAdding] = useState(false);
  const shown = orders.filter((o) => tab === "todas" || o.status === tab);
  return (
    <div>
      <PageHeader eyebrow="Operação" title="Ordens de Serviço" subtitle="Inspeções, substituições e solicitações geradas a partir de alertas.">
        {loco && <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Nova OS</Button>}
      </PageHeader>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="bg-slate-800/60">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          {Object.entries(STATUSES).map(([k, v]) => <TabsTrigger key={k} value={k}>{v}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <Panel>
        {isLoading ? <PageLoader /> : shown.map((o) => <OrderRow key={o.id} o={o} loco={locos.find((l) => l.id === o.locomotive_id)} />)}
        {!isLoading && !shown.length && <p className="py-16 text-center text-sm text-slate-500">Nenhuma ordem de serviço.</p>}
      </Panel>
      {adding && <OrderFormDialog loco={loco} onClose={() => setAdding(false)} />}
    </div>
  );
}