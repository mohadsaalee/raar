"use client";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { Card, PageHead } from "@/components/portal/ui";
import { TRAINING } from "@/data/portal";

export default function Training() {
  const { dealer, toggleTraining } = usePortal(); if (!dealer) return null;
  const pct = Math.round((dealer.training.length / TRAINING.length) * 100);
  return (
    <>
      <PageHead title="Dealer training" sub="Short modules to help you sell with confidence." />
      <Card className="mb-6"><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Your progress</span><span>{pct}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-neutral-100"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div></Card>
      <div className="grid gap-4 md:grid-cols-2">{TRAINING.map((m, i) => { const done = dealer.training.includes(m.id); return (
        <button key={m.id} onClick={() => toggleTraining(m.id)} className={`flex gap-4 rounded-xl border p-5 text-left transition hover:shadow-sm ${done ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-white"}`}>
          {done ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 shrink-0 text-neutral-300" />}
          <div><p className="text-xs text-neutral-400">Module {i + 1}</p><p className="font-medium">{m.title}</p><p className="mt-1 text-sm text-neutral-600">{m.desc}</p><p className="mt-2 flex items-center gap-1 text-xs text-neutral-500"><Clock size={12} />{m.mins} min · {done ? "Completed (click to undo)" : "Click to mark complete"}</p></div>
        </button>); })}</div>
    </>
  );
}
