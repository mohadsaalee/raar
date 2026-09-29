"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Empty, Forbidden, PageHead, ReasonDialog, Table, Td, Th } from "@/components/portal/ui";
import { fmtDate } from "@/data/portal";
import { money } from "@/data/products";

export default function AdminReturns() {
  const { db, can, decideReturn } = usePortal(); const { showToast } = useStore(); const [dlg, setDlg] = useState<{ id: string; approve: boolean } | null>(null);
  if (!can("returns")) return <Forbidden what="returns" />;
  return (
    <>
      <PageHead title="Returns & refunds" sub="Approving a return refunds the customer, restocks the items and reverses the dealer's commission." />
      <Card pad={false}>{db.returns.length === 0 ? <Empty icon={RotateCcw} title="No returns" /> : (
        <Table><thead><tr><Th>Return</Th><Th>Order</Th><Th>Dealer</Th><Th>Reason</Th><Th>Requested</Th><Th>Status</Th><Th right>Refund</Th><Th /></tr></thead>
          <tbody>{db.returns.map((r) => { const o = db.orders.find((x) => x.id === r.orderId); const dl = o?.dealerId ? db.dealers.find((d) => d.id === o.dealerId)?.name : "—"; return (
            <tr key={r.id} className="hover:bg-neutral-50"><Td className="text-xs text-neutral-500">{r.id.slice(-6)}</Td><Td className="font-medium">{r.orderId}</Td><Td>{dl}</Td><Td>{r.reason}</Td><Td>{fmtDate(r.createdAt)}</Td><Td><Badge s={r.status} /></Td><Td right>{money(r.refundAmount)}</Td>
              <Td right>{r.status === "Requested" && <div className="flex justify-end gap-2"><Btn size="sm" variant="success" onClick={() => setDlg({ id: r.id, approve: true })}>Approve</Btn><Btn size="sm" variant="outline" onClick={() => setDlg({ id: r.id, approve: false })}>Reject</Btn></div>}</Td></tr>); })}</tbody></Table>)}</Card>
      <ReasonDialog open={!!dlg} title={dlg?.approve ? "Approve return & refund" : "Reject return"} desc={dlg?.approve ? "The order amount is refunded, stock restored and commission reversed." : "The order returns to Delivered."} confirm={dlg?.approve ? "Approve & refund" : "Reject"} tone={dlg?.approve ? "success" : "danger"} onClose={() => setDlg(null)} onConfirm={(note) => { const r = decideReturn(dlg!.id, dlg!.approve, note); showToast(r.ok ? (dlg!.approve ? "Refund issued and commission reversed" : "Return rejected") : r.error ?? ""); setDlg(null); }} />
    </>
  );
}
