"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Field, Forbidden, Input, Modal, PageHead, Select, Table, Tabs, Td, Th } from "@/components/portal/ui";
import { ALL_PERMS, RoleKey } from "@/data/portal";

export default function StaffPage() {
  const { db, can, staff, addStaff, toggleStaff, setStaffRole, setRolePerm } = usePortal(); const { showToast } = useStore();
  const [tab, setTab] = useState<"staff" | "roles">("staff"); const [open, setOpen] = useState(false); const [f, setF] = useState({ name: "", email: "", role: "operations" as RoleKey });
  if (!can("staff")) return <Forbidden what="staff & roles" />;
  const say = (r: { ok: boolean; error?: string }, ok: string) => showToast(r.ok ? ok : r.error ?? "Failed");
  const roles = Object.entries(db.roles) as [RoleKey, (typeof db.roles)[RoleKey]][];
  return (
    <>
      <PageHead title="Staff & roles" sub="Role-based access control: each role sees and can do only what it is granted." action={<Btn onClick={() => setOpen(true)}>Add staff user</Btn>} />
      <Tabs tabs={[{ key: "staff", label: "Staff users", count: db.staff.length }, { key: "roles", label: "Roles & permissions" }]} value={tab} onChange={setTab} />
      <Card className="mt-4" pad={false}>{tab === "staff" ? (
        <Table><thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{db.staff.map((s) => <tr key={s.id}><Td className="font-medium">{s.name}{s.id === staff?.id && <span className="ml-2 text-xs text-neutral-400">(you)</span>}</Td><Td>{s.email}</Td><Td><Select className="w-44" value={s.role} disabled={s.id === staff?.id} onChange={(e) => say(setStaffRole(s.id, e.target.value as RoleKey), "Role updated")}>{roles.map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</Select></Td><Td><Badge s={s.active ? "Active" : "Inactive"} tone={s.active ? "green" : "gray"} /></Td><Td right><Btn size="sm" variant="outline" disabled={s.id === staff?.id} onClick={() => say(toggleStaff(s.id), s.active ? "Deactivated" : "Reactivated")}>{s.active ? "Deactivate" : "Reactivate"}</Btn></Td></tr>)}</tbody></Table>
      ) : (
        <Table><thead><tr><Th>Permission</Th>{roles.map(([k, r]) => <Th key={k}>{r.label}</Th>)}</tr></thead>
          <tbody>{ALL_PERMS.map((p) => <tr key={p.key}><Td className="font-medium">{p.label}</Td>{roles.map(([k, r]) => <Td key={k}><input type="checkbox" className="h-4 w-4 accent-ink" checked={r.perms.includes(p.key)} disabled={k === "super_admin"} onChange={(e) => say(setRolePerm(k, p.key, e.target.checked), "Permission updated")} aria-label={`${r.label} ${p.label}`} /></Td>)}</tr>)}</tbody></Table>
      )}</Card>
      {tab === "roles" && <p className="mt-3 text-xs text-neutral-500">Super Admin permissions are fixed. Changes apply immediately and are recorded in the audit log. Try it: sign in as another role in a private window to see the sidebar change.</p>}
      <Modal open={open} onClose={() => setOpen(false)} title="Add staff user"><div className="space-y-4"><Field label="Full name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field><Field label="Work email"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field><Field label="Role" hint="Demo accounts get the password demo123"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as RoleKey })}>{roles.map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</Select></Field><div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setOpen(false)}>Cancel</Btn><Btn disabled={!f.name || !/^\S+@\S+\.\S+$/.test(f.email)} onClick={() => { const r = addStaff(f); say(r, "Staff user added"); if (r.ok) { setOpen(false); setF({ name: "", email: "", role: "operations" }); } }}>Create</Btn></div></div></Modal>
    </>
  );
}
