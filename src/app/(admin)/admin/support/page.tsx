"use client";
import { useState } from "react";
import { Headphones } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Empty, Forbidden, Input, Modal, PageHead, Select, Table, Td, Th } from "@/components/portal/ui";
import { Ticket, fmtDateTime } from "@/data/portal";

export default function AdminSupport() {
  const { db, can, replyTicket, setTicketStatus } = usePortal(); const { showToast } = useStore();
  const [st, setSt] = useState("All"); const [selId, setSelId] = useState<string | null>(null); const [reply, setReply] = useState("");
  if (!can("support")) return <Forbidden what="support tickets" />;
  const list = db.tickets.filter((t) => st === "All" || t.status === st); const sel: Ticket | undefined = db.tickets.find((t) => t.id === selId);
  return (
    <>
      <PageHead title="Support tickets" sub={`${db.tickets.filter((t) => t.status !== "Resolved").length} open`} action={<Select className="w-40" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Open", "In progress", "Resolved"].map((s) => <option key={s}>{s}</option>)}</Select>} />
      <Card pad={false}>{list.length === 0 ? <Empty icon={Headphones} title="No tickets" /> : <Table><thead><tr><Th>Ticket</Th><Th>From</Th><Th>Subject</Th><Th>Opened</Th><Th>Status</Th></tr></thead><tbody>{list.map((t) => <tr key={t.id} onClick={() => setSelId(t.id)} className="cursor-pointer hover:bg-neutral-50"><Td className="font-medium">{t.id}</Td><Td>{t.from.name} <span className="text-xs text-neutral-400">({t.from.kind})</span></Td><Td>{t.subject}</Td><Td>{fmtDateTime(t.createdAt)}</Td><Td><Badge s={t.status} /></Td></tr>)}</tbody></Table>}</Card>
      <Modal open={!!sel} onClose={() => setSelId(null)} title={sel ? `${sel.id} · ${sel.subject}` : ""} wide>
        {sel && (<><div className="mb-3 flex items-center gap-3"><Badge s={sel.status} /><Select className="w-40" value={sel.status} onChange={(e) => { const r = setTicketStatus(sel.id, e.target.value as Ticket["status"]); showToast(r.ok ? "Status updated" : r.error ?? ""); }}>{["Open", "In progress", "Resolved"].map((s) => <option key={s}>{s}</option>)}</Select></div>
          <div className="mb-4 max-h-72 space-y-3 overflow-y-auto">{sel.messages.map((m, i) => <div key={i} className={`rounded-lg p-3 text-sm ${m.from === "staff" ? "bg-neutral-100" : "bg-blue-50"}`}><p className="mb-1 text-xs font-semibold">{m.name} <span className="font-normal text-neutral-400">· {fmtDateTime(m.at)}</span></p>{m.text}</div>)}</div>
          <div className="flex gap-2"><Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" /><Btn disabled={!reply.trim()} onClick={() => { const r = replyTicket(sel.id, reply.trim()); if (r.ok) setReply(""); }}>Send</Btn></div></>)}
      </Modal>
    </>
  );
}
