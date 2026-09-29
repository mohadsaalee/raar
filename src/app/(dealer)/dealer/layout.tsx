"use client";
import { BarChart3, BookOpen, CreditCard, Headphones, LayoutDashboard, Megaphone, Package, ShoppingBag, Store, UserCircle, Users, Wallet } from "lucide-react";
import Shell, { NavItem } from "@/components/portal/Shell";

const NAV: NavItem[] = [
  { href: "/dealer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dealer/catalogue", label: "Product access", icon: Package },
  { href: "/dealer/storefront", label: "My storefront", icon: Store },
  { href: "/dealer/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dealer/customers", label: "Customers", icon: Users },
  { href: "/dealer/commission", label: "Commission", icon: BarChart3 },
  { href: "/dealer/payouts", label: "Payouts", icon: Wallet },
  { href: "/dealer/marketing", label: "AI marketing", icon: Megaphone },
  { href: "/dealer/training", label: "Training", icon: BookOpen },
  { href: "/dealer/support", label: "Support", icon: Headphones },
  { href: "/dealer/profile", label: "Profile & KYC", icon: UserCircle },
];
void CreditCard;

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return <Shell kind="dealer" nav={NAV}>{children}</Shell>;
}
