"use client";
import Link from "next/link";
import { useState } from "react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useStore } from "./StoreProvider";

export default function Footer() {
  const { showToast } = useStore();
  const [email, setEmail] = useState("");
  return (
    <footer className="mt-24 bg-ink text-neutral-300">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-5 md:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-4xl tracking-[0.2em] text-white">RAAR</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">Modern fashion, delivered. Shop the RAAR collection or become a Virtual Dealer and build your own digital store.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (email) { showToast("Subscribed. Welcome to RAAR!"); setEmail(""); } }} className="mt-6 flex max-w-sm">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 border border-neutral-700 bg-transparent px-4 py-3 text-sm outline-none focus:border-white" />
            <button className="bg-white px-5 text-xs font-semibold uppercase tracking-widest text-ink">Join</button>
          </form>
          <div className="mt-6 flex gap-4">
            {[Instagram, Facebook, Youtube, Twitter].map((I, i) => <a key={i} href="#" aria-label="Social" className="text-neutral-400 transition hover:text-white"><I size={20} /></a>)}
          </div>
        </div>
        <FooterCol title="Shop" links={[["New Arrivals", "/collections/new-arrivals"], ["Men", "/collections/men"], ["Women", "/collections/women"], ["Ethnic", "/collections/ethnic"], ["Sale", "/collections/sale"]]} />
        <FooterCol title="RAAR" links={[["About us", "/about"], ["Become a Dealer", "/become-a-dealer"], ["Track order", "/track"], ["Dealer / Admin login", "/login"], ["Wishlist", "/wishlist"]]} />
        <FooterCol title="Help" links={[["Shipping policy", "/about"], ["Returns & refunds", "/about"], ["Contact us", "/about"], ["Privacy policy", "/about"], ["Terms & conditions", "/about"]]} />
      </div>
      <div className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">© {new Date().getFullYear()} RAAR Virtual Shoppe. All rights reserved.</div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map(([l, h]) => <li key={l}><Link href={h} className="text-neutral-400 transition hover:text-white">{l}</Link></li>)}
      </ul>
    </div>
  );
}
