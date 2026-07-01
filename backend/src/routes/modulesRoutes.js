import { Router } from "express";
import { getModules } from "../controllers/modulesController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/", authRequired, getModules);

export default router;
