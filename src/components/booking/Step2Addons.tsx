"use client";

import { Plus, Minus, Check, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { BookingFormData, SelectedAddOn } from "@/lib/types/booking";
import { PriceSummary } from "./PriceSummary";
import type { PricingBreakdown } from "@/lib/types/booking";

interface Step2Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  pricing: PricingBreakdown;
  onNext: () => void;
  onBack: () => void;
}

const addOns = [
  {
    id: "addon-premium-branding",
    slug: "premium-branding",
    name: "Premium Branding Package",
    description: "Custom overlay, start screen, and branded sharing page with your logo and colors",
    price: 125,
    priceType: "flat" as const,
    recommended: true,
  },
  {
    id: "addon-led-lighting",
    slug: "led-lighting",
    name: "LED Ring Lighting Upgrade",
    description: "Professional studio-quality lighting for flawless results regardless of venue conditions",
    price: 75,
    priceType: "flat" as const,
  },
  {
    id: "addon-corporate-package",
    slug: "corporate-package",
    name: "Corporate Package",
    description: "Includes branding package plus dedicated gallery, priority delivery, and commercial usage rights",
    price: 200,
    priceType: "flat" as const,
    corporate: true,
  },
];

export function Step2Addons({
  formData,
  updateFormData,
  pricing,
  onNext,
  onBack,
}: Step2Props) {
  const isAddonSelected = (addonSlug: string) => {
    return formData.selectedAddOns.some((a) => a.slug === addonSlug);
  };

  const toggleAddon = (addon: typeof addOns[0]) => {
    const currentAddOns = [...formData.selectedAddOns];
    const existingIndex = currentAddOns.findIndex((a) => a.slug === addon.slug);

    if (existingIndex >= 0) {
      // Remove addon
      currentAddOns.splice(existingIndex, 1);
    } else {
      // Add addon
      const newAddon: SelectedAddOn = {
        id: addon.id,
        slug: addon.slug,
        name: addon.name,
        quantity: 1,
        unitPrice: addon.price,
        totalPrice: addon.price,
      };
      currentAddOns.push(newAddon);

      // If corporate package is selected, remove premium branding (it's included)
      if (addon.slug === "corporate-package") {
        const brandingIndex = currentAddOns.findIndex((a) => a.slug === "premium-branding");
        if (brandingIndex >= 0) {
          currentAddOns.splice(brandingIndex, 1);
        }
      }

      // If premium branding is selected and corporate package exists, don't add it
      if (addon.slug === "premium-branding" && currentAddOns.some((a) => a.slug === "corporate-package")) {
        return; // Don't add, corporate already includes it
      }
    }

    updateFormData({ selectedAddOns: currentAddOns });
  };

  const corporateSelected = isAddonSelected("corporate-package");

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Add-ons Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Enhance Your Experience
          </h3>
          <p className="text-neutral-600">
            Add premium features to make your event even more memorable.
          </p>
        </div>

        <div className="space-y-4">
          {addOns.map((addon) => {
            const isSelected = isAddonSelected(addon.slug);
            const isDisabled = addon.slug === "premium-branding" && corporateSelected;

            return (
              <Card
                key={addon.slug}
                variant={isSelected ? "selected" : "interactive"}
                padding="md"
                className={cn(
                  "relative cursor-pointer transition-all",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isDisabled && toggleAddon(addon)}
              >
                {addon.recommended && (
                  <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    RECOMMENDED
                  </span>
                )}
                {addon.corporate && (
                  <span className="absolute top-3 right-3 bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    FOR CORPORATE
                  </span>
                )}

                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                      isSelected
                        ? "border-primary-600 bg-primary-600"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-neutral-900">{addon.name}</h4>
                        <p className="text-sm text-neutral-500 mt-1">{addon.description}</p>
                        {isDisabled && (
                          <p className="text-sm text-primary-600 mt-1">
                            Included in Corporate Package
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-neutral-900">
                          +{formatCurrency(addon.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Add-ons Summary */}
        {formData.selectedAddOns.length > 0 && (
          <div className="bg-primary-50 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-2">Selected Add-ons</h4>
            <ul className="space-y-1">
              {formData.selectedAddOns.map((addon) => (
                <li key={addon.slug} className="flex justify-between text-sm text-primary-700">
                  <span>{addon.name}</span>
                  <span>{formatCurrency(addon.totalPrice)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" onClick={onNext}>
            Continue to Details
          </Button>
        </div>
      </div>

      {/* Price Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <PriceSummary pricing={pricing} />
        </div>
      </div>
    </div>
  );
}
