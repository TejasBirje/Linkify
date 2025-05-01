import express from "express";
import { login, logout, onboard, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login)
router.post("/logout", logout)

router.post("/onboarding", protectRoute, onboard);  // after protectRoute, we will have access to the user in the req.user

// check if user is logged in or not 
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user});
});

export default router;