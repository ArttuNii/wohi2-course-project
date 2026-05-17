const path = require("path");
const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./lib/logger");
const quizesRouter = require("./routes/quizes");
const authRouter  = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");
const { NotFoundError } = require("./lib/errors");

const app = express();
app.use(pinoHttp({logger, autoLogging:{ignore:(r)=>r.url.startsWith("/uploads")}}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/auth", authRouter);
app.use("/api/quizes", quizesRouter);
app.use((req, res, next) => { next(new NotFoundError()); });
app.use(errorHandler);

module.exports = app;