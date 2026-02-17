"use client";

import { useState } from "react";
import { MapPin, User, Building, MessageSquare } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BookingFormData, PricingBreakdown } from "@/lib/types/booking";
import { EVENT_TYPES } from "@/lib/types/booking";
import { PriceSummary } from "./PriceSummary";

interface Step3Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  pricing: PricingBreakdown;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

export function Step3Details({
  formData,
  updateFormData,
  pricing,
  onNext,
  onBack,
  isValid,
}: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "contactEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "contactPhone":
        if (value && !/^[\d\s\-\(\)\+]{10,}$/.test(value.replace(/\s/g, ""))) {
          error = "Please enter a valid phone number";
        }
        break;
      case "venueZip":
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
          error = "Please enter a valid ZIP code";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (field: keyof BookingFormData, value: string) => {
    updateFormData({ [field]: value });
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Fields */}
      <div className="lg:col-span-2 space-y-8">
        {/* Event Type */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Event Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EVENT_TYPES.map((type) => {
              const isSelected = formData.eventType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("eventType", type)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium text-left transition-all",
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-700"
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Name */}
        <div>
          <Input
            label="Event Name (Optional)"
            placeholder="e.g., Sarah's 30th Birthday, ACME Corp Holiday Party"
            value={formData.eventName}
            onChange={(e) => handleChange("eventName", e.target.value)}
            helperText="Help us personalize your experience"
          />
        </div>

        {/* Venue Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Venue Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Venue Name"
              placeholder="e.g., The Grand Ballroom, Backyard at 123 Main St"
              value={formData.venueName}
              onChange={(e) => handleChange("venueName", e.target.value)}
              required
            />
            <Input
              label="Venue Address"
              placeholder="Full street address"
              value={formData.venueAddress}
              onChange={(e) => handleChange("venueAddress", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP Code"
                placeholder="92618"
                value={formData.venueZip}
                onChange={(e) => handleChange("venueZip", e.target.value)}
                onBlur={(e) => handleBlur("venueZip", e.target.value)}
                error={errors.venueZip}
                required
              />
              <div className="flex items-end">
                <p className="text-sm text-neutral-500 pb-3">
                  60 miles included from Irvine.
                  <br />
                  $100 flat fee if beyond.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Your Name"
              placeholder="Full name"
              value={formData.contactName}
              onChange={(e) => handleChange("contactName", e.target.value)}
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                onBlur={(e) => handleBlur("contactEmail", e.target.value)}
                error={errors.contactEmail}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", formatPhoneNumber(e.target.value))}
                onBlur={(e) => handleBlur("contactPhone", e.target.value)}
                error={errors.contactPhone}
                required
              />
            </div>
            <Input
              label="Company Name (Optional)"
              placeholder="For corporate events"
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Additional Notes (Optional)
          </h3>
          <textarea
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 min-h-[100px]"
            placeholder="Any special requests, setup requirements, or other information we should know..."
            value={formData.clientNotes}
            onChange={(e) => handleChange("clientNotes", e.target.value)}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" onClick={onNext} disabled={!isValid}>
            Review Booking
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
