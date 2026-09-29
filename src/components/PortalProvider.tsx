"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import {
  ALL_PERMS, DAY, DB, DB_VERSION, Dealer, Perm, Order, OrderItem, OrderStatus, RoleKey, Settings, Staff, Ticket,
  createSeed, emptyDB, effectivePct, dealerBalances, slugifyName, uid,
} from "@/data/portal";

export type Session = { kind: "dealer" | "admin"; id: string } | null;
export type Res = { ok: boolean; error?: string; id?: string };
const KEY = "raar_portal_v2", SKEY = "raar_session", RKEY = "raar_ref";
const iso = () => new Date().toISOString();
const ERR = (error: string): Res => ({ ok: false, error });

function useBuildPortal() {
  const { showToast } = useStore();
  const [db, setDb] = useState<DB>(emptyDB);
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<Session>(null);
  const [ref, setRefState] = useState<{ dealerId: string; at: number } | null>(null);
  const dbRef = useRef<DB>(db);
  const sessRef = useRef<Session>(null);

  useEffect(() => {
    let d: DB | null = null;
    try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); if (p.v === DB_VERSION) d = p; } } catch {}
    if (!d) d = createSeed();
    dbRef.current = d; setDb(d);
    try {
      const s = JSON.parse(localStorage.getItem(SKEY) || "null"); sessRef.current = s; setSessionState(s);
      setRefState(JSON.parse(localStorage.getItem(RKEY) || "null"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }, [db, ready]);

  const setSession = (s: Session) => { sessRef.current = s; setSessionState(s); try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch {} };

  /** synchronous transactional update: clone → mutate → commit */
  const commit = useCallback(<T,>(fn: (d: DB) => T): T => {
    const d = structuredClone(dbRef.current);
    const out = fn(d);
    dbRef.current = d; setDb(d);
    return out;
  }, []);

  const staffOf = (d: DB) => (sessRef.current?.kind === "admin" ? d.staff.find((s) => s.id === sessRef.current!.id && s.active) : undefined);
  const dealerOf = (d: DB) => (sessRef.current?.kind === "dealer" ? d.dealers.find((x) => x.id === sessRef.current!.id) : undefined);
  const can = (d: DB, p: Perm) => { const s = staffOf(d); return !!s && (s.role === "super_admin" || d.roles[s.role].perms.includes(p)); };
  const actor = (d: DB) => { const s = staffOf(d); if (s) return { name: s.name, role: d.roles[s.role].label }; const x = dealerOf(d); if (x) return { name: x.name, role: "Dealer" }; return { name: "System", role: "System" }; };
  const log = (d: DB, action: string, entity: string, entityId: string, o: { before?: string; after?: string; reason?: string } = {}) => {
    const a = actor(d); d.audit.unshift({ id: uid("a"), at: iso(), actor: a.name, role: a.role, action, entity, entityId, ...o });
  };
  const notify = (d: DB, to: string, title: string, body: string, href?: string) => d.notifs.unshift({ id: uid("n"), to, title, body, at: iso(), read: false, href });
  const denied = (): Res => { showToast("You don't have permission for this action"); return ERR("Permission denied"); };

  const dealer = useMemo(() => (session?.kind === "dealer" ? db.dealers.find((d) => d.id === session.id) ?? null : null), [db, session]);
  const staff = useMemo(() => (session?.kind === "admin" ? db.staff.find((s) => s.id === session.id) ?? null : null), [db, session]);
  const canUi = useCallback((p: Perm) => !!staff && (staff.role === "super_admin" || db.roles[staff.role].perms.includes(p)), [db, staff]);

  const refDealer = useMemo(() => {
    if (!ref) return null;
    if (Date.now() - ref.at > db.settings.attributionDays * DAY) return null;
    const d = db.dealers.find((x) => x.id === ref.dealerId);
    return d && d.status === "Activated" ? d : null;
  }, [ref, db]);

  /* ───── auth ───── */
  const login = (email: string, password: string, kind: "dealer" | "admin"): Res =>
    commit((d) => {
      const e = email.trim().toLowerCase();
      const acct = kind === "dealer" ? d.dealers.find((x) => x.email.toLowerCase() === e) : d.staff.find((x) => x.email.toLowerCase() === e);
      if (!acct || acct.password !== password || ("active" in acct && !acct.active)) {
        d.audit.unshift({ id: uid("a"), at: iso(), actor: e || "unknown", role: kind, action: "Failed login", entity: "Security", entityId: kind });
        return ERR("Incorrect email or password");
      }
      d.audit.unshift({ id: uid("a"), at: iso(), actor: acct.name, role: kind === "admin" ? d.roles[(acct as Staff).role].label : "Dealer", action: "Signed in", entity: "Security", entityId: acct.id });
      setSession({ kind, id: acct.id });
      return { ok: true, id: acct.id };
    });
  const logout = () => setSession(null);

  const registerDealer = (v: { name: string; email: string; phone: string; city: string; password: string }): Res =>
    commit((d) => {
      if (d.dealers.some((x) => x.email.toLowerCase() === v.email.toLowerCase())) return ERR("An account with this email already exists");
      const id = uid("d"); const n = d.dealers.length + 1;
      let slug = slugifyName(v.name); if (d.dealers.some((x) => x.slug === slug)) slug += "-" + n;
      d.dealers.push({
        id, name: v.name, email: v.email, password: v.password, phone: v.phone, city: v.city, code: "RAAR-D" + (2200 + n), slug, status: "Registered", joinedAt: iso(),
        kyc: { status: "Not submitted" }, storeName: `${v.name.split(" ")[0]}'s Store`, tagline: "Curated fashion, delivered to your door", whatsapp: "91" + v.phone.replace(/\D/g, "").slice(-10),
        accent: "#0b0b0c", featured: Object.keys(d.stock), commissionOverride: null, bank: null, mfa: false, training: [], language: "English",
      });
      notify(d, "admin", "New dealer registration", `${v.name} (${v.city}) registered.`, "/admin/dealers");
      setSession({ kind: "dealer", id });
      return { ok: true, id };
    });

  /* ───── customer side ───── */
  const setRef = (dealerId: string) => { const v = { dealerId, at: Date.now() }; setRefState(v); try { localStorage.setItem(RKEY, JSON.stringify(v)); } catch {} };

  const placeOrder = (input: { customer: Order["customer"]; items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number; payment: string }): Res =>
    commit((d) => {
      const need: Record<string, number> = {};
      input.items.forEach((i) => (need[i.productId] = (need[i.productId] || 0) + i.qty));
      for (const [pid, q] of Object.entries(need)) if ((d.stock[pid] ?? 0) < q) { const it = input.items.find((i) => i.productId === pid)!; return ERR(`"${it.name}" is out of stock (only ${d.stock[pid] ?? 0} left)`); }

      // attribution: valid window, active dealer, and not a self-order
      let dealerId: string | null = null; let pct = 0;
      try {
        const rf = JSON.parse(localStorage.getItem(RKEY) || "null");
        const dl = rf && d.dealers.find((x) => x.id === rf.dealerId);
        if (dl && dl.status === "Activated" && Date.now() - rf.at <= d.settings.attributionDays * DAY && dl.email.toLowerCase() !== input.customer.email.toLowerCase()) { dealerId = dl.id; pct = effectivePct(d, dl); }
      } catch {}
      const id = "RAAR-" + Math.floor(100000 + Math.random() * 900000);
      const cod = input.payment === "COD";
      const commissionAmount = dealerId ? Math.round(((input.subtotal - input.discount) * pct) / 100) : 0;
      const order: Order = {
        id, date: iso(), customer: input.customer, items: input.items, subtotal: input.subtotal, discount: input.discount, shipping: input.shipping, total: input.total,
        payment: input.payment === "upi" ? "UPI" : input.payment === "card" ? "Card" : input.payment === "net" ? "Net banking" : "COD",
        paymentStatus: cod ? "COD" : "Paid", status: "Confirmed", dealerId, commissionPct: pct, commissionAmount,
        history: [{ status: "Order placed", at: iso(), by: "Customer" }, { status: "Confirmed", at: iso(), by: "System" }],
      };
      d.orders.unshift(order);
      for (const [pid, q] of Object.entries(need)) {
        d.stock[pid] -= q;
        d.stockLog.unshift({ id: uid("sm"), productId: pid, delta: -q, reason: `Order ${id}`, by: "System", at: iso() });
        if (d.stock[pid] <= d.settings.lowStockAt) notify(d, "admin", "Low stock", `Only ${d.stock[pid]} units left for product ${pid}.`, "/admin/inventory");
      }
      if (dealerId) {
        d.ledger.unshift({ id: uid("led"), dealerId, orderId: id, type: "commission", amount: commissionAmount, status: "Pending", note: `${pct}% on ${id}`, date: iso() });
        notify(d, dealerId, "New order received", `Order ${id} placed through your store (₹${input.total.toLocaleString("en-IN")}).`, "/dealer/orders");
      }
      notify(d, "admin", "New order", `${id} · ₹${input.total.toLocaleString("en-IN")}${dealerId ? " · dealer-attributed" : ""}`, "/admin/orders");
      return { ok: true, id };
    });

  const trackOrder = (id: string, email: string) => dbRef.current.orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase() && o.customer.email.toLowerCase() === email.trim().toLowerCase()) ?? null;

  const requestReturn = (id: string, email: string, reason: string): Res =>
    commit((d) => {
      const o = d.orders.find((x) => x.id === id && x.customer.email.toLowerCase() === email.toLowerCase());
      if (!o) return ERR("Order not found");
      if (o.status !== "Delivered" || !o.deliveredAt) return ERR("Only delivered orders can be returned");
      if (Date.now() - new Date(o.deliveredAt).getTime() > d.settings.returnWindowDays * DAY) return ERR(`The ${d.settings.returnWindowDays}-day return window has closed`);
      o.status = "Return Requested"; o.history.push({ status: "Return Requested", at: iso(), by: "Customer" });
      d.returns.unshift({ id: uid("ret"), orderId: id, reason, status: "Requested", createdAt: iso(), refundAmount: o.total });
      notify(d, "admin", "Return requested", `${id}: ${reason}`, "/admin/returns");
      if (o.dealerId) notify(d, o.dealerId, "Return requested", `Customer requested a return on ${id}. Related commission is on hold.`, "/dealer/orders");
      return { ok: true };
    });

  /* ───── dealer actions ───── */
  const submitKyc = (docType: string, fileName: string): Res =>
    commit((d) => {
      const me = dealerOf(d); if (!me) return ERR("Not signed in");
      me.kyc = { status: "Pending", docType, fileName, submittedAt: iso() }; me.status = "KYC Pending";
      notify(d, "admin", "KYC awaiting review", `${me.name} submitted ${docType}.`, "/admin/kyc");
      return { ok: true };
    });
  const patchDealer = (fn: (me: Dealer, d: DB) => Res | void): Res => commit((d) => { const me = dealerOf(d); if (!me) return ERR("Not signed in"); return fn(me, d) ?? { ok: true }; });
  const saveProfile = (p: Partial<Pick<Dealer, "name" | "phone" | "city" | "language">>) => patchDealer((me) => { Object.assign(me, p); });
  const saveStore = (p: Partial<Pick<Dealer, "storeName" | "tagline" | "whatsapp" | "accent">>) => patchDealer((me) => { Object.assign(me, p); });
  const toggleFeatured = (pid: string) => patchDealer((me) => { me.featured = me.featured.includes(pid) ? me.featured.filter((x) => x !== pid) : [...me.featured, pid]; });
  const saveBank = (b: { holder: string; account: string; ifsc: string }) => patchDealer((me, d) => {
    me.bank = { holder: b.holder, account: b.account.length > 4 ? "XXXXXX" + b.account.slice(-4) : b.account, ifsc: b.ifsc.toUpperCase(), verified: false };
    notify(d, "admin", "Bank account added", `${me.name} added payout details for verification.`, "/admin/payouts");
  });
  const toggleTraining = (id: string) => patchDealer((me) => { me.training = me.training.includes(id) ? me.training.filter((x) => x !== id) : [...me.training, id]; });
  const setMfa = (on: boolean) => patchDealer((me) => { me.mfa = on; });
  const changePassword = (oldP: string, newP: string): Res => patchDealer((me) => { if (me.password !== oldP) return ERR("Current password is incorrect"); if (newP.length < 6) return ERR("New password must be at least 6 characters"); me.password = newP; });

  const requestPayout = (amount: number): Res =>
    commit((d) => {
      const me = dealerOf(d); if (!me) return ERR("Not signed in");
      if (me.status !== "Activated") return ERR("Your dealership must be active to request payouts");
      if (me.kyc.status !== "Approved") return ERR("KYC must be approved before payouts");
      if (!me.bank) return ERR("Add your bank account first");
      if (!me.bank.verified) return ERR("Your bank account is awaiting verification by RAAR");
      if (!Number.isFinite(amount) || amount < d.settings.minPayout) return ERR(`Minimum payout is ₹${d.settings.minPayout.toLocaleString("en-IN")}`);
      const { available } = dealerBalances(d, me.id);
      if (amount > available) return ERR("Amount exceeds your available balance");
      const id = "PO-" + (1001 + d.payouts.length);
      d.payouts.unshift({ id, dealerId: me.id, amount, status: "Requested", requestedAt: iso() });
      d.ledger.unshift({ id: uid("led"), dealerId: me.id, type: "payout", amount: -amount, status: "Reserved", note: `Payout ${id}`, date: iso() });
      notify(d, "admin", "Payout requested", `${me.name} requested ₹${amount.toLocaleString("en-IN")} (${id}).`, "/admin/payouts");
      return { ok: true, id };
    });

  const saveContent = (c: { productId: string; type: string; lang: string; text: string }) => patchDealer((me, d) => { d.content.unshift({ id: uid("c"), dealerId: me.id, at: iso(), ...c }); });
  const deleteContent = (id: string) => commit((d) => { d.content = d.content.filter((c) => c.id !== id); });

  /* ───── tickets & notifications ───── */
  const createTicket = (subject: string, text: string): Res =>
    commit((d) => {
      const me = dealerOf(d); if (!me) return ERR("Not signed in");
      const t: Ticket = { id: "TK-" + (2001 + d.tickets.length), from: { kind: "dealer", id: me.id, name: me.name }, subject, status: "Open", createdAt: iso(), messages: [{ from: "dealer", name: me.name, text, at: iso() }] };
      d.tickets.unshift(t); notify(d, "admin", "New support ticket", `${me.name}: ${subject}`, "/admin/support");
      return { ok: true, id: t.id };
    });
  const replyTicket = (id: string, text: string): Res =>
    commit((d) => {
      const t = d.tickets.find((x) => x.id === id); if (!t) return ERR("Ticket not found");
      const s = staffOf(d), me = dealerOf(d);
      if (s) { if (!can(d, "support")) return denied(); t.messages.push({ from: "staff", name: s.name, text, at: iso() }); if (t.status === "Open") t.status = "In progress"; if (t.from.id) notify(d, t.from.id, "Support replied", `${t.id}: ${text.slice(0, 60)}`, "/dealer/support"); log(d, "Ticket reply", "Ticket", id); }
      else if (me) { t.messages.push({ from: "dealer", name: me.name, text, at: iso() }); t.status = "Open"; notify(d, "admin", "Ticket reply", `${me.name} replied on ${id}`, "/admin/support"); }
      return { ok: true };
    });
  const setTicketStatus = (id: string, status: Ticket["status"]): Res => commit((d) => { if (!can(d, "support")) return denied(); const t = d.tickets.find((x) => x.id === id); if (!t) return ERR("Not found"); const b = t.status; t.status = status; log(d, "Ticket status", "Ticket", id, { before: b, after: status }); return { ok: true }; });
  const markNotifsRead = (to: string) => commit((d) => { d.notifs.forEach((n) => { if (n.to === to) n.read = true; }); });

  /* ───── admin actions ───── */
  const guard = (perm: Perm, fn: (d: DB) => Res): Res => commit((d) => (can(d, perm) ? fn(d) : denied()));

  const reviewKyc = (dealerId: string, approve: boolean, note: string): Res => guard("kyc", (d) => {
    const x = d.dealers.find((y) => y.id === dealerId); if (!x) return ERR("Dealer not found");
    const s = staffOf(d)!; const before = x.kyc.status;
    x.kyc = { ...x.kyc, status: approve ? "Approved" : "Rejected", reviewedAt: iso(), reviewedBy: s.name, note };
    x.status = approve ? "Approved" : "KYC Rejected";
    log(d, approve ? "KYC approved" : "KYC rejected", "Dealer", x.id, { before, after: x.kyc.status, reason: note });
    notify(d, x.id, approve ? "KYC approved" : "KYC rejected", approve ? "Your KYC is approved. RAAR will activate your dealership shortly." : `Your KYC was rejected: ${note}. Please resubmit.`, "/dealer/profile");
    return { ok: true };
  });
  const activateDealer = (dealerId: string): Res => guard("dealers", (d) => {
    const x = d.dealers.find((y) => y.id === dealerId); if (!x) return ERR("Dealer not found");
    if (x.kyc.status !== "Approved") return ERR("KYC must be approved before activation");
    const b = x.status; x.status = "Activated"; x.suspendedReason = undefined;
    log(d, "Dealer activated", "Dealer", x.id, { before: b, after: "Activated" });
    notify(d, x.id, "Dealership activated", "You now have product access, your storefront and marketing tools.", "/dealer");
    return { ok: true };
  });
  const suspendDealer = (dealerId: string, reason: string): Res => guard("dealers", (d) => {
    const x = d.dealers.find((y) => y.id === dealerId); if (!x) return ERR("Dealer not found");
    const b = x.status; x.status = "Suspended"; x.suspendedReason = reason;
    log(d, "Dealer suspended", "Dealer", x.id, { before: b, after: "Suspended", reason });
    notify(d, x.id, "Dealership suspended", reason, "/dealer");
    return { ok: true };
  });
  const setCommissionOverride = (dealerId: string, pct: number | null): Res => guard("commission", (d) => {
    const x = d.dealers.find((y) => y.id === dealerId); if (!x) return ERR("Dealer not found");
    if (pct !== null && (pct < 0 || pct > 100)) return ERR("Percentage must be between 0 and 100");
    const b = x.commissionOverride; x.commissionOverride = pct;
    log(d, "Commission rule changed", "Dealer", x.id, { before: b === null ? `default (${d.settings.commissionPct}%)` : `${b}%`, after: pct === null ? `default (${d.settings.commissionPct}%)` : `${pct}%` });
    return { ok: true };
  });
  const verifyBank = (dealerId: string): Res => guard("payouts", (d) => {
    const x = d.dealers.find((y) => y.id === dealerId); if (!x?.bank) return ERR("No bank account on file");
    x.bank.verified = true; log(d, "Bank account verified", "Dealer", x.id); notify(d, x.id, "Bank account verified", "You can now request payouts.", "/dealer/payouts"); return { ok: true };
  });

  const returnStock = (d: DB, o: Order, why: string) => o.items.forEach((i) => { d.stock[i.productId] = (d.stock[i.productId] ?? 0) + i.qty; d.stockLog.unshift({ id: uid("sm"), productId: i.productId, delta: i.qty, reason: `${why} ${o.id}`, by: actor(d).name, at: iso() }); });
  const reverseCommission = (d: DB, orderId: string, why: string) => d.ledger.forEach((l) => { if (l.orderId === orderId && l.type === "commission" && l.status !== "Reversed") { l.status = "Reversed"; l.note += ` · reversed (${why})`; } });

  const NEXT: Record<string, OrderStatus[]> = { "Pending Payment": ["Confirmed", "Cancelled"], Confirmed: ["Packed", "Cancelled"], Packed: ["Shipped", "Cancelled"], Shipped: ["Delivered"] };
  const updateOrderStatus = (orderId: string, next: OrderStatus, tracking?: string): Res => guard("orders_edit", (d) => {
    const o = d.orders.find((x) => x.id === orderId); if (!o) return ERR("Order not found");
    if (!(NEXT[o.status] || []).includes(next)) return ERR(`Cannot move an order from ${o.status} to ${next}`);
    if (next === "Shipped") { if (!tracking?.trim()) return ERR("Enter a tracking number"); o.tracking = tracking.trim(); }
    const before = o.status; o.status = next;
    if (next === "Confirmed") o.paymentStatus = "Paid";
    if (next === "Delivered") { o.deliveredAt = iso(); if (o.paymentStatus === "COD") o.paymentStatus = "Paid"; d.ledger.forEach((l) => { if (l.orderId === o.id && l.type === "commission" && l.status === "Pending") l.status = "Confirmed"; }); }
    if (next === "Cancelled") { returnStock(d, o, "Cancelled"); reverseCommission(d, o.id, "cancelled"); if (o.paymentStatus === "Paid") o.paymentStatus = "Refunded"; }
    o.history.push({ status: next, at: iso(), by: actor(d).name });
    log(d, "Order status changed", "Order", o.id, { before, after: next });
    if (o.dealerId) notify(d, o.dealerId, `Order ${next.toLowerCase()}`, `${o.id} is now ${next.toLowerCase()}.`, "/dealer/orders");
    return { ok: true };
  });

  const decideReturn = (returnId: string, approve: boolean, note: string): Res => guard("returns", (d) => {
    const r = d.returns.find((x) => x.id === returnId); if (!r || r.status !== "Requested") return ERR("Return not found or already decided");
    const o = d.orders.find((x) => x.id === r.orderId)!; const s = staffOf(d)!;
    r.decidedBy = s.name;
    if (approve) {
      r.status = "Refunded"; o.status = "Returned"; o.paymentStatus = "Refunded"; returnStock(d, o, "Return"); reverseCommission(d, o.id, "return");
      o.history.push({ status: "Returned", at: iso(), by: s.name });
      log(d, "Return approved & refunded", "Return", r.id, { after: `₹${r.refundAmount} refunded`, reason: note });
      if (o.dealerId) notify(d, o.dealerId, "Commission reversed", `Return approved on ${o.id}; the related commission was reversed.`, "/dealer/commission");
    } else {
      r.status = "Rejected"; o.status = "Delivered"; o.history.push({ status: "Return rejected", at: iso(), by: s.name });
      log(d, "Return rejected", "Return", r.id, { reason: note });
    }
    return { ok: true };
  });

  const releaseCommission = (entryId?: string): Res => guard("commission", (d) => {
    let n = 0; const dealers = new Set<string>();
    d.ledger.forEach((l) => {
      if (l.type !== "commission" || l.status !== "Confirmed") return;
      const o = d.orders.find((x) => x.id === l.orderId);
      const due = o?.deliveredAt && Date.now() - new Date(o.deliveredAt).getTime() >= d.settings.holdDays * DAY;
      if (entryId ? l.id === entryId : due) { l.status = "Available"; n++; dealers.add(l.dealerId); }
    });
    dealers.forEach((id) => notify(d, id, "Commission available", "New commission is now available for payout.", "/dealer/commission"));
    log(d, entryId ? "Commission released (manual)" : "Scheduled commission release", "Commission", entryId || "batch", { after: `${n} entr${n === 1 ? "y" : "ies"} → Available` });
    return { ok: true, id: String(n) };
  });
  const addAdjustment = (dealerId: string, amount: number, reason: string): Res => guard("commission", (d) => {
    if (!amount || !reason.trim()) return ERR("Amount and reason are required");
    d.ledger.unshift({ id: uid("led"), dealerId, type: "adjustment", amount, status: "Available", note: reason, date: iso() });
    log(d, "Manual commission adjustment", "Dealer", dealerId, { after: `${amount > 0 ? "+" : ""}₹${amount}`, reason });
    notify(d, dealerId, "Commission adjusted", `${amount > 0 ? "+" : "−"}₹${Math.abs(amount)}: ${reason}`, "/dealer/commission");
    return { ok: true };
  });

  const decidePayout = (id: string, action: "approve" | "paid" | "reject" | "fail", extra: { reference?: string; reason?: string } = {}): Res => guard("payouts", (d) => {
    const p = d.payouts.find((x) => x.id === id); if (!p) return ERR("Payout not found");
    const x = d.dealers.find((y) => y.id === p.dealerId)!; const res = d.ledger.find((l) => l.type === "payout" && l.note === `Payout ${id}`);
    if (action === "approve") {
      if (p.status !== "Requested") return ERR("Only requested payouts can be approved");
      if (x.kyc.status !== "Approved") return ERR("Dealer KYC is not approved");
      if (!x.bank?.verified) return ERR("Bank account is not verified");
      p.status = "Approved"; log(d, "Payout approved", "Payout", id, { after: `₹${p.amount}` });
      notify(d, x.id, "Payout approved", `${id} for ₹${p.amount.toLocaleString("en-IN")} is approved and will be processed.`, "/dealer/payouts");
    } else if (action === "paid") {
      if (p.status !== "Approved") return ERR("Approve the payout before marking it paid");
      if (!extra.reference?.trim()) return ERR("Enter the bank/UTR reference");
      p.status = "Paid"; p.processedAt = iso(); p.reference = extra.reference.trim(); if (res) res.status = "Paid";
      log(d, "Payout marked paid", "Payout", id, { after: `Paid · ${p.reference}` });
      notify(d, x.id, "Payout paid", `₹${p.amount.toLocaleString("en-IN")} was sent to your bank account (ref ${p.reference}).`, "/dealer/payouts");
    } else {
      if (p.status === "Paid") return ERR("A paid payout cannot be reversed here");
      if (!extra.reason?.trim()) return ERR("A reason is required");
      p.status = action === "reject" ? "Rejected" : "Failed"; p.reason = extra.reason; p.processedAt = iso(); if (res) res.status = "Voided";
      log(d, action === "reject" ? "Payout rejected" : "Payout failed", "Payout", id, { reason: extra.reason });
      notify(d, x.id, `Payout ${p.status.toLowerCase()}`, `${id}: ${extra.reason}. The amount is back in your available balance.`, "/dealer/payouts");
    }
    return { ok: true };
  });

  const adjustStock = (productId: string, delta: number, reason: string): Res => guard("inventory", (d) => {
    if (!delta || !reason.trim()) return ERR("Quantity and reason are required");
    const cur = d.stock[productId] ?? 0; if (cur + delta < 0) return ERR("Stock cannot go below zero");
    d.stock[productId] = cur + delta;
    d.stockLog.unshift({ id: uid("sm"), productId, delta, reason, by: actor(d).name, at: iso() });
    log(d, "Stock adjusted", "Product", productId, { before: String(cur), after: String(cur + delta), reason });
    return { ok: true };
  });

  const saveSettings = (patch: Partial<Settings>, reason: string): Res => guard("settings", (d) => {
    const before: string[] = [], after: string[] = [];
    (Object.keys(patch) as (keyof Settings)[]).forEach((k) => { if (d.settings[k] !== patch[k]) { before.push(`${k}=${d.settings[k]}`); after.push(`${k}=${patch[k]}`); (d.settings as any)[k] = patch[k]; } });
    if (!after.length) return ERR("No changes to save");
    log(d, "System settings changed", "Settings", "business-rules", { before: before.join(", "), after: after.join(", "), reason });
    return { ok: true };
  });

  const addStaff = (v: { name: string; email: string; role: RoleKey }): Res => guard("staff", (d) => {
    if (d.staff.some((s) => s.email.toLowerCase() === v.email.toLowerCase())) return ERR("Email already in use");
    const id = uid("s"); d.staff.push({ id, name: v.name, email: v.email, password: "demo123", role: v.role, active: true });
    log(d, "Staff user created", "Staff", id, { after: `${v.name} · ${d.roles[v.role].label}` }); return { ok: true };
  });
  const toggleStaff = (id: string): Res => guard("staff", (d) => {
    const s = d.staff.find((x) => x.id === id); if (!s) return ERR("Not found");
    if (s.id === sessRef.current?.id) return ERR("You cannot deactivate your own account");
    s.active = !s.active; log(d, s.active ? "Staff reactivated" : "Staff deactivated", "Staff", id); return { ok: true };
  });
  const setStaffRole = (id: string, role: RoleKey): Res => guard("staff", (d) => {
    const s = d.staff.find((x) => x.id === id); if (!s) return ERR("Not found");
    if (s.id === sessRef.current?.id) return ERR("You cannot change your own role");
    const b = s.role; s.role = role; log(d, "Staff role changed", "Staff", id, { before: d.roles[b].label, after: d.roles[role].label }); return { ok: true };
  });
  const setRolePerm = (role: RoleKey, perm: Perm, on: boolean): Res => guard("staff", (d) => {
    if (role === "super_admin") return ERR("Super Admin permissions are fixed");
    const list = d.roles[role].perms; const has = list.includes(perm);
    if (on && !has) list.push(perm); if (!on && has) d.roles[role].perms = list.filter((p) => p !== perm);
    log(d, "Permission changed", "Role", role, { after: `${ALL_PERMS.find((p) => p.key === perm)?.label}: ${on ? "granted" : "revoked"}` }); return { ok: true };
  });

  const resetDemo = () => { const d = createSeed(); dbRef.current = d; setDb(d); setRefState(null); try { localStorage.removeItem(RKEY); } catch {} showToast("Demo data reset"); };

  return {
    db, ready, session, dealer, staff, can: canUi, ref, refDealer, setRef,
    login, logout, registerDealer, placeOrder, trackOrder, requestReturn,
    submitKyc, saveProfile, saveStore, toggleFeatured, saveBank, toggleTraining, setMfa, changePassword, requestPayout, saveContent, deleteContent,
    createTicket, replyTicket, setTicketStatus, markNotifsRead,
    reviewKyc, activateDealer, suspendDealer, setCommissionOverride, verifyBank, updateOrderStatus, decideReturn, releaseCommission, addAdjustment, decidePayout,
    adjustStock, saveSettings, addStaff, toggleStaff, setStaffRole, setRolePerm, resetDemo,
  };
}

const Ctx = createContext<ReturnType<typeof useBuildPortal> | null>(null);
export function PortalProvider({ children }: { children: ReactNode }) {
  const v = useBuildPortal();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal must be used inside PortalProvider");
  return c;
}
