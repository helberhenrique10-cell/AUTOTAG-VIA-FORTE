import { useState } from "react";
import { FileOutput, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { requestErp } from "@/lib/actions";
import { useRefresh } from "@/hooks/useFleet";

export default function ErpButton({ comp, loco }) {
  const [busy, setBusy] = useState(false);
  const refresh = useRefresh();
  const { toast } = useToast();
  if (comp.erp_request_code) {
    return <span className="font-mono text-[11px] text-slate-400 bg-slate-700/40 rounded-md px-2 py-1">{comp.erp_request_code}</span>;
  }
  const run = async () => {
    setBusy(true);
    const code = await requestErp(comp, loco);
    setBusy(false);
    refresh();
    toast({ title: "Solicitação enviada ao ERP", description: `${code} · OS de substituição aberta` });
  };
  return (
    <button onClick={run} disabled={busy} title="Gerar Solicitação de Peça no ERP"
      className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-xs px-2.5 py-1 transition disabled:opacity-50 whitespace-nowrap">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileOutput className="h-3.5 w-3.5" />}
      Solicitar peça no ERP
    </button>
  );
}