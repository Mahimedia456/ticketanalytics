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

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
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

export default app;