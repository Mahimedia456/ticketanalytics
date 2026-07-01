import { Router } from "express";
import multer from "multer";
import { importMonthly } from "../controllers/importController.js";
import { authRequired, allowRoles } from "../middlewares/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/monthly",
  authRequired,
  allowRoles("admin", "manager"),
  upload.single("file"),
  importMonthly
);

export default router;