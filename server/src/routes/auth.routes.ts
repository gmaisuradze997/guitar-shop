import { Router } from "express";
import { register, login, logout, me, refresh } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be at most 128 characters"),
        firstName: z
            .string()
            .min(1, "First name is required")
            .max(50, "First name must be at most 50 characters"),
        lastName: z
            .string()
            .min(1, "Last name is required")
            .max(50, "Last name must be at most 50 characters"),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);

export default router;
