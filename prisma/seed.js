const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

  for (const quiz of seedQuizes) {
    await prisma.quiz.create({
      data: {
        question: quiz.question,
        answer: quiz.answer,
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
