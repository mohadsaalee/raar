"use client";
import { useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download, ExternalLink, MessageCircle } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import DealerGate from "@/components/portal/DealerGate";
import { Btn, Card, Field, Input, PageHead } from "@/components/portal/ui";

const SWATCHES = ["#0b0b0c", "#7c3aed", "#0f766e", "#b45309", "#be123c", "#1d4ed8"];

export default function StorefrontPage() {
  const { dealer, saveStore } = usePortal(); const { showToast } = useStore();
  const [f, setF] = useState(() => dealer ? { storeName: dealer.storeName, tagline: dealer.tagline, whatsapp: dealer.whatsapp, accent: dealer.accent } : { storeName: "", tagline: "", whatsapp: "", accent: "#0b0b0c" });
  if (!dealer) return null;
  const url = `${window.location.origin}/store/${dealer.slug}`;
  const copy = () => { navigator.clipboard?.writeText(url).catch(() => {}); showToast("Store link copied"); };
  const downloadQr = () => { const c = document.getElementById("store-qr") as HTMLCanvasElement | null; if (!c) return; const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `${dealer.slug}-qr.png`; a.click(); };

  return (
    <>
      <PageHead title="My storefront" sub="Your personal RAAR store. Every order placed through your link or QR code is attributed to you." action={<Link href={`/store/${dealer.slug}`} target="_blank"><Btn variant="outline"><ExternalLink size={15} />Preview store</Btn></Link>} />
      <DealerGate what="Your storefront">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card title="Store link">
              <div className="flex gap-2"><Input readOnly value={url} /><Btn variant="outline" onClick={copy}><Copy size={14} />Copy</Btn></div>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Shop my RAAR store: ${url}`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-block"><Btn variant="success"><MessageCircle size={15} />Share on WhatsApp</Btn></a>
            </Card>
            <Card title="QR code">
              <div className="flex items-center gap-6"><div className="rounded-lg border border-neutral-200 p-3"><QRCodeCanvas id="store-qr" value={url} size={150} /></div><div><p className="mb-3 text-sm text-neutral-600">Print it on packaging, cards or posters. Scans open your store.</p><Btn variant="outline" onClick={downloadQr}><Download size={14} />Download PNG</Btn></div></div>
            </Card>
            <Card title="Attribution"><p className="text-sm text-neutral-600">When a customer opens your link, RAAR remembers you for a set window. Orders placed inside that window are attributed to you. Orders you place with your own email are not eligible.</p></Card>
          </div>
          <Card title="Customise your store">
            <div className="space-y-4">
              <Field label="Store name"><Input value={f.storeName} onChange={(e) => setF({ ...f, storeName: e.target.value })} /></Field>
              <Field label="Tagline"><Input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field>
              <Field label="WhatsApp number (with country code)"><Input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value.replace(/\D/g, "") })} /></Field>
              <Field label="Brand colour"><div className="flex gap-2">{SWATCHES.map((c) => <button key={c} onClick={() => setF({ ...f, accent: c })} aria-label={c} className={`h-8 w-8 rounded-full border-2 ${f.accent === c ? "border-ink ring-2 ring-offset-2 ring-ink" : "border-white"}`} style={{ background: c }} />)}</div></Field>
              <div className="overflow-hidden rounded-lg text-white" style={{ background: f.accent }}><div className="p-5"><p className="text-[10px] uppercase tracking-widest opacity-70">Preview</p><p className="font-display text-2xl uppercase">{f.storeName || "Your store"}</p><p className="text-sm opacity-80">{f.tagline}</p></div></div>
              <Btn onClick={() => { saveStore(f); showToast("Storefront updated"); }}>Save changes</Btn>
            </div>
          </Card>
        </div>
      </DealerGate>
    </>
  );
}
