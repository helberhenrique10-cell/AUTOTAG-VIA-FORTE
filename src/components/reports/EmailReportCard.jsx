import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Panel from "@/components/common/Panel";
import { buildStatusPdf } from "@/lib/pdfReport";
import { logEvent } from "@/lib/actions";
import { lifeStats } from "@/lib/maintenance";
import { useRefresh } from "@/hooks/useFleet";

export default function EmailReportCard({ loco, comps }) {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const [emailInput, setEmailInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const email = emailInput || me?.email || "";

  const refresh = useRefresh();
  const stats = comps.map((c) => ({ c, s: lifeStats(c, loco) }));

  const send = async () => {
    setBusy(true);
    setSent(false);
    const b64 = buildStatusPdf(loco, stats);
    await base44.integrations.Core.SendEmail({
      to: email,
      from_name: "ViaForte | AutoTag",
      subject: `Relatório de Status dos Componentes · ${loco.code}`,
      text: `Relatório em PDF anexado com o status de ${stats.length} componentes rastreados da locomotiva ${loco.code} (${Math.round(loco.odometer_km).toLocaleString("pt-BR")} km).`,
      attachments: [{ filename: `relatorio-componentes-${loco.code}.pdf`, content: b64 }],
    });
    await logEvent({
      type: "relatorio",
      title: "Relatório PDF enviado por email",
      description: `${stats.length} componentes · ${email}`,
      locomotive_id: loco.id,
      km: loco.odometer_km,
    });
    setBusy(false);
    setSent(true);
    refresh();
  };

  return (
    <Panel title="Relatório de status por email (PDF)">
      <div className="p-5 flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <Label>Enviar para</Label>
          <Input
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="email@empresa.com"
            className="mt-1.5 max-w-sm"
          />
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Gera um PDF com o status, consumo de vida útil e previsão de troca de cada componente e envia por email.
          </p>
        </div>
        <Button onClick={send} disabled={busy || !email} className="w-fit bg-emerald-500 text-slate-950 hover:bg-emerald-400">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Gerar e enviar PDF
            </>
          )}
        </Button>
      </div>
      {sent && (
        <p className="px-5 pb-4 text-xs text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Relatório enviado para {email}.
        </p>
      )}
    </Panel>
  );
}