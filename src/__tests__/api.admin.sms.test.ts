/**
 * Tests: GET  /api/admin/sms
 *        POST /api/admin/sms/send
 *        GET  /api/admin/sms/send (template list)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/csrf", () => ({
  isTrustedSource: vi.fn().mockReturnValue(true),
  validateOrigin: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/ratelimit", () => ({
  smsLimiter: null,
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

vi.mock("@/lib/data/sms", () => ({
  getRecentSmsLogs: vi.fn().mockResolvedValue([]),
  getSmsStats: vi.fn().mockResolvedValue({}),
  getClientsForSms: vi.fn().mockResolvedValue([]),
  createSmsLog: vi.fn().mockResolvedValue({ id: "log-uuid-1" }),
  updateSmsLogStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("twilio", () => ({
  default: vi.fn().mockReturnValue({
    messages: {
      create: vi.fn().mockResolvedValue({ sid: "SM123" }),
    },
  }),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

import { GET as getSmsData } from "@/app/api/admin/sms/route";
import { POST as sendSms, GET as getTemplates } from "@/app/api/admin/sms/send/route";
import { ADMIN_USER, CLIENT_USER } from "./helpers";

const SMS_URL = "https://capture-the-moment.vercel.app/api/admin/sms";
const SMS_SEND_URL = `${SMS_URL}/send`;

function postReq(body: unknown): NextRequest {
  return new NextRequest(SMS_SEND_URL, {
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

describe("GET /api/admin/sms", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await getSmsData(new NextRequest(SMS_URL));
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin", async () => {
    asClient();
    const res = await getSmsData(new NextRequest(SMS_URL));
    expect(res.status).toBe(403);
  });

  it("returns 200 with logs/stats/clients for admin", async () => {
    asAdmin();
    const res = await getSmsData(new NextRequest(SMS_URL));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.logs)).toBe(true);
  });
});

describe("GET /api/admin/sms/send (template list)", () => {
  it("returns available templates without requiring auth", async () => {
    const res = await getTemplates(new NextRequest(SMS_SEND_URL));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.templates)).toBe(true);
    expect(json.templates.length).toBeGreaterThan(0);
    expect(json.templates[0]).toHaveProperty("id");
    expect(json.templates[0]).toHaveProperty("name");
  });
});

describe("POST /api/admin/sms/send", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    asUnauthenticated();
    const res = await sendSms(postReq({ to: "4075551234", message: "Hi" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin", async () => {
    asClient();
    const res = await sendSms(postReq({ to: "4075551234", message: "Hi" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when to field is too short", async () => {
    asAdmin();
    const res = await sendSms(postReq({ to: "123", message: "Hi" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when neither template nor message is provided", async () => {
    asAdmin();
    const res = await sendSms(postReq({ to: "4075551234" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("template or message");
  });

  it("returns 400 when bookingId is not a valid UUID", async () => {
    asAdmin();
    const res = await sendSms(
      postReq({ to: "4075551234", message: "Hi", bookingId: "not-a-uuid" })
    );
    expect(res.status).toBe(400);
  });

  it("sends a custom SMS and returns 200", async () => {
    asAdmin();
    const res = await sendSms(postReq({ to: "4075551234", message: "Hello!" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("sends a templated SMS with a known template", async () => {
    asAdmin();
    const res = await sendSms(
      postReq({
        to: "4075551234",
        template: "booking_confirmation",
        variables: { name: "Jane", booking_number: "CTM-001", date: "December 1" },
      })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("uses message branch when template key is unrecognized but message is provided", async () => {
    asAdmin();
    const res = await sendSms(
      postReq({ to: "4075551234", template: "nonexistent", message: "Fallback" })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("returns 429 when rate limited", async () => {
    asAdmin();
    const rl = await import("@/lib/ratelimit");
    vi.spyOn(rl, "checkLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
    });
    const res = await sendSms(postReq({ to: "4075551234", message: "Hi" }));
    expect(res.status).toBe(429);
  });
});
