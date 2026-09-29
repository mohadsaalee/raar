"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X, Truck } from "lucide-react";
import { FREE_SHIPPING_AT, useStore } from "./StoreProvider";
import { money } from "@/data/products";
import SafeImage from "./SafeImage";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, updateQty, removeLine, count } = useStore();
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50" onClick={() => setCartOpen(false)} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.32 }} className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
              <h2 className="text-sm font-semibold uppercase tracking-widest">Your Bag ({count})</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={20} /></button>
            </div>

            {lines.length > 0 && (
              <div className="border-b border-neutral-100 px-6 py-4">
                <p className="mb-2 flex items-center gap-2 text-xs text-neutral-600">
                  <Truck size={14} />
                  {remaining > 0 ? <>Add <strong>{money(remaining)}</strong> more for free shipping</> : <strong className="text-green-700">You&apos;ve unlocked free shipping!</strong>}
                </p>
                <div className="h-1.5 w-full overflow-hidden bg-neutral-100">
                  <motion.div initial={false} animate={{ width: `${pct}%` }} className="h-full bg-ink" />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <ShoppingBag size={44} className="text-neutral-300" />
                  <p className="text-sm text-neutral-500">Your bag is empty.</p>
                  <Link href="/collections/all" onClick={() => setCartOpen(false)} className="bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white">Start shopping</Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {lines.map((l) => (
                    <motion.li layout key={l.key} className="flex gap-4 py-5">
                      <Link href={`/product/${l.product.slug}`} onClick={() => setCartOpen(false)} className="h-28 w-22 shrink-0">
                        <SafeImage src={l.product.images[0]} alt={l.product.name} className="h-28 w-[5.5rem] object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{l.product.name}</p>
                          <button onClick={() => removeLine(l.key)} aria-label="Remove" className="text-neutral-400 hover:text-accent"><Trash2 size={15} /></button>
                        </div>
                        <p className="mt-0.5 text-xs text-neutral-500">{l.color} · {l.size}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border border-neutral-300">
                            <button className="p-1.5" onClick={() => updateQty(l.key, l.qty - 1)} aria-label="Decrease"><Minus size={13} /></button>
                            <span className="w-7 text-center text-xs font-medium">{l.qty}</span>
                            <button className="p-1.5" onClick={() => updateQty(l.key, l.qty + 1)} aria-label="Increase"><Plus size={13} /></button>
                          </div>
                          <span className="text-sm font-semibold">{money(l.product.price * l.qty)}</span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-neutral-200 p-6">
                <div className="mb-4 flex justify-between text-sm"><span className="text-neutral-600">Subtotal</span><span className="font-semibold">{money(subtotal)}</span></div>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="block bg-ink py-4 text-center text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800">Checkout</Link>
                <Link href="/cart" onClick={() => setCartOpen(false)} className="mt-2 block border border-ink py-3.5 text-center text-xs font-semibold uppercase tracking-widest">View bag</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
