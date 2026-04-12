import type { Product } from "@/types";

interface StatsPanelProps {
  products: Product[];
  total: number;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-muted-foreground min-w-[80px]">{label}</span>
      <Bar value={count} max={total} color={color} />
      <span className={`text-xs font-semibold min-w-[16px] text-right ${color.replace("bg-", "text-")}`}>
        {count}
      </span>
    </div>
  );
}

export function StatsPanel({ products, total }: StatsPanelProps) {
  const n = products.length;

  const byMarket = { LUX: 0, EU: 0, GCC: 0 } as Record<string, number>;
  const byReadiness = { green: 0, yellow: 0, red: 0 } as Record<string, number>;
  const byBp = { live: 0, piloting: 0, ready: 0, hypothesis: 0 } as Record<string, number>;

  for (const p of products) {
    byMarket[p.market] = (byMarket[p.market] ?? 0) + 1;
    byReadiness[p.readiness]++;
    byBp[p.bp]++;
  }

  return (
    <aside className="sticky top-6 bg-card border border-border rounded-xl p-5 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Overview
      </p>
      <p className="text-3xl font-bold leading-none">{n}</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">
        products shown of {total}
      </p>

      <hr className="border-border mb-4" />

      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        By Market
      </p>
      <StatRow label="🇱🇺 LUX" count={byMarket.LUX ?? 0} total={n} color="bg-blue-500" />
      <StatRow label="🇪🇺 EU" count={byMarket.EU ?? 0} total={n} color="bg-violet-500" />
      <StatRow label="🌍 GCC" count={byMarket.GCC ?? 0} total={n} color="bg-emerald-500" />

      <hr className="border-border my-4" />

      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        By Readiness
      </p>
      <StatRow label="🟢 Ready" count={byReadiness.green ?? 0} total={n} color="bg-emerald-500" />
      <StatRow label="🟡 2–4 wk" count={byReadiness.yellow ?? 0} total={n} color="bg-yellow-500" />
      <StatRow label="🔴 2+ mo" count={byReadiness.red ?? 0} total={n} color="bg-red-500" />

      <hr className="border-border my-4" />

      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        By Status
      </p>
      <StatRow label="✅ Live" count={byBp.live ?? 0} total={n} color="bg-emerald-500" />
      <StatRow label="🔄 Piloting" count={byBp.piloting ?? 0} total={n} color="bg-blue-500" />
      <StatRow label="📋 Ready" count={byBp.ready ?? 0} total={n} color="bg-violet-500" />
      <StatRow label="💡 Hyp." count={byBp.hypothesis ?? 0} total={n} color="bg-yellow-500" />
    </aside>
  );
}
