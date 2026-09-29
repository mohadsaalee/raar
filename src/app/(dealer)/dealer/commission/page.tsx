"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { Badge, Card, PageHead, Stat, Table, Td, Th, Select } from "@/components/portal/ui";
import { dealerBalances, effectivePct, fmtDate } from "@/data/portal";
import { money } from "@/data/products";

const FLOW = [["Pending", "Order placed, payment received"], ["Confirmed", "Order delivered"], ["Available", "Return window passed; ready to withdraw"], ["Paid", "Included in a completed payout"]];

export default function DealerCommission() {
  const { db, dealer } = usePortal(); const [st, setSt] = useState("All"); if (!dealer) return null;
  const b = dealerBalances(db, dealer.id);
  const rows = db.ledger.filter((l) => l.dealerId === dealer.id && (st === "All" || l.status === st));
  return (
    <>
      <PageHead title="Commission" sub={`Your current commission rate is ${effectivePct(db, dealer)}% on eligible sales.`} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Pending" value={money(b.pending)} sub="Awaiting delivery" tone="amber" />
        <Stat label="Confirmed" value={money(b.confirmed)} sub={`Released after ${db.settings.holdDays} days`} tone="blue" />
        <Stat label="Available" value={money(b.available)} sub="Ready to withdraw" tone="green" />
        <Stat label="Paid out" value={money(b.paidOut)} sub="All time" tone="violet" />
      </div>
      <Card title="How commission moves" className="mb-6"><ol className="grid gap-3 sm:grid-cols-4">{FLOW.map(([s, d], i) => <li key={s} className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-400">Step {i + 1}</p><Badge s={s} /><p className="mt-1 text-xs text-neutral-600">{d}</p></li>)}</ol><p className="mt-3 text-xs text-neutral-500">If an order is cancelled or returned, its commission is reversed. Rules and eligibility follow the RAAR dealer agreement.</p></Card>
      <Card title="Commission ledger" action={<Select className="w-40" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Pending", "Confirmed", "Available", "Reserved", "Paid", "Reversed", "Voided"].map((s) => <option key={s}>{s}</option>)}</Select>} pad={false}>
        <Table><thead><tr><Th>Date</Th><Th>Reference</Th><Th>Type</Th><Th>Note</Th><Th>Status</Th><Th right>Amount</Th></tr></thead>
          <tbody>{rows.map((l) => <tr key={l.id} className="hover:bg-neutral-50"><Td>{fmtDate(l.date)}</Td><Td className="font-medium">{l.orderId ?? "—"}</Td><Td className="capitalize">{l.type}</Td><Td className="max-w-xs truncate text-neutral-600">{l.note}</Td><Td><Badge s={l.status} /></Td><Td right className={l.amount < 0 ? "text-red-600" : ""}>{l.amount < 0 ? "− " : ""}{money(Math.abs(l.amount))}</Td></tr>)}
            {rows.length === 0 && <tr><Td className="py-10 text-center text-neutral-500">No entries</Td></tr>}</tbody></Table>
      </Card>
    </>
  );
}
