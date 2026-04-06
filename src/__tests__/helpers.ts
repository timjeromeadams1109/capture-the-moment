/**
 * Test helpers — shared mock factories for all route tests.
 */
import { vi } from "vitest";

// ─── Request factory ───────────────────────────────────────────────────────
export function makeRequest(
  method: string,
  url: string,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { body, headers = {} } = options;
  return new Request(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: {
      "content-type": "application/json",
      // Bypass CSRF in test env (NODE_ENV=test → validateOrigin returns true
      // because the csrf module checks NODE_ENV === "development"; for tests
      // we patch the module instead — see individual test files).
      ...headers,
    },
  });
}

// ─── Supabase mock builder ─────────────────────────────────────────────────
/**
 * Returns a chainable Supabase query mock.
 * Pass `resolveWith` as the final `.single()` / `.select()` result.
 */
export function makeSupabaseMock(overrides: {
  user?: { id: string; email: string } | null;
  userRole?: string | null;
  queryData?: unknown;
  queryError?: unknown;
}) {
  const { user = null, userRole = null, queryData = null, queryError = null } =
    overrides;

  // Chainable query object
  const chainable = (): Record<string, unknown> => {
    const q: Record<string, unknown> = {};
    const chain = () => q;
    q.select = chain;
    q.eq = chain;
    q.not = chain;
    q.single = vi.fn().mockResolvedValue({
      data: queryData,
      error: queryError,
    });
    return q;
  };

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      // role lookup comes from the users table
      if (table === "users") {
        const q: Record<string, unknown> = {};
        const chain = () => q;
        q.select = chain;
        q.eq = chain;
        q.not = chain;
        q.single = vi.fn().mockResolvedValue({
          data: userRole !== null ? { role: userRole } : null,
          error: null,
        });
        return q;
      }
      return chainable();
    }),
  };

  return client;
}

// ─── Standard booking payload ──────────────────────────────────────────────
export const VALID_BOOKING_PAYLOAD = {
  serviceSlug: "photo-booth",
  serviceName: "Photo Booth",
  eventDate: "2026-12-01",
  startTime: "14:00",
  durationHours: 3,
  selectedAddOns: [],
  eventType: "Wedding",
  venueName: "Grand Ballroom",
  venueAddress: "123 Main St, Orlando FL",
  venueZip: "32801",
  contactName: "Jane Doe",
  contactEmail: "jane@example.com",
  contactPhone: "4075551234",
  pricing: {
    basePrice: 500,
    extraHoursPrice: 100,
    extraHours: 1,
    addOnsPrice: 0,
    travelFee: 0,
    travelMiles: 0,
    discountAmount: 0,
    subtotal: 600,
    taxAmount: 42,
    totalPrice: 642,
    depositAmount: 200,
    items: [{ label: "Base", amount: 500, type: "base" as const }],
  },
};

// ─── Admin user fixture ────────────────────────────────────────────────────
export const ADMIN_USER = { id: "admin-uuid-1", email: "admin@ctm.com" };
export const CLIENT_USER = { id: "client-uuid-1", email: "client@example.com" };
