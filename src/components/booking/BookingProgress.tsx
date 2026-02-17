"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: "Service & Date" },
  { number: 2, label: "Customize" },
  { number: 3, label: "Details" },
  { number: 4, label: "Review" },
];

export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && currentStep > step.number;

          return (
            <li key={step.number} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={cn(
                      "absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2",
                      isCompleted || isCurrent ? "bg-primary-600" : "bg-neutral-200"
                    )}
                    style={{ width: "calc(100% - 2rem)", right: "calc(50% + 1rem)" }}
                  />
                )}

                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    isCompleted && "bg-primary-600 text-white",
                    isCurrent && "bg-primary-600 text-white ring-4 ring-primary-100",
                    !isCompleted && !isCurrent && "bg-neutral-200 text-neutral-500",
                    isClickable && "cursor-pointer hover:bg-primary-700"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </button>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isCurrent ? "text-primary-600" : "text-neutral-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
