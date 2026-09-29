"use client";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { Badge, Card, Empty, Input, Modal, PageHead, Select, Table, Td, Th } from "@/components/portal/ui";
import { Order, fmtDate, fmtDateTime, isLiveOrder, maskName } from "@/data/portal";
import { money } from "@/data/products";

export default function DealerOrders() {
  const { db, dealer } = usePortal();
  const [q, setQ] = useState(""); const [st, setSt] = useState("All"); const [sel, setSel] = useState<Order | null>(null);
  if (!dealer) return null;
  const all = db.orders.filter((o) => o.dealerId === dealer.id);
  const list = all.filter((o) => (st === "All" || o.status === st) && (o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.name.toLowerCase().includes(q.toLowerCase())));
  const led = sel ? db.ledger.find((l) => l.orderId === sel.id && l.type === "commission") : null;

  return (
    <>
      <PageHead title="Orders" sub="Orders placed through your store link or QR code." />
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-neutral-100 p-4"><Input className="max-w-xs" placeholder="Search order or customer" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-48" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Confirmed", "Packed", "Shipped", "Delivered", "Return Requested", "Returned", "Cancelled"].map((s) => <option key={s}>{s}</option>)}</Select></div>
        {list.length === 0 ? <Empty icon={ShoppingBag} title="No orders found" text="Orders placed through your store will appear here." /> : (
          <Table><thead><tr><Th>Order</Th><Th>Date</Th><Th>Customer</Th><Th>Status</Th><Th right>Amount</Th><Th right>Commission</Th></tr></thead>
            <tbody>{list.map((o) => (<tr key={o.id} onClick={() => setSel(o)} className="cursor-pointer hover:bg-neutral-50"><Td className="font-medium">{o.id}</Td><Td>{fmtDate(o.date)}</Td><Td>{maskName(o.customer.name)} · {o.customer.city}</Td><Td><Badge s={o.status} /></Td><Td right>{money(o.total)}</Td><Td right>{isLiveOrder(o) ? money(o.commissionAmount) : <span className="text-neutral-400">reversed</span>}</Td></tr>))}</tbody></Table>
        )}
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `Order ${sel.id}` : ""} wide>
        {sel && (<div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Items</p>
            <ul className="space-y-2 text-sm">{sel.items.map((i, k) => <li key={k} className="flex justify-between"><span>{i.name} <span className="text-neutral-400">({i.size}) × {i.qty}</span></span><span>{money(i.price * i.qty)}</span></li>)}</ul>
            <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(sel.subtotal)}</span></div>{sel.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>− {money(sel.discount)}</span></div>}<div className="flex justify-between"><span>Shipping</span><span>{sel.shipping ? money(sel.shipping) : "Free"}</span></div><div className="flex justify-between font-semibold"><span>Total</span><span>{money(sel.total)}</span></div></div>
            <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Customer (limited view)</p>{maskName(sel.customer.name)}, {sel.customer.city}<p className="mt-1 text-xs text-neutral-500">Contact details are held by RAAR to protect customer privacy.</p></div>
          </div>
          <div>
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Your commission</p><p className="mt-1 text-xl font-semibold">{isLiveOrder(sel) ? money(sel.commissionAmount) : "Reversed"}</p><p className="text-xs text-neutral-600">{sel.commissionPct}% of {money(sel.subtotal - sel.discount)} · status: {led ? led.status : "—"}</p></div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Timeline</p>
            <ol className="space-y-3 border-l border-neutral-200 pl-4">{sel.history.map((h, k) => <li key={k} className="relative text-sm"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-ink" /><p className="font-medium">{h.status}</p><p className="text-xs text-neutral-500">{fmtDateTime(h.at)}</p></li>)}</ol>
            {sel.tracking && <p className="mt-4 text-sm">Tracking: <strong>{sel.tracking}</strong></p>}
          </div>
        </div>)}
      </Modal>
    </>
  );
}
