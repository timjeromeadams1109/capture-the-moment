"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  DollarSign,
  CheckCircle,
  XCircle,
  Send,
  Edit,
  Trash2,
  FileText,
  MessageSquare,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

// Mock booking data
const booking = {
  id: "1",
  bookingNumber: "CTM250042",
  status: "approved",

  // Service
  serviceName: "360 Booth Experience",
  serviceSlug: "360-booth",

  // Event
  eventDate: "2025-02-22",
  startTime: "18:00",
  endTime: "21:00",
  durationHours: 3,
  eventType: "Wedding",
  eventName: "Johnson Wedding Reception",

  // Venue
  venueName: "The Grand Ballroom",
  venueAddress: "123 Luxury Lane, Irvine, CA",
  venueZip: "92618",

  // Contact
  contactName: "Sarah Johnson",
  contactEmail: "sarah.johnson@email.com",
  contactPhone: "(555) 123-4567",
  companyName: null,

  // Pricing
  basePrice: 495,
  extraHoursPrice: 150,
  addOnsPrice: 125,
  travelFee: 0,
  discountAmount: 25,
  subtotal: 745,
  taxAmount: 0,
  totalPrice: 720,
  depositAmount: 180,
  depositPaid: false,
  balanceDue: 720,

  // Add-ons
  addOns: [
    { name: "Premium Branding Package", price: 125 },
  ],

  // Referral
  referralCodeUsed: "CTM8XK2P",

  // Notes
  clientNotes: "Please arrive 30 minutes early for setup. The venue has a loading dock on the east side.",
  adminNotes: "",

  // Tracking
  holdExpiresAt: null,
  approvedAt: "2025-02-14T10:30:00",
  createdAt: "2025-02-13T14:22:00",
  updatedAt: "2025-02-14T10:30:00",
};

const statusConfig: Record<string, { bg: string; text: string; label: string; description: string }> = {
  requested: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "Requested",
    description: "Awaiting admin review"
  },
  held: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    label: "Held",
    description: "Date held for 24 hours"
  },
  approved: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "Approved",
    description: "Awaiting deposit payment"
  },
  deposit_paid: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "Deposit Paid",
    description: "Deposit received, pending confirmation"
  },
  confirmed: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    label: "Confirmed",
    description: "Booking confirmed"
  },
  completed: {
    bg: "bg-neutral-500/20",
    text: "text-neutral-400",
    label: "Completed",
    description: "Event completed"
  },
  cancelled: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    label: "Cancelled",
    description: "Booking cancelled"
  },
};

