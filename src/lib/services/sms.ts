import twilio from "twilio";
import { createSmsLog, updateSmsLogStatus } from "@/lib/data/sms";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// SMS Templates
export const SMS_TEMPLATES = {
  booking_confirmation: {
    name: "Booking Confirmation",
    template: `Hi {name}! Your booking request #{booking_number} for {date} has been received. We'll review it and get back to you within 24 hours. - Capture The Moment`,
  },
  booking_approved: {
    name: "Booking Approved",
    template: `Great news, {name}! Your booking #{booking_number} for {date} has been approved. Please complete your deposit of {deposit} to confirm: {payment_link}`,
  },
  deposit_reminder: {
    name: "Deposit Reminder",
    template: `Hi {name}! Friendly reminder: Your deposit of {deposit} for booking #{booking_number} is due. Complete payment here: {payment_link}`,
  },
  deposit_received: {
    name: "Deposit Received",
    template: `Thank you, {name}! We've received your deposit for booking #{booking_number}. Your event on {date} is now confirmed! We can't wait to capture the moment with you.`,
  },
  event_reminder_24h: {
    name: "Event Reminder (24hr)",
    template: `Hi {name}! This is a reminder that your photo booth event is tomorrow at {time}. See you at {venue}! - Capture The Moment`,
  },
  event_reminder_2h: {
    name: "Event Reminder (2hr)",
    template: `Hi {name}! We're getting ready for your event! Our team will arrive at {venue} shortly. See you soon!`,
  },
  hold_expiring: {
    name: "Hold Expiring",
    template: `Hi {name}! Your date hold for {date} expires in 4 hours. Complete your booking to secure your date: {link}`,
  },
  review_request: {
    name: "Review Request",
    template: `Hi {name}! Thank you for choosing Capture The Moment! We hope you loved your experience. We'd appreciate your feedback: {review_link}`,
  },
} as const;

export type SmsTemplateType = keyof typeof SMS_TEMPLATES;

export interface SendSmsOptions {
  to: string;
  template: SmsTemplateType;
  variables: Record<string, string>;
  bookingId?: string;
  userId?: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  logId?: string;
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, "");

  // Add +1 if it's a 10-digit US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Add + if it's an 11-digit number starting with 1
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Return as-is if already formatted or international
  return digits.startsWith("+") ? phone : `+${digits}`;
}

function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

export async function sendSms(options: SendSmsOptions): Promise<SmsResult> {
  const { to, template, variables, bookingId, userId } = options;

  const templateData = SMS_TEMPLATES[template];
  if (!templateData) {
    return { success: false, error: `Unknown template: ${template}` };
  }

  const messageBody = interpolateTemplate(templateData.template, variables);
  const formattedPhone = formatPhoneNumber(to);

  // Create log entry first
  const log = await createSmsLog({
    booking_id: bookingId,
    user_id: userId,
    phone_number: formattedPhone,
    message_type: template,
    message_body: messageBody,
    direction: "outbound",
    status: "queued",
  });

  // If Twilio is not configured, return mock success
  if (!client || !fromNumber) {
    console.log("[SMS Mock] Would send to:", formattedPhone);
    console.log("[SMS Mock] Message:", messageBody);

    await updateSmsLogStatus(log.id, "sent", {
      sent_at: new Date().toISOString(),
      twilio_sid: "mock_" + Date.now(),
    });

    return {
      success: true,
      messageId: "mock_" + Date.now(),
      logId: log.id,
    };
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: formattedPhone,
    });

    await updateSmsLogStatus(log.id, "sent", {
      sent_at: new Date().toISOString(),
      twilio_sid: message.sid,
    });

    return {
      success: true,
      messageId: message.sid,
      logId: log.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await updateSmsLogStatus(log.id, "failed", {
      error_message: errorMessage,
    });

    console.error("Twilio SMS error:", error);

    return {
      success: false,
      error: errorMessage,
      logId: log.id,
    };
  }
}

export async function sendCustomSms(
  to: string,
  message: string,
  bookingId?: string,
  userId?: string
): Promise<SmsResult> {
  const formattedPhone = formatPhoneNumber(to);

  // Create log entry first
  const log = await createSmsLog({
    booking_id: bookingId,
    user_id: userId,
    phone_number: formattedPhone,
    message_type: "custom",
    message_body: message,
    direction: "outbound",
    status: "queued",
  });

  // If Twilio is not configured, return mock success
  if (!client || !fromNumber) {
    console.log("[SMS Mock] Would send to:", formattedPhone);
    console.log("[SMS Mock] Message:", message);

    await updateSmsLogStatus(log.id, "sent", {
      sent_at: new Date().toISOString(),
      twilio_sid: "mock_" + Date.now(),
    });

    return {
      success: true,
      messageId: "mock_" + Date.now(),
      logId: log.id,
    };
  }

  try {
    const twilioMessage = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });

    await updateSmsLogStatus(log.id, "sent", {
      sent_at: new Date().toISOString(),
      twilio_sid: twilioMessage.sid,
    });

    return {
      success: true,
      messageId: twilioMessage.sid,
      logId: log.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await updateSmsLogStatus(log.id, "failed", {
      error_message: errorMessage,
    });

    console.error("Twilio SMS error:", error);

    return {
      success: false,
      error: errorMessage,
      logId: log.id,
    };
  }
}
