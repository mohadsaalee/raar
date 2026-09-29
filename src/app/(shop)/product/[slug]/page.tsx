import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import ProductView from "@/components/ProductView";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  return { title: p ? `${p.name} — RAAR` : "RAAR" };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p) notFound();
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.category === p.category || x.gender === p.gender)).slice(0, 4);
  return <ProductView product={p} related={related} />;
}
