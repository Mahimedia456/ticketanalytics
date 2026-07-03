import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import modulesRoutes from "./routes/modulesRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import rmaEmeaRoutes from "./routes/rmaEmeaRoutes.js";
import rmaUsRoutes from "./routes/rmaUsRoutes.js";
import satisfactionRoutes from "./routes/satisfactionRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import aiSatisfactionRoutes from "./routes/aiSatisfaction.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://reportatomos.mahimediasolutions.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, app: "Atomos Analytics API" });
});

app.get("/api", (req, res) => {
  res.json({ ok: true, app: "Atomos Analytics API" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/imports", importRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/rma-emea", rmaEmeaRoutes);
app.use("/api/rma-us", rmaUsRoutes);
app.use("/api/satisfaction", satisfactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai/satisfaction", aiSatisfactionRoutes);

export default app;