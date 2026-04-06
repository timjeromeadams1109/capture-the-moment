"use client";

import { useEffect, useState } from "react";

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string | null;
  type: "feature" | "fix" | "improvement" | "breaking" | "security" | "infrastructure";
  created_at: string;
  created_by: string;
}

const TYPE_LABELS: Record<ChangelogEntry["type"], string> = {
  feature: "Feature",
  fix: "Fix",
  improvement: "Improvement",
  breaking: "Breaking",
  security: "Security",
  infrastructure: "Infrastructure",
};

const TYPE_COLORS: Record<ChangelogEntry["type"], string> = {
  feature: "bg-blue-100 text-blue-800",
  fix: "bg-red-100 text-red-800",
  improvement: "bg-green-100 text-green-800",
  breaking: "bg-orange-100 text-orange-800",
  security: "bg-purple-100 text-purple-800",
  infrastructure: "bg-gray-100 text-gray-800",
};

const ENTRY_TYPES = [
  "feature",
  "fix",
  "improvement",
  "breaking",
  "security",
  "infrastructure",
] as const;

interface FormState {
  version: string;
  title: string;
  description: string;
  type: ChangelogEntry["type"];
}

const DEFAULT_FORM: FormState = {
  version: "",
  title: "",
  description: "",
  type: "feature",
};

export default function ChangelogAdminPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchEntries() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/changelog");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/changelog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setForm(DEFAULT_FORM);
      await fetchEntries();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create entry");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this changelog entry?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/changelog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Changelog Admin</h1>

      {/* New entry form */}
      <section className="mb-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Add Entry</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="version" className="block text-sm font-medium mb-1">
                Version
              </label>
              <input
                id="version"
                type="text"
                required
                maxLength={50}
                placeholder="1.0.0"
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <select
                id="type"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as ChangelogEntry["type"] }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              placeholder="What changed?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={2000}
              placeholder="More details..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="self-end rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Adding..." : "Add Entry"}
          </button>
        </form>
      </section>

      {/* Entries list */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Entries</h2>
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && entries.length === 0 && (
          <p className="text-sm text-gray-400">No entries yet.</p>
        )}
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-500">v{entry.version}</span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[entry.type]}`}
                  >
                    {TYPE_LABELS[entry.type]}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                {entry.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date(entry.created_at).toLocaleDateString()} · {entry.created_by}
                </p>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                aria-label="Delete entry"
                className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === entry.id ? "..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
