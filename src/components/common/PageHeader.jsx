export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 font-mono mb-2">{eyebrow}</p>}
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-50 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1.5">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}