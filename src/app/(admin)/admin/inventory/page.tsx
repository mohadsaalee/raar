"use client";
import { useState } from "react";
import { usePortal } from "@/components/PortalProvider";
import { useStore } from "@/components/StoreProvider";
import { Badge, Btn, Card, Field, Forbidden, Input, Modal, PageHead, Table, Tabs, Td, Th } from "@/components/portal/ui";
import { fmtDateTime } from "@/data/portal";
import { PRODUCTS, getProductById, money } from "@/data/products";
import SafeImage from "@/components/SafeImage";

export default function Inventory() {
  const { db, can, adjustStock } = usePortal(); const { showToast } = useStore();
  const [tab, setTab] = useState<"stock" | "log">("stock"); const [pid, setPid] = useState<string | null>(null); const [delta, setDelta] = useState(""); const [why, setWhy] = useState("");
  if (!can("inventory")) return <Forbidden what="inventory" />;
  const p = pid ? getProductById(pid) : null;
  const rows = [...PRODUCTS].sort((a, b) => (db.stock[a.id] ?? 0) - (db.stock[b.id] ?? 0));
  const apply = () => { const r = adjustStock(pid!, Number(delta), why); showToast(r.ok ? "Stock updated" : r.error ?? ""); if (r.ok) { setPid(null); setDelta(""); setWhy(""); } };
  return (
    <>
      <PageHead title="Inventory" sub={`Low-stock threshold: ${db.settings.lowStockAt} units. Stock reduces automatically when orders are placed and is restored on cancellations and returns.`} />
      <Tabs tabs={[{ key: "stock", label: "Stock levels" }, { key: "log", label: "Movement log", count: db.stockLog.length }]} value={tab} onChange={setTab} />
      <Card pad={false} className="mt-4">{tab === "stock" ? (
        <Table><thead><tr><Th>Product</Th><Th>Category</Th><Th right>Price</Th><Th right>On hand</Th><Th>Level</Th><Th /></tr></thead>
          <tbody>{rows.map((x) => { const s = db.stock[x.id] ?? 0; return <tr key={x.id} className="hover:bg-neutral-50"><Td><div className="flex items-center gap-3"><SafeImage src={x.images[0]} alt={x.name} className="h-12 w-9 rounded object-cover" /><span className="font-medium">{x.name}</span></div></Td><Td>{x.category}</Td><Td right>{money(x.price)}</Td><Td right className="font-semibold">{s}</Td><Td>{s === 0 ? <Badge s="Out of stock" tone="red" /> : s <= db.settings.lowStockAt ? <Badge s="Low stock" tone="amber" /> : <Badge s="In stock" tone="green" />}</Td><Td right><Btn size="sm" variant="outline" onClick={() => setPid(x.id)}>Adjust</Btn></Td></tr>; })}</tbody></Table>
      ) : db.stockLog.length === 0 ? <p className="py-12 text-center text-sm text-neutral-500">No movements yet. Place an order on the storefront to see stock move.</p> : (
        <Table><thead><tr><Th>When</Th><Th>Product</Th><Th right>Change</Th><Th>Reason</Th><Th>By</Th></tr></thead><tbody>{db.stockLog.slice(0, 80).map((m) => <tr key={m.id}><Td>{fmtDateTime(m.at)}</Td><Td>{getProductById(m.productId)?.name}</Td><Td right className={m.delta < 0 ? "text-red-600" : "text-emerald-700"}>{m.delta > 0 ? "+" : ""}{m.delta}</Td><Td>{m.reason}</Td><Td>{m.by}</Td></tr>)}</tbody></Table>)}</Card>
      <Modal open={!!p} onClose={() => setPid(null)} title={p ? `Adjust stock · ${p.name}` : ""}>
        {p && <div className="space-y-4"><p className="text-sm text-neutral-600">Current stock: <strong>{db.stock[p.id] ?? 0}</strong></p><Field label="Change (use − to remove)" hint="e.g. 20 to add, -3 for damaged"><Input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} /></Field><Field label="Reason"><Input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Restock from supplier, damaged, audit…" /></Field><div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setPid(null)}>Cancel</Btn><Btn onClick={apply}>Save</Btn></div></div>}
      </Modal>
    </>
  );
}
