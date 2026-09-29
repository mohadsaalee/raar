"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Field, Forbidden, Input, Modal, PageHead, ReasonDialog, Stat, Table, Td, Th } from "@/components/portal/ui";
import { dealerBalances, fmtDate } from "@/data/portal";
import { money } from "@/data/products";

export default function AdminPayouts() {
  const { db, can, decidePayout, verifyBank } = usePortal(); const { showToast } = useStore();
  const [pay, setPay] = useState<string | null>(null); const [ref, setRef] = useState(""); const [neg, setNeg] = useState<{ id: string; kind: "reject" | "fail" } | null>(null);
  if (!can("payouts")) return <Forbidden what="payouts" />;
  const say = (r: { ok: boolean; error?: string }, ok: string) => showToast(r.ok ? ok : r.error ?? "Failed");
  const open = db.payouts.filter((p) => p.status === "Requested" || p.status === "Approved");
  const unverified = db.dealers.filter((d) => d.bank && !d.bank.verified);
  return (
    <>
      <PageHead title="Payouts" sub="Approve, pay or reject dealer payout requests. Checks: KYC approved, bank verified, sufficient balance." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Awaiting action" value={open.length} tone="amber" /><Stat label="Amount in queue" value={money(open.reduce((s, p) => s + p.amount, 0))} tone="violet" /><Stat label="Paid (all time)" value={money(db.payouts.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0))} tone="green" /><Stat label="Banks to verify" value={unverified.length} tone="blue" /></div>
      {unverified.length > 0 && <Card title="Bank accounts awaiting verification" className="mb-6" pad={false}><Table><tbody>{unverified.map((d) => <tr key={d.id}><Td className="font-medium">{d.name}</Td><Td>{d.bank!.holder} · {d.bank!.account} · {d.bank!.ifsc}</Td><Td right><Btn size="sm" onClick={() => say(verifyBank(d.id), "Bank verified")}>Verify</Btn></Td></tr>)}</tbody></Table></Card>}
      <Card pad={false}>
        <Table><thead><tr><Th>Payout</Th><Th>Dealer</Th><Th>Requested</Th><Th>Balance check</Th><Th>Status</Th><Th right>Amount</Th><Th /></tr></thead>
          <tbody>{db.payouts.map((p) => { const d = db.dealers.find((x) => x.id === p.dealerId)!; return (
            <tr key={p.id} className="hover:bg-neutral-50"><Td className="font-medium">{p.id}</Td><Td>{d.name}</Td><Td>{fmtDate(p.requestedAt)}</Td><Td className="text-xs text-neutral-500">KYC {d.kyc.status} · bank {d.bank?.verified ? "verified" : "unverified"}<br />balance {money(dealerBalances(db, d.id).available)}</Td><Td><Badge s={p.status} />{(p.reference || p.reason) && <p className="mt-0.5 text-[11px] text-neutral-500">{p.reference ?? p.reason}</p>}</Td><Td right>{money(p.amount)}</Td>
              <Td right><div className="flex justify-end gap-1.5">{p.status === "Requested" && <><Btn size="sm" variant="success" onClick={() => say(decidePayout(p.id, "approve"), "Payout approved")}>Approve</Btn><Btn size="sm" variant="outline" onClick={() => setNeg({ id: p.id, kind: "reject" })}>Reject</Btn></>}{p.status === "Approved" && <><Btn size="sm" onClick={() => setPay(p.id)}>Mark paid</Btn><Btn size="sm" variant="outline" onClick={() => setNeg({ id: p.id, kind: "fail" })}>Failed</Btn></>}</div></Td></tr>); })}</tbody></Table>
      </Card>
      <Modal open={!!pay} onClose={() => setPay(null)} title="Mark payout as paid"><div className="space-y-4"><Field label="Bank / UTR reference" hint="From your bank transfer confirmation"><Input value={ref} onChange={(e) => setRef(e.target.value)} /></Field><div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setPay(null)}>Cancel</Btn><Btn variant="success" onClick={() => { const r = decidePayout(pay!, "paid", { reference: ref }); say(r, "Marked as paid"); if (r.ok) { setPay(null); setRef(""); } }}>Confirm paid</Btn></div></div></Modal>
      <ReasonDialog open={!!neg} title={neg?.kind === "reject" ? "Reject payout" : "Mark payout failed"} desc="The reserved amount returns to the dealer's available balance." confirm={neg?.kind === "reject" ? "Reject" : "Mark failed"} tone="danger" onClose={() => setNeg(null)} onConfirm={(reason) => { say(decidePayout(neg!.id, neg!.kind, { reason }), "Updated"); setNeg(null); }} />
    </>
  );
}
