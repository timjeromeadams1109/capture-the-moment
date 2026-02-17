import { NextRequest, NextResponse } from "next/server";
import { TIME_SLOTS } from "@/lib/types/booking";

// In production, this would query the database for existing bookings
// and return actual availability

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const serviceSlug = searchParams.get("service");

  if (!date) {
    return NextResponse.json(
      { success: false, error: "Date parameter is required" },
      { status: 400 }
    );
  }

  if (!serviceSlug) {
    return NextResponse.json(
      { success: false, error: "Service parameter is required" },
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
  const requestedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestedDate < today) {
    return NextResponse.json(
      { success: false, error: "Cannot check availability for past dates" },
      { status: 400 }
    );
  }

  // In production, query the database for existing bookings on this date
  // For now, simulate some random unavailability

  const slots = TIME_SLOTS.map((slot) => {
    // Simulate random availability (90% available)
    // In production, check against actual bookings
    const randomUnavailable = Math.random() < 0.1;

    return {
      time: slot.time,
      label: slot.label,
      available: !randomUnavailable,
    };
  });

  const fullyBooked = slots.every((slot) => !slot.available);

  return NextResponse.json({
    success: true,
    date,
    serviceSlug,
    slots,
    fullyBooked,
    // Additional metadata
    metadata: {
      checkedAt: new Date().toISOString(),
      timezone: "America/Los_Angeles",
    },
  });
}
