const express = require("express");
const router = express.Router();

const quizes = require("../data/quizes");

router.get("/", (req, res) => {
  const { question } = req.query;

  if (!question) {
    return res.json(quizes);
  }

  const filteredQuizes = quizes.filter(quiz =>
    quiz.question.includes(question.toLowerCase())
  );

  res.json(filteredQuizes);
});

router.get("/:quizId", (req, res) => {
  const quizId = Number(req.params.quizId);

  const quiz = quizes.find((q) => q.id === quizId);

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  res.json(quiz);
});

router.post("/", (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer ) {
    return res.status(400).json({
      message: "Question and answer are both required"
    });
  }
  const maxId = Math.max(...quizes.map(q => q.id), 0);

  const newQuiz = {
    id: quizes.length ? maxId + 1 : 1,
    question, answer
  };
  quizes.push(newQuiz);
  res.status(201).json(newQuiz);
});

router.put("/:quizId", (req, res) => {
  const quizId = Number(req.params.quizId);
  const { question, answer } = req.body;

  const quiz = quizes.find((q) => q.id === quizId);

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (!question || !answer ) {
    return res.json({
      message: "Question and answer are both required"
    });
  }

  quiz.question = question;
  quiz.answer = answer;
  
  res.json(quiz);
});

router.delete("/:quizId", (req, res) => {
  const quizId = Number(req.params.quizId);

  const quizIndex = quizes.findIndex((q) => q.id === quizId);

  if (quizIndex === -1) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const deletedQuiz = quizes.splice(quizIndex, 1);

  res.json({
    message: "Quiz deleted succesfully",
    quiz: deletedQuiz[0]
  });
});

module.exports = router;
