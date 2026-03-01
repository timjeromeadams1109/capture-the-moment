import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendSms, sendCustomSms, SMS_TEMPLATES, type SmsTemplateType } from "@/lib/services/sms";

const sendSmsSchema = z.object({
  to: z.string().min(10),
  template: z.string().optional(),
  message: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  bookingId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
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

    // Validate request body
    const body = await request.json();
    const validationResult = sendSmsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { to, template, message, variables, bookingId } = validationResult.data;

    // Either template or custom message must be provided
    if (!template && !message) {
      return NextResponse.json(
        { success: false, error: "Either template or message must be provided" },
        { status: 400 }
      );
    }

    let result;

    if (template && template in SMS_TEMPLATES) {
      // Send templated SMS
      result = await sendSms({
        to,
        template: template as SmsTemplateType,
        variables: variables || {},
        bookingId,
        userId: user.id,
      });
    } else if (message) {
      // Send custom SMS
      result = await sendCustomSms(to, message, bookingId, user.id);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid template or message" },
        { status: 400 }
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        logId: result.logId,
        message: "SMS sent successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send SMS" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return available templates
  const templates = Object.entries(SMS_TEMPLATES).map(([id, data]) => ({
    id,
    name: data.name,
    template: data.template,
  }));

  return NextResponse.json({
    success: true,
    templates,
  });
}
