import { Router } from "express";
import { getDashboard } from "../controllers/rmaEmeaController.js";

const router = Router();

router.get("/dashboard", getDashboard);

export default router;