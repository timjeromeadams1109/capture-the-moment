"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { PricingBreakdown } from "@/lib/types/booking";

interface PriceSummaryProps {
  pricing: PricingBreakdown;
  showDeposit?: boolean;
  compact?: boolean;
}

export function PriceSummary({ pricing, showDeposit = true, compact = false }: PriceSummaryProps) {
  if (pricing.totalPrice === 0) {
    return null;
  }

  return (
    <div className={cn("bg-neutral-50 rounded-xl border border-neutral-200", compact ? "p-4" : "p-6")}>
      <h4 className={cn("font-semibold text-neutral-900", compact ? "text-base mb-3" : "text-lg mb-4")}>
        Price Summary
      </h4>

      <div className="space-y-2">
        {pricing.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-neutral-600">{item.label}</span>
            <span
              className={cn(
                item.type === "discount" && "text-emerald-600 font-medium",
                item.type !== "discount" && "text-neutral-900"
              )}
            >
              {item.amount < 0 ? "-" : ""}
              {formatCurrency(Math.abs(item.amount))}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 mt-4 pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(pricing.totalPrice)}</span>
        </div>
      </div>

      {showDeposit && pricing.depositAmount > 0 && (
        <div className="bg-primary-50 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-primary-900">Due Today (25%)</p>
              <p className="text-sm text-primary-700">Secure your date</p>
            </div>
            <span className="text-2xl font-bold text-primary-900">
              {formatCurrency(pricing.depositAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
