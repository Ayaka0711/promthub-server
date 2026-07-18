// routes/userRoutes.js
import express from "express";
import { getProfile, getAllUsers, updateUserRole, deleteUser } from "../controllers/userController.js";
import verifyAuth from "../middleware/verifyAuth.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

router.get("/users/profile", verifyAuth, getProfile);
router.get("/admin/users", verifyAuth, verifyRole("admin"), getAllUsers);
router.patch("/admin/users/:id/role", verifyAuth, verifyRole("admin"), updateUserRole);
router.delete("/admin/users/:id", verifyAuth, verifyRole("admin"), deleteUser);

export default router;
