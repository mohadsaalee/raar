import { PRODUCTS } from "./products";

/* ───────────── RBAC ───────────── */
export type Perm =
  | "dashboard" | "dealers" | "kyc" | "orders" | "orders_edit" | "returns" | "inventory" | "commission"
  | "payouts" | "customers" | "support" | "analytics" | "staff" | "settings" | "audit";

export const ALL_PERMS: { key: Perm; label: string }[] = [
  { key: "dashboard", label: "Dashboard" }, { key: "dealers", label: "Dealers" }, { key: "kyc", label: "KYC review" },
  { key: "orders", label: "Orders (view)" }, { key: "orders_edit", label: "Order fulfilment (edit)" }, { key: "returns", label: "Returns & refunds" }, { key: "inventory", label: "Inventory" },
  { key: "commission", label: "Commission" }, { key: "payouts", label: "Payouts" }, { key: "customers", label: "Customers" },
  { key: "support", label: "Support" }, { key: "analytics", label: "Analytics" }, { key: "staff", label: "Staff & roles" },
  { key: "settings", label: "System settings" }, { key: "audit", label: "Audit logs" },
];

export type RoleKey = "super_admin" | "operations" | "finance" | "support";
export type Roles = Record<RoleKey, { label: string; desc: string; perms: Perm[] }>;

export const DEFAULT_ROLES: Roles = {
  super_admin: { label: "Super Admin", desc: "Full platform control, including staff, roles and settings.", perms: ALL_PERMS.map((p) => p.key) },
  operations: { label: "Operations", desc: "Orders, returns, inventory and dealer onboarding.", perms: ["dashboard", "dealers", "kyc", "orders", "orders_edit", "returns", "inventory", "customers", "support"] },
  finance: { label: "Finance", desc: "Commission, payouts and financial analytics.", perms: ["dashboard", "commission", "payouts", "orders", "analytics", "dealers"] },
  support: { label: "Customer Support", desc: "Tickets, customers and read access to orders.", perms: ["dashboard", "support", "customers", "orders"] },
};

/* ───────────── Types ───────────── */
export type DealerStatus = "Registered" | "KYC Pending" | "KYC Rejected" | "Approved" | "Activated" | "Suspended";
export type KycStatus = "Not submitted" | "Pending" | "Approved" | "Rejected";

export type Dealer = {
  id: string; name: string; email: string; password: string; phone: string; city: string;
  code: string; slug: string; status: DealerStatus; joinedAt: string;
  kyc: { status: KycStatus; docType?: string; fileName?: string; submittedAt?: string; reviewedAt?: string; reviewedBy?: string; note?: string };
  storeName: string; tagline: string; whatsapp: string; accent: string;
  featured: string[]; commissionOverride: number | null;
  bank: { holder: string; account: string; ifsc: string; verified: boolean } | null;
  mfa: boolean; training: string[]; language: string; suspendedReason?: string;
};

export type Staff = { id: string; name: string; email: string; password: string; role: RoleKey; active: boolean };

export type OrderStatus = "Pending Payment" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Return Requested" | "Returned";
export type OrderItem = { productId: string; name: string; size: string; color: string; qty: number; price: number };
export type Order = {
  id: string; date: string;
  customer: { name: string; email: string; phone: string; address: string; city: string; state: string; pin: string };
  items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number;
  payment: string; paymentStatus: "Paid" | "Pending" | "COD" | "Refunded";
  status: OrderStatus; dealerId: string | null; commissionPct: number; commissionAmount: number;
  tracking?: string; deliveredAt?: string; history: { status: string; at: string; by: string }[];
};

