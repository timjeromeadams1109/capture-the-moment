"use client";

// Prevent static generation - this page requires runtime features
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types/database";

interface BookingListItem {
  id: string;
  booking_number: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  event_date: string;
  start_time: string;
  duration_hours: number;
  status: BookingStatus;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  services: {
    name: string;
    slug: string;
  };
}

interface BookingsResponse {
  bookings: BookingListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: Record<string, number>;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  requested: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Requested" },
  held: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Held" },
  approved: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Approved" },
  deposit_paid: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Deposit Paid" },
  confirmed: { bg: "bg-green-500/20", text: "text-green-400", label: "Confirmed" },
  completed: { bg: "bg-neutral-500/20", text: "text-neutral-400", label: "Completed" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelled" },
  expired: { bg: "bg-neutral-500/20", text: "text-neutral-500", label: "Expired" },
};

const statusFilters = [
  { value: "all", label: "All Bookings" },
  { value: "requested", label: "Requested" },
  { value: "held", label: "Held" },
  { value: "approved", label: "Approved" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get("status") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BookingsResponse | null>(null);
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (serviceFilter !== "all") params.set("service", serviceFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", page.toString());

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceFilter, searchQuery, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    // Update URL when status filter changes
    const params = new URLSearchParams(searchParams.toString());
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }
    router.replace(`/admin/bookings?${params.toString()}`, { scroll: false });
  }, [statusFilter, router, searchParams]);

  const handleApprove = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!confirm("Are you sure you want to reject this booking?")) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", reason: "Rejected by admin" }),
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  const bookings = data?.bookings || [];
  const counts = data?.counts || {};

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-neutral-400 mt-1">
            Manage all booking requests and reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, email, or booking #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>

        {/* Service filter */}
        <select
          value={serviceFilter}
          onChange={(e) => {
            setServiceFilter(e.target.value);
            setPage(1);
          }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Services</option>
          <option value="stand-alone">Stand-Alone</option>
          <option value="360-booth">360 Booth</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.slice(0, 6).map((filter) => {
          const count =
            filter.value === "all"
              ? counts["all"] || 0
              : counts[filter.value] || 0;
          return (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                statusFilter === filter.value
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              )}
            >
              {filter.label}
              <span className="ml-2 px-1.5 py-0.5 rounded bg-black/20 text-xs">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                      Booking
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                      Client
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                      Service
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                      Event Date
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                      Total
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {bookings.map((booking) => {
                    const status =
                      statusConfig[booking.status] || statusConfig.requested;
                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="font-mono text-sm text-primary-400 hover:text-primary-300"
                          >
                            {booking.booking_number}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {booking.contact_name}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {booking.contact_email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-neutral-300">
                            {booking.services?.name}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-white">
                              {new Date(
                                booking.event_date + "T00:00:00"
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {booking.start_time} · {booking.duration_hours}hr
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                              status.bg,
                              status.text
                            )}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {formatCurrency(booking.total_price)}
                            </p>
                            {booking.deposit_paid ? (
                              <p className="text-xs text-emerald-400">
                                Deposit paid
                              </p>
                            ) : (
                              <p className="text-xs text-neutral-500">
                                Deposit: {formatCurrency(booking.deposit_amount)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {booking.status === "requested" && (
                              <>
                                <button
                                  onClick={() => handleApprove(booking.id)}
                                  className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(booking.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {bookings.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-neutral-400">
                  No bookings found matching your criteria.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            Showing {bookings.length} of {data.total} bookings
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
