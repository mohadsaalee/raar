"use client";
import { useState } from "react";
import { AlertTriangle, Copy, MessageCircle, Sparkles, Trash2 } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import DealerGate from "@/components/portal/DealerGate";
import { Badge, Btn, Card, Field, PageHead, Select, Textarea } from "@/components/portal/ui";
import { CONTENT_TYPES, FESTIVALS, Lang, TONES, generate, riskyPhrase } from "@/components/portal/contentGen";
import { PRODUCTS, getProductById } from "@/data/products";
import { fmtDate } from "@/data/portal";

export default function Marketing() {
  const { dealer, db, saveContent, deleteContent } = usePortal(); const { showToast } = useStore();
  const [pid, setPid] = useState(PRODUCTS[0].id); const [type, setType] = useState<(typeof CONTENT_TYPES)[number]>(CONTENT_TYPES[0]);
  const [lang, setLang] = useState<Lang>((dealer?.language as Lang) || "English"); const [tone, setTone] = useState<(typeof TONES)[number]>("Friendly"); const [fest, setFest] = useState<(typeof FESTIVALS)[number]>("Onam");
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  if (!dealer) return null;
  const p = getProductById(pid)!; const link = `${window.location.origin}/store/${dealer.slug}?p=${p.slug}`;
  const warn = text ? riskyPhrase(text) : null;
  const run = () => { setBusy(true); setTimeout(() => { setText(generate({ p, type, lang, tone, festival: fest, link, dealer: dealer.storeName, price: p.price, mrp: p.mrp })); setBusy(false); }, 700); };
  const mine = db.content.filter((c) => c.dealerId === dealer.id);

  return (
    <>
      <PageHead title="AI marketing" sub="Generate content in English, Malayalam or Tamil. Prices always come from RAAR; you review before sharing." />
      <DealerGate what="Marketing tools">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card title="Create content" className="lg:col-span-2">
            <div className="space-y-4">
              <Field label="Product"><Select value={pid} onChange={(e) => setPid(e.target.value)}>{PRODUCTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
              <Field label="Content type"><Select value={type} onChange={(e) => setType(e.target.value as typeof type)}>{CONTENT_TYPES.map((x) => <option key={x}>{x}</option>)}</Select></Field>
              {type === "Festival campaign" && <Field label="Festival"><Select value={fest} onChange={(e) => setFest(e.target.value as typeof fest)}>{FESTIVALS.map((x) => <option key={x}>{x}</option>)}</Select></Field>}
              <div className="grid grid-cols-2 gap-3"><Field label="Language"><Select value={lang} onChange={(e) => setLang(e.target.value as Lang)}><option>English</option><option>Malayalam</option><option>Tamil</option></Select></Field><Field label="Tone"><Select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)}>{TONES.map((x) => <option key={x}>{x}</option>)}</Select></Field></div>
              <Btn onClick={run} disabled={busy} className="w-full"><Sparkles size={15} />{busy ? "Generating…" : "Generate"}</Btn>
            </div>
          </Card>
          <Card title="Review & edit" className="lg:col-span-3">
            {!text ? <p className="py-16 text-center text-sm text-neutral-500">Your generated content will appear here for review.</p> : (<>
              <Textarea rows={11} value={text} onChange={(e) => setText(e.target.value)} />
              {warn && <p className="mt-2 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={16} className="mt-0.5 shrink-0" />This text contains wording that could be read as an income guarantee. Please remove it. RAAR does not allow guaranteed-income claims.</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn variant="success" disabled={!!warn} onClick={() => { saveContent({ productId: pid, type, lang, text }); showToast("Approved & saved to library"); }}>Approve & save</Btn>
                <Btn variant="outline" onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); showToast("Copied"); }}><Copy size={14} />Copy</Btn>
                <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"><Btn variant="outline" disabled={!!warn}><MessageCircle size={14} />WhatsApp</Btn></a>
                <Btn variant="ghost" onClick={run}>Regenerate</Btn>
              </div>
            </>)}
          </Card>
        </div>
        <Card title={`Saved content (${mine.length})`} className="mt-6">
          {mine.length === 0 ? <p className="text-sm text-neutral-500">Approved content is saved here for reuse.</p> : <div className="grid gap-4 md:grid-cols-2">{mine.map((c) => (
            <div key={c.id} className="rounded-lg border border-neutral-200 p-4"><div className="mb-2 flex items-center justify-between gap-2"><div className="flex flex-wrap gap-1.5"><Badge s={c.type} tone="purple" /><Badge s={c.lang} tone="blue" /></div><button onClick={() => deleteContent(c.id)} aria-label="Delete" className="text-neutral-400 hover:text-red-600"><Trash2 size={15} /></button></div>
              <p className="whitespace-pre-line text-sm text-neutral-700">{c.text}</p><p className="mt-2 text-xs text-neutral-400">{getProductById(c.productId)?.name} · {fmtDate(c.at)}</p></div>))}</div>}
        </Card>
      </DealerGate>
    </>
  );
}
