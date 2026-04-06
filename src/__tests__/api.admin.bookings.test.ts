/**
 * Tests: GET /api/admin/bookings and GET /api/admin/bookings/[id]
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/ratelimit", () => ({
  adminLimiter: null,
  checkLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

const mockGetUser = vi.fn();
const mockRoleSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockRoleSingle,
      })),
    })
  ),
}));

const mockGetBookings = vi.fn();
const mockGetBookingCountsByStatus = vi.fn();
const mockGetBookingById = vi.fn();
const mockGetBookingActivity = vi.fn();

vi.mock("@/lib/data/bookings", () => ({
  getBookings: mockGetBookings,
  getBookingCountsByStatus: mockGetBookingCountsByStatus,
  getBookingById: mockGetBookingById,
  getBookingActivity: mockGetBookingActivity,
  updateBookingStatus: vi.fn(),
  updateBookingNotes: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

import { GET as listBookings } from "@/app/api/admin/bookings/route";
import { GET as getBooking } from "@/app/api/admin/bookings/[id]/route";
import { ADMIN_USER, CLIENT_USER } from "./helpers";

const BOOKINGS_URL = "https://capture-the-moment.vercel.app/api/admin/bookings";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}
function asAdmin() {
  mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER } });
  mockRoleSingle.mockResolvedValue({ data: { role: "admin" } });
}
function asClient() {
  mockGetUser.mockResolvedValue({ data: { user: CLIENT_USER } });
  mockRoleSingle.mockResolvedValue({ data: { role: "client" } });
}
function asUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
}

describe("GET /api/admin/bookings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await listBookings(new NextRequest(BOOKINGS_URL));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });

  it("returns 403 when authenticated as non-admin", async () => {
    asClient();
    const res = await listBookings(new NextRequest(BOOKINGS_URL));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("Forbidden");
  });

  it("returns 200 with bookings data when authenticated as admin", async () => {
    asAdmin();
    mockGetBookings.mockResolvedValue({
      bookings: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    mockGetBookingCountsByStatus.mockResolvedValue({ requested: 0, approved: 0 });
    const res = await listBookings(new NextRequest(BOOKINGS_URL));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("passes status filter to getBookings", async () => {
    asAdmin();
    mockGetBookings.mockResolvedValue({
      bookings: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    mockGetBookingCountsByStatus.mockResolvedValue({});
    await listBookings(new NextRequest(`${BOOKINGS_URL}?status=approved`));
    expect(mockGetBookings).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" })
    );
  });

  it("returns 429 when rate limited", async () => {
    asAdmin();
    const rl = await import("@/lib/ratelimit");
    vi.spyOn(rl, "checkLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
    });
    const res = await listBookings(new NextRequest(BOOKINGS_URL));
    expect(res.status).toBe(429);
  });
});

describe("GET /api/admin/bookings/[id]", () => {
  const BOOKING_URL = `${BOOKINGS_URL}/booking-uuid-1`;
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await getBooking(
      new NextRequest(BOOKING_URL),
      makeParams("booking-uuid-1") as never
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as non-admin", async () => {
    asClient();
    const res = await getBooking(
      new NextRequest(BOOKING_URL),
      makeParams("booking-uuid-1") as never
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 when booking does not exist", async () => {
    asAdmin();
    mockGetBookingById.mockResolvedValue(null);
    mockGetBookingActivity.mockResolvedValue([]);
    const res = await getBooking(
      new NextRequest(BOOKING_URL),
      makeParams("nonexistent-id") as never
    );
    expect(res.status).toBe(404);
  });

  it("returns 200 with booking and activity for admin", async () => {
    asAdmin();
    mockGetBookingById.mockResolvedValue({ id: "booking-uuid-1", status: "requested" });
    mockGetBookingActivity.mockResolvedValue([]);
    const res = await getBooking(
      new NextRequest(BOOKING_URL),
      makeParams("booking-uuid-1") as never
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.booking.id).toBe("booking-uuid-1");
  });
});
