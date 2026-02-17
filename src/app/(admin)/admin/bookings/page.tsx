"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";

// Mock data
const mockBookings = [
  {
    id: "1",
    bookingNumber: "CTM250042",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@email.com",
    clientPhone: "(555) 123-4567",
    service: "360 Booth",
    serviceSlug: "360-booth",
    eventDate: "2025-02-22",
    startTime: "18:00",
    duration: 3,
    venue: "The Grand Ballroom, Irvine",
    status: "deposit_paid",
    total: 695,
    deposit: 174,
    depositPaid: true,
    createdAt: "2025-02-10",
  },
  {
    id: "2",
    bookingNumber: "CTM250041",
    clientName: "Michael Chen",
    clientEmail: "michael@company.com",
    clientPhone: "(555) 234-5678",
    service: "Stand-Alone",
    serviceSlug: "stand-alone",
    eventDate: "2025-02-20",
    startTime: "19:00",
    duration: 2,
    venue: "Private Residence, Newport Beach",
    status: "confirmed",
    total: 375,
    deposit: 94,
    depositPaid: true,
    createdAt: "2025-02-08",
  },
  {
    id: "3",
    bookingNumber: "CTM250040",
    clientName: "Tech Corp Inc.",
    clientEmail: "events@techcorp.com",
    clientPhone: "(555) 345-6789",
    service: "360 Booth",
    serviceSlug: "360-booth",
    eventDate: "2025-02-18",
    startTime: "17:00",
    duration: 4,
    venue: "Innovation Center, Costa Mesa",
    status: "approved",
    total: 895,
    deposit: 224,
    depositPaid: false,
    createdAt: "2025-02-05",
  },
  {
    id: "4",
    bookingNumber: "CTM250039",
    clientName: "Emily Rodriguez",
    clientEmail: "emily@gmail.com",
    clientPhone: "(555) 456-7890",
    service: "Stand-Alone",
    serviceSlug: "stand-alone",
    eventDate: "2025-02-25",
    startTime: "20:00",
    duration: 2,
    venue: "Backyard Party, Laguna Beach",
    status: "requested",
    total: 275,
    deposit: 69,
    depositPaid: false,
    createdAt: "2025-02-12",
  },
  {
    id: "5",
    bookingNumber: "CTM250038",
    clientName: "David Park",
    clientEmail: "david.park@email.com",
    clientPhone: "(555) 567-8901",
    service: "360 Booth",
    serviceSlug: "360-booth",
    eventDate: "2025-02-28",
    startTime: "16:00",
    duration: 3,
    venue: "Art Gallery, Santa Ana",
    status: "held",
    total: 570,
    deposit: 143,
    depositPaid: false,
    holdExpiresAt: "2025-02-14T10:00:00",
    createdAt: "2025-02-13",
  },
  {
    id: "6",
    bookingNumber: "CTM250037",
    clientName: "Amanda White",
    clientEmail: "amanda@wedding.com",
    clientPhone: "(555) 678-9012",
    service: "360 Booth",
    serviceSlug: "360-booth",
    eventDate: "2025-03-15",
    startTime: "17:00",
    duration: 4,
    venue: "Seaside Resort, Huntington Beach",
    status: "requested",
    total: 770,
    deposit: 193,
    depositPaid: false,
    createdAt: "2025-02-14",
  },
  {
    id: "7",
    bookingNumber: "CTM250036",
    clientName: "Corporate Events Co.",
    clientEmail: "booking@corpevents.com",
    clientPhone: "(555) 789-0123",
    service: "360 Booth",
    serviceSlug: "360-booth",
    eventDate: "2025-02-15",
    startTime: "18:00",
    duration: 3,
    venue: "Convention Center, Anaheim",
    status: "completed",
    total: 695,
    deposit: 174,
    depositPaid: true,
    createdAt: "2025-02-01",
  },
  {
    id: "8",
    bookingNumber: "CTM250035",
    clientName: "Lisa Thompson",
    clientEmail: "lisa.t@email.com",
    clientPhone: "(555) 890-1234",
    service: "Stand-Alone",
    serviceSlug: "stand-alone",
    eventDate: "2025-02-10",
    startTime: "19:00",
    duration: 2,
    venue: "Restaurant, Tustin",
    status: "cancelled",
    total: 275,
    deposit: 69,
    depositPaid: false,
    createdAt: "2025-01-28",
  },
];

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
  const initialStatus = searchParams.get("status") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [serviceFilter, setServiceFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    return mockBookings.filter((booking) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          booking.bookingNumber.toLowerCase().includes(query) ||
          booking.clientName.toLowerCase().includes(query) ||
          booking.clientEmail.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      // Service filter
      if (serviceFilter !== "all" && booking.serviceSlug !== serviceFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, serviceFilter]);

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          onChange={(e) => setServiceFilter(e.target.value)}
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
          const count = mockBookings.filter(
            (b) => filter.value === "all" || b.status === filter.value
          ).length;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
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
              {filteredBookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.requested;
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
                        {booking.bookingNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-white">{booking.clientName}</p>
                        <p className="text-sm text-neutral-500">{booking.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-neutral-300">{booking.service}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white">
                          {new Date(booking.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {booking.startTime} · {booking.duration}hr
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
                          {formatCurrency(booking.total)}
                        </p>
                        {booking.depositPaid ? (
                          <p className="text-xs text-emerald-400">Deposit paid</p>
                        ) : (
                          <p className="text-xs text-neutral-500">
                            Deposit: {formatCurrency(booking.deposit)}
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
                            <button className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors">
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

        {filteredBookings.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-400">No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          Showing {filteredBookings.length} of {mockBookings.length} bookings
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
