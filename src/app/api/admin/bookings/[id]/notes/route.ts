import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateBookingNotes } from "@/lib/data/bookings";
import { validateOrigin, isTrustedSource } from "@/lib/csrf";
import { adminLimiter, checkLimit } from "@/lib/ratelimit";
import { logError, logRequest } from "@/lib/logger";

const notesUpdateSchema = z.object({
  admin_notes: z.string().optional(),
  internal_notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logRequest(request);
  if (!isTrustedSource(request) && !validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

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

    const { allowed } = await checkLimit(adminLimiter, user.id);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = notesUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const updatedBooking = await updateBookingNotes(
      id,
      validationResult.data,
      user.id
    );

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Notes updated successfully",
    });
  } catch (error) {
    logError(error, { endpoint: '/api/admin/bookings/[id]/notes' });
    return NextResponse.json(
      { success: false, error: "Failed to update booking notes" },
      { status: 500 }
    );
  }
}
