import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking, getBookingById } from "@/lib/data/bookings";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/services/notifications";

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

// Calculate end time
function calculateEndTime(startTime: string, durationHours: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const endHours = hours + durationHours;
  return `${endHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
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

    // Get service ID from slug if not provided
    let serviceId = data.serviceId;
    if (!serviceId) {
      const supabase = createAdminClient();
      const { data: service } = await supabase
        .from("services")
        .select("id")
        .eq("slug", data.serviceSlug)
        .single<{ id: string }>();

      if (!service) {
        return NextResponse.json(
          { success: false, error: "Service not found" },
          { status: 400 }
        );
      }
      serviceId = service.id;
    }

    // Calculate end time
    const endTime = calculateEndTime(data.startTime, data.durationHours);

    // Prepare add-ons for database
    const addOns = data.selectedAddOns.map((addon) => ({
      add_on_id: addon.id,
      quantity: addon.quantity,
      unit_price: addon.unitPrice,
      total_price: addon.totalPrice,
    }));

    // Create the booking
    const booking = await createBooking({
      service_id: serviceId,
      event_date: data.eventDate,
      start_time: data.startTime,
      end_time: endTime,
      duration_hours: data.durationHours,
      event_type: data.eventType,
      event_name: data.eventName,
      venue_name: data.venueName,
      venue_address: data.venueAddress,
      venue_zip: data.venueZip,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      company_name: data.companyName,
      base_price: data.pricing.basePrice,
      extra_hours_price: data.pricing.extraHoursPrice,
      add_ons_price: data.pricing.addOnsPrice,
      travel_fee: data.pricing.travelFee,
      travel_miles: data.pricing.travelMiles,
      discount_amount: data.pricing.discountAmount,
      discount_code: data.referralCode,
      subtotal: data.pricing.subtotal,
      total_price: data.pricing.totalPrice,
      deposit_amount: data.pricing.depositAmount,
      referral_code_used: data.referralCode,
      client_notes: data.clientNotes,
      source: "website",
      add_ons: addOns,
    });

    // Send confirmation notifications
    const fullBooking = await getBookingById(booking.id);
    if (fullBooking) {
      sendBookingConfirmation(fullBooking).catch((error) => {
        console.error("Error sending confirmation:", error);
      });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.booking_number,
        status: booking.status,
        totalPrice: booking.total_price,
        depositAmount: booking.deposit_amount,
        holdExpiresAt: booking.hold_expires_at,
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
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  // This endpoint is for public use - limited access
  // Admin endpoint is at /api/admin/bookings

  return NextResponse.json({
    success: true,
    message: "Use the booking form to create a booking",
  });
}
