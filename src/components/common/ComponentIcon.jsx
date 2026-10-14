import { COMPONENT_TYPES, STATUS } from "@/lib/maintenance";

export default function ComponentIcon({ type, status = "normal" }) {
  const Icon = (COMPONENT_TYPES[type] || COMPONENT_TYPES.outro).icon;
  return (
    <div className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center ring-1 ring-slate-700/60 ${STATUS[status].soft}`}>
      <Icon className={`h-5 w-5 ${STATUS[status].text}`} strokeWidth={1.6} />
    </div>
  );
}