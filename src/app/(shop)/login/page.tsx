"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Crown, Store, User } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";

type Role = "customer" | "dealer" | "admin";
const DEMOS: Record<Exclude<Role, "customer">, { label: string; email: string; note: string }[]> = {
  dealer: [
    { label: "Active dealer", email: "dealer@raar.demo", note: "Anjali · full access, orders & commission" },
    { label: "KYC under review", email: "pending@raar.demo", note: "Sneha · locked until approved" },
    { label: "New dealer", email: "new@raar.demo", note: "Aswin · start onboarding" },
    { label: "Suspended", email: "vishnu@raar.demo", note: "Vishnu · access blocked" },
  ],
  admin: [
    { label: "Super Admin", email: "admin@raar.demo", note: "Everything" },
    { label: "Operations", email: "ops@raar.demo", note: "Orders, KYC, inventory, returns" },
    { label: "Finance", email: "finance@raar.demo", note: "Commission, payouts, analytics" },
    { label: "Support", email: "support@raar.demo", note: "Tickets & customers only" },
  ],
};

function LoginInner() {
  const sp = useSearchParams(); const router = useRouter(); const { login } = usePortal(); const { showToast } = useStore();
  const [role, setRole] = useState<Role>((["dealer", "admin"].includes(sp.get("role") ?? "") ? sp.get("role") : "dealer") as Role);
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");

  const go = (e: string, p: string) => { const r = login(e, p, role as "dealer" | "admin"); if (r.ok) router.push(role === "admin" ? "/admin" : "/dealer"); else setErr(r.error ?? "Sign in failed"); };
  const tabs: { k: Role; l: string; i: typeof User }[] = [{ k: "customer", l: "Customer", i: User }, { k: "dealer", l: "Dealer", i: Store }, { k: "admin", l: "Staff / Admin", i: Crown }];
  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="text-center font-display text-4xl font-semibold uppercase">Sign in</h1>
      <div className="mt-8 grid grid-cols-3 border border-neutral-300 text-xs font-semibold uppercase tracking-widest">{tabs.map((t) => <button key={t.k} onClick={() => { setRole(t.k); setErr(""); }} className={`flex items-center justify-center gap-1.5 py-3 transition ${role === t.k ? "bg-ink text-white" : "hover:bg-neutral-100"}`}><t.i size={14} />{t.l}</button>)}</div>
      {role === "customer" ? (
        <div className="mt-8 border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600"><p>Customers can shop and check out as guests. Track any order with your order number.</p><div className="mt-4 flex justify-center gap-3"><Link href="/track" className="bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white">Track an order</Link><Link href="/collections/all" className="border border-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest">Shop</Link></div></div>
      ) : (<>
        <form onSubmit={(e) => { e.preventDefault(); go(email, pw); }} className="mt-6 space-y-4">
          <input required type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="Email" className="w-full border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-ink" />
          <input required type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} placeholder="Password" className="w-full border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-ink" />
          {err && <p className="text-sm text-accent">{err}</p>}
          <button className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-white hover:bg-neutral-800">Sign in as {role === "admin" ? "staff" : "dealer"}</button>
        </form>
        <div className="mt-8 border border-dashed border-neutral-300 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">Demo accounts · password <code className="bg-neutral-100 px-1">demo123</code></p>
          <ul className="space-y-2">{DEMOS[role].map((d) => <li key={d.email}><button onClick={() => go(d.email, "demo123")} className="flex w-full items-center justify-between gap-3 border border-neutral-200 px-3 py-2.5 text-left text-sm transition hover:border-ink"><span><strong>{d.label}</strong><span className="block text-xs text-neutral-500">{d.note}</span></span><span className="text-xs text-neutral-400">Sign in →</span></button></li>)}</ul>
        </div>
        {role === "dealer" && <p className="mt-5 text-center text-sm text-neutral-600">Not a dealer yet? <Link href="/become-a-dealer" className="font-semibold underline">Apply here</Link></p>}
      </>)}
    </div>
  );
}
export default function LoginPage() { return <Suspense fallback={<div className="py-32 text-center text-neutral-400">Loading…</div>}><LoginInner /></Suspense>; }
