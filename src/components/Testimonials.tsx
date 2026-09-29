"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import Stars from "./Stars";

const T = [
  { q: "The fit and fabric quality genuinely surprised me. The tee is now my daily wear.", n: "Arjun M.", c: "Kochi" },
  { q: "Ordered a saree for Onam and it arrived in two days, beautifully packed.", n: "Lakshmi R.", c: "Thrissur" },
  { q: "As a RAAR dealer, sharing my store link on WhatsApp made selling simple.", n: "Fathima N.", c: "Kozhikode" },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % T.length), 4500); return () => clearInterval(t); }, []);
  return (
    <section className="bg-sand py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Quote className="mx-auto mb-6 text-neutral-400" size={36} />
        <div className="h-36 md:h-32">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }}>
              <p className="font-display text-2xl leading-snug md:text-3xl">“{T[i].q}”</p>
              <div className="mt-4 flex flex-col items-center gap-1"><Stars rating={5} /><span className="text-xs uppercase tracking-widest text-neutral-500">{T[i].n} · {T[i].c}</span></div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {T.map((_, n) => <button key={n} onClick={() => setI(n)} aria-label={`Testimonial ${n + 1}`} className={`h-1.5 rounded-full transition-all ${n === i ? "w-8 bg-ink" : "w-3 bg-neutral-400"}`} />)}
        </div>
      </div>
    </section>
  );
}
