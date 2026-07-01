import { Router } from "express";
import { homeOverview } from "../controllers/homeController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/overview", authRequired, homeOverview);

export default router;