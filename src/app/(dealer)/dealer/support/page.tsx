"use client";
import { useState } from "react";
import { Headphones, Plus } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Empty, Field, Input, Modal, PageHead, Textarea } from "@/components/portal/ui";
import { fmtDateTime, Ticket } from "@/data/portal";

export default function DealerSupport() {
  const { db, dealer, createTicket, replyTicket } = usePortal(); const { showToast } = useStore();
  const [newOpen, setNewOpen] = useState(false); const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [selId, setSelId] = useState<string | null>(null); const [reply, setReply] = useState("");
  if (!dealer) return null;
  const mine = db.tickets.filter((t) => t.from.id === dealer.id); const sel: Ticket | undefined = mine.find((t) => t.id === selId);
  return (
    <>
      <PageHead title="Support" sub="Questions about orders, commission or payouts? Raise a ticket." action={<Btn onClick={() => setNewOpen(true)}><Plus size={15} />New ticket</Btn>} />
      <Card pad={false}>{mine.length === 0 ? <Empty icon={Headphones} title="No tickets yet" text="Our team usually replies within one working day." /> : <ul className="divide-y divide-neutral-100">{mine.map((t) => (
        <li key={t.id}><button onClick={() => setSelId(t.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-neutral-50"><div><p className="font-medium">{t.subject}</p><p className="text-xs text-neutral-500">{t.id} · {fmtDateTime(t.createdAt)} · {t.messages.length} message{t.messages.length > 1 ? "s" : ""}</p></div><Badge s={t.status} /></button></li>))}</ul>}</Card>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New support ticket">
        <div className="space-y-4"><Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field><Field label="Describe your issue"><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setNewOpen(false)}>Cancel</Btn><Btn disabled={subject.length < 4 || body.length < 5} onClick={() => { const r = createTicket(subject, body); if (r.ok) { showToast(`Ticket ${r.id} created`); setNewOpen(false); setSubject(""); setBody(""); } }}>Submit</Btn></div></div>
      </Modal>
      <Modal open={!!sel} onClose={() => setSelId(null)} title={sel ? `${sel.id} · ${sel.subject}` : ""} wide>
        {sel && (<><div className="mb-4 max-h-80 space-y-3 overflow-y-auto">{sel.messages.map((m, i) => <div key={i} className={`rounded-lg p-3 text-sm ${m.from === "staff" ? "bg-neutral-100" : "bg-blue-50"}`}><p className="mb-1 text-xs font-semibold">{m.name} <span className="font-normal text-neutral-400">· {fmtDateTime(m.at)}</span></p>{m.text}</div>)}</div>
          <div className="flex gap-2"><Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" /><Btn disabled={!reply.trim()} onClick={() => { replyTicket(sel.id, reply.trim()); setReply(""); }}>Send</Btn></div></>)}
      </Modal>
    </>
  );
}
