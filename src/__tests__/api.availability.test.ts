/**
 * Tests: GET /api/availability
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/ratelimit", () => ({
  bookingsLimiter: null,
  availabilityLimiter: null,
  adminLimiter: null,
  smsLimiter: null,
  checkLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Supabase admin mock — uses per-call overrideable mocks
const mockBookingsNotFn = vi.fn().mockResolvedValue({ data: [], error: null });
const mockSlotsEqFn = vi.fn().mockResolvedValue({ data: [], error: null });
const mockServiceSingle = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "services") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: mockServiceSingle,
        };
      }
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          not: mockBookingsNotFn,
        };
      }
      if (table === "time_slots") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: mockSlotsEqFn,
        };
      }
      return {};
    }),
  })),
}));

import { GET } from "@/app/api/availability/route";

const BASE = "https://capture-the-moment.vercel.app/api/availability";
const FUTURE_DATE = "2099-12-01";

function req(params: Record<string, string>): NextRequest {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe("GET /api/availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBookingsNotFn.mockResolvedValue({ data: [], error: null });
    mockSlotsEqFn.mockResolvedValue({ data: [], error: null });
    mockServiceSingle.mockResolvedValue({ data: null, error: null });
  });

  it("returns 400 when date param is missing", async () => {
    const res = await GET(req({}));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Date parameter is required");
  });

  it("returns 400 for invalid date format", async () => {
    const res = await GET(req({ date: "12/01/2026" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid date format");
  });

  it("returns all slots unavailable for a past date", async () => {
    const res = await GET(req({ date: "2020-01-01" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.fullyBooked).toBe(true);
    json.slots.forEach((s: { available: boolean }) =>
      expect(s.available).toBe(false)
    );
  });

  it("returns slots with some available when no bookings exist", async () => {
    const res = await GET(req({ date: FUTURE_DATE }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.fullyBooked).toBe(false);
    const available = json.slots.filter(
      (s: { available: boolean }) => s.available
    );
    expect(available.length).toBeGreaterThan(0);
  });

  it("marks 14:00 and 15:00 unavailable for a 2-hour booking starting at 14:00", async () => {
    mockBookingsNotFn.mockResolvedValue({
      data: [
        {
          start_time: "14:00",
          end_time: "16:00",
          duration_hours: 2,
          service_id: "s1",
        },
      ],
      error: null,
    });

    const res = await GET(req({ date: FUTURE_DATE }));
    const json = await res.json();
    const find = (t: string) =>
      json.slots.find((s: { time: string }) => s.time === t);

    expect(find("14:00")?.available).toBe(false);
    expect(find("15:00")?.available).toBe(false);
    expect(find("16:00")?.available).toBe(true);
  });

  it("marks a slot unavailable when time_slots has is_available=false", async () => {
    mockSlotsEqFn.mockResolvedValue({
      data: [{ start_time: "10:00", end_time: "11:00", is_available: false }],
      error: null,
    });

    const res = await GET(req({ date: FUTURE_DATE }));
    const json = await res.json();
    const slot10 = json.slots.find(
      (s: { time: string }) => s.time === "10:00"
    );
    expect(slot10?.available).toBe(false);
  });

  it("includes metadata with checkedAt timestamp", async () => {
    const res = await GET(req({ date: FUTURE_DATE }));
    const json = await res.json();
    expect(json.metadata.checkedAt).toBeDefined();
    expect(json.metadata.timezone).toBe("America/Los_Angeles");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const rl = await import("@/lib/ratelimit");
    vi.spyOn(rl, "checkLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
    });
    const res = await GET(req({ date: FUTURE_DATE }));
    expect(res.status).toBe(429);
  });
});
