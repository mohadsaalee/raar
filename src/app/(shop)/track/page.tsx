"use client";
import { useState } from "react";
import { CheckCircle2, PackageSearch, RotateCcw } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Order, fmtDateTime } from "@/data/portal";
import { money } from "@/data/products";

const STEPS = ["Confirmed", "Packed", "Shipped", "Delivered"];

export default function TrackPage() {
  const { db, trackOrder, requestReturn } = usePortal(); const { showToast } = useStore();
  const [id, setId] = useState(""); const [email, setEmail] = useState(""); const [orderId, setOrderId] = useState<string | null>(null); const [miss, setMiss] = useState(false);
  const [reason, setReason] = useState("Size did not fit"); const [err, setErr] = useState("");
  const order: Order | null = orderId ? db.orders.find((o) => o.id === orderId) ?? null : null;
  const stepIdx = order ? STEPS.indexOf(order.status === "Returned" || order.status === "Return Requested" ? "Delivered" : order.status) : -1;
  const inWindow = order?.deliveredAt ? Date.now() - new Date(order.deliveredAt).getTime() <= db.settings.returnWindowDays * 86400000 : false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center"><PackageSearch className="mx-auto mb-3" size={40} strokeWidth={1.4} /><h1 className="font-display text-4xl font-semibold uppercase">Track your order</h1><p className="mt-1 text-sm text-neutral-500">Enter your order number and the email used at checkout.</p></div>
      <form onSubmit={(e) => { e.preventDefault(); const o = trackOrder(id, email); setMiss(!o); setOrderId(o?.id ?? null); setErr(""); }} className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input required value={id} onChange={(e) => setId(e.target.value)} placeholder="Order number (RAAR-123456)" className="border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-ink" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-ink" />
        <button className="bg-ink px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white">Track</button>
      </form>
      {miss && <p className="mt-4 text-center text-sm text-accent">No order found for that number and email.</p>}
      {order && (
        <div className="mt-10 border border-neutral-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs text-neutral-500">Order</p><p className="font-semibold">{order.id}</p></div><p className="text-sm font-semibold">{money(order.total)}</p></div>
          {["Cancelled", "Returned", "Return Requested"].includes(order.status) ? <p className="mt-6 rounded bg-neutral-100 p-4 text-center text-sm font-medium">Status: {order.status}{order.status === "Returned" && " · refund issued"}</p> : (
            <ol className="mt-6 grid grid-cols-4 gap-2">{STEPS.map((s, i) => <li key={s} className="text-center"><div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= stepIdx ? "bg-ink text-white" : "bg-neutral-200 text-neutral-400"}`}>{i <= stepIdx ? <CheckCircle2 size={16} /> : i + 1}</div><p className="mt-1 text-xs">{s}</p></li>)}</ol>)}
          {order.tracking && <p className="mt-4 text-center text-sm text-neutral-600">Tracking number: <strong>{order.tracking}</strong></p>}
          <ul className="mt-6 space-y-1 border-t border-neutral-100 pt-4 text-sm">{order.items.map((i, k) => <li key={k} className="flex justify-between"><span>{i.name} <span className="text-neutral-400">({i.size}) × {i.qty}</span></span><span>{money(i.price * i.qty)}</span></li>)}</ul>
          <ol className="mt-6 space-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-500">{order.history.map((h, k) => <li key={k}>{fmtDateTime(h.at)} · {h.status}</li>)}</ol>
          {order.status === "Delivered" && (
            <div className="mt-6 border-t border-neutral-100 pt-5">{inWindow ? (<><p className="mb-2 flex items-center gap-2 text-sm font-semibold"><RotateCcw size={15} />Need to return this?</p><div className="flex gap-2"><select value={reason} onChange={(e) => setReason(e.target.value)} className="flex-1 border border-neutral-300 px-3 py-2.5 text-sm">{["Size did not fit", "Colour differs from photos", "Received damaged item", "Changed my mind"].map((r) => <option key={r}>{r}</option>)}</select><button onClick={() => { const r = requestReturn(order.id, email, reason); if (r.ok) showToast("Return requested"); else setErr(r.error ?? ""); }} className="bg-ink px-5 text-xs font-semibold uppercase tracking-widest text-white">Request return</button></div>{err && <p className="mt-2 text-xs text-accent">{err}</p>}</>) : <p className="text-xs text-neutral-500">The {db.settings.returnWindowDays}-day return window has closed for this order.</p>}</div>)}
        </div>)}
      <p className="mt-8 text-center text-xs text-neutral-400">Demo tip: use any order number from the admin portal with the customer&apos;s email (e.g. divya@example.com).</p>
    </div>
  );
}
