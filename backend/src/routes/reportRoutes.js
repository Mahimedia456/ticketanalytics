import { Router } from "express";
import { getReports } from "../controllers/reportController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/", authRequired, getReports);

export default router;