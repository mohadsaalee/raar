import Link from "next/link";
import { ArrowRight, BadgeCheck, RotateCcw, ShieldCheck, Truck, Store, Share2, Wallet } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ProductRail from "@/components/ProductRail";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import SafeImage from "@/components/SafeImage";
import { PRODUCTS } from "@/data/products";

const u = (id: string, w = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATS = [
  { title: "Men", href: "/collections/men", img: u("1507003211169-0a1dd7228f2d") },
  { title: "Women", href: "/collections/women", img: u("1515886657613-9f3515b0c78f") },
  { title: "Ethnic", href: "/collections/ethnic", img: u("1610030469983-98e550d6193c") },
  { title: "Footwear", href: "/collections/footwear", img: u("1542291026-7eec264c27ff") },
];

const PERKS = [
  { icon: Truck, t: "Free Shipping", d: "On orders above ₹1,499" },
  { icon: RotateCcw, t: "Easy Returns", d: "7-day hassle-free returns" },
  { icon: ShieldCheck, t: "Secure Payments", d: "UPI, cards & net banking" },
  { icon: BadgeCheck, t: "Quality Assured", d: "Checked before dispatch" },
];

export default function Home() {
  const newIn = PRODUCTS.filter((p) => p.tags.includes("new")).slice(0, 4);
  const best = PRODUCTS.filter((p) => p.tags.includes("bestseller")).slice(0, 4);
  const insta = [u("1441984904996-e0b6ba687e04", 600), u("1523381210434-271e8be1f52b", 600), u("1445205170230-053b83016050", 600), u("1529139574466-a303027c1d8b", 600), u("1556905055-8f358a7a47b2", 600), u("1483985988355-763728e1935b", 600)];

  return (
    <>
      <HeroSlider />

      {/* Categories */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <Reveal><h2 className="mb-8 font-display text-3xl font-semibold uppercase tracking-wide md:text-4xl">Shop by category</h2></Reveal>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {CATS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Link href={c.href} className="group relative block aspect-[3/4] overflow-hidden bg-sand">
                <SafeImage src={c.img} alt={c.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <span className="font-display text-2xl uppercase tracking-wider">{c.title}</span>
                  <ArrowRight className="transition group-hover:translate-x-1" size={20} />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <ProductRail title="New Arrivals" sub="Fresh drops, just landed" products={newIn} href="/collections/new-arrivals" />

      {/* Promo banner */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden bg-ink">
            <SafeImage src={u("1556905055-8f358a7a47b2", 2000)} alt="Sale" className="absolute inset-0 h-full w-full object-cover opacity-50" />
            <div className="relative z-10 flex flex-col items-start gap-4 px-8 py-20 text-white md:px-16 md:py-28">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Limited time</span>
              <h2 className="font-display text-5xl font-semibold uppercase leading-none md:text-7xl">Up to 40% off</h2>
              <p className="max-w-md text-sm text-neutral-300">Use code <strong className="text-white">RAAR10</strong> at checkout for an extra 10% off your bag.</p>
              <Link href="/collections/sale" className="mt-2 bg-white px-8 py-4 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-accent hover:text-white">Shop the sale</Link>
            </div>
          </div>
        </Reveal>
      </section>

      <ProductRail title="Bestsellers" sub="The pieces everyone keeps re-ordering" products={best} href="/collections/bestsellers" />

      {/* Dealer CTA */}
      <section className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        <div className="grid overflow-hidden bg-sand md:grid-cols-2">
          <Reveal className="flex flex-col justify-center gap-5 p-8 md:p-16">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">RAAR Virtual Dealer Program</span>
            <h2 className="font-display text-4xl font-semibold uppercase leading-tight md:text-5xl">Your own store. No shop needed.</h2>
            <p className="text-sm leading-relaxed text-neutral-600">Get access to the RAAR catalogue, share your personal store link or QR code, and let RAAR handle fulfilment. You earn commission on eligible sales.</p>
            <div className="grid grid-cols-3 gap-3 py-2 text-center text-xs">
              {[[Store, "Personal store"], [Share2, "Share & sell"], [Wallet, "Earn commission"]].map(([I, l]) => {
                const Icon = I as typeof Store;
                return <div key={l as string} className="bg-white p-4"><Icon className="mx-auto mb-2" size={22} />{l as string}</div>;
              })}
            </div>
            <Link href="/become-a-dealer" className="inline-flex w-fit items-center gap-3 bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-accent">Become a dealer <ArrowRight size={16} /></Link>
          </Reveal>
          <div className="relative min-h-[320px]"><SafeImage src={u("1441984904996-e0b6ba687e04", 1400)} alt="RAAR dealer" className="absolute inset-0 h-full w-full object-cover" /></div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-4 py-16 md:grid-cols-4 md:px-8">
        {PERKS.map((p, i) => (
          <Reveal key={p.t} delay={i * 0.07} className="flex flex-col items-center text-center">
            <p.icon size={30} strokeWidth={1.4} />
            <p className="mt-3 text-sm font-semibold uppercase tracking-widest">{p.t}</p>
            <p className="mt-1 text-xs text-neutral-500">{p.d}</p>
          </Reveal>
        ))}
      </section>

      <Testimonials />

      {/* Social grid */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <Reveal className="mb-8 text-center">
          <h2 className="font-display text-3xl font-semibold uppercase tracking-wide md:text-4xl">#WearRAAR</h2>
          <p className="mt-1 text-sm text-neutral-500">Tag us to be featured</p>
        </Reveal>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {insta.map((src, i) => (
            <Reveal key={i} delay={i * 0.05}><div className="aspect-square overflow-hidden bg-sand"><SafeImage src={src} alt="RAAR community" className="h-full w-full object-cover transition duration-500 hover:scale-110" /></div></Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
