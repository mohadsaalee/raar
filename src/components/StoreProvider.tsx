"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { getProductById, Product } from "@/data/products";

export type Line = { key: string; productId: string; size: string; color: string; qty: number };
export type DetailedLine = Line & { product: Product };

type Ctx = {
  lines: DetailedLine[];
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
  applyCoupon: (code: string) => boolean;
  addToCart: (p: Product, size: string, color: string, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  cartOpen: boolean; setCartOpen: (v: boolean) => void;
  searchOpen: boolean; setSearchOpen: (v: boolean) => void;
  toast: string | null; showToast: (m: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);
export const FREE_SHIPPING_AT = 1499;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setRaw(JSON.parse(localStorage.getItem("raar_cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("raar_wish") || "[]"));
      setCoupon(localStorage.getItem("raar_coupon"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("raar_cart", JSON.stringify(raw));
      localStorage.setItem("raar_wish", JSON.stringify(wishlist));
      coupon ? localStorage.setItem("raar_coupon", coupon) : localStorage.removeItem("raar_coupon");
    } catch {}
  }, [raw, wishlist, coupon, ready]);

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const lines = useMemo<DetailedLine[]>(
    () => raw.flatMap((l) => { const product = getProductById(l.productId); return product ? [{ ...l, product }] : []; }),
    [raw]
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = coupon === "RAAR10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIPPING_AT ? 0 : 79;
  const total = subtotal - discount + shipping;

  const value: Ctx = {
    lines, count, subtotal, discount, shipping, total, coupon,
    applyCoupon: (code) => {
      if (code.trim().toUpperCase() === "RAAR10") { setCoupon("RAAR10"); return true; }
      return false;
    },
    addToCart: (p, size, color, qty = 1) => {
      const key = `${p.id}|${size}|${color}`;
      setRaw((prev) => prev.some((l) => l.key === key)
        ? prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
        : [...prev, { key, productId: p.id, size, color, qty }]);
      setCartOpen(true);
    },
    updateQty: (key, qty) => setRaw((prev) => prev.flatMap((l) => (l.key === key ? (qty <= 0 ? [] : [{ ...l, qty }]) : [l]))),
    removeLine: (key) => setRaw((prev) => prev.filter((l) => l.key !== key)),
    clearCart: () => { setRaw([]); setCoupon(null); },
    wishlist,
    toggleWishlist: (id) => {
      setWishlist((prev) => {
        const has = prev.includes(id);
        showToast(has ? "Removed from wishlist" : "Saved to wishlist");
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    cartOpen, setCartOpen, searchOpen, setSearchOpen, toast, showToast,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
