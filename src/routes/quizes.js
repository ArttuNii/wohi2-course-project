const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");
const path = require("path")
const multer = require("multer");
const { ValidationError, ConflictError, UnauthorizedError, NotFoundError } = require("../lib/errors");
const { z } = require("zod");

const QuizInput = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "public", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});


router.use(authenticate);

function formatQuiz(quiz) {
  return {
    id: quiz.id,
    question: quiz.question,
    answer: quiz.answer,
    keywords: quiz.keywords?.map(k => k.word) || [],
    userName: quiz.user?.name || null,
    solved: quiz.attempts ? quiz.attempts.length > 0 : false,
    imageUrl: quiz.imageUrl || null,
    user: undefined,
    attempts: undefined
  };
}

router.get("/", async (req, res) => {
  const {question} = req.query;

  const where = question ? { question: {contains: question}} : {};

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 5));
    const skip = (page - 1) * limit;

  const [filteredquizes, total] = await Promise.all([prisma.quiz.findMany({
    where,
    include: {keywords: true, user: true, attempts: {where : {userId: req.user.userId}, take: 1} },
    orderBy: { id: "asc" },
    skip,
    take: limit
  }), prisma.quiz.count({where})]);

  res.json({
  data: filteredquizes.map(formatQuiz),
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit)
  });

});

router.get("/:quizId", async (req, res, next) => {
  try {
    const quizId = Number(req.params.quizId);
    const quiz = await prisma.quiz.findUnique({
      include: {
        keywords: true,
        user: true,
        attempts: { where: { userId: req.user.userId }, take: 1 },
      },
      where: { id: quizId }
    });
    if (!quiz) {
      throw new NotFoundError("Quiz not found")
    }
    res.json(formatQuiz(quiz));
  } catch (e) { next(e); }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
  const { question, answer } = QuizInput.parse(req.body);
  const keywords = req.body.keywords ? req.body.keywords.split(",").map(w => w.trim()).filter(Boolean) : [];

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newQuiz = await prisma.quiz.create({
    data: {
      question,
      userId: req.user.userId,
      keywords: keywords?.length ? { create: keywords.map(word => ({ word })) } : undefined,
      answer,
      imageUrl
    },
    include: { keywords: true, user: true }
  });
  res.status(201).json(formatQuiz(newQuiz));
  } catch (e) { next(e); }
});


router.put("/:quizId", isOwner, upload.single("image"), async (req, res) => {
  const quizId = Number(req.params.quizId);
  const { question, answer } = QuizInput.parse(req.body);
  const keywords = req.body.keywords ? req.body.keywords.split(",").map(w => w.trim()).filter(Boolean) : [];

  const existingQuiz = await prisma.quiz.findUnique({
    include: {keywords: true, user: true },
    where: { id: quizId }
  });

  if (!existingQuiz) {
    throw new NotFoundError("Quiz not found")
  }

  if (!question || !answer ) {
    return res.json({
      message: "Question and answer are both required"
    });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        question,
        answer,
        imageUrl,
        keywords: keywords ? { deleteMany: {}, create: keywords.map(word => ({ word }))} : undefined
      },
      include: { keywords: true, user: true }
  });
  res.json(formatQuiz(updatedQuiz));
});

router.delete("/:quizId", isOwner, async (req, res) => {
  const quizId = Number(req.params.quizId);

  const quiz = await prisma.quiz.findUnique({
    include: {keywords: true, user: true },
    where: { id: quizId }
  });

  if (!quiz) {
    throw new NotFoundError("Quiz not found")
  }

  await prisma.quiz.delete({ where: { id: quizId } });

  res.json({
    message: "Quiz deleted succesfully",
    quiz: formatQuiz(quiz)
  });
});

router.post("/:quizId/play", async (req, res) => {
  const quizId = Number(req.params.quizId);
  const { answer } = req.body;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId }
  });

  if (!quiz) {
    throw new NotFoundError("Quiz not found")
  }

  const correct = quiz.answer.trim().toLowerCase() === answer.trim().toLowerCase();

  if (correct) {
    await prisma.attempt.upsert({
      where: { userId_quizId: { userId: req.user.userId, quizId } },
      update: {},
      create: { userId: req.user.userId, quizId },
    });
  }

  res.json({
    correct,
    correctAnswer: correct ? undefined : quiz.answer
  });
});

module.exports = router;
