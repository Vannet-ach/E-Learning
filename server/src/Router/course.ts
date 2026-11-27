import { Router } from "express";
import type { Request, Response } from "express";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const router = Router();
let prisma: any = null;
async function getPrisma() {
  if (!prisma) {
    try {
      let gp: any;
      try {
        gp = require("@prisma/client");
      } catch {
        gp = await import("@prisma/client");
      }
      const PrismaClient = gp.PrismaClient ?? gp.default?.PrismaClient;
      prisma = new PrismaClient({});
    } catch (e) {
      console.error("Prisma init error:", e);
      prisma = null;
    }
  }
  return prisma;
}
/* ================= GET ALL COURSES ================= */
router.get("/", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });
  const courses = await client.course.findMany({
    include: {
      user: true,
      lessons: true,
    },
  });
  console.log("GET COURSES:", courses);
  res.json(courses);
});
/* ================= GET COURSE BY ID ================= */
router.get("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });
  const course = await client.course.findUnique({
    where: { course_id: Number(req.params.id) },
    include: {
      user: true,
      lessons: true,
    },
  });
  console.log("GET COURSE:", course);
  res.json(course);
});
/* ================= CREATE COURSE ================= */
router.post("/", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });
  const course = await client.course.create({
    data: req.body,
  });
  console.log("CREATED COURSE:", course);
  res.json(course);
});
/* ================= UPDATE COURSE ================= */
router.put("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  const course = await client.course.update({
    where: { course_id: Number(req.params.id) },
    data: req.body,
  });
  console.log("UPDATED COURSE:", course);
  res.json(course);
});
/* ================= DELETE COURSE ================= */
router.delete("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  const course = await client.course.delete({
    where: { course_id: Number(req.params.id) },
  });
  console.log("DELETED COURSE:", course);
  res.json(course);
});
/* ================= GET COURSE LESSONS ================= */
router.get("/:id/lessons", async (req, res) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });
  const lessons = await client.lesson.findMany({
    where: { course_id: Number(req.params.id) },
  });
  console.log("GET COURSE LESSONS:", lessons);
  res.json(lessons);
});
export default router;