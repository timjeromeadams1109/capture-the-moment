import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecentSmsLogs, getSmsStats, getClientsForSms } from "@/lib/data/sms";

export async function GET(request: NextRequest) {
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

    // Fetch SMS logs, stats, and clients in parallel
    const [logs, stats, clients] = await Promise.all([
      getRecentSmsLogs(50),
      getSmsStats(),
      getClientsForSms(),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      stats,
      clients,
    });
  } catch (error) {
    console.error("Error fetching SMS data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SMS data" },
      { status: 500 }
    );
  }
}
