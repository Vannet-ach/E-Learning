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
/* ================= GET ALL ANSWERS ================= */
router.get("/", async (req, res) => {
  const client = await getPrisma();
  const data = await client.answer.findMany({
    include: { quiz: true },
  });
  console.log("GET ANSWERS:", data);
  res.json(data);
});
/* ================= GET ANSWER BY ID ================= */
router.get("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.answer.findUnique({
    where: { answer_id: Number(req.params.id) },
    include: { quiz: true },
  });
  console.log("GET ANSWER:", data);
  res.json(data);
});
/* ================= CREATE ANSWER ================= */
router.post("/", async (req, res) => {
  const client = await getPrisma();
  const data = await client.answer.create({
    data: req.body,
  });
  console.log("CREATED ANSWER:", data);
  res.json(data);
});
/* ================= UPDATE ANSWER ================= */
router.put("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.answer.update({
    where: { answer_id: Number(req.params.id) },
    data: req.body,
  });
  console.log("UPDATED ANSWER:", data);
  res.json(data);
});
/* ================= DELETE ANSWER ================= */
router.delete("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.answer.delete({
    where: { answer_id: Number(req.params.id) },
  });
  console.log("DELETED ANSWER:", data);
  res.json(data);
});
/* ================= GET ANSWERS BY QUIZ ================= */
router.get("/quiz/:quizId", async (req, res) => {
  const client = await getPrisma();
  const data = await client.answer.findMany({
    where: { quiz_id: Number(req.params.quizId) },
  });
  console.log("QUIZ ANSWERS:", data);
  res.json(data);
});
export default router;