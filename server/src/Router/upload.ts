// ================================================
// src/Router/upload.ts  — REPLACE your backend file
// ================================================
import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Create uploads folder
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    cb(null, `${Date.now()}_${name}${ext}`);
  },
});

// Image upload — 5MB max
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok  = [".jpg",".jpeg",".png",".gif",".webp",".svg"].includes(ext)
             || file.mimetype.startsWith("image/");
    ok ? cb(null, true) : cb(new Error("Images only"));
  },
});

// Video upload — 500MB max, NO strict filter
const videoUpload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 1,
  },
});

// POST /upload/image
router.post("/image", (req: Request, res: Response) => {
  imageUpload.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file received" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("✅ IMAGE:", url);
    res.json({ url, filename: req.file.filename });
  });
});

// POST /upload/video
router.post("/video", (req: Request, res: Response) => {
  // Set long timeout for large video files
  req.setTimeout(30 * 60 * 1000); // 30 minutes
  res.setTimeout(30 * 60 * 1000);

  videoUpload.single("video")(req, res, (err) => {
    if (err) {
      console.error("❌ Video upload error:", err.message);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: "No file received. Make sure field name is 'video'" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("✅ VIDEO:", url, `(${(req.file.size / 1024 / 1024).toFixed(1)} MB)`);
    res.json({ url, filename: req.file.filename, size: req.file.size });
  });
});

export default router;