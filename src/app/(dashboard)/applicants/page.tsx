import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export default async function ApplicantsPage() {
  const applications = await prisma.application.findMany({
    include: { candidate: true, job: true },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">All applicants</h1>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/applicants/${app.id}`}
                      className="font-medium text-slate-900 hover:text-brand-600 hover:underline"
                    >
                      {app.candidate.name}
                    </Link>
                    <p className="text-xs text-slate-500">{app.candidate.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${app.jobId}`} className="text-brand-600 hover:underline">
                      {app.job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{STAGE_LABELS[app.stage] ?? app.stage}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No applicants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
