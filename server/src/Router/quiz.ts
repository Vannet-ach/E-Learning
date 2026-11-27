import { Router } from "express";
const router = Router();
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let prisma: any = null;
async function getPrisma() {
  if (!prisma) {
    const gp = require("@prisma/client");
    prisma = new gp.PrismaClient();
  }
  return prisma;
}
/* ================= CREATE QUIZ ================= */
router.post("/", async (req, res) => {
  const client = await getPrisma();
  const data = await client.quiz.create({
    data: req.body,
  });

  console.log("CREATED QUIZ:", data);
  res.json(data);
});
/* ================= GET ALL QUIZZES ================= */
router.get("/", async (req, res) => {
  const client = await getPrisma();
  const data = await client.quiz.findMany({
    include: {
      lesson: true,
      answers: true,
    },
  });
  console.log("GET QUIZZES:", data);
  res.json(data);
});

/* ================= GET QUIZ BY ID ================= */
router.get("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.quiz.findUnique({
    where: { quiz_id: Number(req.params.id) },
    include: {
      lesson: true,
      answers: true,
    },
  });
  console.log("✅ GET QUIZ:", data);
  res.json(data);
});
/* ================= UPDATE QUIZ ================= */
router.put("/:id", async (req, res) => {
  const client = await getPrisma();

  const data = await client.quiz.update({
    where: { quiz_id: Number(req.params.id) },
    data: req.body,
  });
  console.log("UPDATED QUIZ:", data);
  res.json(data);
});
/* ================= DELETE QUIZ ================= */
router.delete("/:id", async (req, res) => {
  const client = await getPrisma();

  const data = await client.quiz.delete({
    where: { quiz_id: Number(req.params.id) },
  });
  console.log("DELETED QUIZ:", data);
  res.json(data);
});
/* ================= GET QUIZ ANSWERS ================= */
router.get("/:id/answers", async (req, res) => {
  const client = await getPrisma();

  const data = await client.answer.findMany({
    where: { quiz_id: Number(req.params.id) },
  });
  console.log("QUIZ ANSWERS:", data);
  res.json(data);
});
export default router;