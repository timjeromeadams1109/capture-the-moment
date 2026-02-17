"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, Mail, Phone, ArrowRight } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface BookingData {
  bookingNumber: string;
  formData: {
    serviceName: string;
    eventDate: string;
    startTime: string;
    durationHours: number;
    venueName: string;
    venueAddress: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  pricing: {
    totalPrice: number;
    depositAmount: number;
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get("booking");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const stored = sessionStorage.getItem("pendingBooking");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setBookingData(data);
      } catch (e) {
        console.error("Failed to parse booking data");
      }
    }
  }, []);

  const calculateEndTime = () => {
    if (!bookingData?.formData.startTime) return "";
    const [hours, minutes] = bookingData.formData.startTime.split(":").map(Number);
    const endHours = hours + bookingData.formData.durationHours;
    return formatTime(`${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Booking Request Submitted
          </h1>
          <p className="text-neutral-600">
            We&apos;ve received your request and will review it shortly.
          </p>
        </div>

        {/* Booking Number */}
        <Card padding="lg" className="text-center mb-6">
          <p className="text-sm text-neutral-500 mb-1">Booking Reference</p>
          <p className="text-2xl font-bold text-neutral-900 font-mono">
            {bookingNumber || "CTM250001"}
          </p>
        </Card>

        {/* Booking Summary */}
        {bookingData && (
          <Card padding="lg" className="mb-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Booking Summary</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">
                    {bookingData.formData.serviceName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatDate(bookingData.formData.eventDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-neutral-700">
                    {formatTime(bookingData.formData.startTime)} – {calculateEndTime()}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {bookingData.formData.durationHours} hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-neutral-700">{bookingData.formData.venueName}</p>
                  <p className="text-sm text-neutral-500">
                    {bookingData.formData.venueAddress}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-600">Total Price</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(bookingData.pricing.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Deposit Due (after approval)</span>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(bookingData.pricing.depositAmount)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* What's Next */}
        <Card padding="lg" className="bg-primary-50 border-primary-200 mb-6">
          <h3 className="font-semibold text-primary-900 mb-4">What Happens Next?</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-medium flex items-center justify-center">
                1
              </span>
              <div>
                <p className="font-medium text-primary-900">We Review Your Request</p>
                <p className="text-sm text-primary-700">
                  Your date is held for 24 hours while we review the details.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-medium flex items-center justify-center">
                2
              </span>
              <div>
                <p className="font-medium text-primary-900">Approval Notification</p>
                <p className="text-sm text-primary-700">
                  You&apos;ll receive an SMS and email with a link to pay your deposit.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-medium flex items-center justify-center">
                3
              </span>
              <div>
                <p className="font-medium text-primary-900">Pay Your Deposit</p>
                <p className="text-sm text-primary-700">
                  Secure your date with a 25% deposit. The balance is due on event day.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-medium flex items-center justify-center">
                4
              </span>
              <div>
                <p className="font-medium text-primary-900">Confirmation</p>
                <p className="text-sm text-primary-700">
                  Once paid, you&apos;ll receive a final confirmation with all details.
                </p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Contact Info */}
        <Card padding="md" className="mb-8">
          <p className="text-sm text-neutral-600 mb-3">
            We&apos;ll send updates to:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 text-neutral-700">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>{bookingData?.formData.contactEmail || "your@email.com"}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>{bookingData?.formData.contactPhone || "(555) 123-4567"}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild>
            <Link href="/book">
              Book Another Event
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Help */}
        <p className="text-center text-sm text-neutral-500 mt-8">
          Questions about your booking? Call us at{" "}
          <a href="tel:+19495550123" className="text-primary-600 hover:underline">
            (949) 555-0123
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
