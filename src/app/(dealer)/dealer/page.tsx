"use client";
import Link from "next/link";
import { ArrowRight, Clock, IndianRupee, Package, ShoppingBag, Users, Wallet } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { Badge, Btn, Card, PageHead, Stat, Table, Td, Th } from "@/components/portal/ui";
import { BarChart } from "@/components/portal/charts";
import { OnboardingSteps } from "@/components/portal/DealerGate";
import { TRAINING, dayBuckets, dealerStats, fmtDate, isLiveOrder } from "@/data/portal";
import { money } from "@/data/products";

export default function DealerDashboard() {
  const { db, dealer } = usePortal(); if (!dealer) return null;
  const s = dealerStats(db, dealer.id); const active = dealer.status === "Activated";
  const chart = dayBuckets(s.orders.filter(isLiveOrder), 14, (o) => o.date, (o) => o.subtotal - o.discount);
  const done = dealer.training.length;

  return (
    <>
      <PageHead title={`Welcome, ${dealer.name.split(" ")[0]}`} sub={`${dealer.code} · ${dealer.city}`} action={<Badge s={dealer.status} />} />
      {!active && (<Card className="mb-6" title={dealer.status === "Suspended" ? "Dealership suspended" : "Complete your onboarding"}>
        {dealer.status === "Suspended" ? <p className="text-sm text-neutral-600">Reason: {dealer.suspendedReason}. Contact support to appeal.</p> : <><OnboardingSteps /><Link href="/dealer/profile" className="mt-4 inline-block"><Btn>Continue onboarding <ArrowRight size={15} /></Btn></Link></>}
      </Card>)}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total sales" value={money(s.sales)} sub={`${s.orderCount} orders`} icon={IndianRupee} tone="green" />
        <Stat label="Available to withdraw" value={money(s.available)} sub="After hold period" icon={Wallet} tone="violet" />
        <Stat label="Commission in progress" value={money(s.pending + s.confirmed)} sub={`${money(s.pending)} pending · ${money(s.confirmed)} confirmed`} icon={Clock} tone="amber" />
        <Stat label="Customers" value={s.customers} sub="Attributed to your store" icon={Users} tone="blue" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card title="Sales, last 14 days" className="lg:col-span-2"><BarChart data={chart} color="#7c3aed" fmt={money} /></Card>
        <Card title="Quick actions">
          <div className="space-y-2">
            <Link href="/dealer/storefront" className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-ink">Share my store link / QR <ArrowRight size={15} /></Link>
            <Link href="/dealer/marketing" className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-ink">Generate marketing content <ArrowRight size={15} /></Link>
            <Link href="/dealer/catalogue" className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-ink">Browse product access <ArrowRight size={15} /></Link>
            <Link href="/dealer/payouts" className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-ink">Request a payout <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-5"><div className="mb-1 flex justify-between text-xs text-neutral-500"><span>Training progress</span><span>{done}/{TRAINING.length}</span></div><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full bg-ink transition-all" style={{ width: `${(done / TRAINING.length) * 100}%` }} /></div><Link href="/dealer/training" className="mt-2 inline-block text-xs underline">Continue training</Link></div>
        </Card>
      </div>

      <Card title="Recent orders" action={<Link href="/dealer/orders" className="text-xs underline">View all</Link>} pad={false}>
        {s.orders.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">No orders yet. Share your store link to get your first order.</p> : (
          <Table><thead><tr><Th>Order</Th><Th>Date</Th><Th>Items</Th><Th>Status</Th><Th right>Amount</Th><Th right>Commission</Th></tr></thead>
            <tbody>{s.orders.slice(0, 6).map((o) => (<tr key={o.id} className="hover:bg-neutral-50"><Td className="font-medium">{o.id}</Td><Td>{fmtDate(o.date)}</Td><Td>{o.items.reduce((n, i) => n + i.qty, 0)}</Td><Td><Badge s={o.status} /></Td><Td right>{money(o.total)}</Td><Td right>{isLiveOrder(o) ? money(o.commissionAmount) : "—"}</Td></tr>))}</tbody></Table>
        )}
      </Card>
      <p className="mt-4 flex items-center gap-2 text-xs text-neutral-500"><ShoppingBag size={13} /><Package size={13} />Commission is calculated by RAAR on eligible sales and is subject to the dealer agreement. Returns and cancellations reverse related commission.</p>
    </>
  );
}
