import { Badge } from "@/components/ui/badge";

export function ResearchActiveFilters({
  count,
  total,
  chips,
}: {
  count: number;
  total: number;
  chips: Array<{ key: string; label: string; value: string }>;
}) {
  return (
    <section className="mt-4 flex flex-wrap items-center gap-3">
      <Badge variant="secondary" className="rounded-2xl px-4 py-2 text-sm">
        {count} of {total} products
      </Badge>
      {chips.length > 0 ? (
        chips.map((chip) => (
          <Badge key={chip.key} variant="outline" className="rounded-2xl px-4 py-2 text-sm">
            {chip.label}: {chip.value}
          </Badge>
        ))
      ) : (
        <span className="text-sm text-muted-foreground">All filters open.</span>
      )}
    </section>
  );
}
