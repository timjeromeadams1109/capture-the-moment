import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBookingById, updateBookingStatus } from "@/lib/data/bookings";
import { sendBookingApproved } from "@/lib/services/notifications";

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

    // Get current booking
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking can be approved
    if (booking.status !== "requested" && booking.status !== "held") {
      return NextResponse.json(
        { success: false, error: "Booking cannot be approved in current status" },
        { status: 400 }
      );
    }

    // Update status to approved
    const updatedBooking = await updateBookingStatus(id, "approved", user.id);

    // Send notification
    const fullBooking = await getBookingById(id);
    if (fullBooking) {
      const notificationResult = await sendBookingApproved(fullBooking);
      console.log("Notification result:", notificationResult);
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking approved successfully",
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve booking" },
      { status: 500 }
    );
  }
}
