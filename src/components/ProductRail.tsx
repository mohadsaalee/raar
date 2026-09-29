import Link from "next/link";
import { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function ProductRail({ title, sub, products, href }: { title: string; sub?: string; products: Product[]; href: string }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-14 md:px-8">
      <Reveal className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold uppercase tracking-wide md:text-4xl">{title}</h2>
          {sub && <p className="mt-1 text-sm text-neutral-500">{sub}</p>}
        </div>
        <Link href={href} className="border-b border-ink pb-0.5 text-xs font-semibold uppercase tracking-widest">View all</Link>
      </Reveal>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
