const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

function formatQuiz(quiz) {
  return {
    id: quiz.id,
    question: quiz.question,
    answer: quiz.answer,
  };
}

router.get("/", async (req, res) => {
  const { question } = req.query;

  const where = question
    ? {
        question: {
          contains: question,
        },
      }
    : {};

  const quizes = await prisma.quiz.findMany({
    where,
    orderBy: { id: "asc" },
  });

  res.json(quizes.map(formatQuiz));
});

router.get("/:quizId", async (req, res) => {
  const quizId = Number(req.params.quizId);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });


  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  res.json(formatQuiz(quiz));
});

router.post("/", async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer ) {
    return res.status(400).json({
      message: "Question and answer are both required"
    });
  }

  const newQuiz = await prisma.quiz.create({
    data: {
      question,
      answer,
    }  
  });
  res.status(201).json(formatQuiz(newQuiz));
});

router.put("/:quizId", async (req, res) => {
  const quizId = Number(req.params.quizId);
  const { question, answer } = req.body;

  const existingQuiz = await prisma.quiz.findUnique({
  where: { id: quizId },
  });

  if (!existingQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (!question || !answer ) {
    return res.json({
      message: "Question and answer are both required"
    });
  }

  const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        question,
        answer,
      },
  });
  res.json(formatQuiz(updatedQuiz));
});

router.delete("/:quizId", async (req, res) => {
  const quizId = Number(req.params.quizId);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  await prisma.quiz.delete({ where: { id: quizId } });

  res.json({
    message: "Quiz deleted succesfully",
    quiz: formatQuiz(quiz)
  });
});

module.exports = router;
