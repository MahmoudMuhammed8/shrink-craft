import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compressRoutes from "./src/routes/compress.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL,
  exposeHeaders: ['Content-Disposition'] // Required for frontend to read filename
}));
app.use(express.json());

// Routes
app.use("/api/compress", compressRoutes);

// Boot
app.listen(PORT, () => {
  console.log(`ShrinkCraft engine running on http://localhost:${PORT}`);
});