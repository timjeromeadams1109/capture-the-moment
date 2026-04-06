import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBookings } from "@/lib/data/bookings";
import { getBookingCountsByStatus } from "@/lib/data/stats";
import type { BookingStatus } from "@/lib/types/database";
import { adminLimiter, checkLimit } from "@/lib/ratelimit";
import { logError, logRequest } from "@/lib/logger";

export async function GET(request: NextRequest) {
  logRequest(request);
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single<{ role: string }>();

    if (userData?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { allowed } = await checkLimit(adminLimiter, user.id);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as BookingStatus | "all" | null;
    const service = searchParams.get("service");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");

    // Fetch bookings and counts in parallel
    const [bookingsResult, counts] = await Promise.all([
      getBookings({
        status: status || "all",
        serviceSlug: service || undefined,
        search: search || undefined,
        page,
        limit: 20,
      }),
      getBookingCountsByStatus(),
    ]);

    return NextResponse.json({
      success: true,
      ...bookingsResult,
      counts,
    });
  } catch (error) {
    logError(error, { endpoint: '/api/admin/bookings' });
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
