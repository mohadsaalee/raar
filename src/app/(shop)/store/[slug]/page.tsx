"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

/** Public dealer storefront: opening it records dealer attribution for later checkout */
export default function DealerStore() {
  const { slug } = useParams<{ slug: string }>(); const router = useRouter();
  const { db, ready, setRef } = usePortal();
  const dealer = useMemo(() => db.dealers.find((d) => d.slug === slug), [db.dealers, slug]);
  const live = dealer?.status === "Activated";

  useEffect(() => {
    if (!ready || !dealer || !live) return;
    setRef(dealer.id);
    const p = new URLSearchParams(window.location.search).get("p");
    if (p) router.replace(`/product/${p}`);
  }, [ready, dealer, live, setRef, router]);

  if (!ready) return <div className="py-40 text-center text-neutral-400">Loading store…</div>;
  if (!dealer || !live) return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center"><Store size={48} className="text-neutral-300" /><h1 className="font-display text-3xl uppercase">Store unavailable</h1><p className="text-sm text-neutral-500">This dealer store isn&apos;t active right now. You can still browse the full RAAR collection.</p><Link href="/collections/all" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Shop RAAR</Link></div>
  );
  const items = PRODUCTS.filter((p) => dealer.featured.includes(p.id));
  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ background: dealer.accent }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-20 md:px-8">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Curated by {dealer.name} · {dealer.city}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 font-display text-5xl font-semibold uppercase md:text-7xl">{dealer.storeName}</motion.h1>
          <p className="mt-3 max-w-xl text-white/80">{dealer.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3"><a href="#products" className="bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-ink">Shop now</a>{dealer.whatsapp && <a href={`https://wa.me/${dealer.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/40 px-7 py-3.5 text-xs font-semibold uppercase tracking-widest"><MessageCircle size={15} />Chat on WhatsApp</a>}</div>
        </div>
      </section>
      <div className="border-b border-neutral-200 bg-white"><div className="mx-auto flex max-w-[1400px] flex-wrap justify-center gap-8 px-4 py-4 text-xs text-neutral-600"><span className="flex items-center gap-2"><Truck size={15} />Fulfilled &amp; shipped by RAAR</span><span className="flex items-center gap-2"><ShieldCheck size={15} />Secure checkout</span><span className="flex items-center gap-2"><Store size={15} />Easy 7-day returns</span></div></div>
      <section id="products" className="mx-auto max-w-[1400px] px-4 py-14 md:px-8">
        <h2 className="mb-8 font-display text-3xl font-semibold uppercase">Shop {dealer.storeName}</h2>
        {items.length === 0 ? <p className="py-20 text-center text-neutral-500">This store hasn&apos;t picked products yet.</p> : <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">{items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>}
      </section>
    </>
  );
}
