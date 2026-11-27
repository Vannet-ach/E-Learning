// ================================================
// src/index.ts  — REPLACE your backend entry file
// ================================================
import express from "express";
import cors from "cors";
import path from "path";
import type { Request, Response } from "express";
import usersRouter       from "./Router/user.js";
import coursesRouter     from "./Router/course.js";
import lessonsRouter     from "./Router/lesson.js";
import enrollmentsRouter from "./Router/enrollment.js";
import progressRouter    from "./Router/progress.js";
import quizzesRouter     from "./Router/quiz.js";
import answersRouter     from "./Router/answer.js";
import uploadRouter      from "./Router/upload.js";

const app = express();

// ── CORS — allow frontend at localhost:5173 ──
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Increase timeout for large video uploads ──
app.use((req, res, next) => {
  req.setTimeout(30 * 60 * 1000); // 30 minutes
  res.setTimeout(30 * 60 * 1000);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Serve uploaded files ──
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req: Request, res: Response) => res.send("✅ Server is running"));

app.use("/users",       usersRouter);
app.use("/courses",     coursesRouter);
app.use("/lessons",     lessonsRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/progress",    progressRouter);
app.use("/quizzes",     quizzesRouter);
app.use("/answers",     answersRouter);
app.use("/upload",      uploadRouter);

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Increase server timeout for large uploads
server.timeout        = 30 * 60 * 1000; // 30 min
server.keepAliveTimeout = 30 * 60 * 1000;