export type LedgerEntry = {
  id: string; dealerId: string; orderId?: string; type: "commission" | "adjustment" | "payout";
  amount: number; status: "Pending" | "Confirmed" | "Available" | "Reversed" | "Reserved" | "Paid" | "Voided";
  note: string; date: string;
};
export type Payout = { id: string; dealerId: string; amount: number; status: "Requested" | "Approved" | "Paid" | "Rejected" | "Failed"; requestedAt: string; processedAt?: string; reference?: string; reason?: string };
export type ReturnReq = { id: string; orderId: string; reason: string; status: "Requested" | "Approved" | "Rejected" | "Refunded"; createdAt: string; decidedBy?: string; refundAmount: number };
export type StockMove = { id: string; productId: string; delta: number; reason: string; by: string; at: string };
export type Ticket = {
  id: string; from: { kind: "dealer" | "customer"; id?: string; name: string }; subject: string;
  status: "Open" | "In progress" | "Resolved"; createdAt: string;
  messages: { from: "dealer" | "staff" | "customer"; name: string; text: string; at: string }[];
};
export type Notif = { id: string; to: string; title: string; body: string; at: string; read: boolean; href?: string };
export type AuditEntry = { id: string; at: string; actor: string; role: string; action: string; entity: string; entityId: string; before?: string; after?: string; reason?: string };
export type Content = { id: string; dealerId: string; productId: string; type: string; lang: string; text: string; at: string };

export type Settings = {
  commissionPct: number; minPayout: number; returnWindowDays: number; holdDays: number;
  attributionDays: number; lowStockAt: number; dealerFee: number; launchFee: number; launchEnds: string;
};

export type DB = {
  v: number; settings: Settings; dealers: Dealer[]; staff: Staff[]; roles: Roles; orders: Order[];
  ledger: LedgerEntry[]; payouts: Payout[]; returns: ReturnReq[]; stock: Record<string, number>;
  stockLog: StockMove[]; tickets: Ticket[]; notifs: Notif[]; audit: AuditEntry[]; content: Content[];
};

export const DB_VERSION = 2;
export const DAY = 86400000;

export const DEFAULT_SETTINGS: Settings = {
  commissionPct: 30, minPayout: 1000, returnWindowDays: 7, holdDays: 7, attributionDays: 30,
  lowStockAt: 10, dealerFee: 25000, launchFee: 12500, launchEnds: "2026-12-31",
};

export const TRAINING = [
  { id: "t1", title: "RAAR 101: how the dealer program works", mins: 8, desc: "Your role, how orders flow, and how commission is tracked." },
  { id: "t2", title: "Product knowledge: fabrics and fits", mins: 12, desc: "Know the catalogue so you can advise customers with confidence." },
  { id: "t3", title: "How to sell on WhatsApp", mins: 10, desc: "Share your store link, handle questions and close orders politely." },
  { id: "t4", title: "Your store link and QR code", mins: 5, desc: "Where to share it, and how attribution works for your orders." },
  { id: "t5", title: "Marketing with AI content", mins: 9, desc: "Generate, review and share content responsibly." },
  { id: "t6", title: "Delivery, returns and customer care", mins: 7, desc: "What happens after the order and how returns affect commission." },
];

/* ───────────── helpers ───────────── */
export const uid = (p: string) => p + "_" + Math.random().toString(36).slice(2, 9);
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};
export const slugifyName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const maskName = (n: string) => { const p = n.trim().split(" "); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0]; };

/* ───────────── selectors / calculations ───────────── */
export const isLiveOrder = (o: Order) => o.status !== "Cancelled" && o.status !== "Returned";
export const effectivePct = (db: DB, d: Dealer) => d.commissionOverride ?? db.settings.commissionPct;

export function dealerBalances(db: DB, dealerId: string) {
  const L = db.ledger.filter((l) => l.dealerId === dealerId);
  const sum = (f: (l: LedgerEntry) => boolean) => L.filter(f).reduce((s, l) => s + l.amount, 0);
  const pending = sum((l) => l.type === "commission" && l.status === "Pending");
  const confirmed = sum((l) => l.type === "commission" && l.status === "Confirmed");
  const availableGross = sum((l) => l.status === "Available");
  const reserved = -sum((l) => l.type === "payout" && l.status === "Reserved");
  const paidOut = -sum((l) => l.type === "payout" && l.status === "Paid");
  const available = availableGross - reserved - paidOut;
  const lifetime = sum((l) => l.type === "commission" && l.status !== "Reversed") + sum((l) => l.type === "adjustment" && l.status === "Available");
  return { pending, confirmed, available, reserved, paidOut, lifetime };
}

