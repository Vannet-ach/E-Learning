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
/* ================= GET ALL ENROLLMENTS ================= */
router.get("/", async (req, res) => {
  const client = await getPrisma();
  const data = await client.enrollment.findMany({
    include: { user: true, course: true },
  });
  console.log("GET ENROLLMENTS:", data);
  res.json(data);
});
/* ================= GET ENROLLMENT BY ID ================= */
router.get("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.enrollment.findUnique({
    where: { enrollment_id: Number(req.params.id) },
    include: { user: true, course: true },
  });
  console.log("GET ENROLLMENT:", data);
  res.json(data);
});
/* ================= ENROLL (CREATE) ================= */
router.post("/", async (req, res) => {
  const client = await getPrisma();
  const data = await client.enrollment.create({
    data: {
      user_id: req.body.user_id,
      course_id: req.body.course_id,
    },
  });
  console.log("CREATED ENROLLMENT:", data);
  res.json(data);
});
/* ================= UPDATE ENROLLMENT ================= */
router.put("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.enrollment.update({
    where: { enrollment_id: Number(req.params.id) },
    data: {
      user_id: req.body.user_id,
      course_id: req.body.course_id,
    },
  });
  console.log("UPDATED ENROLLMENT:", data);
  res.json(data);
});
/* ================= DELETE ENROLLMENT ================= */
router.delete("/:id", async (req, res) => {
  const client = await getPrisma();
  const data = await client.enrollment.delete({
    where: { enrollment_id: Number(req.params.id) },
  });
  console.log("DELETED ENROLLMENT:", data);
  res.json(data);
});
/* ================= GET USER ENROLLMENTS ================= */
router.get("/user/:userId", async (req, res) => {
  const client = await getPrisma();
  const data = await client.enrollment.findMany({
    where: { user_id: Number(req.params.userId) },
    include: { course: true },
  });
  console.log("USER ENROLLMENTS:", data);
  res.json(data);
});
export default router;