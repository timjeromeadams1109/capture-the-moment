import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminLimiter, checkLimit } from "@/lib/ratelimit";
import { logError, logRequest } from "@/lib/logger";

const ChangelogEntrySchema = z.object({
  version: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["feature", "fix", "improvement", "breaking", "security", "infrastructure"]),
  created_by: z.string().max(100).optional(),
});

const DeleteSchema = z.object({
  id: z.string().uuid(),
});

async function verifyAdmin(): Promise<
  { userId: string; supabase: Awaited<ReturnType<typeof createClient>> } | NextResponse
> {
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

  return { userId: user.id, supabase };
}

export async function GET(request: NextRequest) {
  logRequest(request);
  try {
    const auth = await verifyAdmin();
    if (auth instanceof NextResponse) return auth;

    const { allowed } = await checkLimit(adminLimiter, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const { data, error } = await auth.supabase
      .from("changelog")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logError(error, { endpoint: "/api/admin/changelog", method: "GET" });
      return NextResponse.json(
        { success: false, error: "Failed to fetch changelog" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, entries: data });
  } catch (error) {
    logError(error, { endpoint: "/api/admin/changelog", method: "GET" });
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logRequest(request);
  try {
    const auth = await verifyAdmin();
    if (auth instanceof NextResponse) return auth;

    const { allowed } = await checkLimit(adminLimiter, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = ChangelogEntrySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // RLS policy requires service role for writes; use service-role client
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { success: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await adminClient
      .from("changelog")
      .insert({ ...result.data, created_by: result.data.created_by ?? auth.userId })
      .select()
      .single();

    if (error) {
      logError(error, { endpoint: "/api/admin/changelog", method: "POST" });
      return NextResponse.json(
        { success: false, error: "Failed to create entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, entry: data }, { status: 201 });
  } catch (error) {
    logError(error, { endpoint: "/api/admin/changelog", method: "POST" });
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  logRequest(request);
  try {
    const auth = await verifyAdmin();
    if (auth instanceof NextResponse) return auth;

    const { allowed } = await checkLimit(adminLimiter, auth.userId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = DeleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { success: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await adminClient
      .from("changelog")
      .delete()
      .eq("id", result.data.id);

    if (error) {
      logError(error, { endpoint: "/api/admin/changelog", method: "DELETE" });
      return NextResponse.json(
        { success: false, error: "Failed to delete entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, { endpoint: "/api/admin/changelog", method: "DELETE" });
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
