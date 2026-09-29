"use client";
import { useState } from "react";

export function BarChart({ data, height = 200, color = "#0b0b0c", fmt = (n: number) => String(n) }: { data: { label: string; value: number }[]; height?: number; color?: string; fmt?: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 600, pad = 24, bw = (W - pad * 2) / data.length;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Bar chart">
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={pad} x2={W - pad} y1={height - 24 - (height - 44) * g} y2={height - 24 - (height - 44) * g} stroke="#eee" />)}
        {data.map((d, i) => {
          const h = ((height - 44) * d.value) / max;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad + i * bw + bw * 0.18} y={height - 24 - h} width={bw * 0.64} height={Math.max(h, 1)} rx={3} fill={color} opacity={hover === null || hover === i ? 1 : 0.35} />
              {(data.length <= 10 || i % Math.ceil(data.length / 8) === 0) && <text x={pad + i * bw + bw / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#888">{d.label}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded bg-ink px-2.5 py-1 text-xs text-white">{data[hover].label}: {fmt(data[hover].value)}</div>}
    </div>
  );
}

export function LineChart({ data, height = 200, color = "#7c3aed", fmt = (n: number) => String(n) }: { data: { label: string; value: number }[]; height?: number; color?: string; fmt?: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value)); const W = 600, pad = 24;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => height - 24 - ((height - 44) * v) / max;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Line chart">
        <defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".25" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={pad} x2={W - pad} y1={height - 24 - (height - 44) * g} y2={height - 24 - (height - 44) * g} stroke="#eee" />)}
        <path d={`${line} L${x(data.length - 1)},${height - 24} L${x(0)},${height - 24} Z`} fill="url(#lg)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={x(i) - 10} y={0} width={20} height={height} fill="transparent" />
            {hover === i && <circle cx={x(i)} cy={y(d.value)} r={4.5} fill={color} />}
            {(i % Math.ceil(data.length / 7) === 0) && <text x={x(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="#888">{d.label}</text>}
          </g>
        ))}
      </svg>
      {hover !== null && <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded bg-ink px-2.5 py-1 text-xs text-white">{data[hover].label}: {fmt(data[hover].value)}</div>}
    </div>
  );
}

export function Donut({ data, size = 150 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1; const r = 52, c = 2 * Math.PI * r; let off = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="Donut chart">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f1f1" strokeWidth="18" />
        {data.map((d) => { const len = (d.value / total) * c; const el = <circle key={d.label} cx="70" cy="70" r={r} fill="none" stroke={d.color} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />; off += len; return el; })}
        <text x="70" y="75" textAnchor="middle" fontSize="18" fontWeight="600">{total}</text>
      </svg>
      <ul className="space-y-1.5 text-sm">{data.map((d) => <li key={d.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.label} <span className="text-neutral-400">({d.value})</span></li>)}</ul>
    </div>
  );
}
