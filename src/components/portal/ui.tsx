"use client";
import { AnimatePresence, motion } from "framer-motion";
import { LucideIcon, X } from "lucide-react";
import { ReactNode, useState } from "react";

export function Card({ title, action, children, className = "", pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-xl border border-neutral-200 bg-white ${className}`}>
      {(title || action) && <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4"><h2 className="text-sm font-semibold">{title}</h2>{action}</div>}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20", blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20", gray: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
};
const STATUS_TONE: Record<string, string> = {
  Delivered: "green", Available: "green", Paid: "green", Approved: "green", Activated: "green", Resolved: "green", Refunded: "green", Shipped: "blue", Packed: "blue",
  Confirmed: "blue", "In progress": "blue", Pending: "amber", "Pending Payment": "amber", "KYC Pending": "amber", Requested: "amber", Open: "amber", Reserved: "amber", Registered: "gray",
  "Not submitted": "gray", Cancelled: "red", Returned: "red", Rejected: "red", Failed: "red", Suspended: "red", Reversed: "red", Voided: "gray", "KYC Rejected": "red", "Return Requested": "purple", COD: "gray",
};
export function Badge({ s, tone }: { s: string; tone?: keyof typeof TONES }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone ?? STATUS_TONE[s] ?? "gray"]}`}>{s}</span>;
}

export function Stat({ label, value, sub, icon: Icon, tone = "ink" }: { label: string; value: ReactNode; sub?: ReactNode; icon?: LucideIcon; tone?: "ink" | "green" | "amber" | "violet" | "red" | "blue" }) {
  const t = { ink: "bg-neutral-100 text-neutral-700", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600", red: "bg-red-50 text-red-600", blue: "bg-blue-50 text-blue-600" }[tone];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><p className="text-xs font-medium text-neutral-500">{label}</p><p className="mt-1 truncate text-2xl font-semibold tracking-tight">{value}</p>{sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}</div>
        {Icon && <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t}`}><Icon size={19} /></div>}
      </div>
    </div>
  );
}

export function Btn({ variant = "primary", size = "md", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "danger" | "success" | "ghost"; size?: "sm" | "md" }) {
  const v = { primary: "bg-ink text-white hover:bg-neutral-800", outline: "border border-neutral-300 bg-white hover:border-ink", danger: "bg-red-600 text-white hover:bg-red-700", success: "bg-emerald-600 text-white hover:bg-emerald-700", ghost: "hover:bg-neutral-100" }[variant];
  const s = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  return <button {...p} className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${s} ${className}`} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>{children}{hint && !error && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
const inputCls = "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink disabled:bg-neutral-50";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${inputCls} ${p.className ?? ""}`} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${inputCls} ${p.className ?? ""}`} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`${inputCls} ${p.className ?? ""}`} />;

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()} className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl ${wide ? "max-w-3xl" : "max-w-md"}`}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-4"><h3 className="font-semibold">{title}</h3><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Confirmation dialog that can require a written reason (used for audited actions) */
export function ReasonDialog({ open, title, desc, label = "Reason", confirm, tone = "primary", requireReason = true, onClose, onConfirm }: {
  open: boolean; title: string; desc?: string; label?: string; confirm: string; tone?: "primary" | "danger" | "success"; requireReason?: boolean; onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [v, setV] = useState("");
  const ok = !requireReason || v.trim().length > 2;
  return (
    <Modal open={open} onClose={() => { setV(""); onClose(); }} title={title}>
      {desc && <p className="mb-4 text-sm text-neutral-600">{desc}</p>}
      {requireReason !== undefined && <Field label={label}><Textarea rows={3} value={v} onChange={(e) => setV(e.target.value)} placeholder="Add a short note (recorded in the audit log)" /></Field>}
      <div className="mt-5 flex justify-end gap-2"><Btn variant="outline" onClick={() => { setV(""); onClose(); }}>Cancel</Btn><Btn variant={tone} disabled={!ok} onClick={() => { onConfirm(v.trim()); setV(""); }}>{confirm}</Btn></div>
    </Modal>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { key: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-neutral-200">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)} className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${value === t.key ? "text-ink" : "text-neutral-500 hover:text-ink"}`}>
          {t.label}{t.count !== undefined && <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px]">{t.count}</span>}
          {value === t.key && <motion.span layoutId={"tab-" + tabs.map((x) => x.key).join()} className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center gap-2 py-14 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"><Icon size={22} /></div><p className="font-medium">{title}</p>{text && <p className="max-w-sm text-sm text-neutral-500">{text}</p>}{action}</div>;
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-sm text-neutral-500">{sub}</p>}</div>{action}</div>;
}

export const Table = ({ children }: { children: ReactNode }) => <div className="overflow-x-auto"><table className="w-full text-sm">{children}</table></div>;
export const Th = ({ children, right }: { children?: ReactNode; right?: boolean }) => <th className={`whitespace-nowrap border-b border-neutral-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 ${right ? "text-right" : "text-left"}`}>{children}</th>;
export const Td = ({ children, right, className = "" }: { children?: ReactNode; right?: boolean; className?: string }) => <td className={`border-b border-neutral-100 px-4 py-3 align-middle ${right ? "text-right" : ""} ${className}`}>{children}</td>;

export function Forbidden({ what }: { what: string }) {
  return <Empty icon={X} title="403 · Access denied" text={`Your role does not have permission to view ${what}. Ask a Super Admin to update your role.`} />;
}
export function Skeleton() {
  return <div className="animate-pulse space-y-4 p-8"><div className="h-8 w-48 rounded bg-neutral-200" /><div className="grid grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-neutral-200" />)}</div><div className="h-64 rounded-xl bg-neutral-200" /></div>;
}
