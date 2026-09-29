"use client";
import { useMemo, useState } from "react";
import { Copy, MessageCircle, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import DealerGate from "@/components/portal/DealerGate";
import { Badge, Btn, Card, Input, PageHead, Select } from "@/components/portal/ui";
import SafeImage from "@/components/SafeImage";
import { CATEGORIES, PRODUCTS, money } from "@/data/products";
import { effectivePct } from "@/data/portal";

export default function Catalogue() {
  const { db, dealer, toggleFeatured } = usePortal(); const { showToast } = useStore();
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All");
  const list = useMemo(() => PRODUCTS.filter((p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())), [q, cat]);
  if (!dealer) return null;
  const pct = effectivePct(db, dealer);
  const link = (slug?: string) => `${window.location.origin}/store/${dealer.slug}${slug ? `?p=${slug}` : ""}`;
  const copy = (t: string) => { navigator.clipboard?.writeText(t).catch(() => {}); showToast("Link copied"); };

  return (
    <>
      <PageHead title="Product access" sub="The RAAR catalogue available to you. Share products with your personal link; RAAR handles payment, delivery and returns." />
      <DealerGate what="Product access">
        <Card className="mb-6"><div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-3.5 text-neutral-400" /><Input className="pl-9" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Select className="w-44" value={cat} onChange={(e) => setCat(e.target.value)}><option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
          <p className="self-center text-sm text-neutral-500">Your commission rate: <strong>{pct}%</strong></p>
        </div></Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const stock = db.stock[p.id] ?? 0; const inStore = dealer.featured.includes(p.id);
            return (
              <div key={p.id} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4">
                <Link href={`/product/${p.slug}`} target="_blank"><SafeImage src={p.images[0]} alt={p.name} className="h-32 w-24 rounded-lg object-cover" /></Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500">{p.category}</p>
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm">{money(p.price)} <span className="text-xs text-neutral-400 line-through">{money(p.mrp)}</span></p>
                  <p className="mt-1 text-xs text-emerald-700">You earn ≈ {money(Math.round((p.price * pct) / 100))} per unit</p>
                  <div className="mt-1">{stock === 0 ? <Badge s="Out of stock" tone="red" /> : stock <= db.settings.lowStockAt ? <Badge s={`Only ${stock} left`} tone="amber" /> : <span className="text-xs text-neutral-500">{stock} in stock</span>}</div>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    <Btn size="sm" variant="outline" onClick={() => copy(link(p.slug))}><Copy size={12} />Link</Btn>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${p.name} · ${money(p.price)}\n${link(p.slug)}`)}`} target="_blank" rel="noreferrer"><Btn size="sm" variant="outline"><MessageCircle size={12} />Share</Btn></a>
                    <Link href="/dealer/marketing"><Btn size="sm" variant="ghost"><Sparkles size={12} />Content</Btn></Link>
                  </div>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={inStore} onChange={() => toggleFeatured(p.id)} className="accent-ink" />Show in my storefront</label>
                </div>
              </div>
            );
          })}
        </div>
        {list.length === 0 && <p className="py-16 text-center text-neutral-500">No products match your search.</p>}
      </DealerGate>
    </>
  );
}
