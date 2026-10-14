import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import NavContent from "./NavContent";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0B1222] text-slate-200">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[#0F172A] border-r border-slate-800">
        <NavContent />
      </aside>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#0F172A]/90 backdrop-blur border-b border-slate-800">
        <p className="font-heading font-semibold text-slate-50">ViaForte <span className="font-mono text-xs text-emerald-400">| AutoTag</span></p>
        <button onClick={() => setOpen(true)} className="p-2 text-slate-300"><Menu className="h-5 w-5" /></button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[#0F172A] border-slate-800">
          <NavContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}