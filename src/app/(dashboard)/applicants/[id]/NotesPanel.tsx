"use client";

import { FormEvent, useState } from "react";

type Author = {
  id: string;
  name: string | null;
  email: string;
};

type Note = {
  id: string;
  body: string;
  createdAt: string | Date;
  author: Author;
};

export function NotesPanel({
  applicationId,
  initialNotes,
  currentUserId,
  currentUserRole,
}: {
  applicationId: string;
  initialNotes: Note[];
  currentUserId?: string;
  currentUserRole?: string;
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = String(form.get("body") ?? "").trim();

    if (!body) {
      setLoading(false);
      setError("Note can't be empty.");
      return;
    }

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, body }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not post note. Try again.");
      return;
    }

    const note = await res.json();
    setNotes((prev) => [note, ...prev]);
    e.currentTarget.reset();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Notes</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <textarea
          name="body"
          rows={3}
          placeholder="Leave feedback for the team..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post note"}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {notes.map((note) => {
          const canDelete = currentUserId === note.author.id || currentUserRole === "ADMIN";
          return (
            <div key={note.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="flex items-start justify-between">
                <p className="font-medium text-slate-900">
                  {note.author.name ?? note.author.email}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-slate-600">{note.body}</p>
            </div>
          );
        })}
        {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
      </div>
    </section>
  );
}
