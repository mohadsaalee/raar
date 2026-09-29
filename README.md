# RAAR Virtual Shoppe — Storefront + Dealer Portal + Admin Portal (Next.js 14)

A working, end-to-end demo of the RAAR platform: a customer storefront, a
Dealer Portal, and an Admin/Operations Portal, all sharing one in-browser
data layer (`src/components/PortalProvider.tsx`) so actions in one portal
show up in the others — no backend required yet.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
```

## Try the full loop (2 minutes)
1. Go to `/login → Dealer` and sign in as **Active dealer** (`dealer@raar.demo` / `demo123`).
2. Open **My storefront**, copy the store link, and open it in a new tab (or click "Preview store").
3. On that storefront, add a product to the bag and check out as a guest (any email/address — nothing is charged).
4. Back in the dealer portal → **Orders**: the new order appears, commission shows **Pending**.
5. Open `/login → Staff/Admin` as **Operations** (`ops@raar.demo`) in another tab/window.
6. Admin → **Orders**: mark the order Confirmed → Packed → Shipped → Delivered.
7. Dealer portal → **Commission**: the entry moves Pending → Confirmed (then Available after the hold period, or click "Run scheduled release" / "Release now" in Admin → Commission to fast-forward it).
8. Dealer → **Payouts**: add a bank account, then Admin → Payouts → verify the bank, dealer requests a payout, Admin approves and marks it paid.

Also try: Admin → **KYC review** to approve `pending@raar.demo`, then **Dealers** → Activate. Sign in as `finance@raar.demo` or `support@raar.demo` to see the sidebar and permissions change per role (RBAC).

## What's included
**Dealer Portal** (`/dealer/*`): dashboard with charts, onboarding tracker, product access with per-product share links, storefront customization + QR code, orders, customers (privacy-masked), commission ledger, payouts (bank verification, min payout, requests), AI marketing generator (English/Malayalam/Tamil, with a guard against "guaranteed income" wording), training modules, support tickets, profile/KYC/security (MFA toggle, password change).

**Admin Portal** (`/admin/*`): dashboard with revenue/order charts and an alerts feed, dealer management + detail page (KYC approve/reject, activate/suspend, commission override, bank verification), a dedicated KYC queue, order fulfilment (state machine with tracking numbers), returns & refunds (approve → refund + restock + reverse commission), inventory (stock levels + movement log), commission ledger (manual adjustments, scheduled/manual release), payouts (approve → paid, with UTR reference), customers, support tickets, analytics (revenue, dealer leaderboard, category/status breakdowns), staff & role management with a live permissions matrix (RBAC), audit logs, and system settings (commission %, hold days, return window, attribution window, min payout — all configurable, never hard-coded).

**Storefront** (public, from the earlier build): home, shop, product detail, cart, checkout, wishlist, order tracking with self-serve returns, and dealer storefronts at `/store/[slug]` that carry attribution through checkout into the dealer's commission ledger.

## How data flows (no backend yet)
`PortalProvider` holds one in-memory "database" (dealers, orders, ledger, payouts, tickets, audit log…), persisted to `localStorage` so it survives a refresh. Every admin/dealer action goes through a typed function that validates, mutates, logs to the audit trail, and (where relevant) notifies the other side — the same shape a real API would have. `src/data/portal.ts` defines the types and seeds realistic demo data (dealers in different states, ~46 historical orders, tickets, a pending return).

Reset the demo data anytime from **Admin → System settings → Reset demo data** (Super Admin only).

## Known simplifications
- No real backend/database — swap `PortalProvider`'s functions for API calls when ready; the shapes (types in `src/data/portal.ts`) are designed to map directly onto the Django models discussed earlier.
- Login is by plaintext demo password in localStorage — fine for a walkthrough, not for production.
- File uploads (KYC documents) store only the filename, not real file content.
- Payment is simulated at checkout.

## Deploy
```bash
npx vercel
```
