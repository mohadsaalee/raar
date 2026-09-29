import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "@/data/products";
import CollectionView from "@/components/CollectionView";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const c = getCollection(params.slug);
  if (!c) notFound();
  return <CollectionView slug={c.slug} />;
}
