// src/server.js
import "dotenv/config";                 
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import formRoutes from "./routes/form.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState });
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/form", formRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(` API en http://localhost:${PORT}`);
      console.log(`  Mongo host: ${mongoose.connection.host}`);
    });
  } catch (e) {
    console.error(" No se pudo iniciar:", e);
    process.exit(1);
  }
};

start();
