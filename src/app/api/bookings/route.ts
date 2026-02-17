import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for booking creation
const bookingSchema = z.object({
  serviceId: z.string().optional(),
  serviceSlug: z.string().min(1, "Service is required"),
  serviceName: z.string().min(1, "Service name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  durationHours: z.number().min(2, "Minimum 2 hours required"),
  selectedAddOns: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
  eventType: z.string().min(1, "Event type is required"),
  eventName: z.string().optional(),
  venueName: z.string().min(1, "Venue name is required"),
  venueAddress: z.string().min(1, "Venue address is required"),
  venueZip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Invalid phone number"),
  companyName: z.string().optional(),
  clientNotes: z.string().optional(),
  referralCode: z.string().optional(),
  pricing: z.object({
    basePrice: z.number(),
    extraHoursPrice: z.number(),
    extraHours: z.number(),
    addOnsPrice: z.number(),
    travelFee: z.number(),
    travelMiles: z.number(),
    discountAmount: z.number(),
    subtotal: z.number(),
    taxAmount: z.number(),
    totalPrice: z.number(),
    depositAmount: z.number(),
    items: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        type: z.enum(["base", "addon", "fee", "discount"]),
      })
    ),
  }),
});

// Generate booking number
function generateBookingNumber(): string {
  const prefix = "CTM";
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${year}${random}`;
}

// Calculate end time
function calculateEndTime(startTime: string, durationHours: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const endHours = hours + durationHours;
  return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = bookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate booking number
    const bookingNumber = generateBookingNumber();

    // Calculate end time
    const endTime = calculateEndTime(data.startTime, data.durationHours);

    // In production, this would:
    // 1. Check availability one more time (atomic lock)
    // 2. Create the booking in the database
    // 3. Send confirmation SMS
    // 4. Notify admin
    // 5. Set up 24-hour hold expiration

    // For now, simulate the booking creation
    const booking = {
      id: crypto.randomUUID(),
      bookingNumber,
      serviceId: data.serviceId,
      serviceSlug: data.serviceSlug,
      serviceName: data.serviceName,
      eventDate: data.eventDate,
      startTime: data.startTime,
      endTime,
      durationHours: data.durationHours,
      eventType: data.eventType,
      eventName: data.eventName || null,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      venueZip: data.venueZip,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      companyName: data.companyName || null,
      clientNotes: data.clientNotes || null,
      referralCodeUsed: data.referralCode || null,
      basePrice: data.pricing.basePrice,
      extraHoursPrice: data.pricing.extraHoursPrice,
      addOnsPrice: data.pricing.addOnsPrice,
      travelFee: data.pricing.travelFee,
      discountAmount: data.pricing.discountAmount,
      subtotal: data.pricing.subtotal,
      taxAmount: data.pricing.taxAmount,
      totalPrice: data.pricing.totalPrice,
      depositAmount: data.pricing.depositAmount,
      depositPaid: false,
      status: "requested",
      holdExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      addOns: data.selectedAddOns,
    };

    // Log the booking (in production, save to database)
    console.log("New booking created:", JSON.stringify(booking, null, 2));

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        totalPrice: booking.totalPrice,
        depositAmount: booking.depositAmount,
        holdExpiresAt: booking.holdExpiresAt,
      },
      message: "Booking request submitted successfully",
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // In production, this would fetch bookings from the database
  // with proper authentication and filtering

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  return NextResponse.json({
    success: true,
    bookings: [],
    message: "Bookings endpoint ready. Connect Supabase to enable.",
  });
}
