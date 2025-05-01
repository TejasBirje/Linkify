import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, getMyFriends, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute); // apply auth middleware to all user routes

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.post("friend-request/:id/accept", acceptFriendRequest);

export default router;