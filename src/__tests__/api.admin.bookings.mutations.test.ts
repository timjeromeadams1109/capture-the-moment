/**
 * Tests: POST /api/admin/bookings/[id]/approve
 *        POST /api/admin/bookings/[id]/status
 *        POST /api/admin/bookings/[id]/notes
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/csrf", () => ({
  isTrustedSource: vi.fn().mockReturnValue(true),
  validateOrigin: vi.fn().mockReturnValue(true),
}));

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

const mockGetBookingById = vi.fn();
const mockUpdateBookingStatus = vi.fn();
const mockUpdateBookingNotes = vi.fn();

vi.mock("@/lib/data/bookings", () => ({
  getBookingById: mockGetBookingById,
  updateBookingStatus: mockUpdateBookingStatus,
  updateBookingNotes: mockUpdateBookingNotes,
  getBookings: vi.fn(),
  getBookingActivity: vi.fn(),
}));

vi.mock("@/lib/services/notifications", () => ({
  sendBookingApproved: vi.fn().mockResolvedValue({ success: true }),
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

import { POST as approveBooking } from "@/app/api/admin/bookings/[id]/approve/route";
import { POST as updateStatus } from "@/app/api/admin/bookings/[id]/status/route";
import { POST as updateNotes } from "@/app/api/admin/bookings/[id]/notes/route";
import { ADMIN_USER, CLIENT_USER } from "./helpers";

const BASE = "https://capture-the-moment.vercel.app/api/admin/bookings";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}
function postReq(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
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

// ─── /approve ─────────────────────────────────────────────────────────────
describe("POST /api/admin/bookings/[id]/approve", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await approveBooking(
      postReq(`${BASE}/abc/approve`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin", async () => {
    asClient();
    const res = await approveBooking(
      postReq(`${BASE}/abc/approve`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 when booking does not exist", async () => {
    asAdmin();
    mockGetBookingById.mockResolvedValue(null);
    const res = await approveBooking(
      postReq(`${BASE}/abc/approve`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when booking status is not approvable (completed)", async () => {
    asAdmin();
    mockGetBookingById.mockResolvedValue({ id: "abc", status: "completed" });
    const res = await approveBooking(
      postReq(`${BASE}/abc/approve`, {}),
      makeParams("abc") as never
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("cannot be approved");
  });

  it("approves a requested booking and returns 200", async () => {
    asAdmin();
    mockGetBookingById
      .mockResolvedValueOnce({ id: "abc", status: "requested" })
      .mockResolvedValueOnce({ id: "abc", status: "approved" });
    mockUpdateBookingStatus.mockResolvedValue({ id: "abc", status: "approved" });
    const res = await approveBooking(
      postReq(`${BASE}/abc/approve`, {}),
      makeParams("abc") as never
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdateBookingStatus).toHaveBeenCalledWith("abc", "approved", ADMIN_USER.id);
  });

  it("approves a held booking", async () => {
    asAdmin();
    mockGetBookingById
      .mockResolvedValueOnce({ id: "abc", status: "held" })
      .mockResolvedValueOnce({ id: "abc", status: "approved" });
    mockUpdateBookingStatus.mockResolvedValue({ id: "abc", status: "approved" });
    const res = await approveBooking(
      postReq(`${BASE}/abc/approve`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(200);
  });
});

// ─── /status ──────────────────────────────────────────────────────────────
describe("POST /api/admin/bookings/[id]/status", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await updateStatus(
      postReq(`${BASE}/abc/status`, { status: "cancelled" }),
      makeParams("abc") as never
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin", async () => {
    asClient();
    const res = await updateStatus(
      postReq(`${BASE}/abc/status`, { status: "cancelled" }),
      makeParams("abc") as never
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid status value", async () => {
    asAdmin();
    const res = await updateStatus(
      postReq(`${BASE}/abc/status`, { status: "flying" }),
      makeParams("abc") as never
    );
    expect(res.status).toBe(400);
  });

  it("rejects missing status field", async () => {
    asAdmin();
    const res = await updateStatus(
      postReq(`${BASE}/abc/status`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(400);
  });

  it("updates status to cancelled with reason", async () => {
    asAdmin();
    mockUpdateBookingStatus.mockResolvedValue({ id: "abc", status: "cancelled" });
    const res = await updateStatus(
      postReq(`${BASE}/abc/status`, { status: "cancelled", reason: "Client request" }),
      makeParams("abc") as never
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdateBookingStatus).toHaveBeenCalledWith(
      "abc",
      "cancelled",
      ADMIN_USER.id,
      expect.objectContaining({ cancellation_reason: "Client request" })
    );
  });

  it("accepts all 9 valid status values", async () => {
    const statuses = [
      "requested", "held", "approved", "deposit_paid",
      "confirmed", "completed", "cancelled", "expired", "no_show",
    ];
    for (const status of statuses) {
      asAdmin();
      mockUpdateBookingStatus.mockResolvedValue({ id: "abc", status });
      const res = await updateStatus(
        postReq(`${BASE}/abc/status`, { status }),
        makeParams("abc") as never
      );
      expect(res.status).toBe(200);
    }
  });
});

// ─── /notes ───────────────────────────────────────────────────────────────
describe("POST /api/admin/bookings/[id]/notes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await updateNotes(
      postReq(`${BASE}/abc/notes`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin", async () => {
    asClient();
    const res = await updateNotes(
      postReq(`${BASE}/abc/notes`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(403);
  });

  it("updates admin_notes successfully", async () => {
    asAdmin();
    mockUpdateBookingNotes.mockResolvedValue({ id: "abc", admin_notes: "Reviewed" });
    const res = await updateNotes(
      postReq(`${BASE}/abc/notes`, { admin_notes: "Reviewed" }),
      makeParams("abc") as never
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdateBookingNotes).toHaveBeenCalledWith(
      "abc",
      expect.objectContaining({ admin_notes: "Reviewed" }),
      ADMIN_USER.id
    );
  });

  it("updates both admin_notes and internal_notes simultaneously", async () => {
    asAdmin();
    mockUpdateBookingNotes.mockResolvedValue({ id: "abc" });
    await updateNotes(
      postReq(`${BASE}/abc/notes`, {
        admin_notes: "Public note",
        internal_notes: "Private note",
      }),
      makeParams("abc") as never
    );
    expect(mockUpdateBookingNotes).toHaveBeenCalledWith(
      "abc",
      { admin_notes: "Public note", internal_notes: "Private note" },
      ADMIN_USER.id
    );
  });

  it("accepts an empty body (all fields optional)", async () => {
    asAdmin();
    mockUpdateBookingNotes.mockResolvedValue({ id: "abc" });
    const res = await updateNotes(
      postReq(`${BASE}/abc/notes`, {}),
      makeParams("abc") as never
    );
    expect(res.status).toBe(200);
  });
});
