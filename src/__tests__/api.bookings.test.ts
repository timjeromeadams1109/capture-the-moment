/**
 * Tests: POST /api/bookings  +  GET /api/bookings
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/csrf", () => ({
  isTrustedSource: vi.fn().mockReturnValue(true),
  validateOrigin: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/ratelimit", () => ({
  bookingsLimiter: null,
  availabilityLimiter: null,
  adminLimiter: null,
  smsLimiter: null,
  checkLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

const mockServiceSingle = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockServiceSingle,
    })),
  })),
}));

const mockCreateBooking = vi.fn();
const mockGetBookingById = vi.fn();
vi.mock("@/lib/data/bookings", () => ({
  createBooking: mockCreateBooking,
  getBookingById: mockGetBookingById,
}));

vi.mock("@/lib/services/notifications", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
  sendBookingApproved: vi.fn().mockResolvedValue(undefined),
}));

import { POST, GET } from "@/app/api/bookings/route";
import { VALID_BOOKING_PAYLOAD } from "./helpers";

const BASE_URL = "https://capture-the-moment.vercel.app/api/bookings";

function postReq(body: unknown): NextRequest {
  return new NextRequest(BASE_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceSingle.mockResolvedValue({
      data: { id: "service-uuid-1" },
      error: null,
    });
    mockCreateBooking.mockResolvedValue({
      id: "booking-uuid-1",
      booking_number: "CTM-001",
      status: "requested",
      total_price: 642,
      deposit_amount: 200,
      hold_expires_at: null,
    });
    mockGetBookingById.mockResolvedValue(null);
  });

  it("returns 200 and booking data on valid payload", async () => {
    const res = await POST(postReq(VALID_BOOKING_PAYLOAD));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.booking.bookingNumber).toBe("CTM-001");
  });

  it("returns 400 when serviceSlug is missing", async () => {
    const bad = { ...VALID_BOOKING_PAYLOAD } as Record<string, unknown>;
    delete bad.serviceSlug;
    const res = await POST(postReq(bad));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("Validation failed");
  });

  it("returns 400 when contactEmail is invalid", async () => {
    const res = await POST(
      postReq({ ...VALID_BOOKING_PAYLOAD, contactEmail: "not-an-email" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when venueZip has bad format", async () => {
    const res = await POST(
      postReq({ ...VALID_BOOKING_PAYLOAD, venueZip: "ABC" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when durationHours is below minimum (2)", async () => {
    const res = await POST(
      postReq({ ...VALID_BOOKING_PAYLOAD, durationHours: 1 })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when service slug cannot be resolved", async () => {
    mockServiceSingle.mockResolvedValue({ data: null, error: null });
    const payload = { ...VALID_BOOKING_PAYLOAD };
    delete (payload as Record<string, unknown>).serviceId;
    const res = await POST(postReq(payload));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("Service not found");
  });

  it("passes serviceId directly, skipping DB lookup", async () => {
    const payload = { ...VALID_BOOKING_PAYLOAD, serviceId: "direct-uuid" };
    await POST(postReq(payload));
    expect(mockCreateBooking).toHaveBeenCalledWith(
      expect.objectContaining({ service_id: "direct-uuid" })
    );
  });

  it("accepts both 5-digit and 9-digit ZIP codes", async () => {
    const r5 = await POST(postReq({ ...VALID_BOOKING_PAYLOAD, venueZip: "32801" }));
    expect((await r5.json()).success).toBe(true);

    const r9 = await POST(postReq({ ...VALID_BOOKING_PAYLOAD, venueZip: "32801-1234" }));
    expect((await r9.json()).success).toBe(true);
  });

  it("calculates end time correctly (14:00 + 3h = 17:00)", async () => {
    await POST(postReq({ ...VALID_BOOKING_PAYLOAD, startTime: "14:00", durationHours: 3 }));
    expect(mockCreateBooking).toHaveBeenCalledWith(
      expect.objectContaining({ end_time: "17:00", start_time: "14:00" })
    );
  });

  it("returns 500 when createBooking throws", async () => {
    mockCreateBooking.mockRejectedValue(new Error("DB error"));
    const res = await POST(postReq(VALID_BOOKING_PAYLOAD));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/bookings", () => {
  it("returns 200 with informational message", async () => {
    const res = await GET(new NextRequest(`${BASE_URL}?status=all`));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
