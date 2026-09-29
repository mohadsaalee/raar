"use client";
import { usePortal } from "@/components/PortalProvider";
import { Card, Forbidden, PageHead, Stat, Table, Td, Th } from "@/components/portal/ui";
import { BarChart, Donut, LineChart } from "@/components/portal/charts";
import { dayBuckets, dealerStats, isLiveOrder } from "@/data/portal";
import { getProductById, money } from "@/data/products";

const COLORS = ["#0b0b0c", "#7c3aed", "#0f766e", "#b45309", "#be123c", "#1d4ed8", "#64748b"];

export default function Analytics() {
  const { db, can } = usePortal();
  if (!can("analytics")) return <Forbidden what="analytics" />;
  const live = db.orders.filter(isLiveOrder); const revenue = live.reduce((s, o) => s + o.total, 0);
  const viaDealer = live.filter((o) => o.dealerId); const dealerRev = viaDealer.reduce((s, o) => s + o.total, 0);
  const comm = db.ledger.filter((l) => l.type === "commission" && l.status !== "Reversed").reduce((s, l) => s + l.amount, 0);
  const statusCount = ["Confirmed", "Packed", "Shipped", "Delivered", "Return Requested", "Returned", "Cancelled", "Pending Payment"].map((s, i) => ({ label: s, value: db.orders.filter((o) => o.status === s).length, color: COLORS[i % COLORS.length] })).filter((x) => x.value > 0);
  const byProd = new Map<string, number>(); live.forEach((o) => o.items.forEach((i) => byProd.set(i.productId, (byProd.get(i.productId) ?? 0) + i.qty * i.price)));
  const topProd = [...byProd.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const byCat = new Map<string, number>(); live.forEach((o) => o.items.forEach((i) => { const c = getProductById(i.productId)?.category ?? "Other"; byCat.set(c, (byCat.get(c) ?? 0) + i.qty * i.price); }));
  const cat = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value], i) => ({ label, value: Math.round(value / 1000), color: COLORS[i] }));
  const dealers = db.dealers.map((d) => ({ d, s: dealerStats(db, d.id) })).filter((x) => x.s.orderCount > 0).sort((a, b) => b.s.sales - a.s.sales);
  const returnRate = db.orders.length ? Math.round((db.orders.filter((o) => o.status === "Returned" || o.status === "Return Requested").length / db.orders.length) * 100) : 0;
  return (
    <>
      <PageHead title="Analytics" sub="Sales, dealer performance and commission." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Net revenue" value={money(revenue)} tone="green" /><Stat label="Dealer-driven share" value={`${revenue ? Math.round((dealerRev / revenue) * 100) : 0}%`} sub={money(dealerRev)} tone="violet" /><Stat label="Commission cost" value={money(comm)} sub={`${dealerRev ? Math.round((comm / dealerRev) * 100) : 0}% of dealer sales`} tone="amber" /><Stat label="Return rate" value={`${returnRate}%`} tone="red" /></div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2"><Card title="Revenue, last 30 days"><LineChart data={dayBuckets(live, 30, (o) => o.date, (o) => o.total)} fmt={money} /></Card><Card title="Dealer-attributed sales, last 30 days"><BarChart data={dayBuckets(viaDealer, 30, (o) => o.date, (o) => o.total)} color="#7c3aed" fmt={money} /></Card></div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2"><Card title="Orders by status"><Donut data={statusCount} /></Card><Card title="Revenue by category (₹ thousands)"><Donut data={cat} /></Card></div>
      <div className="grid gap-6 lg:grid-cols-2"><Card title="Top products" pad={false}><Table><thead><tr><Th>Product</Th><Th right>Revenue</Th></tr></thead><tbody>{topProd.map(([id, v]) => <tr key={id}><Td>{getProductById(id)?.name}</Td><Td right>{money(v)}</Td></tr>)}</tbody></Table></Card>
        <Card title="Dealer leaderboard" pad={false}><Table><thead><tr><Th>Dealer</Th><Th right>Orders</Th><Th right>Sales</Th></tr></thead><tbody>{dealers.map(({ d, s }) => <tr key={d.id}><Td>{d.name}</Td><Td right>{s.orderCount}</Td><Td right>{money(s.sales)}</Td></tr>)}</tbody></Table></Card></div>
    </>
  );
}
