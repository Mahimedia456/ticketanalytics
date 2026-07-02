import { Router } from "express";
import {
  deleteHomeMonth,
  homeOverview,
} from "../controllers/homeController.js";
import { allowRoles, authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/overview", authRequired, homeOverview);

router.delete(
  "/month",
  authRequired,
  allowRoles("admin", "owner"),
  deleteHomeMonth
);

export default router;