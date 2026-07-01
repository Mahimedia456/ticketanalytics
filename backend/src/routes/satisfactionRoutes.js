import { Router } from "express";
import {
  getBadSatisfactionDashboard,
  getGoodSatisfactionDashboard,
} from "../controllers/satisfactionController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/good/dashboard", authRequired, getGoodSatisfactionDashboard);
router.get("/bad/dashboard", authRequired, getBadSatisfactionDashboard);

export default router;