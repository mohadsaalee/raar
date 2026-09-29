"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import DealerGate from "@/components/portal/DealerGate";
import { Badge, Btn, Card, Field, Input, PageHead, Stat, Table, Td, Th } from "@/components/portal/ui";
import { dealerBalances, fmtDate } from "@/data/portal";
import { money } from "@/data/products";

export default function DealerPayouts() {
  const { db, dealer, saveBank, requestPayout } = usePortal(); const { showToast } = useStore();
  const [bank, setBank] = useState(() => ({ holder: dealer?.bank?.holder ?? dealer?.name ?? "", account: "", ifsc: dealer?.bank?.ifsc ?? "" }));
  const [amt, setAmt] = useState(""); const [err, setErr] = useState("");
  if (!dealer) return null;
  const b = dealerBalances(db, dealer.id); const mine = db.payouts.filter((p) => p.dealerId === dealer.id);
  const submit = () => { const r = requestPayout(Number(amt)); if (r.ok) { setAmt(""); setErr(""); showToast(`Payout ${r.id} requested`); } else setErr(r.error ?? "Failed"); };
  const saveB = () => { if (!bank.holder || bank.account.length < 6 || !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(bank.ifsc)) { showToast("Enter valid account number and IFSC"); return; } saveBank(bank); showToast("Bank account saved for verification"); setBank({ ...bank, account: "" }); };

  return (
    <>
      <PageHead title="Payouts" sub={`Minimum payout ${money(db.settings.minPayout)}. Requires approved KYC and a verified bank account.`} />
      <DealerGate what="Payouts">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3"><Stat label="Available balance" value={money(b.available)} tone="green" /><Stat label="Requested (awaiting)" value={money(b.reserved)} tone="amber" /><Stat label="Paid out" value={money(b.paidOut)} tone="violet" /></div>
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card title="Request a payout">
            {!dealer.bank?.verified && <div className="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{dealer.bank ? "Your bank account is awaiting verification by RAAR." : "Add your bank account to request payouts."}</div>}
            <Field label="Amount (₹)" error={err}><Input type="number" min={db.settings.minPayout} max={b.available} value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={`Up to ${b.available}`} /></Field>
            <div className="mt-4 flex gap-2"><Btn onClick={submit} disabled={!amt}>Request payout</Btn><Btn variant="outline" onClick={() => setAmt(String(b.available))}>Max</Btn></div>
          </Card>
          <Card title="Bank account" action={dealer.bank && (dealer.bank.verified ? <span className="flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 size={14} />Verified</span> : <Badge s="Pending" />)}>
            {dealer.bank && <p className="mb-3 rounded-lg bg-neutral-50 p-3 text-sm">{dealer.bank.holder} · {dealer.bank.account} · {dealer.bank.ifsc}</p>}
            <div className="space-y-3"><Field label="Account holder name"><Input value={bank.holder} onChange={(e) => setBank({ ...bank, holder: e.target.value })} /></Field><Field label="Account number"><Input value={bank.account} onChange={(e) => setBank({ ...bank, account: e.target.value.replace(/\D/g, "") })} /></Field><Field label="IFSC" hint="e.g. SBIN0001234"><Input value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} /></Field><Btn variant="outline" onClick={saveB}>{dealer.bank ? "Update (re-verification needed)" : "Save bank account"}</Btn></div>
          </Card>
        </div>
        <Card title="Payout history" pad={false}>
          <Table><thead><tr><Th>ID</Th><Th>Requested</Th><Th>Status</Th><Th>Reference</Th><Th right>Amount</Th></tr></thead>
            <tbody>{mine.map((p) => <tr key={p.id} className="hover:bg-neutral-50"><Td className="font-medium">{p.id}</Td><Td>{fmtDate(p.requestedAt)}</Td><Td><Badge s={p.status} /></Td><Td className="text-neutral-600">{p.reference ?? p.reason ?? "—"}</Td><Td right>{money(p.amount)}</Td></tr>)}
              {mine.length === 0 && <tr><Td className="py-10 text-center text-neutral-500">No payouts yet</Td></tr>}</tbody></Table>
        </Card>
      </DealerGate>
    </>
  );
}
