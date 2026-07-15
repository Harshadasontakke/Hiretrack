import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const noteSchema = z.object({
  applicationId: z.string(),
  body: z.string().min(1, "Note can't be empty"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("applicationId");

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }

  const notes = await prisma.note.findMany({
    where: { applicationId },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { applicationId, body: noteBody } = parsed.data;

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const note = await prisma.note.create({
    data: {
      applicationId,
      body: noteBody,
      authorId: session.user.id,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
