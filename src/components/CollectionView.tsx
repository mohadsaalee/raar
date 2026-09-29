"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { getCollection, PRODUCTS, CATEGORIES } from "@/data/products";
import ProductCard from "./ProductCard";
import SafeImage from "./SafeImage";

const PRICE_BANDS = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 – ₹3,000", min: 2001, max: 3000 },
  { label: "Above ₹3,000", min: 3001, max: 1e9 },
];
const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "price-asc", l: "Price: Low to High" },
  { v: "price-desc", l: "Price: High to Low" },
  { v: "rating", l: "Top Rated" },
  { v: "discount", l: "Biggest Discount" },
];

export default function CollectionView({ slug }: { slug: string }) {
  const collection = getCollection(slug) ?? getCollection("all")!;
  const base = useMemo(() => PRODUCTS.filter(collection.filter), [collection]);
  const [cats, setCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [band, setBand] = useState<number | null>(null);
  const [sort, setSort] = useState("featured");
  const [open, setOpen] = useState(false);

  const availableCats = CATEGORIES.filter((c) => base.some((p) => p.category === c));
  const availableSizes = Array.from(new Set(base.flatMap((p) => p.sizes)));

  const list = useMemo(() => {
    let r = base.filter((p) =>
      (cats.length === 0 || cats.includes(p.category)) &&
      (sizes.length === 0 || p.sizes.some((s) => sizes.includes(s))) &&
      (band === null || (p.price >= PRICE_BANDS[band].min && p.price <= PRICE_BANDS[band].max))
    );
    const d = (p: (typeof r)[number]) => 1 - p.price / p.mrp;
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "discount") r = [...r].sort((a, b) => d(b) - d(a));
    return r;
  }, [base, cats, sizes, band, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const activeCount = cats.length + sizes.length + (band !== null ? 1 : 0);
  const clear = () => { setCats([]); setSizes([]); setBand(null); };

  const Filters = (
    <div className="space-y-8">
      {availableCats.length > 1 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest">Category</p>
          <div className="space-y-2">{availableCats.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(cats, setCats, c)} className="h-4 w-4 accent-ink" />{c}</label>
          ))}</div>
        </div>
      )}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest">Size</p>
        <div className="flex flex-wrap gap-2">{availableSizes.map((s) => (
          <button key={s} onClick={() => toggle(sizes, setSizes, s)} className={`min-w-[2.5rem] border px-2.5 py-1.5 text-xs font-medium transition ${sizes.includes(s) ? "border-ink bg-ink text-white" : "border-neutral-300 hover:border-ink"}`}>{s}</button>
        ))}</div>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest">Price</p>
        <div className="space-y-2">{PRICE_BANDS.map((b, i) => (
          <label key={b.label} className="flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name="price" checked={band === i} onChange={() => setBand(i)} className="h-4 w-4 accent-ink" />{b.label}</label>
        ))}</div>
      </div>
      {activeCount > 0 && <button onClick={clear} className="text-xs font-semibold uppercase tracking-widest underline">Clear all filters</button>}
    </div>
  );

  return (
    <>
      <section className="relative h-56 overflow-hidden bg-ink md:h-72">
        <SafeImage src={collection.hero} alt={collection.title} priority className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-8 text-white md:px-8">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl font-semibold uppercase md:text-7xl">{collection.title}</motion.h1>
          <p className="mt-1 text-sm text-white/80">{collection.blurb}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
          <p className="text-sm text-neutral-500">{list.length} product{list.length !== 1 && "s"}</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest md:hidden"><SlidersHorizontal size={15} />Filters{activeCount > 0 && ` (${activeCount})`}</button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-neutral-300 bg-white px-3 py-2 text-xs font-medium uppercase tracking-wider outline-none">
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="hidden w-56 shrink-0 md:block">{Filters}</aside>
          <div className="flex-1">
            {list.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg font-medium">No products match your filters.</p>
                <button onClick={clear} className="mt-4 bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white">Clear filters</button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-6">
                <AnimatePresence>{list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-white p-6">
              <div className="mb-6 flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-widest">Filters</h3><button onClick={() => setOpen(false)} aria-label="Close"><X /></button></div>
              {Filters}
              <button onClick={() => setOpen(false)} className="mt-8 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-white">Show {list.length} results</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
