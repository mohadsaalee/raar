"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, MapPin, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Product, discountPct, money } from "@/data/products";
import { useStore } from "./StoreProvider";
import SafeImage from "./SafeImage";
import Stars from "./Stars";
import ProductCard from "./ProductCard";

export default function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const { addToCart, wishlist, toggleWishlist, showToast } = useStore();
  const router = useRouter();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(false);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [acc, setAcc] = useState<string | null>("Description");
  const liked = wishlist.includes(product.id);

  function add(buyNow = false) {
    if (!size) { setErr(true); showToast("Please select a size"); return; }
    addToCart(product, size, color, qty);
    if (buyNow) router.push("/checkout");
  }

  const ACC = [
    ["Description", product.description],
    ["Fabric & Care", product.fabric],
    ["Shipping & Returns", "Free shipping above ₹1,499. Dispatched within 24 hours. Easy returns within 7 days of delivery in original condition."],
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="hover:text-ink">Home</Link> / <Link href={`/collections/all`} className="hover:text-ink">Shop</Link> / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} className={`h-24 w-20 overflow-hidden border-2 transition ${i === img ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <SafeImage src={src} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div
            className="relative flex-1 cursor-zoom-in overflow-hidden bg-sand"
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
            onMouseLeave={() => setZoom(null)}
          >
            <AnimatePresence mode="wait">
              <motion.div key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="aspect-[3/4]">
                <SafeImage src={product.images[img]} alt={product.name} priority className="h-full w-full object-cover transition-transform duration-200" />
                {zoom && <div className="pointer-events-none absolute inset-0 hidden bg-no-repeat md:block" style={{ backgroundImage: `url(${product.images[img]})`, backgroundSize: "220%", backgroundPosition: `${zoom.x}% ${zoom.y}%` }} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Info */}
        <div className="md:sticky md:top-32 md:self-start">
          <p className="text-xs uppercase tracking-widest text-neutral-500">{product.category}</p>
          <h1 className="mt-1 font-display text-4xl font-semibold uppercase leading-tight">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm"><Stars rating={product.rating} /><span className="text-neutral-500">{product.rating} ({product.reviews} reviews)</span></div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{money(product.price)}</span>
            <span className="text-neutral-400 line-through">{money(product.mrp)}</span>
            <span className="text-sm font-semibold text-accent">{discountPct(product)}% OFF</span>
          </div>
          <p className="text-xs text-neutral-500">Inclusive of all taxes</p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Colour: <span className="font-normal text-neutral-600">{color}</span></p>
            <div className="flex gap-2.5">{product.colors.map((c) => (
              <button key={c.name} onClick={() => setColor(c.name)} title={c.name} aria-label={c.name} className={`h-8 w-8 rounded-full border-2 p-0.5 transition ${color === c.name ? "border-ink" : "border-transparent"}`}>
                <span className="block h-full w-full rounded-full border border-neutral-300" style={{ background: c.hex }} />
              </button>
            ))}</div>
          </div>

          <div className="mt-6">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${err ? "text-accent" : ""}`}>Select size</p>
            <div className="flex flex-wrap gap-2">{product.sizes.map((s) => (
              <button key={s} onClick={() => { setSize(s); setErr(false); }} className={`min-w-[3rem] border px-3 py-2.5 text-sm font-medium transition ${size === s ? "border-ink bg-ink text-white" : err ? "border-accent" : "border-neutral-300 hover:border-ink"}`}>{s}</button>
            ))}</div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-neutral-300">
              <button className="px-3.5 py-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button className="px-3.5 py-3" onClick={() => setQty(qty + 1)} aria-label="Increase">+</button>
            </div>
            <button onClick={() => add(false)} className="flex-1 bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800">Add to bag</button>
            <button onClick={() => toggleWishlist(product.id)} aria-label="Wishlist" className="border border-neutral-300 p-3.5 transition hover:border-ink"><Heart size={18} className={liked ? "fill-accent text-accent" : ""} /></button>
          </div>
          <button onClick={() => add(true)} className="mt-3 w-full border border-ink py-4 text-xs font-semibold uppercase tracking-widest transition hover:bg-ink hover:text-white">Buy it now</button>

          <div className="mt-6 border border-neutral-200 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"><MapPin size={14} />Check delivery</p>
            <form onSubmit={(e) => { e.preventDefault(); setPinMsg(/^\d{6}$/.test(pin) ? `Delivery to ${pin} in 3–5 business days. COD available.` : "Enter a valid 6-digit pincode."); }} className="flex gap-2">
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter pincode" className="flex-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-ink" />
              <button className="bg-neutral-100 px-5 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-200">Check</button>
            </form>
            {pinMsg && <p className="mt-2 text-xs text-neutral-600">{pinMsg}</p>}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] uppercase tracking-wider text-neutral-600">
            <div className="flex flex-col items-center gap-1"><Truck size={20} strokeWidth={1.4} />Fast delivery</div>
            <div className="flex flex-col items-center gap-1"><RotateCcw size={20} strokeWidth={1.4} />7-day returns</div>
            <div className="flex flex-col items-center gap-1"><ShieldCheck size={20} strokeWidth={1.4} />Secure checkout</div>
          </div>

          <div className="mt-6 border-t border-neutral-200">
            {ACC.map(([t, body]) => (
              <div key={t} className="border-b border-neutral-200">
                <button onClick={() => setAcc(acc === t ? null : t)} className="flex w-full items-center justify-between py-4 text-xs font-semibold uppercase tracking-widest">{t}<ChevronDown size={16} className={`transition ${acc === t ? "rotate-180" : ""}`} /></button>
                <AnimatePresence initial={false}>
                  {acc === t && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-4 text-sm leading-relaxed text-neutral-600">{body}</motion.p>}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="mb-8 font-display text-3xl font-semibold uppercase tracking-wide">You may also like</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">{related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
      </section>
    </div>
  );
}

