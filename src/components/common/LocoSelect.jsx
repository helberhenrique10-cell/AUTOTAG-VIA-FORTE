import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LocoSelect({ locos, value, onChange, className = "w-52" }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`bg-slate-800/60 border-slate-700 ${className}`}><SelectValue placeholder="Locomotiva" /></SelectTrigger>
      <SelectContent>
        {locos.map((l) => (
          <SelectItem key={l.id} value={l.id}>Locomotiva {l.code} · {l.model}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}