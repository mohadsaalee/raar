"use client";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, FileText } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Empty, Forbidden, PageHead, ReasonDialog } from "@/components/portal/ui";
import { fmtDateTime } from "@/data/portal";

export default function KycQueue() {
  const { db, can, reviewKyc } = usePortal(); const { showToast } = useStore(); const [rej, setRej] = useState<string | null>(null);
  if (!can("kyc")) return <Forbidden what="KYC review" />;
  const q = db.dealers.filter((d) => d.kyc.status === "Pending"); const done = db.dealers.filter((d) => d.kyc.reviewedAt).slice(0, 6);
  return (
    <>
      <PageHead title="KYC review" sub="Verify dealer identity documents before activation." />
      {q.length === 0 ? <Card><Empty icon={BadgeCheck} title="Queue is empty" text="No dealers are waiting for KYC review." /></Card> : <div className="grid gap-4 md:grid-cols-2">{q.map((d) => (
        <Card key={d.id} title={d.name} action={<Badge s="Pending" />}>
          <p className="text-sm text-neutral-600">{d.email} · {d.city}</p>
          <div className="my-4 flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm"><FileText size={20} /><div><p className="font-medium">{d.kyc.docType}</p><p className="text-xs text-neutral-500">{d.kyc.fileName} · {d.kyc.submittedAt && fmtDateTime(d.kyc.submittedAt)}</p></div></div>
          <div className="flex flex-wrap gap-2"><Btn variant="success" onClick={() => { const r = reviewKyc(d.id, true, "Documents verified"); showToast(r.ok ? "KYC approved. Activate the dealership next." : r.error ?? ""); }}>Approve</Btn><Btn variant="danger" onClick={() => setRej(d.id)}>Reject</Btn><Link href={`/admin/dealers/${d.id}`}><Btn variant="outline">Open dealer</Btn></Link></div>
        </Card>))}</div>}
      <Card title="Recently reviewed" className="mt-6" pad={false}><ul className="divide-y divide-neutral-100">{done.map((d) => <li key={d.id} className="flex items-center justify-between px-5 py-3 text-sm"><span>{d.name} <span className="text-xs text-neutral-500">· {d.kyc.docType}</span></span><Badge s={d.kyc.status} /></li>)}</ul></Card>
      <ReasonDialog open={!!rej} title="Reject KYC" desc="Explain what needs fixing. The dealer will see this." confirm="Reject" tone="danger" onClose={() => setRej(null)} onConfirm={(r) => { const x = reviewKyc(rej!, false, r); showToast(x.ok ? "KYC rejected" : x.error ?? ""); setRej(null); }} />
    </>
  );
}
