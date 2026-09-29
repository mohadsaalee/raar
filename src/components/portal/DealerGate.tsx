"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { usePortal } from "../PortalProvider";
import { Btn, Card } from "./ui";

export function OnboardingSteps() {
  const { dealer } = usePortal(); if (!dealer) return null;
  const k = dealer.kyc.status;
  const steps = [
    { t: "Register", d: "Account created", done: true },
    { t: "Submit KYC", d: k === "Not submitted" || k === "Rejected" ? "Upload an ID document" : "Documents submitted", done: k === "Pending" || k === "Approved" },
    { t: "KYC review", d: k === "Rejected" ? `Rejected: ${dealer.kyc.note}` : k === "Approved" ? "Approved by RAAR" : "RAAR verifies your details", done: k === "Approved" },
    { t: "Activation", d: dealer.status === "Activated" ? "Your dealership is live" : "RAAR activates your dealership", done: dealer.status === "Activated" },
  ];
  return (
    <ol className="grid gap-4 sm:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.t} className={`rounded-xl border p-4 ${s.done ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-white"}`}>
          <div className="mb-2 flex items-center gap-2">{s.done ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} className="text-neutral-300" />}<span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Step {i + 1}</span></div>
          <p className="font-medium">{s.t}</p><p className="mt-0.5 text-xs text-neutral-500">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

/** Pages needing an activated dealership show onboarding status instead */
export default function DealerGate({ children, what }: { children: ReactNode; what: string }) {
  const { dealer } = usePortal();
  if (!dealer) return null;
  if (dealer.status === "Activated") return <>{children}</>;
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100"><Lock size={20} /></div>
        <h2 className="text-lg font-semibold">{what} unlocks when your dealership is active</h2>
        <p className="max-w-md text-sm text-neutral-600">{dealer.status === "Suspended" ? `Your dealership is suspended: ${dealer.suspendedReason ?? "contact support"}.` : "Finish onboarding below. Once RAAR approves your KYC and activates your dealership, this section opens."}</p>
      </div>
      {dealer.status !== "Suspended" && <OnboardingSteps />}
      <div className="mt-6 flex justify-center gap-2"><Link href="/dealer/profile"><Btn>Go to Profile & KYC</Btn></Link><Link href="/dealer/support"><Btn variant="outline">Contact support</Btn></Link></div>
    </Card>
  );
}
