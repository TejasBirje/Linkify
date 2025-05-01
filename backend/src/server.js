import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

app.use(express.json());
app.use(cookieParser()); // so we have access to the cookies in the request

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Starts the Express server and listens for incoming requests on a specific port.
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}, URL: http://localhost:5001`)
    connectDB();
})