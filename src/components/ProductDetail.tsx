import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product: p }: ProductDetailProps) {
  const d = p.details;

  return (
    <div className="p-5 bg-muted/40 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Target Audience
            </p>
            <p className="text-sm">{d.targetAudience}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              JTBD
            </p>
            <blockquote className="italic text-muted-foreground text-sm border-l-2 border-primary pl-3 py-1 bg-background rounded-r-md">
              {d.jtbd}
            </blockquote>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Curriculum
            </p>
            <ul className="space-y-1">
              {d.curriculum.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Grid info */}
          <div className="grid grid-cols-1 gap-y-3 bg-background border border-border rounded-lg p-3">
            {Object.entries(d.grid).map(([key, val]) => (
              <div key={key}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {key}
                </p>
                <p className="text-xs mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Full Price
            </p>
            <p className="text-sm">{d.priceFull}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Deliverables
            </p>
            <p className="text-xs text-muted-foreground">{d.deliverables}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Competitive Positioning
            </p>
            <p className="text-xs text-muted-foreground">{d.competitive}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Why It Works
            </p>
            <p className="text-xs text-muted-foreground">{d.whyItWorks}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Readiness Detail
            </p>
            <p className="text-xs text-muted-foreground">{d.readinessDetail}</p>
          </div>
        </div>
      </div>

      {/* Upsell */}
      <div className="mt-4 pt-4 border-t border-border text-xs">
        <span className="text-muted-foreground">Upsell path: </span>
        <span className="text-primary font-medium">{p.upsell}</span>
      </div>
    </div>
  );
}
