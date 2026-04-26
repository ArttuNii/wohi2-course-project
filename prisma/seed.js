const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

const seedQuizes = [
  {
    question: "Java or Python?",
    answer: "Python"
  },
  {
    question: "Which course is this?",
    answer: "WOHI2"
  },
  {
    question: "Who teaches this course?",
    answer: "Sonsoles López Pernas"
  },
  {
    question: "1 + 1 = ?",
    answer: "3"
  },
];

async function main() {
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();
  const hashedPassword = await bcrypt.hash("1234", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  console.log("Created user:", user.email);

  for (const quiz of seedQuizes) {
    await prisma.quiz.create({
      data: {
        question: quiz.question,
        answer: quiz.answer,
        userId: user.id,
        },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
