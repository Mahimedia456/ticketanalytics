import { Router } from "express";
import {
  getUsers,
  patchUser,
  patchUserPassword,
  postUser,
  removeUser,
} from "../controllers/userController.js";
import { allowRoles, authRequired } from "../middlewares/auth.js";

const router = Router();

router.use(authRequired);
router.use(allowRoles("admin"));

router.get("/", getUsers);
router.post("/", postUser);
router.patch("/:id", patchUser);
router.patch("/:id/password", patchUserPassword);
router.delete("/:id", removeUser);

export default router;