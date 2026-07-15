import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const applicationSchema = z.object({
  jobId: z.string(),
  candidate: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    resumeUrl: z.string().url().optional(),
    linkedIn: z.string().url().optional(),
  }),
});

export async function GET() {
  const applications = await prisma.application.findMany({
    include: { candidate: true, job: true },
    orderBy: { appliedAt: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { jobId, candidate } = parsed.data;

  const candidateRecord = await prisma.candidate.upsert({
    where: { email: candidate.email },
    update: candidate,
    create: candidate,
  });

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: candidateRecord.id,
    },
    include: { candidate: true, job: true },
  });

  return NextResponse.json(application, { status: 201 });
}
