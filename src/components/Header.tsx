"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useStore } from "./StoreProvider";
import { usePortal } from "./PortalProvider";

const NAV = [
  { href: "/collections/new-arrivals", label: "New Arrivals" },
  { href: "/collections/men", label: "Men" },
  { href: "/collections/women", label: "Women" },
  { href: "/collections/ethnic", label: "Ethnic" },
  { href: "/collections/accessories", label: "Accessories" },
  { href: "/collections/sale", label: "Sale", accent: true },
  { href: "/become-a-dealer", label: "Become a Dealer" },
];

const ANNOUNCE = ["FREE SHIPPING ABOVE ₹1,499", "USE CODE RAAR10 FOR 10% OFF", "EASY 7-DAY RETURNS", "JOIN THE RAAR VIRTUAL DEALER NETWORK"];

export default function Header() {
  const { count, wishlist, setCartOpen, setSearchOpen } = useStore();
  const { session } = usePortal();
  const account = session ? (session.kind === "admin" ? "/admin" : "/dealer") : "/login";
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="overflow-hidden bg-ink py-2 text-white">
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap text-[11px] font-medium tracking-[0.2em]">
          {[...ANNOUNCE, ...ANNOUNCE, ...ANNOUNCE, ...ANNOUNCE].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <div className={`border-b bg-white/95 backdrop-blur transition-shadow ${scrolled ? "border-neutral-200 shadow-sm" : "border-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
          <button className="md:hidden" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={22} /></button>

          <Link href="/" className="font-display text-3xl font-semibold tracking-[0.18em]">RAAR</Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                className={`group relative text-[13px] font-medium uppercase tracking-wider ${n.accent ? "text-accent" : n.label === "Become a Dealer" ? "rounded-full border border-ink px-3 py-1.5 hover:bg-ink hover:text-white" : ""}`}>
                {n.label}
                {n.label !== "Become a Dealer" && <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all group-hover:w-full" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={20} /></button>
            <Link href={account} aria-label="Account" className="hidden sm:block"><User size={20} /></Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden sm:block">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">{wishlist.length}</span>}
            </Link>
            <button onClick={() => setCartOpen(true)} aria-label="Open bag" className="relative">
              <ShoppingBag size={20} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setMenu(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-y-0 left-0 z-50 w-[82%] max-w-sm bg-white p-6">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-2xl tracking-[0.18em]">RAAR</span>
                <button onClick={() => setMenu(false)} aria-label="Close menu"><X size={22} /></button>
              </div>
              <nav className="flex flex-col">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className={`border-b border-neutral-100 py-4 text-sm font-medium uppercase tracking-widest ${n.accent ? "text-accent" : ""}`}>{n.label}</Link>
                ))}
                <Link href="/wishlist" onClick={() => setMenu(false)} className="border-b border-neutral-100 py-4 text-sm font-medium uppercase tracking-widest">Wishlist ({wishlist.length})</Link>
                <Link href="/login" onClick={() => setMenu(false)} className="py-4 text-sm font-medium uppercase tracking-widest">Login / Register</Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
