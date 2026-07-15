import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { NewJobForm } from "./NewJobForm";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
        </div>

        <NewJobForm />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium text-slate-900">{job.title}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    job.status === "OPEN"
                      ? "bg-green-50 text-green-700"
                      : job.status === "CLOSED"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="mb-3 text-sm text-slate-500">
                {job.department ?? "—"} {job.location ? `· ${job.location}` : ""}
              </p>
              <p className="text-sm text-slate-600">
                {job._count.applications} applicant
                {job._count.applications === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-slate-500">No jobs yet. Create one above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
