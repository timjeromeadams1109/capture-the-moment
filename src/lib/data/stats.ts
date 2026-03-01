import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardStats {
  revenueThisMonth: number;
  revenueTarget: number;
  bookingsThisMonth: number;
  aov: number;
  depositsCollected: number;
  depositsPending: number;
  pendingRequests: number;
  holdsExpiringSoon: number;
  revenueMoM: number;
  bookingsMoM: number;
  todaysEvents: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const today = now.toISOString().split("T")[0];
  const fourHoursFromNow = new Date(
    now.getTime() + 4 * 60 * 60 * 1000
  ).toISOString();

  // Get bookings this month
  const { data: thisMonthBookings } = await supabase
    .from("bookings")
    .select("total_price, deposit_amount, deposit_paid, status")
    .gte("created_at", startOfMonth.toISOString())
    .not("status", "in", '("cancelled","expired")');

  // Get bookings last month for comparison
  const { data: lastMonthBookings } = await supabase
    .from("bookings")
    .select("total_price")
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())
    .not("status", "in", '("cancelled","expired")');

  // Get pending requests count
  const { count: pendingRequests } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "requested");

  // Get holds expiring soon
  const { count: holdsExpiringSoon } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "held")
    .lte("hold_expires_at", fourHoursFromNow)
    .gte("hold_expires_at", now.toISOString());

  // Get today's events
  const { count: todaysEvents } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("event_date", today)
    .in("status", ["confirmed", "deposit_paid"]);

  // Calculate stats
  const bookingsArray = thisMonthBookings || [];
  const lastMonthArray = lastMonthBookings || [];

  const revenueThisMonth = bookingsArray.reduce(
    (sum, b) => sum + (b.total_price || 0),
    0
  );
  const revenueLastMonth = lastMonthArray.reduce(
    (sum, b) => sum + (b.total_price || 0),
    0
  );

  const bookingsThisMonth = bookingsArray.length;
  const bookingsLastMonth = lastMonthArray.length;

  const depositsCollected = bookingsArray
    .filter((b) => b.deposit_paid)
    .reduce((sum, b) => sum + (b.deposit_amount || 0), 0);

  const depositsPending = bookingsArray
    .filter((b) => !b.deposit_paid && b.status === "approved")
    .reduce((sum, b) => sum + (b.deposit_amount || 0), 0);

  const aov = bookingsThisMonth > 0 ? revenueThisMonth / bookingsThisMonth : 0;

  const revenueMoM =
    revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 0;

  const bookingsMoM =
    bookingsLastMonth > 0
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
      : 0;

  // Revenue target (e.g., $8,000/month)
  const revenueTarget = 8000;

  return {
    revenueThisMonth,
    revenueTarget,
    bookingsThisMonth,
    aov,
    depositsCollected,
    depositsPending,
    pendingRequests: pendingRequests || 0,
    holdsExpiringSoon: holdsExpiringSoon || 0,
    revenueMoM,
    bookingsMoM,
    todaysEvents: todaysEvents || 0,
  };
}

export interface RevenueStats {
  daily: Array<{ date: string; revenue: number; bookings: number }>;
  byService: Array<{ service: string; revenue: number; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

export async function getRevenueStats(
  startDate: string,
  endDate: string
): Promise<RevenueStats> {
  const supabase = createAdminClient();

  // Get bookings in date range
  const { data: bookings } = await supabase
    .from("bookings")
    .select("event_date, total_price, status, services(name)")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .not("status", "in", '("cancelled","expired")');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookingsArray = (bookings || []) as Array<{
    event_date: string;
    total_price: number;
    status: string;
    services: { name: string } | { name: string }[] | null;
  }>;

  // Aggregate daily stats
  const dailyMap = new Map<string, { revenue: number; bookings: number }>();
  bookingsArray.forEach((b) => {
    const existing = dailyMap.get(b.event_date) || { revenue: 0, bookings: 0 };
    dailyMap.set(b.event_date, {
      revenue: existing.revenue + (b.total_price || 0),
      bookings: existing.bookings + 1,
    });
  });

  const daily = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate by service
  const serviceMap = new Map<string, { revenue: number; count: number }>();
  bookingsArray.forEach((b) => {
    const services = b.services;
    const serviceName = Array.isArray(services)
      ? services[0]?.name
      : services?.name || "Unknown";
    const existing = serviceMap.get(serviceName) || { revenue: 0, count: 0 };
    serviceMap.set(serviceName, {
      revenue: existing.revenue + (b.total_price || 0),
      count: existing.count + 1,
    });
  });

  const byService = Array.from(serviceMap.entries()).map(
    ([service, data]) => ({
      service,
      ...data,
    })
  );

  // Aggregate by status
  const statusMap = new Map<string, number>();
  bookingsArray.forEach((b) => {
    statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1);
  });

  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return { daily, byService, byStatus };
}

export async function getBookingCountsByStatus(): Promise<
  Record<string, number>
> {
  const supabase = createAdminClient();

  const statuses = [
    "requested",
    "held",
    "approved",
    "deposit_paid",
    "confirmed",
    "completed",
    "cancelled",
  ];

  const counts: Record<string, number> = {};

  for (const status of statuses) {
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    counts[status] = count || 0;
  }

  // Get total
  const { count: total } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });
  counts["all"] = total || 0;

  return counts;
}