export function dealerStats(db: DB, dealerId: string) {
  const orders = db.orders.filter((o) => o.dealerId === dealerId);
  const live = orders.filter(isLiveOrder);
  const customers = new Set(orders.map((o) => o.customer.email.toLowerCase()));
  return {
    orders, sales: live.reduce((s, o) => s + o.subtotal - o.discount, 0), orderCount: live.length,
    customers: customers.size, ...dealerBalances(db, dealerId),
  };
}

export function dayBuckets<T>(items: T[], days: number, dateOf: (t: T) => string, valueOf: (t: T) => number) {
  const out: { label: string; value: number }[] = [];
  const start = new Date(); start.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start.getTime() - i * DAY);
    const key = d.toDateString();
    out.push({ label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: items.filter((t) => new Date(dateOf(t)).toDateString() === key).reduce((s, t) => s + valueOf(t), 0) });
  }
  return out;
}

/* ───────────── seed ───────────── */
function rng(seed: number) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

const CUSTOMERS = [
  ["Divya Sreekumar", "Kochi", "Kerala", "682001"], ["Karthik Raman", "Chennai", "Tamil Nadu", "600017"], ["Meera Thomas", "Kottayam", "Kerala", "686001"],
  ["Arjun Varma", "Thiruvananthapuram", "Kerala", "695001"], ["Fathima Nazir", "Kozhikode", "Kerala", "673001"], ["Sanjay Kumar", "Coimbatore", "Tamil Nadu", "641001"],
  ["Anitha Joseph", "Thrissur", "Kerala", "680001"], ["Rohit Menon", "Bengaluru", "Karnataka", "560001"], ["Priya Nair", "Kannur", "Kerala", "670001"],
  ["Suresh Babu", "Palakkad", "Kerala", "678001"], ["Lakshmi Pillai", "Alappuzha", "Kerala", "688001"], ["Nithin George", "Ernakulam", "Kerala", "682011"],
  ["Ayesha Rahman", "Malappuram", "Kerala", "676505"], ["Vivek Krishnan", "Madurai", "Tamil Nadu", "625001"], ["Deepa Mathew", "Pathanamthitta", "Kerala", "689645"],
  ["Sreejith Nambiar", "Kasaragod", "Kerala", "671121"], ["Hari Prasad", "Kollam", "Kerala", "691001"], ["Neha Sharma", "Hyderabad", "Telangana", "500001"],
];

