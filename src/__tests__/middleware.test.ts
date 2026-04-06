/**
 * Tests: src/middleware.ts
 * Covers: unauthenticated → redirect to /login, non-admin → redirect to /,
 *         admin → pass through, authenticated admin on /login → redirect to dashboard,
 *         non-admin on /login → stay, public route → pass through.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Supabase SSR mock ─────────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockRoleSingle = vi.fn();
const mockFromFn = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: mockRoleSingle,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFromFn,
  })),
}));

// ─── next/headers not needed in middleware, but prevent import errors ──────
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

import { middleware } from "@/middleware";

const ORIGIN = "https://capture-the-moment.vercel.app";

function nextReq(path: string): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`);
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("passes through when Supabase env vars are missing", async () => {
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const res = await middleware(nextReq("/admin/dashboard"));
    expect(res.status).toBe(200);
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
  });

  it("redirects unauthenticated request on /admin to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(nextReq("/admin/dashboard"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/login");
    expect(loc).toContain("redirectTo=");
  });

  it("redirects authenticated non-admin from /admin to / with error param", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockRoleSingle.mockResolvedValue({ data: { role: "client" }, error: null });
    const res = await middleware(nextReq("/admin/bookings"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=unauthorized");
  });

  it("allows authenticated admin user through /admin routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "a1" } } });
    mockRoleSingle.mockResolvedValue({ data: { role: "admin" }, error: null });
    const res = await middleware(nextReq("/admin/dashboard"));
    expect(res.status).toBe(200);
  });

  it("redirects authenticated admin away from /login to /admin/dashboard", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "a1" } } });
    mockRoleSingle.mockResolvedValue({ data: { role: "admin" }, error: null });
    const res = await middleware(nextReq("/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/dashboard");
  });

  it("allows non-admin authenticated user to stay on /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockRoleSingle.mockResolvedValue({ data: { role: "client" }, error: null });
    const res = await middleware(nextReq("/login"));
    expect(res.status).toBe(200);
  });

  it("passes through public /book route for unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(nextReq("/book"));
    expect(res.status).toBe(200);
  });
});
