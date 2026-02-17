"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BookingFormData } from "@/lib/types/booking";
import { DURATION_OPTIONS, TIME_SLOTS } from "@/lib/types/booking";

interface Step1Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNext: () => void;
  canProceed: boolean;
}

const services = [
  {
    id: "srv-stand-alone",
    slug: "stand-alone",
    name: "Stand-Alone Photo Booth",
    description: "Classic photo booth experience with instant digital delivery",
    basePrice: 275,
    extraHourPrice: 100,
  },
  {
    id: "srv-360-booth",
    slug: "360-booth",
    name: "360 Booth Experience",
    description: "Premium 360-degree video capture with slow-motion effects",
    basePrice: 495,
    extraHourPrice: 150,
    popular: true,
  },
];

export function Step1ServiceDate({
  formData,
  updateFormData,
  onNext,
  canProceed,
}: Step1Props) {
  // Generate dates for next 90 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from tomorrow (minimum 24hr notice)
    for (let i = 1; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const selectedService = services.find((s) => s.slug === formData.serviceSlug);

  const handleServiceSelect = (service: typeof services[0]) => {
    updateFormData({
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceName: service.name,
    });
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    updateFormData({ eventDate: dateStr, startTime: "" });
  };

  const handleTimeSelect = (time: string) => {
    updateFormData({ startTime: time });
  };

  const handleDurationChange = (hours: number) => {
    updateFormData({ durationHours: hours });
  };

  // Format date for display
  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Group dates by month for calendar display
  const datesByMonth = useMemo(() => {
    const grouped: Record<string, Date[]> = {};
    availableDates.forEach((date) => {
      const monthKey = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(date);
    });
    return grouped;
  }, [availableDates]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return Object.keys(datesByMonth)[0];
  });

  return (
    <div className="space-y-8">
      {/* Service Selection */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Select Your Experience
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => {
            const isSelected = formData.serviceSlug === service.slug;
            return (
              <Card
                key={service.slug}
                variant={isSelected ? "selected" : "interactive"}
                padding="md"
                className="relative cursor-pointer"
                onClick={() => handleServiceSelect(service)}
              >
                {service.popular && (
                  <span className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    POPULAR
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected
                        ? "border-primary-600 bg-primary-600"
                        : "border-neutral-300"
                    )}
                  >
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900">{service.name}</h4>
                    <p className="text-sm text-neutral-500 mt-1">{service.description}</p>
                    <p className="text-lg font-bold text-neutral-900 mt-2">
                      Starting at ${service.basePrice}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Date Selection */}
      {formData.serviceSlug && (
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Your Date
          </h3>

          {/* Month tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {Object.keys(datesByMonth).map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => setSelectedMonth(month)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedMonth === month
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {month}
              </button>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {datesByMonth[selectedMonth]?.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const isSelected = formData.eventDate === dateStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "p-3 rounded-lg text-center transition-all",
                    isSelected
                      ? "bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2"
                      : "bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50",
                    isWeekend && !isSelected && "bg-neutral-50"
                  )}
                >
                  <div className="text-xs text-inherit opacity-70">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-lg font-semibold">{date.getDate()}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Selection */}
      {formData.eventDate && (
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Select Start Time
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = formData.startTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleTimeSelect(slot.time)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Duration Selection */}
      {formData.startTime && (
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Event Duration
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {DURATION_OPTIONS.map((option) => {
              const isSelected = formData.durationHours === option.value;
              const extraCost = selectedService
                ? option.extra * selectedService.extraHourPrice
                : 0;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDurationChange(option.value)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-center transition-all",
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                  )}
                >
                  <div className="font-semibold">{option.label}</div>
                  {extraCost > 0 && (
                    <div className={cn("text-xs mt-1", isSelected ? "text-primary-100" : "text-neutral-500")}>
                      +${extraCost}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={onNext} disabled={!canProceed}>
          Continue to Add-ons
        </Button>
      </div>
    </div>
  );
}
