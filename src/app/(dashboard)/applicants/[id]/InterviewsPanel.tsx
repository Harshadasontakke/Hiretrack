"use client";

import { FormEvent, useState } from "react";

type Interview = {
  id: string;
  scheduledAt: string | Date;
  interviewer: string | null;
  feedback: string | null;
  rating: number | null;
};

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-slate-400">Not rated</span>;
  return (
    <span className="text-sm text-amber-500">
      {"★".repeat(rating)}
      <span className="text-slate-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function InterviewsPanel({
  applicationId,
  initialInterviews,
}: {
  applicationId: string;
  initialInterviews: Interview[];
}) {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const ratingRaw = form.get("rating");

    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        scheduledAt: new Date(String(form.get("scheduledAt"))).toISOString(),
        interviewer: form.get("interviewer") || undefined,
        feedback: form.get("feedback") || undefined,
        rating: ratingRaw ? Number(ratingRaw) : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not schedule interview. Check the fields and try again.");
      return;
    }

    const interview = await res.json();
    setInterviews((prev) =>
      [...prev, interview].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
    );
    setFormOpen(false);
    e.currentTarget.reset();
  }

  async function handleUpdate(id: string, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const ratingRaw = form.get("rating");

    const res = await fetch(`/api/interviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedback: form.get("feedback") || "",
        rating: ratingRaw ? Number(ratingRaw) : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save feedback. Try again.");
      return;
    }

    const updated = await res.json();
    setInterviews((prev) => prev.map((i) => (i.id === id ? updated : i)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setLoading(true);
    const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    }
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Interviews</h2>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
        >
          {formOpen ? "Cancel" : "+ Schedule"}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-4 space-y-3 rounded-lg border border-slate-200 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Date &amp; time
              </label>
              <input
                name="scheduledAt"
                type="datetime-local"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Interviewer</label>
              <input
                name="interviewer"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Feedback (optional)
            </label>
            <textarea
              name="feedback"
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Rating (optional)
            </label>
            <select
              name="rating"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">No rating yet</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} — {"★".repeat(n)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Schedule interview"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {interviews.map((interview) => (
          <div key={interview.id} className="rounded-lg border border-slate-200 p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {new Date(interview.scheduledAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {interview.interviewer ?? "Interviewer not set"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={interview.rating} />
                <button
                  onClick={() =>
                    setEditingId((id) => (id === interview.id ? null : interview.id))
                  }
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  {editingId === interview.id ? "Close" : "Edit"}
                </button>
                <button
                  onClick={() => handleDelete(interview.id)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

            {interview.feedback && editingId !== interview.id && (
              <p className="mt-2 whitespace-pre-wrap text-slate-600">{interview.feedback}</p>
            )}

            {editingId === interview.id && (
              <form
                onSubmit={(e) => handleUpdate(interview.id, e)}
                className="mt-3 space-y-2 border-t border-slate-100 pt-3"
              >
                <textarea
                  name="feedback"
                  defaultValue={interview.feedback ?? ""}
                  rows={2}
                  placeholder="Feedback"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <select
                  name="rating"
                  defaultValue={interview.rating ?? ""}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">No rating</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} — {"★".repeat(n)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  Save feedback
                </button>
              </form>
            )}
          </div>
        ))}
        {interviews.length === 0 && (
          <p className="text-sm text-slate-400">No interviews scheduled yet.</p>
        )}
      </div>
    </section>
  );
}
