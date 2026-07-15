import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const jobSchema = z.object({
  title: z.string().min(2),
  department: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(10),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),
});

export async function GET() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(job, { status: 201 });
}
