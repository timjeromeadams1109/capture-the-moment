import { sendSms, type SmsTemplateType } from "./sms";
import { sendEmail, type EmailTemplate } from "./email";
import type { BookingFull } from "@/lib/types/database";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface NotificationResult {
  sms: { success: boolean; error?: string };
  email: { success: boolean; error?: string };
}

function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBookingTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export async function sendBookingConfirmation(
  booking: BookingFull
): Promise<NotificationResult> {
  const smsVariables = {
    name: booking.contact_name.split(" ")[0],
    booking_number: booking.booking_number,
    date: formatBookingDate(booking.event_date),
  };

  const emailVariables = {
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    eventDate: formatBookingDate(booking.event_date),
    eventTime: formatBookingTime(booking.start_time),
    serviceName: booking.services?.name || "Photo Booth",
    venueName: booking.venue_name || undefined,
    totalPrice: formatCurrency(booking.total_price),
    depositAmount: formatCurrency(booking.deposit_amount),
  };

  const [smsResult, emailResult] = await Promise.all([
    sendSms({
      to: booking.contact_phone,
      template: "booking_confirmation",
      variables: smsVariables,
      bookingId: booking.id,
    }),
    sendEmail({
      to: booking.contact_email,
      template: "booking_confirmation",
      variables: emailVariables,
    }),
  ]);

  return {
    sms: { success: smsResult.success, error: smsResult.error },
    email: { success: emailResult.success, error: emailResult.error },
  };
}

export async function sendBookingApproved(
  booking: BookingFull,
  paymentLink?: string
): Promise<NotificationResult> {
  const smsVariables = {
    name: booking.contact_name.split(" ")[0],
    booking_number: booking.booking_number,
    date: formatBookingDate(booking.event_date),
    deposit: formatCurrency(booking.deposit_amount),
    payment_link: paymentLink || `${baseUrl}/pay/${booking.id}`,
  };

  const emailVariables = {
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    eventDate: formatBookingDate(booking.event_date),
    totalPrice: formatCurrency(booking.total_price),
    depositAmount: formatCurrency(booking.deposit_amount),
    balanceDue: formatCurrency(booking.total_price - booking.deposit_amount),
    paymentLink: paymentLink || `${baseUrl}/pay/${booking.id}`,
  };

  const [smsResult, emailResult] = await Promise.all([
    sendSms({
      to: booking.contact_phone,
      template: "booking_approved",
      variables: smsVariables,
      bookingId: booking.id,
    }),
    sendEmail({
      to: booking.contact_email,
      template: "booking_approved",
      variables: emailVariables,
    }),
  ]);

  return {
    sms: { success: smsResult.success, error: smsResult.error },
    email: { success: emailResult.success, error: emailResult.error },
  };
}

export async function sendDepositReceived(
  booking: BookingFull
): Promise<NotificationResult> {
  const smsVariables = {
    name: booking.contact_name.split(" ")[0],
    booking_number: booking.booking_number,
    date: formatBookingDate(booking.event_date),
  };

  const emailVariables = {
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    eventDate: formatBookingDate(booking.event_date),
    eventTime: formatBookingTime(booking.start_time),
    venueName: booking.venue_name || undefined,
    depositAmount: formatCurrency(booking.deposit_amount),
    balanceDue: formatCurrency(booking.total_price - booking.deposit_amount),
  };

  const [smsResult, emailResult] = await Promise.all([
    sendSms({
      to: booking.contact_phone,
      template: "deposit_received",
      variables: smsVariables,
      bookingId: booking.id,
    }),
    sendEmail({
      to: booking.contact_email,
      template: "deposit_received",
      variables: emailVariables,
    }),
  ]);

  return {
    sms: { success: smsResult.success, error: smsResult.error },
    email: { success: emailResult.success, error: emailResult.error },
  };
}

export async function sendEventReminder(
  booking: BookingFull
): Promise<NotificationResult> {
  const smsVariables = {
    name: booking.contact_name.split(" ")[0],
    time: formatBookingTime(booking.start_time),
    venue: booking.venue_name || "your venue",
  };

  const emailVariables = {
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    eventDate: formatBookingDate(booking.event_date),
    eventTime: formatBookingTime(booking.start_time),
    venueName: booking.venue_name || undefined,
    balanceDue: booking.balance_paid
      ? undefined
      : formatCurrency(booking.total_price - booking.deposit_amount),
  };

  const [smsResult, emailResult] = await Promise.all([
    sendSms({
      to: booking.contact_phone,
      template: "event_reminder_24h",
      variables: smsVariables,
      bookingId: booking.id,
    }),
    sendEmail({
      to: booking.contact_email,
      template: "event_reminder",
      variables: emailVariables,
    }),
  ]);

  return {
    sms: { success: smsResult.success, error: smsResult.error },
    email: { success: emailResult.success, error: emailResult.error },
  };
}

export async function sendDepositReminder(
  booking: BookingFull,
  paymentLink?: string
): Promise<{ success: boolean; error?: string }> {
  const smsVariables = {
    name: booking.contact_name.split(" ")[0],
    booking_number: booking.booking_number,
    deposit: formatCurrency(booking.deposit_amount),
    payment_link: paymentLink || `${baseUrl}/pay/${booking.id}`,
  };

  const result = await sendSms({
    to: booking.contact_phone,
    template: "deposit_reminder",
    variables: smsVariables,
    bookingId: booking.id,
  });

  return { success: result.success, error: result.error };
}

export async function sendHoldExpiringNotification(
  booking: BookingFull
): Promise<{ success: boolean; error?: string }> {
  const smsVariables = {
    name: booking.contact_name.split(" ")[0],
    date: formatBookingDate(booking.event_date),
    link: `${baseUrl}/booking/${booking.booking_number}`,
  };

  const result = await sendSms({
    to: booking.contact_phone,
    template: "hold_expiring",
    variables: smsVariables,
    bookingId: booking.id,
  });

  return { success: result.success, error: result.error };
}
