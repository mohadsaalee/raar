"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Landmark, Smartphone, Banknote } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { usePortal } from "@/components/PortalProvider";
import { money } from "@/data/products";

const PAY = [
  { v: "upi", l: "UPI", icon: Smartphone },
  { v: "card", l: "Credit / Debit card", icon: CreditCard },
  { v: "net", l: "Net banking", icon: Landmark },
  { v: "cod", l: "Cash on delivery", icon: Banknote },
];

export default function CheckoutPage() {
  const { lines, subtotal, discount, shipping, total, clearCart, showToast } = useStore();
  const { placeOrder, refDealer } = usePortal();
  const [pay, setPay] = useState("upi");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ id: string; total: number } | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const er: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(String(f.get("email")))) er.email = "Enter a valid email";
    if (!/^\d{10}$/.test(String(f.get("phone")))) er.phone = "Enter a 10-digit phone number";
    for (const k of ["name", "address", "city", "state"]) if (!String(f.get(k)).trim()) er[k] = "Required";
    if (!/^\d{6}$/.test(String(f.get("pin")))) er.pin = "Enter a 6-digit pincode";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const t = total;
    const items = lines.map((l) => ({ productId: l.productId, name: l.product.name, size: l.size, color: l.color, qty: l.qty, price: l.product.price }));
    const customer = { name: String(f.get("name")).trim(), email: String(f.get("email")).trim(), phone: String(f.get("phone")), address: String(f.get("address")).trim(), city: String(f.get("city")).trim(), state: String(f.get("state")).trim(), pin: String(f.get("pin")) };
    setTimeout(() => {
      const r = placeOrder({ customer, items, subtotal, discount, shipping, total: t, payment: pay });
      setBusy(false);
      if (!r.ok) { showToast(r.error ?? "Could not place order"); return; }
      setDone({ id: r.id!, total: t }); clearCart();
    }, 1000);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}><CheckCircle2 size={72} className="mx-auto text-green-600" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h1 className="mt-6 font-display text-4xl font-semibold uppercase">Order confirmed</h1>
          <p className="mt-2 text-neutral-600">Thank you! Your order <strong>{done.id}</strong> for {money(done.total)} has been placed.</p>
          <p className="mt-1 text-sm text-neutral-500">A confirmation has been sent to your email. Estimated delivery: 3–5 business days.</p>
          <Link href="/track" className="mt-3 inline-block text-sm underline">Track this order</Link>
          <Link href="/" className="mt-8 inline-block bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Continue shopping</Link>
        </motion.div>
      </div>
    );
  }

  if (lines.length === 0) {
    return <div className="py-32 text-center"><p className="mb-6">Your bag is empty.</p><Link href="/collections/all" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Shop now</Link></div>;
  }

  const input = (name: string, label: string, ph = "", type = "text") => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-neutral-600">{label}</label>
      <input name={name} type={type} placeholder={ph} className={`w-full border px-3 py-3 text-sm outline-none focus:border-ink ${errors[name] ? "border-accent" : "border-neutral-300"}`} />
      {errors[name] && <p className="mt-1 text-xs text-accent">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold uppercase">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">{input("email", "Email", "you@example.com", "email")}{input("phone", "Phone", "10-digit mobile", "tel")}</div>
        </section>
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold uppercase">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{input("name", "Full name")}</div>
            <div className="sm:col-span-2">{input("address", "Address")}</div>
            {input("city", "City")}{input("state", "State")}{input("pin", "Pincode")}
          </div>
        </section>
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold uppercase">Payment</h2>
          <p className="mb-3 text-xs text-neutral-500">Demo checkout: no real payment is processed.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PAY.map((p) => (
              <label key={p.v} className={`flex cursor-pointer items-center gap-3 border p-4 transition ${pay === p.v ? "border-ink bg-white" : "border-neutral-300"}`}>
                <input type="radio" name="pay" checked={pay === p.v} onChange={() => setPay(p.v)} className="accent-ink" />
                <p.icon size={18} /> <span className="text-sm font-medium">{p.l}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit border border-neutral-200 bg-white p-6 lg:sticky lg:top-32">
        {refDealer && <p className="mb-4 bg-neutral-50 p-3 text-xs text-neutral-600">Ordering via <strong>{refDealer.storeName}</strong></p>}
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest">Order summary</h2>
        <ul className="mb-5 space-y-3">{lines.map((l) => (
          <li key={l.key} className="flex justify-between gap-3 text-sm"><span className="text-neutral-700">{l.product.name} <span className="text-neutral-400">({l.size}) × {l.qty}</span></span><span className="font-medium">{money(l.product.price * l.qty)}</span></li>
        ))}</ul>
        <dl className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>− {money(discount)}</dd></div>}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : money(shipping)}</dd></div>
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold"><dt>Total</dt><dd>{money(total)}</dd></div>
        </dl>
        <button disabled={busy} className="mt-6 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800 disabled:opacity-60">{busy ? "Placing order…" : `Place order · ${money(total)}`}</button>
      </aside>
    </form>
  );
}
