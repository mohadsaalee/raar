"use client";
import Link from "next/link";
import { Store } from "lucide-react";
import { usePortal } from "./PortalProvider";

/** Shows the customer which dealer their purchase will be attributed to */
export default function RefBanner() {
  const { refDealer } = usePortal();
  if (!refDealer) return null;
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-white" style={{ background: refDealer.accent }}>
      <Store size={13} /> You&apos;re shopping via <Link href={`/store/${refDealer.slug}`} className="font-semibold underline">{refDealer.storeName}</Link>
    </div>
  );
}
