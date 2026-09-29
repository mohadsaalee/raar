"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Empty, Field, Forbidden, Input, PageHead, ReasonDialog, Stat, Table, Tabs, Td, Th } from "@/components/portal/ui";
import { dealerStats, effectivePct, fmtDate, fmtDateTime } from "@/data/portal";
import { money } from "@/data/products";

export default function DealerDetail() {
  const { id } = useParams<{ id: string }>();
  const { db, can, reviewKyc, activateDealer, suspendDealer, setCommissionOverride, verifyBank } = usePortal(); const { showToast } = useStore();
  const [tab, setTab] = useState<"overview" | "kyc" | "orders" | "commission" | "activity">("overview");
  const [dlg, setDlg] = useState<null | "reject" | "suspend">(null); const [pct, setPct] = useState("");
  const d = db.dealers.find((x) => x.id === id);
  if (!can("dealers")) return <Forbidden what="dealer details" />;
  if (!d) return <Empty icon={FileText} title="Dealer not found" action={<Link href="/admin/dealers"><Btn>Back to dealers</Btn></Link>} />;
  const s = dealerStats(db, d.id); const say = (r: { ok: boolean; error?: string }, ok: string) => showToast(r.ok ? ok : r.error ?? "Failed");
  const activity = db.audit.filter((a) => a.entityId === d.id);

  return (
    <>
      <Link href="/admin/dealers" className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink"><ArrowLeft size={14} />All dealers</Link>
      <PageHead title={d.name} sub={`${d.code} · ${d.email} · ${d.city}`} action={<div className="flex flex-wrap items-center gap-2"><Badge s={d.status} />
        {d.kyc.status === "Pending" && can("kyc") && <><Btn variant="success" size="sm" onClick={() => say(reviewKyc(d.id, true, "Documents verified"), "KYC approved")}>Approve KYC</Btn><Btn variant="danger" size="sm" onClick={() => setDlg("reject")}>Reject KYC</Btn></>}
        {d.status === "Approved" && <Btn size="sm" onClick={() => say(activateDealer(d.id), "Dealership activated")}>Activate dealership</Btn>}
        {d.status === "Suspended" ? <Btn size="sm" variant="outline" onClick={() => say(activateDealer(d.id), "Dealer reinstated")}>Reinstate</Btn> : d.status === "Activated" && <Btn size="sm" variant="danger" onClick={() => setDlg("suspend")}>Suspend</Btn>}</div>} />
      {d.suspendedReason && d.status === "Suspended" && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Suspended: {d.suspendedReason}</p>}
      <Tabs tabs={[{ key: "overview", label: "Overview" }, { key: "kyc", label: "KYC & bank" }, { key: "orders", label: "Orders", count: s.orders.length }, { key: "commission", label: "Commission" }, { key: "activity", label: "Activity", count: activity.length }]} value={tab} onChange={setTab} />
      <div className="mt-6">
        {tab === "overview" && <><div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Sales" value={money(s.sales)} /><Stat label="Orders" value={s.orderCount} /><Stat label="Available balance" value={money(s.available)} tone="green" /><Stat label="Lifetime commission" value={money(s.lifetime)} tone="violet" /></div>
          <Card title="Profile"><dl className="grid gap-4 text-sm sm:grid-cols-3">{[["Store", d.storeName], ["Store URL", `/store/${d.slug}`], ["Phone", d.phone], ["Joined", fmtDate(d.joinedAt)], ["Training", `${d.training.length}/6 modules`], ["MFA", d.mfa ? "Enabled" : "Off"]].map(([k, v]) => <div key={k}><dt className="text-xs text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></Card></>}
        {tab === "kyc" && <div className="grid gap-6 lg:grid-cols-2"><Card title="KYC document"><div className="mb-3"><Badge s={d.kyc.status} /></div>{d.kyc.fileName ? <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm"><FileText size={18} /><div><p className="font-medium">{d.kyc.docType}</p><p className="text-xs text-neutral-500">{d.kyc.fileName} · submitted {d.kyc.submittedAt && fmtDate(d.kyc.submittedAt)}</p></div></div> : <p className="text-sm text-neutral-500">No document submitted.</p>}{d.kyc.reviewedBy && <p className="mt-3 text-xs text-neutral-500">Reviewed by {d.kyc.reviewedBy}{d.kyc.note ? ` · ${d.kyc.note}` : ""}</p>}</Card>
          <Card title="Payout bank account">{d.bank ? <><p className="text-sm">{d.bank.holder} · {d.bank.account} · {d.bank.ifsc}</p><div className="mt-3 flex items-center gap-3">{d.bank.verified ? <Badge s="Verified" tone="green" /> : <Badge s="Unverified" tone="amber" />}{!d.bank.verified && can("payouts") && <Btn size="sm" onClick={() => say(verifyBank(d.id), "Bank account verified")}>Verify account</Btn>}</div></> : <p className="text-sm text-neutral-500">No bank account added.</p>}</Card></div>}
        {tab === "orders" && <Card pad={false}><Table><thead><Tr3 /></thead><tbody>{s.orders.map((o) => <tr key={o.id}><Td className="font-medium">{o.id}</Td><Td>{fmtDate(o.date)}</Td><Td><Badge s={o.status} /></Td><Td right>{money(o.total)}</Td><Td right>{money(o.commissionAmount)}</Td></tr>)}</tbody></Table>{s.orders.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">No attributed orders.</p>}</Card>}
        {tab === "commission" && <div className="grid gap-6 lg:grid-cols-2"><Card title="Commission rate"><p className="mb-3 text-sm">Effective rate: <strong>{effectivePct(db, d)}%</strong> {d.commissionOverride === null && <span className="text-neutral-500">(global default)</span>}</p>{can("commission") ? <div className="flex items-end gap-2"><Field label="Dealer-specific % (applies to new orders)"><Input type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} placeholder={String(effectivePct(db, d))} /></Field><Btn disabled={pct === ""} onClick={() => say(setCommissionOverride(d.id, Number(pct)), "Rate updated")}>Set</Btn><Btn variant="outline" onClick={() => say(setCommissionOverride(d.id, null), "Reset to default")}>Reset</Btn></div> : <p className="text-xs text-neutral-500">You can view but not change commission rules.</p>}</Card>
          <Card title="Balances"><ul className="space-y-1.5 text-sm">{[["Pending", s.pending], ["Confirmed", s.confirmed], ["Available", s.available], ["Requested (reserved)", s.reserved], ["Paid out", s.paidOut]].map(([k, v]) => <li key={k as string} className="flex justify-between"><span className="text-neutral-600">{k}</span><span className="font-medium">{money(v as number)}</span></li>)}</ul></Card></div>}
        {tab === "activity" && <Card pad={false}>{activity.length === 0 ? <p className="py-10 text-center text-sm text-neutral-500">No recorded activity.</p> : <ul className="divide-y divide-neutral-100">{activity.map((a) => <li key={a.id} className="px-5 py-3 text-sm"><p className="font-medium">{a.action}{a.after && <span className="font-normal text-neutral-500"> → {a.after}</span>}</p><p className="text-xs text-neutral-500">{a.actor} ({a.role}) · {fmtDateTime(a.at)}{a.reason ? ` · ${a.reason}` : ""}</p></li>)}</ul>}</Card>}
      </div>
      <ReasonDialog open={dlg === "reject"} title="Reject KYC" desc="The dealer will be asked to resubmit." confirm="Reject" tone="danger" onClose={() => setDlg(null)} onConfirm={(r) => { say(reviewKyc(d.id, false, r), "KYC rejected"); setDlg(null); }} />
      <ReasonDialog open={dlg === "suspend"} title="Suspend dealership" desc="The dealer loses access to product access, storefront and payouts." confirm="Suspend" tone="danger" onClose={() => setDlg(null)} onConfirm={(r) => { say(suspendDealer(d.id, r), "Dealer suspended"); setDlg(null); }} />
    </>
  );
}
const Tr3 = () => <tr><Th>Order</Th><Th>Date</Th><Th>Status</Th><Th right>Total</Th><Th right>Commission</Th></tr>;
