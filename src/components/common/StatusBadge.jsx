import { STATUS } from "@/lib/maintenance";

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.normal;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.bar}`} />
      {s.label}
    </span>
  );
}