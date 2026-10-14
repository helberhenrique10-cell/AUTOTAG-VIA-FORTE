import { motion } from "framer-motion";
import { STATUS } from "@/lib/maintenance";

export default function LifeBar({ pct, status }) {
  const remaining = Math.max(0, 100 - pct);
  return (
    <div className="min-w-[130px]">
      <div className="flex justify-between text-xs mb-1.5">
        <span className={`font-mono ${STATUS[status].text}`}>{remaining.toFixed(1)}%</span>
        <span className="text-slate-500">restante</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${remaining}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
          className={`h-full rounded-full ${STATUS[status].bar}`}
        />
      </div>
    </div>
  );
}