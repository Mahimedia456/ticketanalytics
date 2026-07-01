import { Router } from "express";
import { getTicketDashboard } from "../controllers/ticketController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/dashboard", authRequired, getTicketDashboard);

export default router;