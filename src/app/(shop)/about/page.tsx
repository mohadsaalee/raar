import Reveal from "@/components/Reveal";

const SECTIONS = [
  ["About RAAR", "RAAR Virtual Shoppe blends modern fashion retail with a virtual dealership network. Customers shop a curated catalogue online, while Virtual Dealers share their own storefronts and earn commission on eligible sales."],
  ["Shipping policy", "Orders are dispatched within 24 hours. Delivery takes 3–5 business days across India. Shipping is free on orders above ₹1,499; otherwise a flat ₹79 applies."],
  ["Returns & refunds", "Items can be returned within 7 days of delivery if unused and in original packaging. Refunds are processed to the original payment method after inspection."],
  ["Contact us", "Email support@raar.example · Phone +91 00000 00000 · Monday to Saturday, 10am – 6pm IST."],
  ["Privacy & terms", "We collect only the information required to fulfil your orders and never sell personal data. Full policy and terms are provided here before launch."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-5xl font-semibold uppercase">About & policies</h1>
      <div className="mt-10 space-y-10">
        {SECTIONS.map(([t, b]) => (
          <Reveal key={t}><h2 className="text-sm font-semibold uppercase tracking-widest">{t}</h2><p className="mt-2 leading-relaxed text-neutral-600">{b}</p></Reveal>
        ))}
      </div>
    </div>
  );
}
