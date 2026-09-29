"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Field, Forbidden, Input, Modal, PageHead, Select, Table, Td, Th } from "@/components/portal/ui";
import { Order, OrderStatus, fmtDate, fmtDateTime } from "@/data/portal";
import { money } from "@/data/products";

const NEXT: Record<string, OrderStatus[]> = { "Pending Payment": ["Confirmed", "Cancelled"], Confirmed: ["Packed", "Cancelled"], Packed: ["Shipped", "Cancelled"], Shipped: ["Delivered"] };

export default function AdminOrders() {
  const { db, can, updateOrderStatus } = usePortal(); const { showToast } = useStore();
  const [q, setQ] = useState(""); const [st, setSt] = useState("All"); const [selId, setSelId] = useState<string | null>(null); const [trk, setTrk] = useState("");
  if (!can("orders")) return <Forbidden what="orders" />;
  const list = db.orders.filter((o) => (st === "All" || o.status === st) && `${o.id} ${o.customer.name} ${o.customer.email}`.toLowerCase().includes(q.toLowerCase()));
  const sel: Order | undefined = db.orders.find((o) => o.id === selId);
  const dealer = sel?.dealerId ? db.dealers.find((d) => d.id === sel.dealerId) : null;
  const move = (n: OrderStatus) => { const r = updateOrderStatus(sel!.id, n, trk); showToast(r.ok ? `Order marked ${n}` : r.error ?? "Failed"); if (r.ok) setTrk(""); };

  return (
    <>
      <PageHead title="Orders" sub={`${db.orders.length} total`} />
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-neutral-100 p-4"><Input className="max-w-xs" placeholder="Search order, name or email" value={q} onChange={(e) => setQ(e.target.value)} /><Select className="w-48" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Pending Payment", "Confirmed", "Packed", "Shipped", "Delivered", "Return Requested", "Returned", "Cancelled"].map((s) => <option key={s}>{s}</option>)}</Select></div>
        <Table><thead><tr><Th>Order</Th><Th>Date</Th><Th>Customer</Th><Th>Dealer</Th><Th>Payment</Th><Th>Status</Th><Th right>Total</Th></tr></thead>
          <tbody>{list.slice(0, 60).map((o) => <tr key={o.id} onClick={() => setSelId(o.id)} className="cursor-pointer hover:bg-neutral-50"><Td className="font-medium">{o.id}</Td><Td>{fmtDate(o.date)}</Td><Td>{o.customer.name}</Td><Td>{o.dealerId ? db.dealers.find((d) => d.id === o.dealerId)?.name : <span className="text-neutral-400">Direct</span>}</Td><Td><span className="mr-1.5">{o.payment}</span><Badge s={o.paymentStatus} /></Td><Td><Badge s={o.status} /></Td><Td right>{money(o.total)}</Td></tr>)}</tbody></Table>
      </Card>

      <Modal open={!!sel} onClose={() => setSelId(null)} title={sel ? `Order ${sel.id}` : ""} wide>
        {sel && (<div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Items</p><ul className="space-y-1.5 text-sm">{sel.items.map((i, k) => <li key={k} className="flex justify-between"><span>{i.name} <span className="text-neutral-400">({i.color}, {i.size}) × {i.qty}</span></span><span>{money(i.price * i.qty)}</span></li>)}</ul><p className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-semibold"><span>Total</span><span>{money(sel.total)}</span></p></div>
            <div className="rounded-lg bg-neutral-50 p-3 text-sm"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Ship to</p>{sel.customer.name}<br />{sel.customer.address}, {sel.customer.city}, {sel.customer.state} {sel.customer.pin}<br />{sel.customer.phone} · {sel.customer.email}</div>
            <div className="text-sm"><p>Payment: {sel.payment} · <Badge s={sel.paymentStatus} /></p><p className="mt-1">Attribution: {dealer ? <>{dealer.name} · {sel.commissionPct}% = <strong>{money(sel.commissionAmount)}</strong></> : "Direct order (no dealer)"}</p>{sel.tracking && <p className="mt-1">Tracking: <strong>{sel.tracking}</strong></p>}</div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2"><Badge s={sel.status} /></div>
            {NEXT[sel.status] && can("orders_edit") ? (<div className="mb-5 space-y-3 rounded-lg border border-neutral-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Next step</p>
              {NEXT[sel.status].includes("Shipped") && <Field label="Tracking number"><Input value={trk} onChange={(e) => setTrk(e.target.value)} placeholder="e.g. TRK1234567" /></Field>}
              <div className="flex flex-wrap gap-2">{NEXT[sel.status].map((n) => <Btn key={n} size="sm" variant={n === "Cancelled" ? "danger" : "primary"} onClick={() => move(n)}>{n === "Confirmed" ? "Mark payment received" : n === "Cancelled" ? "Cancel & refund" : `Mark ${n.toLowerCase()}`}</Btn>)}</div></div>) : <p className="mb-5 text-sm text-neutral-500">{NEXT[sel.status] ? "You have view-only access to orders." : "No further actions."} {sel.status === "Return Requested" ? "Handle it in Returns & refunds." : ""}</p>}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">History</p>
            <ol className="space-y-3 border-l border-neutral-200 pl-4">{sel.history.map((h, k) => <li key={k} className="relative text-sm"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-ink" /><p className="font-medium">{h.status}</p><p className="text-xs text-neutral-500">{fmtDateTime(h.at)} · {h.by}</p></li>)}</ol>
          </div>
        </div>)}
      </Modal>
    </>
  );
}
