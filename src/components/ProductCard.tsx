"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Product, money, discountPct } from "@/data/products";
import { useStore } from "./StoreProvider";
import SafeImage from "./SafeImage";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { wishlist, toggleWishlist, addToCart, showToast } = useStore();
  const [hover, setHover] = useState(false);
  const liked = wishlist.includes(product.id);
  const isNew = product.tags.includes("new");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <SafeImage src={product.images[0]} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
          <SafeImage src={product.images[1] ?? product.images[0]} alt={`${product.name} alternate view`} className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && <span className="bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">New</span>}
          {discountPct(product) >= 32 && <span className="bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">{discountPct(product)}% off</span>}
        </div>

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110"
        >
          <Heart size={16} className={liked ? "fill-accent text-accent" : "text-ink"} />
        </button>

        {/* Quick add */}
        <motion.div
          initial={false}
          animate={{ y: hover ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-x-0 bottom-0 hidden bg-white/95 p-3 backdrop-blur md:block"
        >
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Quick add</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => { addToCart(product, s, product.colors[0].name); showToast(`${product.name} (${s}) added`); }}
                className="min-w-[2.25rem] border border-neutral-300 px-2 py-1.5 text-xs font-medium transition hover:border-ink hover:bg-ink hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="pt-3">
        <p className="text-[11px] uppercase tracking-widest text-neutral-500">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="mt-0.5 block text-sm font-medium leading-snug hover:underline">{product.name}</Link>
        <div className="mt-1 flex items-baseline gap-2 text-sm">
          <span className="font-semibold">{money(product.price)}</span>
          <span className="text-xs text-neutral-400 line-through">{money(product.mrp)}</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {product.colors.map((c) => (
            <span key={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full border border-neutral-300" style={{ background: c.hex }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
