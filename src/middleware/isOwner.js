const prisma = require("../lib/prisma");

async function isOwner (req, res, next) {
    const id = Number(req.params.quizId);
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.userId !== req.user.userId) {
      return res.status(403).json({ error: "You can only modify your own quizes!" });
    }

    // Attach the record to the request so the route handler can reuse it
    req.quiz = quiz;
    next();
  
}

module.exports = isOwner;
