import { Router } from "express";
import { getRmaUsDashboard } from "../controllers/rmaUsController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/dashboard", authRequired, getRmaUsDashboard);

export default router;