const activityLog = [
  {
    id: 1,
    action: "Booking approved",
    actor: "Admin",
    timestamp: "2025-02-14T10:30:00",
  },
  {
    id: 2,
    action: "Deposit reminder SMS sent",
    actor: "System",
    timestamp: "2025-02-14T10:31:00",
  },
  {
    id: 3,
    action: "Hold created",
    actor: "System",
    timestamp: "2025-02-13T14:22:00",
  },
  {
    id: 4,
    action: "Booking request submitted",
    actor: "Sarah Johnson",
    timestamp: "2025-02-13T14:22:00",
  },
];

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes);
  const status = statusConfig[booking.status] || statusConfig.requested;

  const handleApprove = () => {
    console.log("Approving booking...");
  };

  const handleReject = () => {
    console.log("Rejecting booking...");
  };

  const handleSendSMS = () => {
    console.log("Opening SMS modal...");
  };

  const handleGeneratePaymentLink = () => {
    console.log("Generating payment link...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bookings"
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-mono">
                {booking.bookingNumber}
              </h1>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  status.bg,
                  status.text
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="text-neutral-400 mt-1">{status.description}</p>
          </div>
        </div>

        {/* Action buttons based on status */}
        <div className="flex items-center gap-3">
          {booking.status === "requested" && (
            <>
              <Button variant="outline" onClick={handleReject} className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {booking.status === "approved" && (
            <Button onClick={handleGeneratePaymentLink}>
              <CreditCard className="w-4 h-4 mr-2" />
              Generate Payment Link
            </Button>
          )}
          <Button variant="outline" onClick={handleSendSMS}>
            <Send className="w-4 h-4 mr-2" />
            Send SMS
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              Event Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Service</p>
                  <p className="text-white font-medium">{booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Date</p>
                  <p className="text-white font-medium">{formatDate(booking.eventDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Time</p>
                  <p className="text-white font-medium">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    <span className="text-neutral-400 ml-2">({booking.durationHours} hours)</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Event Type</p>
                  <p className="text-white font-medium">{booking.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Event Name</p>
                  <p className="text-white font-medium">{booking.eventName || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-400" />
              Venue
            </h2>
            <div className="space-y-2">
              <p className="text-white font-medium">{booking.venueName}</p>
              <p className="text-neutral-400">{booking.venueAddress}</p>
              <p className="text-neutral-400">ZIP: {booking.venueZip}</p>
              {booking.travelFee > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm">
                    Travel fee applies: {formatCurrency(booking.travelFee)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-400" />
              Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-neutral-500" />
                <span className="text-white">{booking.contactName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500" />
                <a
                  href={`mailto:${booking.contactEmail}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {booking.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-500" />
                <a
                  href={`tel:${booking.contactPhone}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {booking.contactPhone}
                </a>
              </div>
              {booking.companyName && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-neutral-500" />
                  <span className="text-white">{booking.companyName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Notes */}
          {booking.clientNotes && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                Client Notes
              </h2>
              <p className="text-neutral-300">{booking.clientNotes}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              Admin Notes
            </h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this booking..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
            />
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm">
                Save Notes
              </Button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Activity Log</h2>
            <div className="space-y-4">
              {activityLog.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex gap-4 relative"
                >
                  {index < activityLog.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-neutral-800" />
                  )}
                  <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-700 flex-shrink-0 z-10" />
                  <div className="flex-1 pb-4">
                    <p className="text-white">{activity.action}</p>
                    <p className="text-sm text-neutral-500">
                      {activity.actor} ·{" "}
                      {new Date(activity.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-400" />
              Pricing
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-400">Base price (2 hrs)</span>
                <span className="text-white">{formatCurrency(booking.basePrice)}</span>
              </div>
              {booking.extraHoursPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Extra hour</span>
                  <span className="text-white">{formatCurrency(booking.extraHoursPrice)}</span>
                </div>
              )}
              {booking.addOns.map((addon) => (
                <div key={addon.name} className="flex justify-between">
                  <span className="text-neutral-400">{addon.name}</span>
                  <span className="text-white">{formatCurrency(addon.price)}</span>
                </div>
              ))}
              {booking.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-400">Referral discount</span>
                  <span className="text-emerald-400">-{formatCurrency(booking.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Deposit status */}
            <div className="mt-6 p-4 rounded-lg bg-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400">Deposit (25%)</span>
                <span className="text-white font-medium">
                  {formatCurrency(booking.depositAmount)}
                </span>
              </div>
              {booking.depositPaid ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Paid</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
            </div>

            {/* Balance */}
            <div className="mt-4 p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
              <div className="flex items-center justify-between">
                <span className="text-primary-300">Balance Due</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(booking.balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Referral Info */}
          {booking.referralCodeUsed && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Referral</h2>
              <div className="p-3 bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-400">Referral code used</p>
                <p className="text-white font-mono">{booking.referralCodeUsed}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" fullWidth className="justify-start">
                <Send className="w-4 h-4 mr-2" />
                Send Reminder SMS
              </Button>
              <Button variant="outline" fullWidth className="justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" fullWidth className="justify-start">
                <Edit className="w-4 h-4 mr-2" />
                Edit Booking
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="justify-start border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Created</span>
                <span className="text-neutral-300">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
              {booking.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Approved</span>
                  <span className="text-neutral-300">
                    {new Date(booking.approvedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Last Updated</span>
                <span className="text-neutral-300">
                  {new Date(booking.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
