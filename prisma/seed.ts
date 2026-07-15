import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@hiretrack.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@hiretrack.dev",
      password,
      role: "ADMIN",
    },
  });

  const job = await prisma.job.create({
    data: {
      title: "Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      description: "We're looking for a frontend engineer to join our team.",
      status: "OPEN",
      createdById: user.id,
    },
  });

  const candidate = await prisma.candidate.create({
    data: {
      name: "Jamie Rivera",
      email: "jamie@example.com",
      phone: "555-0100",
    },
  });

  await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: candidate.id,
      stage: "APPLIED",
    },
  });

  console.log("Seeded database. Login with admin@hiretrack.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
