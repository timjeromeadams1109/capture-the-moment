"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, Mail, Phone, Building, Tag, AlertCircle, CheckCircle } from "lucide-react";
import { Button, Card, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { BookingFormData, PricingBreakdown } from "@/lib/types/booking";
import { PriceSummary } from "./PriceSummary";

interface Step4Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  pricing: PricingBreakdown;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  goToStep: (step: number) => void;
}

export function Step4Review({
  formData,
  updateFormData,
  pricing,
  onBack,
  onSubmit,
  isSubmitting,
  goToStep,
}: Step4Props) {
  const [referralCode, setReferralCode] = useState(formData.referralCode);
  const [referralError, setReferralError] = useState("");
  const [referralValid, setReferralValid] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleReferralCodeChange = (value: string) => {
    const code = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setReferralCode(code);
    setReferralError("");
    setReferralValid(false);

    if (code.length === 8) {
      // Validate code format (in production, this would check against the database)
      setReferralValid(true);
      updateFormData({ referralCode: code });
    } else if (code.length > 0 && code.length < 8) {
      updateFormData({ referralCode: "" });
    } else {
      updateFormData({ referralCode: "" });
    }
  };

  const calculateEndTime = () => {
    if (!formData.startTime) return "";
    const [hours, minutes] = formData.startTime.split(":").map(Number);
    const endHours = hours + formData.durationHours;
    return formatTime(`${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Review Details */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Review Your Booking
          </h3>
          <p className="text-neutral-600">
            Please review all details before submitting your request.
          </p>
        </div>

        {/* Service & Date */}
        <Card padding="md">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-neutral-900">Service & Schedule</h4>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">{formData.serviceName}</p>
                <p className="text-sm text-neutral-500">
                  {formData.eventDate ? formatDate(formData.eventDate) : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">
                  {formData.startTime ? formatTime(formData.startTime) : ""} – {calculateEndTime()}
                </p>
                <p className="text-sm text-neutral-500">{formData.durationHours} hours</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Add-ons */}
        {formData.selectedAddOns.length > 0 && (
          <Card padding="md">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-neutral-900">Add-ons</h4>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit
              </button>
            </div>
            <ul className="space-y-2">
              {formData.selectedAddOns.map((addon) => (
                <li key={addon.slug} className="flex justify-between">
                  <span className="text-neutral-700">{addon.name}</span>
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(addon.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Venue & Contact */}
        <Card padding="md">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-neutral-900">Event Details</h4>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-neutral-900">{formData.venueName}</p>
                  <p className="text-sm text-neutral-500">{formData.venueAddress}</p>
                  <p className="text-sm text-neutral-500">{formData.venueZip}</p>
                </div>
              </div>
              {formData.eventType && (
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <Badge variant="default">{formData.eventType}</Badge>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                <p className="text-neutral-700">{formData.contactName}</p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                <p className="text-neutral-700">{formData.contactEmail}</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                <p className="text-neutral-700">{formData.contactPhone}</p>
              </div>
              {formData.companyName && (
                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                  <p className="text-neutral-700">{formData.companyName}</p>
                </div>
              )}
            </div>
          </div>
          {formData.clientNotes && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 mb-1">Additional Notes</p>
              <p className="text-neutral-700">{formData.clientNotes}</p>
            </div>
          )}
        </Card>

        {/* Referral Code */}
        <Card padding="md">
          <h4 className="font-semibold text-neutral-900 mb-4">Have a Referral Code?</h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter 8-character code"
                value={referralCode}
                onChange={(e) => handleReferralCodeChange(e.target.value)}
                error={referralError}
                className={cn(referralValid && "border-emerald-500")}
              />
            </div>
            {referralValid && (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">$25 off applied</span>
              </div>
            )}
          </div>
        </Card>

        {/* Terms & Conditions */}
        <Card padding="md" className="bg-neutral-50">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">
              I agree to the{" "}
              <a href="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
              . I understand that a 25% deposit is required to confirm my booking and that the
              remaining balance is due on the day of the event.
            </span>
          </label>
        </Card>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700">
              <li>We&apos;ll review your request and hold the date for 24 hours</li>
              <li>You&apos;ll receive an approval notification via SMS and email</li>
              <li>Pay your 25% deposit to confirm the booking</li>
              <li>We&apos;ll send a confirmation and event details</li>
            </ol>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!agreedToTerms || isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </div>
      </div>

      {/* Price Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <PriceSummary pricing={pricing} />

          <div className="mt-4 bg-primary-50 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              <strong>Deposit due after approval:</strong>
              <br />
              {formatCurrency(pricing.depositAmount)} (25%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
