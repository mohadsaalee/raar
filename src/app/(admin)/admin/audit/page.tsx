"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { Card, Forbidden, Input, PageHead, Select, Table, Td, Th } from "@/components/portal/ui";
import { fmtDateTime } from "@/data/portal";

export default function AuditLogs() {
  const { db, can } = usePortal(); const [q, setQ] = useState(""); const [ent, setEnt] = useState("All");
  if (!can("audit")) return <Forbidden what="audit logs" />;
  const ents = ["All", ...Array.from(new Set(db.audit.map((a) => a.entity)))];
  const list = db.audit.filter((a) => (ent === "All" || a.entity === ent) && `${a.actor} ${a.action} ${a.entityId} ${a.reason ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Audit logs" sub="Who did what, when. Sensitive actions and security events are recorded automatically." />
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-neutral-100 p-4"><Input className="max-w-xs" placeholder="Search actor, action, reference" value={q} onChange={(e) => setQ(e.target.value)} /><Select className="w-40" value={ent} onChange={(e) => setEnt(e.target.value)}>{ents.map((s) => <option key={s}>{s}</option>)}</Select></div>
        <Table><thead><tr><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Entity</Th><Th>Change</Th><Th>Reason</Th></tr></thead>
          <tbody>{list.slice(0, 120).map((a) => <tr key={a.id} className="hover:bg-neutral-50"><Td className="whitespace-nowrap">{fmtDateTime(a.at)}</Td><Td>{a.actor}<p className="text-xs text-neutral-400">{a.role}</p></Td><Td className="font-medium">{a.action}</Td><Td>{a.entity} <span className="text-xs text-neutral-400">{a.entityId.slice(0, 12)}</span></Td><Td className="max-w-xs text-xs text-neutral-600">{a.before && <span className="line-through">{a.before}</span>}{a.before && a.after && " → "}{a.after}</Td><Td className="max-w-[14rem] text-xs text-neutral-600">{a.reason}</Td></tr>)}</tbody></Table>
        {list.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">No matching entries.</p>}
      </Card>
    </>
  );
}
