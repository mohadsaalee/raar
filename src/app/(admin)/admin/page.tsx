"use client";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Boxes, IndianRupee, RotateCcw, ShoppingBag, Store, Wallet } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { Badge, Card, Forbidden, PageHead, Stat, Table, Td, Th } from "@/components/portal/ui";
import { BarChart, LineChart } from "@/components/portal/charts";
import { dayBuckets, dealerStats, fmtDate, isLiveOrder } from "@/data/portal";
import { PRODUCTS, money } from "@/data/products";

export default function AdminDashboard() {
  const { db, can, staff } = usePortal();
  if (!can("dashboard")) return <Forbidden what="the dashboard" />;
  const live = db.orders.filter(isLiveOrder); const revenue = live.reduce((s, o) => s + o.total, 0);
  const today = new Date().toDateString(); const todays = live.filter((o) => new Date(o.date).toDateString() === today);
  const activeDealers = db.dealers.filter((d) => d.status === "Activated").length;
  const kycQ = db.dealers.filter((d) => d.kyc.status === "Pending").length;
  const payQ = db.payouts.filter((p) => p.status === "Requested" || p.status === "Approved");
  const retQ = db.returns.filter((r) => r.status === "Requested").length;
  const low = PRODUCTS.filter((p) => (db.stock[p.id] ?? 0) <= db.settings.lowStockAt);
  const pendingPay = db.orders.filter((o) => o.status === "Pending Payment").length;
  const rev = dayBuckets(live, 30, (o) => o.date, (o) => o.total);
  const orders14 = dayBuckets(live, 14, (o) => o.date, () => 1);
  const top = db.dealers.map((d) => ({ d, s: dealerStats(db, d.id) })).sort((a, b) => b.s.sales - a.s.sales).slice(0, 4);
  const alerts = [
    kycQ > 0 && { t: `${kycQ} dealer KYC awaiting review`, href: "/admin/kyc", tone: "amber" as const, p: "kyc" as const },
    payQ.length > 0 && { t: `${payQ.length} payout${payQ.length > 1 ? "s" : ""} awaiting action`, href: "/admin/payouts", tone: "amber" as const, p: "payouts" as const },
    retQ > 0 && { t: `${retQ} return request${retQ > 1 ? "s" : ""} to review`, href: "/admin/returns", tone: "purple" as const, p: "returns" as const },
    low.length > 0 && { t: `${low.length} product${low.length > 1 ? "s" : ""} low on stock`, href: "/admin/inventory", tone: "red" as const, p: "inventory" as const },
    pendingPay > 0 && { t: `${pendingPay} order${pendingPay > 1 ? "s" : ""} pending payment`, href: "/admin/orders", tone: "amber" as const, p: "orders" as const },
  ].filter(Boolean).filter((a) => can((a as { p: "kyc" }).p)) as { t: string; href: string; tone: "amber" | "purple" | "red"; p: string }[];

  return (
    <>
      <PageHead title={`Good day, ${staff?.name.split(" ")[0]}`} sub="Platform overview" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue (all live orders)" value={money(revenue)} sub={`${money(todays.reduce((s, o) => s + o.total, 0))} today`} icon={IndianRupee} tone="green" />
        <Stat label="Orders" value={live.length} sub={`${todays.length} today`} icon={ShoppingBag} tone="blue" />
        <Stat label="Active dealers" value={`${activeDealers} / ${db.dealers.length}`} sub={`${kycQ} KYC pending`} icon={Store} tone="violet" />
        <Stat label="Payouts awaiting" value={money(payQ.reduce((s, p) => s + p.amount, 0))} sub={`${payQ.length} request${payQ.length !== 1 ? "s" : ""}`} icon={Wallet} tone="amber" />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card title="Revenue, last 30 days" className="lg:col-span-2"><LineChart data={rev} fmt={money} /></Card>
        <Card title="Needs attention">
          {alerts.length === 0 ? <p className="py-6 text-center text-sm text-neutral-500">All clear 🎉</p> : <ul className="space-y-2">{alerts.map((a) => <li key={a.t}><Link href={a.href} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm hover:border-ink"><AlertTriangle size={16} className={a.tone === "red" ? "text-red-500" : a.tone === "purple" ? "text-violet-500" : "text-amber-500"} />{a.t}</Link></li>)}</ul>}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-neutral-500"><div className="rounded-lg bg-neutral-50 p-2"><BadgeCheck size={16} className="mx-auto mb-1" />{kycQ}<br />KYC</div><div className="rounded-lg bg-neutral-50 p-2"><RotateCcw size={16} className="mx-auto mb-1" />{retQ}<br />Returns</div><div className="rounded-lg bg-neutral-50 p-2"><Boxes size={16} className="mx-auto mb-1" />{low.length}<br />Low stock</div></div>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Orders per day (14d)"><BarChart data={orders14} height={180} /></Card>
        <Card title="Top dealers" pad={false}><Table><thead><tr><Th>Dealer</Th><Th>Status</Th><Th right>Sales</Th></tr></thead><tbody>{top.map(({ d, s }) => <tr key={d.id}><Td><Link href={`/admin/dealers/${d.id}`} className="font-medium hover:underline">{d.name}</Link></Td><Td><Badge s={d.status} /></Td><Td right>{money(s.sales)}</Td></tr>)}</tbody></Table></Card>
      </div>
      <Card title="Latest orders" className="mt-6" pad={false} action={<Link href="/admin/orders" className="text-xs underline">All orders</Link>}>
        <Table><thead><tr><Th>Order</Th><Th>Date</Th><Th>Customer</Th><Th>Status</Th><Th right>Total</Th></tr></thead><tbody>{db.orders.slice(0, 5).map((o) => <tr key={o.id}><Td className="font-medium">{o.id}</Td><Td>{fmtDate(o.date)}</Td><Td>{o.customer.name}</Td><Td><Badge s={o.status} /></Td><Td right>{money(o.total)}</Td></tr>)}</tbody></Table>
      </Card>
    </>
  );
}
