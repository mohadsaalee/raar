"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Field, Forbidden, Input, Modal, PageHead, Select, Stat, Table, Td, Th } from "@/components/portal/ui";
import { fmtDate } from "@/data/portal";
import { money } from "@/data/products";

export default function AdminCommission() {
  const { db, can, releaseCommission, addAdjustment } = usePortal(); const { showToast } = useStore();
  const [st, setSt] = useState("All"); const [dl, setDl] = useState("All"); const [adj, setAdj] = useState(false); const [f, setF] = useState({ dealerId: "", amount: "", reason: "" });
  if (!can("commission")) return <Forbidden what="commission" />;
  const c = db.ledger.filter((l) => l.type === "commission");
  const sum = (s: string) => c.filter((l) => l.status === s).reduce((a, l) => a + l.amount, 0);
  const rows = db.ledger.filter((l) => (st === "All" || l.status === st) && (dl === "All" || l.dealerId === dl));
  const name = (id: string) => db.dealers.find((d) => d.id === id)?.name ?? id;
  const runRelease = () => { const r = releaseCommission(); showToast(r.ok ? `${r.id} entries released to Available` : r.error ?? ""); };
  return (
    <>
      <PageHead title="Commission" sub={`Default rate ${db.settings.commissionPct}% · hold ${db.settings.holdDays} days after delivery. Change rules in System settings.`} action={<div className="flex gap-2"><Btn variant="outline" onClick={runRelease}>Run scheduled release</Btn><Btn onClick={() => setAdj(true)}>Manual adjustment</Btn></div>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Pending" value={money(sum("Pending"))} tone="amber" /><Stat label="Confirmed (in hold)" value={money(sum("Confirmed"))} tone="blue" /><Stat label="Available" value={money(sum("Available"))} tone="green" /><Stat label="Reversed" value={money(sum("Reversed"))} tone="red" /></div>
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-neutral-100 p-4"><Select className="w-44" value={dl} onChange={(e) => setDl(e.target.value)}><option value="All">All dealers</option>{db.dealers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select><Select className="w-40" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Pending", "Confirmed", "Available", "Reserved", "Paid", "Reversed", "Voided"].map((s) => <option key={s}>{s}</option>)}</Select></div>
        <Table><thead><tr><Th>Date</Th><Th>Dealer</Th><Th>Order</Th><Th>Type</Th><Th>Note</Th><Th>Status</Th><Th right>Amount</Th><Th /></tr></thead>
          <tbody>{rows.slice(0, 80).map((l) => <tr key={l.id} className="hover:bg-neutral-50"><Td>{fmtDate(l.date)}</Td><Td>{name(l.dealerId)}</Td><Td className="font-medium">{l.orderId ?? "—"}</Td><Td className="capitalize">{l.type}</Td><Td className="max-w-[16rem] truncate text-neutral-600">{l.note}</Td><Td><Badge s={l.status} /></Td><Td right className={l.amount < 0 ? "text-red-600" : ""}>{l.amount < 0 ? "− " : ""}{money(Math.abs(l.amount))}</Td><Td right>{l.type === "commission" && l.status === "Confirmed" && <Btn size="sm" variant="outline" onClick={() => { const r = releaseCommission(l.id); showToast(r.ok ? "Released to Available" : r.error ?? ""); }}>Release now</Btn>}</Td></tr>)}</tbody></Table>
      </Card>
      <p className="mt-3 text-xs text-neutral-500">Ledger entries are never edited silently: cancellations and returns mark entries Reversed, and corrections are added as adjustments. Every change is in the audit log.</p>
      <Modal open={adj} onClose={() => setAdj(false)} title="Manual commission adjustment"><div className="space-y-4"><Field label="Dealer"><Select value={f.dealerId} onChange={(e) => setF({ ...f, dealerId: e.target.value })}><option value="">Select…</option>{db.dealers.filter((d) => d.status === "Activated" || d.status === "Suspended").map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field><Field label="Amount (₹, negative to deduct)"><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field><Field label="Reason (required, audited)"><Input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field><div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setAdj(false)}>Cancel</Btn><Btn disabled={!f.dealerId} onClick={() => { const r = addAdjustment(f.dealerId, Number(f.amount), f.reason); showToast(r.ok ? "Adjustment recorded" : r.error ?? ""); if (r.ok) { setAdj(false); setF({ dealerId: "", amount: "", reason: "" }); } }}>Record</Btn></div></div></Modal>
    </>
  );
}
