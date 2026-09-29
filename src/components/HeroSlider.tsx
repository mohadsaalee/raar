"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "./SafeImage";

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;
const SLIDES = [
  { img: u("1490481651871-ab68de25d43d"), kicker: "New Season", title: "Wear the\nMoment", cta: "Shop New Arrivals", href: "/collections/new-arrivals" },
  { img: u("1489987707025-afc232f7ea0f"), kicker: "Menswear", title: "Sharp.\nEffortless.", cta: "Shop Men", href: "/collections/men" },
  { img: u("1512436991641-6745cdb1723f"), kicker: "Womenswear", title: "Made to\nMove", cta: "Shop Women", href: "/collections/women" },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} className="absolute inset-0">
          <SafeImage src={s.img} alt={s.title.replace("\n", " ")} priority className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-center px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">{s.kicker}</p>
            <h1 className="whitespace-pre-line font-display text-6xl font-semibold uppercase leading-[0.95] md:text-8xl">{s.title}</h1>
            <Link href={s.href} className="group mt-8 inline-flex items-center gap-3 bg-white px-8 py-4 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-accent hover:text-white">
              {s.cta} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        <button onClick={() => setI((i + SLIDES.length - 1) % SLIDES.length)} className="text-white/80 hover:text-white" aria-label="Previous"><ChevronLeft /></button>
        {SLIDES.map((_, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} className={`h-1 rounded-full transition-all ${n === i ? "w-10 bg-white" : "w-5 bg-white/40"}`} />
        ))}
        <button onClick={() => setI((i + 1) % SLIDES.length)} className="text-white/80 hover:text-white" aria-label="Next"><ChevronRight /></button>
      </div>
    </section>
  );
}
