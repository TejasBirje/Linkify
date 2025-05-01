import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

app.get("/api/auth/signup", (req, res) => {
    res.send("Sign Up Route");
})

app.get("/api/auth/login", (req, res) => {
    res.send("Login Route");
})

app.get("/api/auth/logout", (req, res) => {
    res.send("Logout Route");
})

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})