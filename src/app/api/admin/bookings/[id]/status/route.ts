import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateBookingStatus } from "@/lib/data/bookings";
import type { BookingStatus } from "@/lib/types/database";

const statusUpdateSchema = z.object({
  status: z.enum([
    "requested",
    "held",
    "approved",
    "deposit_paid",
    "confirmed",
    "completed",
    "cancelled",
    "expired",
    "no_show",
  ]),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Validate request body
    const body = await request.json();
    const validationResult = statusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { status, reason } = validationResult.data;

    // Update status
    const additionalData: Record<string, unknown> = {};
    if (status === "cancelled" && reason) {
      additionalData.cancellation_reason = reason;
    }

    const updatedBooking = await updateBookingStatus(
      id,
      status as BookingStatus,
      user.id,
      additionalData
    );

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
