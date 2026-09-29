"use client";
import { Users } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { Card, Empty, PageHead, Table, Td, Th } from "@/components/portal/ui";
import { fmtDate, isLiveOrder, maskName } from "@/data/portal";
import { money } from "@/data/products";

export default function DealerCustomers() {
  const { db, dealer } = usePortal(); if (!dealer) return null;
  const map = new Map<string, { name: string; city: string; orders: number; spent: number; last: string }>();
  db.orders.filter((o) => o.dealerId === dealer.id).forEach((o) => {
    const k = o.customer.email.toLowerCase(); const c = map.get(k) ?? { name: o.customer.name, city: o.customer.city, orders: 0, spent: 0, last: o.date };
    c.orders += 1; if (isLiveOrder(o)) c.spent += o.total; if (o.date > c.last) c.last = o.date; map.set(k, c);
  });
  const rows = [...map.values()].sort((a, b) => b.spent - a.spent);
  return (
    <>
      <PageHead title="My customers" sub="Customers who ordered through your store. Contact details are protected." />
      <Card pad={false}>
        {rows.length === 0 ? <Empty icon={Users} title="No customers yet" text="Share your store link to get your first customer." /> : (
          <Table><thead><tr><Th>Customer</Th><Th>City</Th><Th right>Orders</Th><Th right>Spent</Th><Th>Last order</Th></tr></thead>
            <tbody>{rows.map((c, i) => <tr key={i} className="hover:bg-neutral-50"><Td className="font-medium">{maskName(c.name)}</Td><Td>{c.city}</Td><Td right>{c.orders}</Td><Td right>{money(c.spent)}</Td><Td>{fmtDate(c.last)}</Td></tr>)}</tbody></Table>
        )}
      </Card>
      <p className="mt-3 text-xs text-neutral-500">Who owns the customer relationship, and what a dealer may see, is governed by RAAR&apos;s dealer agreement and privacy policy.</p>
    </>
  );
}
