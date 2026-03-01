import { createAdminClient } from "@/lib/supabase/admin";
import type { SmsLog } from "@/lib/types/database";

export interface SmsFilters {
  status?: string;
  messageType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  bookingId?: string;
  page?: number;
  limit?: number;
}

export interface SmsLogsResult {
  logs: SmsLogWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SmsLogWithDetails extends SmsLog {
  bookings?: {
    booking_number: string;
    contact_name: string;
  } | null;
}

export async function getSmsLogs(
  filters: SmsFilters = {}
): Promise<SmsLogsResult> {
  const supabase = createAdminClient();

  const {
    status,
    messageType,
    search,
    startDate,
    endDate,
    bookingId,
    page = 1,
    limit = 20,
  } = filters;

  let query = supabase
    .from("sms_logs")
    .select(
      `
      *,
      bookings (
        booking_number,
        contact_name
      )
    `,
      { count: "exact" }
    );

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (messageType) {
    query = query.eq("message_type", messageType);
  }

  if (bookingId) {
    query = query.eq("booking_id", bookingId);
  }

  if (search) {
    query = query.or(
      `phone_number.ilike.%${search}%,message_body.ilike.%${search}%`
    );
  }

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching SMS logs:", error);
    throw new Error("Failed to fetch SMS logs");
  }

  return {
    logs: (data as SmsLogWithDetails[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export interface CreateSmsLogData {
  booking_id?: string;
  user_id?: string;
  phone_number: string;
  message_type: string;
  message_body: string;
  direction?: "outbound" | "inbound";
  twilio_sid?: string;
  status?: string;
  error_message?: string;
  sent_at?: string;
}

export async function createSmsLog(data: CreateSmsLogData): Promise<SmsLog> {
  const supabase = createAdminClient();

  const { data: log, error } = await supabase
    .from("sms_logs")
    .insert({
      ...data,
      direction: data.direction || "outbound",
      status: data.status || "queued",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating SMS log:", error);
    throw new Error("Failed to create SMS log");
  }

  return log;
}

export async function updateSmsLogStatus(
  id: string,
  status: string,
  additionalData?: {
    twilio_sid?: string;
    error_message?: string;
    delivered_at?: string;
    sent_at?: string;
  }
): Promise<SmsLog> {
  const supabase = createAdminClient();

  const { data: log, error } = await supabase
    .from("sms_logs")
    .update({
      status,
      ...additionalData,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating SMS log status:", error);
    throw new Error("Failed to update SMS log status");
  }

  return log;
}

export interface SmsStats {
  sentToday: number;
  sentThisMonth: number;
  deliveryRate: number;
  failedCount: number;
}

export async function getSmsStats(): Promise<SmsStats> {
  const supabase = createAdminClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get today's messages
  const { count: sentToday } = await supabase
    .from("sms_logs")
    .select("*", { count: "exact", head: true })
    .eq("direction", "outbound")
    .gte("created_at", startOfDay.toISOString());

  // Get this month's messages
  const { count: sentThisMonth } = await supabase
    .from("sms_logs")
    .select("*", { count: "exact", head: true })
    .eq("direction", "outbound")
    .gte("created_at", startOfMonth.toISOString());

  // Get delivered count this month
  const { count: deliveredThisMonth } = await supabase
    .from("sms_logs")
    .select("*", { count: "exact", head: true })
    .eq("direction", "outbound")
    .eq("status", "delivered")
    .gte("created_at", startOfMonth.toISOString());

  // Get failed count this month
  const { count: failedCount } = await supabase
    .from("sms_logs")
    .select("*", { count: "exact", head: true })
    .eq("direction", "outbound")
    .eq("status", "failed")
    .gte("created_at", startOfMonth.toISOString());

  const totalSent = sentThisMonth || 0;
  const deliveredTotal = deliveredThisMonth || 0;
  const deliveryRate = totalSent > 0 ? (deliveredTotal / totalSent) * 100 : 100;

  return {
    sentToday: sentToday || 0,
    sentThisMonth: totalSent,
    deliveryRate: Math.round(deliveryRate * 10) / 10,
    failedCount: failedCount || 0,
  };
}

export async function getRecentSmsLogs(
  limit: number = 10
): Promise<SmsLogWithDetails[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("sms_logs")
    .select(
      `
      *,
      bookings (
        booking_number,
        contact_name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent SMS logs:", error);
    throw new Error("Failed to fetch recent SMS logs");
  }

  return (data as SmsLogWithDetails[]) || [];
}

export async function getClientsForSms(): Promise<
  Array<{
    id: string;
    name: string;
    phone: string;
    bookingNumber: string;
    bookingId: string;
  }>
> {
  const supabase = createAdminClient();

  // Get recent bookings with valid phone numbers
  const { data, error } = await supabase
    .from("bookings")
    .select("id, contact_name, contact_phone, booking_number")
    .not("contact_phone", "is", null)
    .not("status", "in", '("cancelled","expired","completed")')
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching clients for SMS:", error);
    return [];
  }

  return (data || []).map((booking) => ({
    id: booking.id,
    name: booking.contact_name,
    phone: booking.contact_phone,
    bookingNumber: booking.booking_number,
    bookingId: booking.id,
  }));
}
