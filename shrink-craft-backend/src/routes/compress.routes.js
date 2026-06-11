import express from "express";
import multer from "multer";
import { compressImages } from "../controllers/compress.controller.js";

const router = express.Router();

// Use memory storage so we never write uncompressed files to the disk
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit per file
});

// Expect a FormData field named 'images', max 50 files per batch
router.post("/", upload.array("images", 50), compressImages);

export default router;