"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDetail } from "@/components/ProductDetail";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
}

const MARKET_CLASS: Record<string, string> = {
  LUX: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  EU: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  GCC: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const READINESS_CLASS: Record<string, string> = {
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
};

const READINESS_LABEL: Record<string, string> = {
  green: "🟢 Ready",
  yellow: "🟡 2–4 wk",
  red: "🔴 2+ mo",
};

const MODEL_CLASS: Record<string, string> = {
  B2B: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  B2C: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  B2B2C: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
};

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 75
      ? "bg-emerald-500"
      : value >= 60
      ? "bg-yellow-500"
      : "bg-red-500";
  return (
    <div className="flex flex-col gap-1 min-w-[72px]">
      <span className="text-xs font-semibold">{value}%</span>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ProductTable({ products }: ProductTableProps) {
  const [openCode, setOpenCode] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm border border-border rounded-xl">
        No products match the current filters.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-8" />
            <TableHead className="text-[10px] font-bold uppercase tracking-wider w-28">
              Code
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider">
              Product
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider w-16">
              Market
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider w-24">
              Readiness
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider hidden md:table-cell">
              Status
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider hidden md:table-cell w-24">
              Model
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider">
              Price
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider hidden lg:table-cell">
              Revenue Y1
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider w-20">
              Conf.
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isOpen = openCode === product.code;
            return (
              <>
                <TableRow
                  key={product.code}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isOpen && "bg-primary/5"
                  )}
                  onClick={() => setOpenCode(isOpen ? null : product.code)}
                >
                  <TableCell className="pl-4 pr-0">
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </TableCell>

                  <TableCell className="font-mono text-[11px] font-semibold text-primary uppercase tracking-wide">
                    {product.code}
                  </TableCell>

                  <TableCell>
                    <p className="font-semibold text-sm">{product.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wide rounded-full px-2",
                        MARKET_CLASS[product.market]
                      )}
                    >
                      {product.market}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold rounded-full px-2 whitespace-nowrap",
                        READINESS_CLASS[product.readiness]
                      )}
                    >
                      {READINESS_LABEL[product.readiness]}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {product.discoveryStatus}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {product.model.split(",").map((m) => {
                        const key = m.trim();
                        return (
                          <Badge
                            key={key}
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold rounded px-1.5",
                              MODEL_CLASS[key]
                            )}
                          >
                            {key}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>

                  <TableCell className="text-primary font-medium text-xs whitespace-nowrap">
                    {product.price}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-emerald-600 dark:text-emerald-400 text-xs whitespace-nowrap">
                    {product.revenue}
                  </TableCell>

                  <TableCell>
                    <ConfidenceBar value={product.confidence} />
                  </TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow key={`${product.code}-detail`} className="hover:bg-transparent">
                    <TableCell colSpan={10} className="p-0">
                      <ProductDetail product={product} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
