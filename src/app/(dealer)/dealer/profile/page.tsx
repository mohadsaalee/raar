"use client";
import { useState } from "react";
import { CheckCircle2, FileText, Upload } from "lucide-react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Field, Input, PageHead, Select, Tabs } from "@/components/portal/ui";
import { fmtDate } from "@/data/portal";

export default function DealerProfile() {
  const { dealer, saveProfile, submitKyc, setMfa, changePassword } = usePortal(); const { showToast } = useStore();
  const [tab, setTab] = useState<"profile" | "kyc" | "security">("profile");
  const [f, setF] = useState(() => ({ name: dealer?.name ?? "", phone: dealer?.phone ?? "", city: dealer?.city ?? "", language: dealer?.language ?? "English" }));
  const [doc, setDoc] = useState("Aadhaar"); const [file, setFile] = useState<File | null>(null);
  const [pw, setPw] = useState({ o: "", n: "" }); const [pwErr, setPwErr] = useState("");
  if (!dealer) return null;
  const k = dealer.kyc;
  return (
    <>
      <PageHead title="Profile & KYC" sub={`${dealer.code} · ${dealer.email}`} action={<Badge s={dealer.status} />} />
      <Tabs tabs={[{ key: "profile", label: "Profile" }, { key: "kyc", label: "KYC & documents" }, { key: "security", label: "Security" }]} value={tab} onChange={setTab} />
      <div className="mt-6 max-w-2xl">
        {tab === "profile" && <Card><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field><Field label="Mobile"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field><Field label="City"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field><Field label="Preferred content language"><Select value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })}><option>English</option><option>Malayalam</option><option>Tamil</option></Select></Field></div><Btn className="mt-5" onClick={() => { saveProfile(f); showToast("Profile saved"); }}>Save profile</Btn></Card>}

        {tab === "kyc" && <Card title="Identity verification">
          <div className="mb-4 flex items-center gap-3"><Badge s={k.status} />{k.submittedAt && <span className="text-xs text-neutral-500">Submitted {fmtDate(k.submittedAt)}</span>}{k.reviewedAt && <span className="text-xs text-neutral-500">· Reviewed {fmtDate(k.reviewedAt)}</span>}</div>
          {k.fileName && <div className="mb-4 flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm"><FileText size={18} /><div><p className="font-medium">{k.docType}</p><p className="text-xs text-neutral-500">{k.fileName} · stored privately</p></div></div>}
          {k.status === "Rejected" && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Rejected: {k.note}. Please upload a clearer document.</p>}
          {k.status === "Approved" ? <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 size={16} />Your KYC is approved.</p> : k.status === "Pending" ? <p className="text-sm text-neutral-600">Your documents are under review. We&apos;ll notify you once done.</p> : (
            <div className="space-y-4"><Field label="Document type"><Select value={doc} onChange={(e) => setDoc(e.target.value)}><option>Aadhaar</option><option>PAN</option><option>Driving licence</option><option>Passport</option></Select></Field>
              <Field label="Upload document" hint="PDF, JPG or PNG. In this demo the file is not uploaded anywhere."><label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-4 text-sm hover:border-ink"><Upload size={18} />{file ? file.name : "Choose a file"}<input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label></Field>
              <Btn disabled={!file} onClick={() => { submitKyc(doc, file!.name); showToast("KYC submitted for review"); }}>Submit for review</Btn></div>)}
        </Card>}

        {tab === "security" && <div className="space-y-6">
          <Card title="Two-factor authentication"><div className="flex items-center justify-between gap-4"><p className="text-sm text-neutral-600">Add an extra verification step when you sign in and request payouts.</p><Btn variant={dealer.mfa ? "outline" : "primary"} onClick={() => { setMfa(!dealer.mfa); showToast(dealer.mfa ? "MFA disabled" : "MFA enabled"); }}>{dealer.mfa ? "Disable" : "Enable"}</Btn></div></Card>
          <Card title="Change password"><div className="space-y-4"><Field label="Current password"><Input type="password" value={pw.o} onChange={(e) => setPw({ ...pw, o: e.target.value })} /></Field><Field label="New password" error={pwErr}><Input type="password" value={pw.n} onChange={(e) => setPw({ ...pw, n: e.target.value })} /></Field><Btn onClick={() => { const r = changePassword(pw.o, pw.n); if (r.ok) { setPw({ o: "", n: "" }); setPwErr(""); showToast("Password updated"); } else setPwErr(r.error ?? ""); }}>Update password</Btn></div></Card>
        </div>}
      </div>
    </>
  );
}
