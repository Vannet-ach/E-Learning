import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const router = Router();
let prisma: any = null;

// Function to get Prisma Client
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

/* ================= REGISTER ================= */
router.post("/register", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await client.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hash,
        role: req.body.role || "USER",
      },
    });
    console.log("REGISTERED USER:", user);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  try {
    const user = await client.user.findUnique({
      where: { email: req.body.email },
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ user_id: user.user_id }, "SECRET", {
      expiresIn: "1d",
    });
    console.log("USER LOGGED IN:", user);
    res.json({ token, user });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
});

/* ================= GET ALL USERS ================= */
router.get("/", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  try {
    const users = await client.user.findMany();
    console.log("GET USERS:", users);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* ================= GET USER BY ID ================= */
router.get("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  try {
    const user = await client.user.findUnique({
      where: { user_id: Number(req.params.id) },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("GET USER:", user);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/* ================= UPDATE USER ================= */
router.put("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  try {
    const user = await client.user.update({
      where: { user_id: Number(req.params.id) },
      data: req.body,
    });
    console.log("UPDATED USER:", user);
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/* ================= DELETE USER ================= */
router.delete("/:id", async (req: Request, res: Response) => {
  const client = await getPrisma();
  if (!client) return res.status(503).json({ error: "DB error" });

  try {
    const user = await client.user.delete({
      where: { user_id: Number(req.params.id) },
    });
    console.log("DELETED USER:", user);
    res.json(user);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