export function createSeed(now = Date.now()): DB {
  const r = rng(42);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const iso = (t: number) => new Date(t).toISOString();
  const settings = { ...DEFAULT_SETTINGS };

  const mk = (id: string, name: string, email: string, city: string, status: DealerStatus, kycStatus: KycStatus, extra: Partial<Dealer> = {}): Dealer => ({
    id, name, email, password: "demo123", phone: "98" + Math.floor(10000000 + r() * 89999999), city,
    code: "RAAR-D" + (2200 + parseInt(id.slice(1))), slug: slugifyName(name), status, joinedAt: iso(now - 40 * DAY),
    kyc: { status: kycStatus }, storeName: `${name.split(" ")[0]}'s Store`, tagline: "Curated fashion, delivered to your door",
    whatsapp: "9198765" + Math.floor(10000 + r() * 89999), accent: "#0b0b0c", featured: PRODUCTS.map((p) => p.id),
    commissionOverride: null, bank: null, mfa: false, training: [], language: "English", ...extra,
  });

  const dealers: Dealer[] = [
    mk("d1", "Anjali Nair", "dealer@raar.demo", "Kochi", "Activated", "Approved", {
      storeName: "Anjali's Style Studio", accent: "#7c3aed", training: ["t1", "t2", "t3"], mfa: true,
      kyc: { status: "Approved", docType: "Aadhaar", fileName: "anjali_aadhaar.pdf", submittedAt: iso(now - 38 * DAY), reviewedAt: iso(now - 36 * DAY), reviewedBy: "Nikhil Das" },
      bank: { holder: "Anjali Nair", account: "XXXXXX4821", ifsc: "FDRL0001234", verified: true },
    }),
    mk("d2", "Rahul Menon", "rahul@raar.demo", "Thrissur", "Activated", "Approved", {
      storeName: "Rahul Menon Menswear", accent: "#0f766e", training: ["t1"],
      kyc: { status: "Approved", docType: "PAN", fileName: "rahul_pan.jpg", submittedAt: iso(now - 30 * DAY), reviewedAt: iso(now - 28 * DAY), reviewedBy: "Nikhil Das" },
      bank: { holder: "Rahul Menon", account: "XXXXXX9932", ifsc: "SBIN0004567", verified: true },
    }),
    mk("d3", "Sneha Pillai", "pending@raar.demo", "Kozhikode", "KYC Pending", "Pending", {
      kyc: { status: "Pending", docType: "Aadhaar", fileName: "sneha_aadhaar.pdf", submittedAt: iso(now - 1 * DAY) },
    }),
    mk("d4", "Vishnu K", "vishnu@raar.demo", "Kannur", "Suspended", "Approved", {
      suspendedReason: "Repeated self-orders flagged by attribution rules",
      kyc: { status: "Approved", docType: "Driving licence", fileName: "vishnu_dl.jpg", submittedAt: iso(now - 25 * DAY), reviewedAt: iso(now - 24 * DAY), reviewedBy: "Nikhil Das" },
    }),
    mk("d5", "Aswin Raj", "new@raar.demo", "Kollam", "Registered", "Not submitted", { joinedAt: iso(now - 1 * DAY) }),
  ];

  const staff: Staff[] = [
    { id: "s1", name: "Meera Iyer", email: "admin@raar.demo", password: "demo123", role: "super_admin", active: true },
    { id: "s2", name: "Nikhil Das", email: "ops@raar.demo", password: "demo123", role: "operations", active: true },
    { id: "s3", name: "Farah Khan", email: "finance@raar.demo", password: "demo123", role: "finance", active: true },
    { id: "s4", name: "Joel Thomas", email: "support@raar.demo", password: "demo123", role: "support", active: true },
  ];

  const stock: Record<string, number> = {};
  PRODUCTS.forEach((p) => (stock[p.id] = 25 + Math.floor(r() * 90)));
  stock["r09"] = 6; stock["r16"] = 4; stock["r12"] = 9;

  const orders: Order[] = []; const ledger: LedgerEntry[] = [];
  const dealerPool: (string | null)[] = ["d1", "d1", "d1", "d1", "d2", "d2", "d2", "d4", null, null, null, null, null];
  const online = ["UPI", "Card", "Net banking"];

  for (let i = 0; i < 46; i++) {
    const daysAgo = Math.floor(Math.pow(r(), 1.3) * 30);
    const date = now - daysAgo * DAY - Math.floor(r() * 10) * 3600000;
    const items: OrderItem[] = Array.from({ length: 1 + Math.floor(r() * 2.4) }, () => {
      const p = pick(PRODUCTS); return { productId: p.id, name: p.name, size: pick(p.sizes), color: pick(p.colors).name, qty: 1 + Math.floor(r() * 1.6), price: p.price };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = subtotal >= 1499 ? 0 : 79;
    const c = pick(CUSTOMERS); const dealerId = pick(dealerPool);
    const pay = r() < 0.2 ? "COD" : pick(online);
    let status: OrderStatus;
    const x = r();
    if (daysAgo >= 8) status = x < 0.78 ? "Delivered" : x < 0.9 ? "Returned" : "Cancelled";
    else if (daysAgo >= 4) status = x < 0.6 ? "Delivered" : "Shipped";
    else if (daysAgo >= 2) status = x < 0.5 ? "Shipped" : "Packed";
    else if (daysAgo >= 1) status = x < 0.5 ? "Packed" : "Confirmed";
    else status = pay !== "COD" && x < 0.4 ? "Pending Payment" : "Confirmed";
    const dealer = dealers.find((d) => d.id === dealerId);
    const pct = dealer ? dealer.commissionOverride ?? settings.commissionPct : 0;
    const commissionAmount = dealer ? Math.round((subtotal * pct) / 100) : 0;
    const deliveredAt = status === "Delivered" || status === "Returned" ? Math.min(now, date + 3.5 * DAY) : undefined;
    const paymentStatus: Order["paymentStatus"] = status === "Cancelled" || status === "Returned" ? "Refunded" : status === "Pending Payment" ? "Pending" : pay === "COD" ? "COD" : "Paid";
    const id = "RAAR-" + (100200 + i * 7);
    const hist = [{ status: "Order placed", at: iso(date), by: "Customer" }];
    if (status !== "Pending Payment") hist.push({ status: "Confirmed", at: iso(date + 3600000), by: "System" });
    if (["Packed", "Shipped", "Delivered", "Returned"].includes(status)) hist.push({ status: "Packed", at: iso(date + 0.5 * DAY), by: "Nikhil Das" });
    if (["Shipped", "Delivered", "Returned"].includes(status)) hist.push({ status: "Shipped", at: iso(date + 1 * DAY), by: "Nikhil Das" });
    if (deliveredAt) hist.push({ status: "Delivered", at: iso(deliveredAt), by: "Courier" });
    if (status === "Returned") hist.push({ status: "Returned", at: iso(Math.min(now, date + 6 * DAY)), by: "Nikhil Das" });
    if (status === "Cancelled") hist.push({ status: "Cancelled", at: iso(date + 0.3 * DAY), by: "Nikhil Das" });
    orders.push({
      id, date: iso(date), customer: { name: c[0], email: c[0].split(" ")[0].toLowerCase() + "@example.com", phone: "9" + Math.floor(100000000 + r() * 899999999), address: `${10 + Math.floor(r() * 80)}, MG Road`, city: c[1], state: c[2], pin: c[3] },
      items, subtotal, discount: 0, shipping, total: subtotal + shipping, payment: pay, paymentStatus, status, dealerId, commissionPct: pct, commissionAmount,
      tracking: ["Shipped", "Delivered", "Returned"].includes(status) ? "TRK" + Math.floor(1000000 + r() * 8999999) : undefined,
      deliveredAt: deliveredAt ? iso(deliveredAt) : undefined, history: hist,
    });
    if (dealer && dealer.status !== "Registered" && dealer.status !== "KYC Pending") {
      let ls: LedgerEntry["status"] = "Pending";
      if (status === "Cancelled" || status === "Returned") ls = "Reversed";
      else if (status === "Delivered") ls = now - (deliveredAt as number) >= settings.holdDays * DAY ? "Available" : "Confirmed";
      ledger.push({ id: uid("led"), dealerId: dealer.id, orderId: id, type: "commission", amount: commissionAmount, status: ls, note: `${pct}% on ${id}`, date: iso(date) });
    }
  }

  // one live return request for the demo
  const returnCandidate = orders.find((o) => o.dealerId === "d1" && o.status === "Delivered" && now - new Date(o.deliveredAt!).getTime() < 6 * DAY);
  const returns: ReturnReq[] = orders.filter((o) => o.status === "Returned").map((o) => ({ id: uid("ret"), orderId: o.id, reason: pick(["Size did not fit", "Colour differs from photos", "Received damaged item"]), status: "Refunded" as const, createdAt: o.history[o.history.length - 1].at, decidedBy: "Nikhil Das", refundAmount: o.total }));
  if (returnCandidate) {
    returnCandidate.status = "Return Requested"; returnCandidate.history.push({ status: "Return Requested", at: iso(now - 4 * 3600000), by: "Customer" });
    returns.push({ id: uid("ret"), orderId: returnCandidate.id, reason: "Size did not fit", status: "Requested", createdAt: iso(now - 4 * 3600000), refundAmount: returnCandidate.total });
  }

  // opening adjustments so seeded balances are sensible
  const payouts: Payout[] = [];
  const bal = (id: string) => { let a = 0; ledger.filter((l) => l.dealerId === id && l.status === "Available").forEach((l) => (a += l.amount)); return a; };
  [["d1", 7000], ["d2", 3500]].forEach(([id, need]) => {
    const b = bal(id as string);
    if (b < (need as number)) ledger.push({ id: uid("led"), dealerId: id as string, type: "adjustment", amount: (need as number) - b, status: "Available", note: "Opening balance adjustment", date: iso(now - 20 * DAY) });
  });
  ledger.push({ id: uid("led"), dealerId: "d1", type: "payout", amount: -4000, status: "Paid", note: "Payout PO-1001", date: iso(now - 10 * DAY) });
  payouts.push({ id: "PO-1001", dealerId: "d1", amount: 4000, status: "Paid", requestedAt: iso(now - 12 * DAY), processedAt: iso(now - 10 * DAY), reference: "UTR58291034" });
  ledger.push({ id: uid("led"), dealerId: "d2", type: "payout", amount: -1500, status: "Reserved", note: "Payout PO-1002", date: iso(now - 1 * DAY) });
  payouts.push({ id: "PO-1002", dealerId: "d2", amount: 1500, status: "Requested", requestedAt: iso(now - 1 * DAY) });

  const tickets: Ticket[] = [
    { id: "TK-2001", from: { kind: "dealer", id: "d1", name: "Anjali Nair" }, subject: "Commission for RAAR-100263 still pending", status: "In progress", createdAt: iso(now - 2 * DAY),
      messages: [{ from: "dealer", name: "Anjali Nair", text: "The order was delivered but the commission still shows as Confirmed. When will it be available?", at: iso(now - 2 * DAY) }, { from: "staff", name: "Farah Khan", text: "Commission is released after the return window. It will move to Available automatically.", at: iso(now - 1 * DAY) }] },
    { id: "TK-2002", from: { kind: "customer", name: "Meera Thomas" }, subject: "Where is my order?", status: "Open", createdAt: iso(now - 5 * 3600000),
      messages: [{ from: "customer", name: "Meera Thomas", text: "Ordered 3 days ago, tracking has not updated.", at: iso(now - 5 * 3600000) }] },
  ];

  const notifs: Notif[] = [
    { id: uid("n"), to: "d1", title: "Welcome to RAAR", body: "Complete your training modules to get the most from your store.", at: iso(now - 3 * DAY), read: true, href: "/dealer/training" },
    { id: uid("n"), to: "admin", title: "KYC awaiting review", body: "Sneha Pillai submitted KYC documents.", at: iso(now - 1 * DAY), read: false, href: "/admin/kyc" },
    { id: uid("n"), to: "admin", title: "Return requested", body: "A customer requested a return on a delivered order.", at: iso(now - 4 * 3600000), read: false, href: "/admin/returns" },
  ];

  const audit: AuditEntry[] = [
    { id: uid("a"), at: iso(now - 36 * DAY), actor: "Nikhil Das", role: "Operations", action: "KYC approved", entity: "Dealer", entityId: "d1", after: "Approved" },
    { id: uid("a"), at: iso(now - 24 * DAY), actor: "Meera Iyer", role: "Super Admin", action: "Dealer suspended", entity: "Dealer", entityId: "d4", before: "Activated", after: "Suspended", reason: "Repeated self-orders flagged by attribution rules" },
    { id: uid("a"), at: iso(now - 10 * DAY), actor: "Farah Khan", role: "Finance", action: "Payout marked paid", entity: "Payout", entityId: "PO-1001", after: "Paid · UTR58291034" },
  ];

  return { v: DB_VERSION, settings, dealers, staff, roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)), orders: orders.sort((a, b) => +new Date(b.date) - +new Date(a.date)), ledger, payouts, returns, stock, stockLog: [], tickets, notifs, audit, content: [] };
}

export function emptyDB(): DB {
  return { v: DB_VERSION, settings: { ...DEFAULT_SETTINGS }, dealers: [], staff: [], roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)), orders: [], ledger: [], payouts: [], returns: [], stock: {}, stockLog: [], tickets: [], notifs: [], audit: [], content: [] };
}
