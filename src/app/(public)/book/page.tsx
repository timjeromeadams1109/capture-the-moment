"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useBookingForm } from "@/lib/hooks/useBookingForm";
import {
  BookingProgress,
  Step1ServiceDate,
  Step2Addons,
  Step3Details,
  Step4Review,
} from "@/components/booking";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialService = searchParams.get("service") || undefined;

  const {
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
    isStep3Valid,
  } = useBookingForm(initialService);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Generate a booking number for now (in production, this comes from the API)
      const bookingNumber = `CTM${new Date().getFullYear().toString().slice(-2)}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

      // In production, this would call the API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricing,
        }),
      });

      // For now, simulate success and redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store booking data in sessionStorage for confirmation page
      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          bookingNumber,
          formData,
          pricing,
        })
      );

      router.push(`/book/confirmation?booking=${bookingNumber}`);
    } catch (error) {
      console.error("Booking submission failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Book Your Experience</h1>
          <p className="text-neutral-600 mt-2">
            Complete your booking in just a few steps.
          </p>
        </div>

        {/* Progress */}
        <BookingProgress currentStep={step} onStepClick={goToStep} />

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
          {step === 1 && (
            <Step1ServiceDate
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              canProceed={canProceed}
            />
          )}

          {step === 2 && (
            <Step2Addons
              formData={formData}
              updateFormData={updateFormData}
              pricing={pricing}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === 3 && (
            <Step3Details
              formData={formData}
              updateFormData={updateFormData}
              pricing={pricing}
              onNext={nextStep}
              onBack={prevStep}
              isValid={isStep3Valid}
            />
          )}

          {step === 4 && (
            <Step4Review
              formData={formData}
              updateFormData={updateFormData}
              pricing={pricing}
              onBack={prevStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              goToStep={goToStep}
            />
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Questions? Call us at{" "}
          <a href="tel:+19495550123" className="text-primary-600 hover:underline">
            (949) 555-0123
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
