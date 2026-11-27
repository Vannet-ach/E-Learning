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
/* ================= GET ALL PROGRESS ================= */
router.get("/", async (req, res) => {
  const client = await getPrisma();
  const progress = await client.progress.findMany({
    include: { user: true, lesson: true },
  });
  console.log("GET PROGRESS:", progress);
  res.json(progress);
});
/* ================= GET PROGRESS BY ID ================= */
router.get("/:id", async (req, res) => {
  const client = await getPrisma();
  const progress = await client.progress.findUnique({
    where: { progress_id: Number(req.params.id) },
    include: { user: true, lesson: true },
  });
  console.log("GET PROGRESS:", progress);
  res.json(progress);
});
/* ================= CREATE PROGRESS ================= */
router.post("/", async (req, res) => {
  const client = await getPrisma();
  const progress = await client.progress.create({
    data: req.body,
  });
  console.log("CREATED PROGRESS:", progress);
  res.json(progress);
});
/* ================= UPDATE PROGRESS ================= */
router.put("/:id", async (req, res) => {
  const client = await getPrisma();
  const progress = await client.progress.update({
    where: { progress_id: Number(req.params.id) },
    data: req.body,
  });
  console.log("UPDATED PROGRESS:", progress);
  res.json(progress);
});
/* ================= DELETE PROGRESS ================= */
router.delete("/:id", async (req, res) => {
  const client = await getPrisma();
  const progress = await client.progress.delete({
    where: { progress_id: Number(req.params.id) },
  });
  console.log("DELETED PROGRESS:", progress);
  res.json(progress);
});
/* ================= GET USER PROGRESS ================= */
router.get("/user/:userId", async (req, res) => {
  const client = await getPrisma();
  const progress = await client.progress.findMany({
    where: { user_id: Number(req.params.userId) },
    include: { lesson: true },
  });
  console.log("USER PROGRESS:", progress);
  res.json(progress);
});
export default router;
