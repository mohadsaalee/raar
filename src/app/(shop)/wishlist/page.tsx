"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { PRODUCTS } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <h1 className="mb-8 font-display text-4xl font-semibold uppercase">Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Heart size={52} className="text-neutral-300" />
          <p className="text-neutral-500">Tap the heart on any product to save it here.</p>
          <Link href="/collections/all" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">{items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
      )}
    </div>
  );
}
