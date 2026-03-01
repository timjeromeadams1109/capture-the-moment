import {
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getDashboardStats } from "@/lib/data/stats";
import { getRecentBookings, getUpcomingEvents } from "@/lib/data/bookings";

// Prevent static generation - this page needs runtime data
export const dynamic = "force-dynamic";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  requested: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Requested" },
  held: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Held" },
  approved: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Approved" },
  deposit_paid: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Deposit Paid" },
  confirmed: { bg: "bg-green-500/20", text: "text-green-400", label: "Confirmed" },
  completed: { bg: "bg-neutral-500/20", text: "text-neutral-400", label: "Completed" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelled" },
};

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down";
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span
                className={changeType === "up" ? "text-emerald-400" : "text-red-400"}
              >
                {change}
              </span>
              <span className="text-neutral-500 text-sm">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-400" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) {
    return "Today";
  }
  if (date.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default async function AdminDashboard() {
  // Fetch real data from database
  const [stats, recentBookings, upcomingEvents] = await Promise.all([
    getDashboardStats(),
    getRecentBookings(5),
    getUpcomingEvents(3),
  ]);

  const revenueProgress = Math.min(
    (stats.revenueThisMonth / stats.revenueTarget) * 100,
    100
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400 mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {/* Revenue progress */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-100">Monthly Revenue</p>
            <p className="text-3xl font-bold text-white mt-1">
              {formatCurrency(stats.revenueThisMonth)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-100">Target</p>
            <p className="text-xl font-semibold text-white">
              {formatCurrency(stats.revenueTarget)}
            </p>
          </div>
        </div>
        <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500"
            style={{ width: `${revenueProgress}%` }}
          />
        </div>
        <p className="text-sm text-primary-100 mt-2">
          {revenueProgress.toFixed(0)}% of monthly target
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bookings This Month"
          value={stats.bookingsThisMonth.toString()}
          change={stats.bookingsMoM !== 0 ? `${stats.bookingsMoM.toFixed(1)}%` : undefined}
          changeType={stats.bookingsMoM >= 0 ? "up" : "down"}
          icon={Calendar}
          href="/admin/bookings"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(stats.aov)}
          icon={TrendingUp}
        />
        <StatCard
          title="Deposits Collected"
          value={formatCurrency(stats.depositsCollected)}
          icon={DollarSign}
        />
        <StatCard
          title="Deposits Pending"
          value={formatCurrency(stats.depositsPending)}
          icon={Clock}
          href="/admin/bookings?status=approved"
        />
      </div>

      {/* Alerts */}
      {(stats.pendingRequests > 0 || stats.holdsExpiringSoon > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.pendingRequests > 0 && (
            <Link
              href="/admin/bookings?status=requested"
              className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 hover:bg-amber-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-amber-400">
                  {stats.pendingRequests} Pending Request
                  {stats.pendingRequests !== 1 && "s"}
                </p>
                <p className="text-sm text-amber-400/70">Awaiting your review</p>
              </div>
            </Link>
          )}
          {stats.holdsExpiringSoon > 0 && (
            <Link
              href="/admin/bookings?status=held"
              className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 hover:bg-red-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-red-400">
                  {stats.holdsExpiringSoon} Hold
                  {stats.holdsExpiringSoon !== 1 && "s"} Expiring Soon
                </p>
                <p className="text-sm text-red-400/70">Within the next 4 hours</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="font-semibold text-white">Recent Bookings</h2>
            <Link
              href="/admin/bookings"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                No bookings yet
              </div>
            ) : (
              recentBookings.map((booking) => {
                const status = statusColors[booking.status] || statusColors.requested;
                return (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {booking.contact_name}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {booking.booking_number} · {booking.services?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                      >
                        {status.label}
                      </span>
                      <p className="text-sm text-neutral-400 mt-1">
                        {formatCurrency(booking.total_price)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="font-semibold text-white">Upcoming Events</h2>
            <Link
              href="/admin/calendar"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Calendar →
            </Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                No upcoming events
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-400">
                      {formatEventDate(event.event_date)}
                    </span>
                    <span className="text-sm text-neutral-400">
                      {formatTime(event.start_time)}
                    </span>
                  </div>
                  <p className="font-medium text-white">{event.contact_name}</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {event.venue_name || "Venue TBD"}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-neutral-800 text-xs text-neutral-300">
                    {event.services?.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/admin/bookings?status=requested"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary-500 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-white">Review Requests</p>
              <p className="text-sm text-neutral-400">Approve pending bookings</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/sms"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary-500 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="font-medium text-white">Send SMS</p>
              <p className="text-sm text-neutral-400">Message clients</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/revenue"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary-500 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-white">View Analytics</p>
              <p className="text-sm text-neutral-400">Revenue & insights</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
