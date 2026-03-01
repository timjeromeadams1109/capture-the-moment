import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Booking,
  BookingStatus,
  BookingFull,
  Service,
} from "@/lib/types/database";

export interface BookingFilters {
  status?: BookingStatus | "all";
  serviceSlug?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BookingsResult {
  bookings: BookingWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingWithDetails extends Booking {
  services: Service;
}

export async function getBookings(
  filters: BookingFilters = {}
): Promise<BookingsResult> {
  const supabase = createAdminClient();

  const {
    status = "all",
    serviceSlug,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;

  // Build query
  let query = supabase
    .from("bookings")
    .select("*, services!inner(*)", { count: "exact" });

  // Status filter
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  // Service filter
  if (serviceSlug) {
    query = query.eq("services.slug", serviceSlug);
  }

  // Search filter
  if (search) {
    query = query.or(
      `booking_number.ilike.%${search}%,contact_name.ilike.%${search}%,contact_email.ilike.%${search}%`
    );
  }

  // Date range filter
  if (startDate) {
    query = query.gte("event_date", startDate);
  }
  if (endDate) {
    query = query.lte("event_date", endDate);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Order by created_at descending
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }

  return {
    bookings: (data as BookingWithDetails[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getBookingById(id: string): Promise<BookingFull | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (*),
      booking_add_ons (
        *,
        add_ons (*)
      ),
      users (*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching booking:", error);
    throw new Error("Failed to fetch booking");
  }

  return data as BookingFull;
}

export async function getBookingByNumber(
  bookingNumber: string
): Promise<BookingFull | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (*),
      booking_add_ons (
        *,
        add_ons (*)
      ),
      users (*)
    `
    )
    .eq("booking_number", bookingNumber)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching booking:", error);
    throw new Error("Failed to fetch booking");
  }

  return data as BookingFull;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  adminId: string,
  additionalData?: Record<string, unknown>
): Promise<Booking> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    ...additionalData,
  };

  // Set timestamps based on status
  const now = new Date().toISOString();
  switch (status) {
    case "approved":
      updateData.approved_at = now;
      updateData.approved_by = adminId;
      break;
    case "confirmed":
      updateData.confirmed_at = now;
      break;
    case "completed":
      updateData.completed_at = now;
      break;
    case "cancelled":
      updateData.cancelled_at = now;
      updateData.cancelled_by = adminId;
      break;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }

  // Log the action
  await supabase.from("audit_logs").insert({
    entity_type: "booking",
    entity_id: id,
    action: `status_changed_to_${status}`,
    actor_id: adminId,
    actor_type: "user",
    new_values: updateData,
  });

  return data;
}

export async function updateBookingNotes(
  id: string,
  notes: { admin_notes?: string; internal_notes?: string },
  adminId: string
): Promise<Booking> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .update(notes)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking notes:", error);
    throw new Error("Failed to update booking notes");
  }

  return data;
}

export interface CreateBookingData {
  service_id: string;
  event_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  event_type?: string;
  event_name?: string;
  venue_name?: string;
  venue_address?: string;
  venue_zip?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_name?: string;
  base_price: number;
  extra_hours_price?: number;
  add_ons_price?: number;
  travel_fee?: number;
  travel_miles?: number;
  discount_amount?: number;
  discount_code?: string;
  subtotal: number;
  total_price: number;
  deposit_amount: number;
  referral_code_used?: string;
  client_notes?: string;
  source?: string;
  add_ons?: Array<{
    add_on_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export async function createBooking(
  data: CreateBookingData
): Promise<Booking> {
  const supabase = createAdminClient();

  // Generate booking number using database function
  const { data: bookingNumberResult } = await supabase.rpc(
    "generate_booking_number"
  );
  const bookingNumber =
    bookingNumberResult || `CTM${Date.now().toString().slice(-8)}`;

  const { add_ons, ...bookingData } = data;

  // Create the booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      ...bookingData,
      booking_number: bookingNumber,
      balance_due: data.total_price,
      status: "requested",
      hold_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }

  // Insert add-ons if any
  if (add_ons && add_ons.length > 0) {
    const addOnInserts = add_ons.map((addon) => ({
      booking_id: booking.id,
      add_on_id: addon.add_on_id,
      quantity: addon.quantity,
      unit_price: addon.unit_price,
      total_price: addon.total_price,
    }));

    const { error: addOnError } = await supabase
      .from("booking_add_ons")
      .insert(addOnInserts);

    if (addOnError) {
      console.error("Error inserting booking add-ons:", addOnError);
      // Don't throw - booking was created successfully
    }
  }

  // Log the creation
  await supabase.from("audit_logs").insert({
    entity_type: "booking",
    entity_id: booking.id,
    action: "created",
    actor_type: "system",
    new_values: { booking_number: bookingNumber },
  });

  return booking;
}

export async function getRecentBookings(limit: number = 5): Promise<BookingWithDetails[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent bookings:", error);
    throw new Error("Failed to fetch recent bookings");
  }

  return (data as BookingWithDetails[]) || [];
}

export async function getUpcomingEvents(
  limit: number = 5
): Promise<BookingWithDetails[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(*)")
    .gte("event_date", today)
    .in("status", ["confirmed", "deposit_paid"])
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching upcoming events:", error);
    throw new Error("Failed to fetch upcoming events");
  }

  return (data as BookingWithDetails[]) || [];
}

export async function getBookingActivity(
  bookingId: string
): Promise<
  Array<{
    id: string;
    action: string;
    actor_type: string;
    actor_id: string | null;
    created_at: string;
    new_values: Record<string, unknown> | null;
    users?: { full_name: string } | null;
  }>
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, users(full_name)")
    .eq("entity_type", "booking")
    .eq("entity_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching booking activity:", error);
    return [];
  }

  return data || [];
}
