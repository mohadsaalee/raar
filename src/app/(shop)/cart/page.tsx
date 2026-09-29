"use client";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { money } from "@/data/products";
import SafeImage from "@/components/SafeImage";

export default function CartPage() {
  const { lines, subtotal, discount, shipping, total, coupon, applyCoupon, updateQty, removeLine, showToast } = useStore();
  const [code, setCode] = useState("");

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-32 text-center">
        <ShoppingBag size={56} className="text-neutral-300" />
        <h1 className="font-display text-4xl uppercase">Your bag is empty</h1>
        <p className="text-sm text-neutral-500">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/collections/all" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <h1 className="mb-8 font-display text-4xl font-semibold uppercase">Your bag</h1>
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-5 py-6">
              <Link href={`/product/${l.product.slug}`}><SafeImage src={l.product.images[0]} alt={l.product.name} className="h-36 w-28 object-cover" /></Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link href={`/product/${l.product.slug}`} className="font-medium hover:underline">{l.product.name}</Link>
                    <p className="mt-1 text-xs text-neutral-500">{l.color} · Size {l.size}</p>
                  </div>
                  <button onClick={() => removeLine(l.key)} aria-label="Remove" className="text-neutral-400 hover:text-accent"><Trash2 size={17} /></button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-neutral-300">
                    <button className="p-2" onClick={() => updateQty(l.key, l.qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-9 text-center text-sm font-medium">{l.qty}</span>
                    <button className="p-2" onClick={() => updateQty(l.key, l.qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-semibold">{money(l.product.price * l.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest">Order summary</h2>
          <form onSubmit={(e) => { e.preventDefault(); showToast(applyCoupon(code) ? "Coupon applied: 10% off" : "Invalid coupon code"); setCode(""); }} className="mb-5 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code (try RAAR10)" className="flex-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-ink" />
            <button className="bg-neutral-100 px-4 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-200">Apply</button>
          </form>
          <dl className="space-y-3 text-sm">
            <Row l="Subtotal" v={money(subtotal)} />
            {coupon && <Row l={`Discount (${coupon})`} v={`− ${money(discount)}`} green />}
            <Row l="Shipping" v={shipping === 0 ? "Free" : money(shipping)} />
            <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold"><dt>Total</dt><dd>{money(total)}</dd></div>
          </dl>
          <Link href="/checkout" className="mt-6 block bg-ink py-4 text-center text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800">Proceed to checkout</Link>
          <Link href="/collections/all" className="mt-3 block text-center text-xs uppercase tracking-widest text-neutral-500 underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ l, v, green }: { l: string; v: string; green?: boolean }) {
  return <div className="flex justify-between"><dt className="text-neutral-600">{l}</dt><dd className={green ? "font-medium text-green-700" : "font-medium"}>{v}</dd></div>;
}
