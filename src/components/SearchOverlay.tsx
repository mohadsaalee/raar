"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { PRODUCTS, money } from "@/data/products";
import { useStore } from "./StoreProvider";
import SafeImage from "./SafeImage";

const POPULAR = ["Tee", "Linen", "Denim", "Saree", "Sneakers", "Hoodie"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => ref.current?.focus(), 150);
    else setQ("");
  }, [searchOpen]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return PRODUCTS.filter((p) => `${p.name} ${p.category} ${p.gender}`.toLowerCase().includes(s)).slice(0, 8);
  }, [q]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] overflow-y-auto bg-white">
          <div className="mx-auto max-w-4xl px-4 pb-16 pt-8">
            <div className="flex items-center gap-4 border-b-2 border-ink pb-3">
              <Search size={22} />
              <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, categories…" className="flex-1 bg-transparent text-xl outline-none placeholder:text-neutral-400" />
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={24} /></button>
            </div>

            {!q && (
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => <button key={p} onClick={() => setQ(p)} className="border border-neutral-300 px-4 py-2 text-sm transition hover:border-ink hover:bg-ink hover:text-white">{p}</button>)}
                </div>
              </div>
            )}

            {q && results.length === 0 && <p className="mt-10 text-center text-neutral-500">No results for “{q}”.</p>}

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {results.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} onClick={() => setSearchOpen(false)} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-sand"><SafeImage src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                  <p className="mt-2 text-sm font-medium">{p.name}</p>
                  <p className="text-sm text-neutral-500">{money(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
