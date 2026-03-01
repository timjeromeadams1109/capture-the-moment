import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromEmail = process.env.FROM_EMAIL || "bookings@capturethemoment.com";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export type EmailTemplate =
  | "booking_confirmation"
  | "booking_approved"
  | "deposit_received"
  | "event_reminder";

interface EmailVariables {
  name: string;
  bookingNumber: string;
  eventDate: string;
  eventTime?: string;
  serviceName?: string;
  venueName?: string;
  totalPrice?: string;
  depositAmount?: string;
  paymentLink?: string;
  balanceDue?: string;
}

interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  variables: EmailVariables;
  subject?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

function getEmailContent(
  template: EmailTemplate,
  variables: EmailVariables
): { subject: string; html: string } {
  const {
    name,
    bookingNumber,
    eventDate,
    eventTime,
    serviceName,
    venueName,
    totalPrice,
    depositAmount,
    paymentLink,
    balanceDue,
  } = variables;

  switch (template) {
    case "booking_confirmation":
      return {
        subject: `Booking Request Received - ${bookingNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Capture The Moment</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Photo Booth Experiences</p>
            </div>

            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>

              <p>Thank you for your booking request! We've received your submission and our team is reviewing it now.</p>

              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #3b82f6;">Booking Details</h3>
                <p><strong>Booking Number:</strong> ${bookingNumber}</p>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Event Date:</strong> ${eventDate}</p>
                ${eventTime ? `<p><strong>Time:</strong> ${eventTime}</p>` : ""}
                ${venueName ? `<p><strong>Venue:</strong> ${venueName}</p>` : ""}
                ${totalPrice ? `<p><strong>Total:</strong> ${totalPrice}</p>` : ""}
              </div>

              <p>We'll review your request and get back to you within 24 hours. Once approved, you'll receive a payment link to secure your date.</p>

              <p style="color: #6b7280; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
            </div>

            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>Capture The Moment Photo Booths</p>
              <p>Orange County, California</p>
            </div>
          </body>
          </html>
        `,
      };

    case "booking_approved":
      return {
        subject: `Booking Approved - ${bookingNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Approved</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Booking Approved!</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Great news, ${name}!</h2>

              <p>Your booking request for <strong>${eventDate}</strong> has been approved!</p>

              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #3b82f6;">Payment Details</h3>
                <p><strong>Booking Number:</strong> ${bookingNumber}</p>
                <p><strong>Total Price:</strong> ${totalPrice}</p>
                <p><strong>Deposit Due:</strong> ${depositAmount}</p>
                ${balanceDue ? `<p><strong>Balance Due at Event:</strong> ${balanceDue}</p>` : ""}
              </div>

              <p>To confirm your booking, please pay the deposit using the link below:</p>

              ${
                paymentLink
                  ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${paymentLink}" style="background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Pay Deposit Now</a>
              </div>
              `
                  : ""
              }

              <p style="color: #6b7280; font-size: 14px;">Your date is held for 48 hours. Please complete payment to secure your booking.</p>
            </div>

            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>Capture The Moment Photo Booths</p>
            </div>
          </body>
          </html>
        `,
      };

    case "deposit_received":
      return {
        subject: `Deposit Received - ${bookingNumber} Confirmed!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">You're All Set!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Booking Confirmed</p>
            </div>

            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Thank you, ${name}!</h2>

              <p>We've received your deposit and your booking is now confirmed! We can't wait to capture the moment with you.</p>

              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #10b981;">Confirmed Details</h3>
                <p><strong>Booking Number:</strong> ${bookingNumber}</p>
                <p><strong>Event Date:</strong> ${eventDate}</p>
                ${eventTime ? `<p><strong>Time:</strong> ${eventTime}</p>` : ""}
                ${venueName ? `<p><strong>Venue:</strong> ${venueName}</p>` : ""}
                <p><strong>Deposit Paid:</strong> ${depositAmount}</p>
                ${balanceDue ? `<p><strong>Balance Due:</strong> ${balanceDue} (due at event)</p>` : ""}
              </div>

              <p>You'll receive a reminder 24 hours before your event with final details.</p>

              <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email anytime.</p>
            </div>

            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>Capture The Moment Photo Booths</p>
            </div>
          </body>
          </html>
        `,
      };

    case "event_reminder":
      return {
        subject: `Reminder: Your Event Tomorrow - ${bookingNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Reminder</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">See You Tomorrow!</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>

              <p>Just a friendly reminder that your photo booth experience is tomorrow!</p>

              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #8b5cf6;">Event Details</h3>
                <p><strong>Date:</strong> ${eventDate}</p>
                ${eventTime ? `<p><strong>Time:</strong> ${eventTime}</p>` : ""}
                ${venueName ? `<p><strong>Venue:</strong> ${venueName}</p>` : ""}
              </div>

              <p>Our team will arrive 30-60 minutes early to set up. We'll make sure everything is ready for your guests!</p>

              ${
                balanceDue
                  ? `<p style="background: #fef3c7; padding: 12px; border-radius: 6px;"><strong>Reminder:</strong> Balance of ${balanceDue} is due at the event.</p>`
                  : ""
              }

              <p>See you tomorrow!</p>
            </div>

            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>Capture The Moment Photo Booths</p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, template, variables, subject: customSubject } = options;

  const { subject, html } = getEmailContent(template, variables);

  // If Resend is not configured, log and return mock success
  if (!resend) {
    console.log("[Email Mock] Would send to:", to);
    console.log("[Email Mock] Subject:", customSubject || subject);
    console.log("[Email Mock] Template:", template);

    return {
      success: true,
      id: "mock_" + Date.now(),
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: customSubject || subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Email send error:", error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function sendCustomEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  if (!resend) {
    console.log("[Email Mock] Would send custom email to:", to);
    console.log("[Email Mock] Subject:", subject);

    return {
      success: true,
      id: "mock_" + Date.now(),
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Email send error:", error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
