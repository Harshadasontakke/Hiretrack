"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Candidate = {
  id: string;
  name: string;
  email: string;
};

type Application = {
  id: string;
  stage: string;
  candidate: Candidate;
};

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export function PipelineBoard({
  stages,
  applications,
}: {
  stages: string[];
  applications: Application[];
}) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function moveStage(applicationId: string, stage: string) {
    setUpdatingId(applicationId);
    await fetch(`/api/applicants/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    setUpdatingId(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-6">
      {stages.map((stage) => {
        const apps = applications.filter((a) => a.stage === stage);
        return (
          <div key={stage} className="min-w-[220px] rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
              {STAGE_LABELS[stage] ?? stage}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {apps.length}
              </span>
            </h3>
            <div className="space-y-2">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <Link
                    href={`/applicants/${app.id}`}
                    className="font-medium text-slate-900 hover:text-brand-600 hover:underline"
                  >
                    {app.candidate.name}
                  </Link>
                  <p className="mb-2 truncate text-xs text-slate-500">{app.candidate.email}</p>
                  <select
                    value={app.stage}
                    disabled={updatingId === app.id}
                    onChange={(e) => moveStage(app.id, e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-brand-500"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s] ?? s}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {apps.length === 0 && (
                <p className="text-xs text-slate-400">No candidates</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
