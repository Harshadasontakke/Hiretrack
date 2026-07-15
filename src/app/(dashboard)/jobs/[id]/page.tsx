import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { PipelineBoard } from "./PipelineBoard";
import { AddApplicantForm } from "./AddApplicantForm";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: { candidate: true },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!job) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">{job.title}</h1>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          {job.department ?? "—"} {job.location ? `· ${job.location}` : ""} ·{" "}
          {job.applications.length} applicant{job.applications.length === 1 ? "" : "s"}
        </p>

        <AddApplicantForm jobId={job.id} />

        <div className="mt-6">
          <PipelineBoard stages={STAGES as unknown as string[]} applications={job.applications} />
        </div>
      </main>
    </div>
  );
}
