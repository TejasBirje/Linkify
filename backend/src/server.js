import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

app.use("/api/auth", authRoutes)

// Starts the Express server and listens for incoming requests on a specific port.
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
    connectDB();
})