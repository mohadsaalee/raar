"use client";
import { Activity, BadgeCheck, BarChart3, Boxes, ClipboardList, Headphones, LayoutDashboard, PieChart, RotateCcw, Settings, ShieldCheck, ShoppingBag, Store, UserCog, Users, Wallet } from "lucide-react";
import Shell, { NavItem } from "@/components/portal/Shell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard", exact: true },
  { href: "/admin/dealers", label: "Dealers", icon: Store, perm: "dealers" },
  { href: "/admin/kyc", label: "KYC review", icon: BadgeCheck, perm: "kyc" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, perm: "orders" },
  { href: "/admin/returns", label: "Returns & refunds", icon: RotateCcw, perm: "returns" },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, perm: "inventory" },
  { href: "/admin/commission", label: "Commission", icon: BarChart3, perm: "commission" },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet, perm: "payouts" },
  { href: "/admin/customers", label: "Customers", icon: Users, perm: "customers" },
  { href: "/admin/support", label: "Support", icon: Headphones, perm: "support" },
  { href: "/admin/analytics", label: "Analytics", icon: PieChart, perm: "analytics" },
  { href: "/admin/staff", label: "Staff & roles", icon: UserCog, perm: "staff" },
  { href: "/admin/audit", label: "Audit logs", icon: ClipboardList, perm: "audit" },
  { href: "/admin/settings", label: "System settings", icon: Settings, perm: "settings" },
];
void ShieldCheck; void Activity;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Shell kind="admin" nav={NAV}>{children}</Shell>;
}
