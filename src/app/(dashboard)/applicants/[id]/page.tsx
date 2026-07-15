import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { InterviewsPanel } from "./InterviewsPanel";
import { NotesPanel } from "./NotesPanel";

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export default async function ApplicantDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      candidate: true,
      job: true,
      interviews: { orderBy: { scheduledAt: "asc" } },
      notes: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!application) notFound();

  const currentUser = session?.user;

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{application.candidate.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{application.candidate.email}</p>
            <p className="mt-3 text-sm text-slate-600">
              Applying for{" "}
              <Link href={`/jobs/${application.jobId}`} className="text-brand-600 hover:underline">
                {application.job.title}
              </Link>
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {STAGE_LABELS[application.stage] ?? application.stage}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Phone</p>
            <p className="mt-1 text-sm text-slate-700">{application.candidate.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Resume</p>
            <p className="mt-1 text-sm text-slate-700">
              {application.candidate.resumeUrl ? (
                <a
                  href={application.candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  View resume
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">LinkedIn</p>
            <p className="mt-1 text-sm text-slate-700">
              {application.candidate.linkedIn ? (
                <a
                  href={application.candidate.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  View profile
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InterviewsPanel applicationId={application.id} initialInterviews={application.interviews} />
          <NotesPanel
            applicationId={application.id}
            initialNotes={application.notes}
            currentUserId={currentUser?.id}
            currentUserRole={currentUser?.role}
          />
        </div>
      </main>
    </div>
  );
}
