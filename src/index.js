const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const quizesRouter = require("./routes/quizes");
const authRouter = require("./routes/auth");
const prisma = require("./lib/prisma");

// Middleware to parse JSON bodies (will be useful in later steps)
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/quizes", quizesRouter);

app.use((req, res) => {
  res.json({msg: "Not found"});
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

