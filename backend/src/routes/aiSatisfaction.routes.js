import { Router } from "express";
import { analyzeSatisfaction } from "../controllers/aiSatisfaction.controller.js";

const router = Router();

router.post("/analyze", analyzeSatisfaction);

export default router;