"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/PortalProvider";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck, Link2, ShoppingBag, Sparkles, Store, UserPlus, Wallet } from "lucide-react";
import Reveal from "@/components/Reveal";
import SafeImage from "@/components/SafeImage";

const STEPS = [
  { icon: UserPlus, t: "Register", d: "Create your dealer profile in minutes." },
  { icon: ClipboardCheck, t: "Verify (KYC)", d: "Submit your details for review and approval." },
  { icon: Store, t: "Get your store", d: "Access the catalogue and your personal storefront." },
  { icon: Link2, t: "Share your link / QR", d: "Promote on WhatsApp, Instagram and more." },
  { icon: ShoppingBag, t: "Customers order", d: "RAAR handles payment, packing and delivery." },
  { icon: Wallet, t: "Earn commission", d: "Commission on eligible sales, tracked in your dashboard." },
];
const FEATURES = ["Personal storefront with your own link & QR", "Full RAAR product catalogue access", "AI-assisted marketing content (English, Malayalam, Tamil)", "Live dashboard: orders, sales, commission and customers", "Central fulfilment, shipping and returns handled by RAAR", "Dealer training and support"];

export default function DealerPage() {
  const [sent, setSent] = useState(false); const router = useRouter(); const { registerDealer } = usePortal();
  const [f, setF] = useState({ name: "", phone: "", email: "", city: "", password: "" }); const [err, setErr] = useState("");
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <SafeImage src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80" alt="RAAR" priority className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">RAAR Virtual Dealer Program</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.95] md:text-8xl">Build your own fashion business.</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 max-w-xl text-neutral-300">Become a RAAR Virtual Dealer: promote our catalogue digitally, share your personal store, and earn commission on eligible sales. No physical shop required.</motion.p>
          <a href="#apply" className="mt-8 inline-block bg-white px-8 py-4 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-accent hover:text-white">Apply now</a>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <Reveal><h2 className="mb-10 text-center font-display text-4xl font-semibold uppercase">How it works</h2></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.07}>
              <div className="relative h-full border border-neutral-200 bg-white p-7">
                <span className="absolute right-5 top-4 font-display text-4xl text-neutral-200">0{i + 1}</span>
                <s.icon size={28} strokeWidth={1.4} />
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-widest">{s.t}</h3>
                <p className="mt-2 text-sm text-neutral-600">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 md:grid-cols-2 md:px-8">
          <Reveal>
            <h2 className="font-display text-4xl font-semibold uppercase">What you get</h2>
            <ul className="mt-6 space-y-4">{FEATURES.map((f) => <li key={f} className="flex gap-3 text-sm"><Sparkles size={18} className="mt-0.5 shrink-0 text-gold" />{f}</li>)}</ul>
            <p className="mt-8 text-xs leading-relaxed text-neutral-500">Commission structure, eligibility and payout terms are set out in the RAAR dealer agreement. Earnings depend on sales and are not guaranteed.</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div id="apply" className="scroll-mt-32 bg-white p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <CheckCircle2 size={56} className="mx-auto text-green-600" />
                  <h3 className="mt-4 font-display text-3xl uppercase">Account created</h3>
                  <p className="mt-2 text-sm text-neutral-600">Taking you to your dealer portal to complete KYC…</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); const r = registerDealer(f); if (r.ok) { setSent(true); setTimeout(() => router.push("/dealer"), 1400); } else setErr(r.error ?? "Could not register"); }} className="space-y-4">
                  <h3 className="font-display text-3xl font-semibold uppercase">Apply to become a dealer</h3>
                  {([["name", "Full name", "text"], ["phone", "Mobile number", "tel"], ["email", "Email", "email"], ["city", "City / District", "text"], ["password", "Create a password (min 6 characters)", "password"]] as const).map(([k, l, t]) => (
                    <input key={k} required minLength={k === "password" ? 6 : 1} type={t} placeholder={l} value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setErr(""); }} className="w-full border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-ink" />
                  ))}
                  {err && <p className="text-sm text-accent">{err}</p>}
                  <label className="flex items-start gap-2 text-xs text-neutral-600"><input required type="checkbox" className="mt-0.5 accent-ink" />I agree to the RAAR dealer terms and to be contacted about the program.</label>
                  <button className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-white hover:bg-neutral-800">Create dealer account</button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
