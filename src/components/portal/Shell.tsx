"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ExternalLink, LogOut, LucideIcon, Menu, X } from "lucide-react";
import { usePortal } from "../PortalProvider";
import { Perm, ago } from "@/data/portal";
import { Skeleton } from "./ui";

export type NavItem = { href: string; label: string; icon: LucideIcon; perm?: Perm; exact?: boolean };

export default function Shell({ kind, nav, children }: { kind: "dealer" | "admin"; nav: NavItem[]; children: ReactNode }) {
  const { ready, session, dealer, staff, db, can, logout, markNotifsRead } = usePortal();
  const path = usePathname(); const router = useRouter();
  const [open, setOpen] = useState(false); const [bell, setBell] = useState(false);

  useEffect(() => { if (ready && session?.kind !== kind) router.replace(`/login?role=${kind}`); }, [ready, session, kind, router]);
  useEffect(() => setOpen(false), [path]);

  if (!ready || session?.kind !== kind || (kind === "dealer" ? !dealer : !staff)) return <Skeleton />;

  const me = kind === "dealer" ? dealer! : staff!;
  const toKey = kind === "admin" ? "admin" : dealer!.id;
  const notifs = db.notifs.filter((n) => n.to === toKey).slice(0, 12);
  const unread = notifs.filter((n) => !n.read).length;
  const items = nav.filter((n) => !n.perm || can(n.perm));
  const active = (n: NavItem) => (n.exact ? path === n.href : path === n.href || path.startsWith(n.href + "/"));
  const title = items.find(active)?.label ?? (kind === "admin" ? "Admin" : "Dealer portal");
  const roleLabel = kind === "admin" ? db.roles[staff!.role].label : dealer!.status;

  const Side = (
    <div className="flex h-full flex-col bg-ink text-neutral-300">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link href={kind === "admin" ? "/admin" : "/dealer"} className="font-display text-2xl tracking-[0.2em] text-white">RAAR</Link>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">{kind === "admin" ? "Admin" : "Dealer"}</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((n) => (
          <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active(n) ? "bg-white text-ink font-medium" : "hover:bg-white/10 hover:text-white"}`}>
            <n.icon size={17} />{n.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-white">{me.name}</p>
        <p className="mb-3 truncate text-xs text-neutral-400">{roleLabel}</p>
        <div className="flex gap-2">
          <Link href="/" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 py-2 text-xs hover:bg-white/10"><ExternalLink size={13} />Storefront</Link>
          <button onClick={() => { logout(); router.push("/login"); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 py-2 text-xs hover:bg-white/10"><LogOut size={13} />Sign out</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f2]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{Side}</aside>
      <AnimatePresence>
        {open && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
          <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.25 }} className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">{Side}</motion.aside></>)}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={22} /></button>
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <div className="relative flex items-center gap-4">
            <button onClick={() => { setBell(!bell); }} className="relative" aria-label="Notifications">
              <Bell size={20} />{unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{unread}</span>}
            </button>
            <div className="hidden text-right sm:block"><p className="text-sm font-medium leading-tight">{me.name}</p><p className="text-xs text-neutral-500">{roleLabel}</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{me.name[0]}</div>
            <AnimatePresence>
              {bell && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><p className="text-sm font-semibold">Notifications</p><div className="flex gap-3"><button onClick={() => markNotifsRead(toKey)} className="text-xs text-neutral-500 underline">Mark all read</button><button onClick={() => setBell(false)}><X size={15} /></button></div></div>
                  <ul className="max-h-80 divide-y divide-neutral-100 overflow-y-auto">
                    {notifs.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">Nothing new</li>}
                    {notifs.map((n) => (<li key={n.id}><Link href={n.href ?? "#"} onClick={() => setBell(false)} className={`block px-4 py-3 hover:bg-neutral-50 ${n.read ? "" : "bg-blue-50/40"}`}><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-neutral-600">{n.body}</p><p className="mt-0.5 text-[10px] text-neutral-400">{ago(n.at)}</p></Link></li>))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
