"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  BookingFormData,
  PricingBreakdown,
  SelectedAddOn,
} from "@/lib/types/booking";
import { INITIAL_BOOKING_DATA } from "@/lib/types/booking";

// Service pricing (will come from DB in production)
const SERVICE_PRICING = {
  "stand-alone": { basePrice: 275, extraHourPrice: 100, minHours: 2 },
  "360-booth": { basePrice: 495, extraHourPrice: 150, minHours: 2 },
};

export function useBookingForm(initialService?: string) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const initial = { ...INITIAL_BOOKING_DATA };
    if (initialService && SERVICE_PRICING[initialService as keyof typeof SERVICE_PRICING]) {
      initial.serviceSlug = initialService;
    }
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback(
    (updates: Partial<BookingFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((newStep: number) => {
    if (newStep >= 1 && newStep <= 4) {
      setStep(newStep);
    }
  }, []);

  // Calculate pricing
  const pricing = useMemo((): PricingBreakdown => {
    const serviceKey = formData.serviceSlug as keyof typeof SERVICE_PRICING;
    const service = SERVICE_PRICING[serviceKey];

    if (!service) {
      return {
        basePrice: 0,
        extraHoursPrice: 0,
        extraHours: 0,
        addOnsPrice: 0,
        travelFee: 0,
        travelMiles: 0,
        discountAmount: 0,
        subtotal: 0,
        taxAmount: 0,
        totalPrice: 0,
        depositAmount: 0,
        items: [],
      };
    }

    const items: PricingBreakdown["items"] = [];

    // Base price
    const basePrice = service.basePrice;
    items.push({
      label: `${formData.serviceName || "Photo Booth"} (${service.minHours} hours)`,
      amount: basePrice,
      type: "base",
    });

    // Extra hours
    const extraHours = Math.max(0, formData.durationHours - service.minHours);
    const extraHoursPrice = extraHours * service.extraHourPrice;
    if (extraHours > 0) {
      items.push({
        label: `Additional ${extraHours} hour${extraHours > 1 ? "s" : ""}`,
        amount: extraHoursPrice,
        type: "base",
      });
    }

    // Add-ons
    let addOnsPrice = 0;
    formData.selectedAddOns.forEach((addon) => {
      addOnsPrice += addon.totalPrice;
      items.push({
        label: addon.name,
        amount: addon.totalPrice,
        type: "addon",
      });
    });

    // Holiday premium check (Nov 15 - Jan 5)
    let holidayPremium = 0;
    if (formData.eventDate) {
      const eventDate = new Date(formData.eventDate);
      const month = eventDate.getMonth() + 1;
      const day = eventDate.getDate();
      const isHolidaySeason =
        (month === 11 && day >= 15) || month === 12 || (month === 1 && day <= 5);

      if (isHolidaySeason) {
        holidayPremium = 75;
        items.push({
          label: "Holiday Season Premium",
          amount: holidayPremium,
          type: "fee",
        });
      }
    }

    // Travel fee placeholder (calculated on server)
    const travelFee = 0;
    const travelMiles = 0;

    // Referral discount
    let discountAmount = 0;
    if (formData.referralCode && formData.referralCode.length === 8) {
      discountAmount = 25;
      items.push({
        label: "Referral Discount",
        amount: -discountAmount,
        type: "discount",
      });
    }

    // Totals
    const subtotal =
      basePrice + extraHoursPrice + addOnsPrice + holidayPremium + travelFee - discountAmount;
    const taxAmount = 0;
    const totalPrice = subtotal + taxAmount;
    const depositAmount = Math.round(totalPrice * 0.25);

    return {
      basePrice,
      extraHoursPrice,
      extraHours,
      addOnsPrice,
      travelFee,
      travelMiles,
      discountAmount,
      subtotal,
      taxAmount,
      totalPrice,
      depositAmount,
      items,
    };
  }, [formData]);

  // Validation
  const isStep1Valid = useMemo(() => {
    return (
      formData.serviceSlug !== "" &&
      formData.eventDate !== "" &&
      formData.startTime !== "" &&
      formData.durationHours >= 2
    );
  }, [formData.serviceSlug, formData.eventDate, formData.startTime, formData.durationHours]);

  const isStep2Valid = useMemo(() => {
    // Add-ons are optional, so always valid
    return true;
  }, []);

  const isStep3Valid = useMemo(() => {
    return (
      formData.eventType !== "" &&
      formData.venueName !== "" &&
      formData.venueAddress !== "" &&
      formData.venueZip !== "" &&
      formData.contactName !== "" &&
      formData.contactEmail !== "" &&
      formData.contactPhone !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail) &&
      /^\d{5}(-\d{4})?$/.test(formData.venueZip)
    );
  }, [
    formData.eventType,
    formData.venueName,
    formData.venueAddress,
    formData.venueZip,
    formData.contactName,
    formData.contactEmail,
    formData.contactPhone,
  ]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, isStep1Valid, isStep2Valid, isStep3Valid]);

  return {
    step,
    formData,
    pricing,
    isSubmitting,
    setIsSubmitting,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
  };
}
