"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Btn, Card, Field, Forbidden, Input, PageHead } from "@/components/portal/ui";
import { Settings } from "@/data/portal";

const RULES: { k: keyof Settings; label: string; hint: string; suffix?: string }[] = [
  { k: "commissionPct", label: "Default commission rate", hint: "Applied to new dealer orders. Dealer-specific rates override it.", suffix: "%" },
  { k: "holdDays", label: "Commission hold period", hint: "Days after delivery before commission becomes Available.", suffix: "days" },
  { k: "returnWindowDays", label: "Return window", hint: "Days after delivery a customer may request a return.", suffix: "days" },
  { k: "attributionDays", label: "Attribution window", hint: "How long a dealer link remembers the customer.", suffix: "days" },
  { k: "minPayout", label: "Minimum payout", hint: "Smallest amount a dealer can request.", suffix: "₹" },
  { k: "lowStockAt", label: "Low-stock threshold", hint: "Units at or below this raise alerts.", suffix: "units" },
];

export default function SettingsPage() {
  const { db, can, saveSettings, resetDemo, staff } = usePortal(); const { showToast } = useStore();
  const [f, setF] = useState<Settings>(db.settings); const [reason, setReason] = useState("");
  if (!can("settings")) return <Forbidden what="system settings" />;
  const dirty = JSON.stringify(f) !== JSON.stringify(db.settings);
  return (
    <>
      <PageHead title="System settings" sub="Business rules are configurable, never hard-coded. Every change is audited." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Business rules" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">{RULES.map((r) => <Field key={r.k} label={`${r.label} (${r.suffix})`} hint={r.hint}><Input type="number" min={0} value={f[r.k] as number} onChange={(e) => setF({ ...f, [r.k]: Number(e.target.value) })} /></Field>)}</div>
          <div className="mt-5"><Field label="Reason for change" hint="Recorded in the audit log"><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field></div>
          <div className="mt-4 flex gap-2"><Btn disabled={!dirty || reason.trim().length < 3} onClick={() => { const r = saveSettings(f, reason); showToast(r.ok ? "Settings saved" : r.error ?? ""); if (r.ok) setReason(""); }}>Save changes</Btn><Btn variant="outline" disabled={!dirty} onClick={() => setF(db.settings)}>Discard</Btn></div>
        </Card>
        <div className="space-y-6">
          <Card title="Dealer entry terms (reference)"><p className="mb-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" />From the business plan. These are subject to final business and legal approval and are not enforced by the software.</p><dl className="space-y-1.5 text-sm"><div className="flex justify-between"><dt>Standard dealership</dt><dd>₹{db.settings.dealerFee.toLocaleString("en-IN")}</dd></div><div className="flex justify-between"><dt>Launch offer</dt><dd>₹{db.settings.launchFee.toLocaleString("en-IN")}</dd></div><div className="flex justify-between"><dt>Offer ends</dt><dd>{db.settings.launchEnds}</dd></div></dl></Card>
          {staff?.role === "super_admin" && <Card title="Demo tools"><p className="mb-3 text-sm text-neutral-600">Restore the original sample data (orders, dealers, ledger, tickets). Useful before a client walkthrough.</p><Btn variant="danger" onClick={() => { if (confirm("Reset all demo data?")) resetDemo(); }}>Reset demo data</Btn></Card>}
        </div>
      </div>
    </>
  );
}
