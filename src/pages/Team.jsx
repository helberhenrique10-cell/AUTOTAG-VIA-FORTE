import { useState } from "react";
import { Plus, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useList, useRefresh } from "@/hooks/useFleet";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import TechFormDialog, { SHIFTS } from "@/components/team/TechFormDialog";

export default function Team() {
  const { data: techs = [], isLoading } = useList("Technician", "name");
  const [adding, setAdding] = useState(false);
  const refresh = useRefresh();
  const remove = async (id) => { await base44.entities.Technician.delete(id); refresh(); };
  return (
    <div>
      <PageHeader eyebrow="Gestão" title="Equipe Técnica" subtitle="Técnicos responsáveis pelas inspeções e substituições.">
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Novo técnico</Button>
      </PageHeader>
      {isLoading ? <PageLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {techs.map((t) => (
            <div key={t.id} className="group rounded-2xl bg-slate-800/40 ring-1 ring-slate-700/50 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 grid place-items-center font-heading text-emerald-300">{t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                  <div><p className="font-medium text-slate-100">{t.name}</p><p className="text-xs text-slate-400">{t.role}</p></div>
                </div>
                <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-300 transition"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {t.specialty && <span className="rounded-md bg-slate-700/40 px-2 py-1 text-slate-300">{t.specialty}</span>}
                <span className="rounded-md bg-slate-700/40 px-2 py-1 text-slate-300">Turno {SHIFTS[t.shift]}</span>
                {t.registration && <span className="rounded-md bg-slate-700/40 px-2 py-1 font-mono text-slate-400">{t.registration}</span>}
              </div>
              {t.phone && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3" />{t.phone}</p>}
            </div>
          ))}
          {!techs.length && <p className="col-span-full py-16 text-center text-sm text-slate-500">Nenhum técnico cadastrado.</p>}
        </div>
      )}
      {adding && <TechFormDialog onClose={() => setAdding(false)} />}
    </div>
  );
}