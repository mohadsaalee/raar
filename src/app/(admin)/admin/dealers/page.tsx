"use client";
import Link from "next/link";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { Badge, Btn, Card, Forbidden, Input, PageHead, Select, Table, Td, Th } from "@/components/portal/ui";
import { dealerStats, fmtDate } from "@/data/portal";
import { money } from "@/data/products";

export default function AdminDealers() {
  const { db, can } = usePortal(); const [q, setQ] = useState(""); const [st, setSt] = useState("All");
  if (!can("dealers")) return <Forbidden what="dealers" />;
  const list = db.dealers.filter((d) => (st === "All" || d.status === st) && `${d.name} ${d.email} ${d.code} ${d.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Dealers" sub={`${db.dealers.length} registered · ${db.dealers.filter((d) => d.status === "Activated").length} active`} />
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-neutral-100 p-4"><Input className="max-w-xs" placeholder="Search name, email, code, city" value={q} onChange={(e) => setQ(e.target.value)} /><Select className="w-44" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Registered", "KYC Pending", "KYC Rejected", "Approved", "Activated", "Suspended"].map((s) => <option key={s}>{s}</option>)}</Select></div>
        <Table><thead><tr><Th>Dealer</Th><Th>Code</Th><Th>City</Th><Th>Status</Th><Th>Joined</Th><Th right>Orders</Th><Th right>Sales</Th><Th /></tr></thead>
          <tbody>{list.map((d) => { const s = dealerStats(db, d.id); return (<tr key={d.id} className="hover:bg-neutral-50"><Td><p className="font-medium">{d.name}</p><p className="text-xs text-neutral-500">{d.email}</p></Td><Td>{d.code}</Td><Td>{d.city}</Td><Td><Badge s={d.status} /></Td><Td>{fmtDate(d.joinedAt)}</Td><Td right>{s.orderCount}</Td><Td right>{money(s.sales)}</Td><Td right><Link href={`/admin/dealers/${d.id}`}><Btn size="sm" variant="outline">Manage</Btn></Link></Td></tr>); })}</tbody></Table>
        {list.length === 0 && <p className="py-12 text-center text-sm text-neutral-500">No dealers match.</p>}
      </Card>
    </>
  );
}
