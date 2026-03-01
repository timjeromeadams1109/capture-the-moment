"use client";

// Prevent static generation - this page requires runtime features
export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { BookingFull } from "@/lib/types/database";

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string; description: string }
> = {
  requested: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "Requested",
    description: "Awaiting admin review",
  },
  held: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    label: "Held",
    description: "Date held for 24 hours",
  },
  approved: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "Approved",
    description: "Awaiting deposit payment",
  },
  deposit_paid: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "Deposit Paid",
    description: "Deposit received, pending confirmation",
  },
  confirmed: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    label: "Confirmed",
    description: "Booking confirmed",
  },
  completed: {
    bg: "bg-neutral-500/20",
    text: "text-neutral-400",
    label: "Completed",
    description: "Event completed",
  },
  cancelled: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    label: "Cancelled",
    description: "Booking cancelled",
  },
};

interface Activity {
  id: string;
  action: string;
  actor_type: string;
  actor_id: string | null;
  created_at: string;
  users?: { full_name: string } | null;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingFull | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await fetch(`/api/admin/bookings/${resolvedParams.id}`);
        const data = await response.json();

        if (data.success) {
          setBooking(data.booking);
          setActivity(data.activity || []);
          setAdminNotes(data.booking.admin_notes || "");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [resolvedParams.id]);

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      const response = await fetch(
        `/api/admin/bookings/${resolvedParams.id}/approve`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
        router.refresh();
      }
    } catch (error) {
      console.error("Error approving booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this booking?")) return;

    setActionLoading("reject");
    try {
      const response = await fetch(
        `/api/admin/bookings/${resolvedParams.id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelled",
            reason: "Rejected by admin",
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
        router.refresh();
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/admin/bookings/${resolvedParams.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: adminNotes }),
      });
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSendSMS = () => {
    router.push(`/admin/sms?booking=${resolvedParams.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Booking not found</p>
        <Link href="/admin/bookings" className="text-primary-400 mt-4 block">
          &larr; Back to bookings
        </Link>
      </div>
    );
  }

  const status = statusConfig[booking.status] || statusConfig.requested;
  const addOns = booking.booking_add_ons || [];
  const balanceDue = booking.total_price - (booking.deposit_paid ? booking.deposit_amount : 0);

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
                {booking.booking_number}
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
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                {actionLoading === "reject" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={actionLoading !== null}>
                {actionLoading === "approve" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
          {booking.status === "approved" && (
            <Button>
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
                  <p className="text-white font-medium">
                    {booking.services?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Date</p>
                  <p className="text-white font-medium">
                    {formatDate(booking.event_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Time</p>
                  <p className="text-white font-medium">
                    {formatTime(booking.start_time)} -{" "}
                    {formatTime(booking.end_time)}
                    <span className="text-neutral-400 ml-2">
                      ({booking.duration_hours} hours)
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Event Type</p>
                  <p className="text-white font-medium">
                    {booking.event_type || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Event Name</p>
                  <p className="text-white font-medium">
                    {booking.event_name || "—"}
                  </p>
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
              <p className="text-white font-medium">
                {booking.venue_name || "—"}
              </p>
              <p className="text-neutral-400">{booking.venue_address || "—"}</p>
              <p className="text-neutral-400">ZIP: {booking.venue_zip || "—"}</p>
              {booking.travel_fee > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm">
                    Travel fee applies: {formatCurrency(booking.travel_fee)}
                    {booking.travel_miles && ` (${booking.travel_miles} miles)`}
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
                <span className="text-white">{booking.contact_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500" />
                <a
                  href={`mailto:${booking.contact_email}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {booking.contact_email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-500" />
                <a
                  href={`tel:${booking.contact_phone}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {booking.contact_phone}
                </a>
              </div>
              {booking.company_name && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-neutral-500" />
                  <span className="text-white">{booking.company_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Notes */}
          {booking.client_notes && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                Client Notes
              </h2>
              <p className="text-neutral-300">{booking.client_notes}</p>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save Notes
              </Button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Activity Log
            </h2>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <p className="text-neutral-400">No activity recorded</p>
              ) : (
                activity.map((item, index) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {index < activity.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-neutral-800" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-700 flex-shrink-0 z-10" />
                    <div className="flex-1 pb-4">
                      <p className="text-white">
                        {item.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {item.actor_type === "system"
                          ? "System"
                          : item.users?.full_name || "Admin"}{" "}
                        ·{" "}
                        {new Date(item.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
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
                <span className="text-neutral-400">
                  Base price ({booking.services?.min_hours || 2} hrs)
                </span>
                <span className="text-white">
                  {formatCurrency(booking.base_price)}
                </span>
              </div>
              {booking.extra_hours_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Extra hours</span>
                  <span className="text-white">
                    {formatCurrency(booking.extra_hours_price)}
                  </span>
                </div>
              )}
              {addOns.map((addon) => (
                <div key={addon.id} className="flex justify-between">
                  <span className="text-neutral-400">
                    {addon.add_ons?.name || "Add-on"}
                  </span>
                  <span className="text-white">
                    {formatCurrency(addon.total_price)}
                  </span>
                </div>
              ))}
              {booking.travel_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Travel fee</span>
                  <span className="text-white">
                    {formatCurrency(booking.travel_fee)}
                  </span>
                </div>
              )}
              {booking.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-400">
                    Referral discount
                  </span>
                  <span className="text-emerald-400">
                    -{formatCurrency(booking.discount_amount)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deposit status */}
            <div className="mt-6 p-4 rounded-lg bg-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400">Deposit (25%)</span>
                <span className="text-white font-medium">
                  {formatCurrency(booking.deposit_amount)}
                </span>
              </div>
              {booking.deposit_paid ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Paid{" "}
                    {booking.deposit_paid_at &&
                      `on ${new Date(booking.deposit_paid_at).toLocaleDateString()}`}
                  </span>
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
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Referral Info */}
          {booking.referral_code_used && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Referral
              </h2>
              <div className="p-3 bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-400">Referral code used</p>
                <p className="text-white font-mono">
                  {booking.referral_code_used}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                className="justify-start"
                onClick={handleSendSMS}
              >
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
                  {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
              {booking.approved_at && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Approved</span>
                  <span className="text-neutral-300">
                    {new Date(booking.approved_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {booking.deposit_paid_at && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deposit Paid</span>
                  <span className="text-neutral-300">
                    {new Date(booking.deposit_paid_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Last Updated</span>
                <span className="text-neutral-300">
                  {new Date(booking.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
