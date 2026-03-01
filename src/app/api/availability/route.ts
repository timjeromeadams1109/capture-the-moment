import { NextRequest, NextResponse } from "next/server";
import { TIME_SLOTS } from "@/lib/types/booking";
import { createAdminClient } from "@/lib/supabase/admin";

interface BookingSlot {
  start_time: string;
  end_time: string;
  duration_hours: number;
  service_id: string;
}

interface TimeSlotRecord {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const serviceSlug = searchParams.get("service");

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check if date is in the past
    const requestedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      // Return all slots as unavailable for past dates
      const slots = TIME_SLOTS.map((slot) => ({
        time: slot.time,
        label: slot.label,
        available: false,
      }));

      return NextResponse.json({
        success: true,
        date,
        serviceSlug,
        slots,
        fullyBooked: true,
        metadata: {
          checkedAt: new Date().toISOString(),
          timezone: "America/Los_Angeles",
        },
      });
    }

    const supabase = createAdminClient();

    // Get service ID if slug provided
    let serviceId: string | null = null;
    if (serviceSlug) {
      const { data: service } = await supabase
        .from("services")
        .select("id")
        .eq("slug", serviceSlug)
        .single<{ id: string }>();

      if (service) {
        serviceId = service.id;
      }
    }

    // Check for existing bookings on this date
    const bookingsQueryBase = supabase
      .from("bookings")
      .select("start_time, end_time, duration_hours, service_id")
      .eq("event_date", date)
      .not("status", "in", '("cancelled","expired")');

    const { data: existingBookingsRaw } = serviceId
      ? await bookingsQueryBase.eq("service_id", serviceId)
      : await bookingsQueryBase;

    const existingBookings = existingBookingsRaw as BookingSlot[] | null;

    // Check time_slots table for any locked/blocked slots
    const slotsQueryBase = supabase
      .from("time_slots")
      .select("start_time, end_time, is_available")
      .eq("slot_date", date);

    const { data: timeSlotsRaw } = serviceId
      ? await slotsQueryBase.eq("service_id", serviceId)
      : await slotsQueryBase;

    const timeSlots = timeSlotsRaw as TimeSlotRecord[] | null;

    // Determine which times are blocked
    const bookedTimes = new Set<string>();

    // Mark times blocked by existing bookings
    existingBookings?.forEach((booking) => {
      const [startHour] = booking.start_time.split(":").map(Number);
      for (let h = startHour; h < startHour + booking.duration_hours; h++) {
        const timeStr = `${h.toString().padStart(2, "0")}:00`;
        bookedTimes.add(timeStr);
      }
    });

    // Mark times blocked by time_slots
    timeSlots?.forEach((slot) => {
      if (!slot.is_available) {
        bookedTimes.add(slot.start_time);
      }
    });

    // Build availability response using TIME_SLOTS constant
    const slots = TIME_SLOTS.map((slot) => ({
      time: slot.time,
      label: slot.label,
      available: !bookedTimes.has(slot.time),
    }));

    const fullyBooked = slots.every((slot) => !slot.available);

    return NextResponse.json({
      success: true,
      date,
      serviceSlug,
      slots,
      fullyBooked,
      metadata: {
        checkedAt: new Date().toISOString(),
        timezone: "America/Los_Angeles",
      },
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
