import { motion } from "framer-motion";
import { Boxes, CheckCircle2, AlertTriangle, OctagonAlert } from "lucide-react";

export default function MetricCards({ stats }) {
  const count = (s) => stats.filter((x) => x.s.status === s).length;
  const cards = [
    { label: "Componentes cadastrados", value: stats.length, icon: Boxes, color: "text-sky-300", ring: "from-sky-500/10" },
    { label: "Dentro do prazo", value: count("normal"), icon: CheckCircle2, color: "text-emerald-300", ring: "from-emerald-500/10" },
    { label: "Atenção programada", value: count("atencao"), icon: AlertTriangle, color: "text-amber-300", ring: "from-amber-500/10" },
    { label: "Intervenção crítica", value: count("critico"), icon: OctagonAlert, color: "text-rose-300", ring: "from-rose-500/10" },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className={`rounded-2xl bg-gradient-to-br ${c.ring} to-transparent ring-1 ring-slate-700/50 p-5`}>
          <c.icon className={`h-5 w-5 ${c.color}`} strokeWidth={1.6} />
          <p className="font-heading text-3xl font-semibold text-slate-50 mt-4">{c.value}</p>
          <p className="text-xs text-slate-400 mt-1">{c.label}</p>
        </motion.div>
      ))}
    </div>
  );
}