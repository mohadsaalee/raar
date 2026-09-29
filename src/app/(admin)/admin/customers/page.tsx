"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { Card, Forbidden, Input, PageHead, Table, Td, Th } from "@/components/portal/ui";
import { fmtDate, isLiveOrder } from "@/data/portal";
import { money } from "@/data/products";

export default function AdminCustomers() {
  const { db, can } = usePortal(); const [q, setQ] = useState("");
  if (!can("customers")) return <Forbidden what="customers" />;
  const map = new Map<string, { name: string; email: string; city: string; orders: number; spent: number; last: string; dealers: Set<string> }>();
  db.orders.forEach((o) => { const k = o.customer.email.toLowerCase(); const c = map.get(k) ?? { name: o.customer.name, email: o.customer.email, city: o.customer.city, orders: 0, spent: 0, last: o.date, dealers: new Set<string>() }; c.orders++; if (isLiveOrder(o)) c.spent += o.total; if (o.date > c.last) c.last = o.date; if (o.dealerId) c.dealers.add(db.dealers.find((d) => d.id === o.dealerId)?.name ?? ""); map.set(k, c); });
  const rows = [...map.values()].filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.spent - a.spent);
  return (
    <>
      <PageHead title="Customers" sub={`${map.size} customers`} />
      <Card pad={false}><div className="border-b border-neutral-100 p-4"><Input className="max-w-xs" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Table><thead><tr><Th>Customer</Th><Th>City</Th><Th>Via dealer</Th><Th right>Orders</Th><Th right>Spent</Th><Th>Last order</Th></tr></thead>
          <tbody>{rows.map((c) => <tr key={c.email} className="hover:bg-neutral-50"><Td><p className="font-medium">{c.name}</p><p className="text-xs text-neutral-500">{c.email}</p></Td><Td>{c.city}</Td><Td className="text-neutral-600">{[...c.dealers].join(", ") || "—"}</Td><Td right>{c.orders}</Td><Td right>{money(c.spent)}</Td><Td>{fmtDate(c.last)}</Td></tr>)}</tbody></Table></Card>
    </>
  );
}
