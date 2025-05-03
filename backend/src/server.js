import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
}));

app.use(express.json());
app.use(cookieParser()); // so we have access to the cookies in the request

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

// Starts the Express server and listens for incoming requests on a specific port.
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}, URL: http://localhost:5001`)
    connectDB();
})