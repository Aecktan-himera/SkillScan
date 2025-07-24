import express from "express";
import { AdminController } from "../controllers/adminController";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/users", 
  authMiddleware, 
  adminMiddleware, 
  AdminController.getUsers
);

/*router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  AdminController.createAdmin
);*/

router.post(
  '/users',
  authMiddleware,
  adminMiddleware,
  AdminController.createUser
);

router.delete(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  AdminController.deleteUser
);

router.patch(
  '/users/:id/status',
  authMiddleware,
  adminMiddleware,
  AdminController.toggleUserStatus
);



export default router;