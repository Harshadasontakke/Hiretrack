import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const interviewSchema = z.object({
  applicationId: z.string(),
  scheduledAt: z.string().datetime().or(z.string().min(1)),
  interviewer: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("applicationId");

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }

  const interviews = await prisma.interview.findMany({
    where: { applicationId },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(interviews);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = interviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { applicationId, scheduledAt, interviewer, feedback, rating } = parsed.data;

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const interview = await prisma.interview.create({
    data: {
      applicationId,
      scheduledAt: new Date(scheduledAt),
      interviewer,
      feedback,
      rating,
    },
  });

  return NextResponse.json(interview, { status: 201 });
}
