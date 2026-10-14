export default function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl bg-slate-800/40 ring-1 ring-slate-700/50 backdrop-blur ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h2 className="font-heading text-sm font-semibold text-slate-100 tracking-tight">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}