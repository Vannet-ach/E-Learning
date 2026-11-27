import { Router } from "express";
import type { Request, Response } from "express";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const router = Router();
let prisma: any = null;
async function getPrisma() {
  if (!prisma) {
    const gp = require("@prisma/client");
    prisma = new gp.PrismaClient();
  }
  return prisma;
}
/* ================= GET ALL LESSONS ================= */
router.get("/", async (req: Request, res: Response) => {
  const client = await getPrisma();
  const lessons = await client.lesson.findMany({
    include: { course: true },
  });
  console.log("GET LESSONS:", lessons);
  res.json(lessons);
});
/* ================= GET LESSON BY ID ================= */
router.get("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  const lesson = await client.lesson.findUnique({
    where: { lesson_id: Number(req.params.id) },
    include: { course: true },
  });
  console.log("GET LESSON:", lesson);
  res.json(lesson);
});
/* ================= CREATE LESSON ================= */
router.post("/", async (req: Request, res: Response) => {
  const client = await getPrisma();
  const lesson = await client.lesson.create({
    data: req.body,
  });
  console.log("CREATED LESSON:", lesson);
  res.json(lesson);
});
/* ================= UPDATE LESSON ================= */
router.put("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  const lesson = await client.lesson.update({
    where: { lesson_id: Number(req.params.id) },
    data: req.body,
  });
  console.log("UPDATED LESSON:", lesson);
  res.json(lesson);
});
/* ================= DELETE LESSON ================= */
router.delete("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  const lesson = await client.lesson.delete({
    where: { lesson_id: Number(req.params.id) },
  });
  console.log("DELETED LESSON:", lesson);
  res.json(lesson);
});
/* ================= GET LESSON QUIZZES ================= */
router.get("/:id/quizzes", async (req, res) => {
  const client = await getPrisma();
  const quizzes = await client.quiz.findMany({
    where: { lesson_id: Number(req.params.id) },
  });
  console.log("GET LESSON QUIZZES:", quizzes);
  res.json(quizzes);
});
export default router;