import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
    const { email, password, fullName } = req.body;

    try {

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must contain at least 8 characters" });
        }

        // Regex to validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // if Already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email is already used by another user" });
        }

        // generate a number between 1 and 100, to choose an avatar from 100 avatars
        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`  // using the avatar placeholder api

        // create the user
        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        })

        // TODO: CREATE THE USER IN STREAM AS WELL

        // JWT token, userId -> used to uniquely identify who this token belongs to 
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // put the token in the response cookies which user stores
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,  // prevents XSS attacks
            sameSite: "strict",  // prevents CSRF attacks
            secure: process.env.NODE_ENV === 'production',
        })

        res.status(201).json({
            success: true,
            user: newUser,
        });

    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function login(req, res) {
    res.send("Login Route")
}

export async function logout(req, res) {
    res.send("Logout Route")
}

/* 
                    Signup Flowchart

User sends a signup request with: email, password, fullName
            │
            ▼
Check if any of the fields are missing → ❌ Yes → Return 400: "All fields are required"
            │
            ▼
Check if password length is less than 6 → ❌ Yes → Return 400: "Password must contain at least 8 characters"
            │
            ▼
Check if email is valid using regex → ❌ Invalid → Return 400: "Invalid email format"
            │
            ▼
Check if user already exists in the database using email
            │
            ├──► ✅ Exists → Return 400: "Email is already used by another user"
            │
            └──► ❌ Doesn't exist → Continue
            │
            ▼
Generate a random avatar index (1 to 100)
            │
            ▼
Construct avatar URL using the random index
            │
            ▼
Create the new user in the database with:
  - email
  - fullName
  - hashed password (via schema middleware)
  - profilePic (random avatar URL)
            │
            ▼
Generate JWT token with:
  - Payload: { userId: newUser._id }
  - Secret: process.env.JWT_SECRET
  - Expiration: 7 days
            │
            ▼
Set the token in an HTTP-only cookie with:
  - Max Age: 7 days
  - Secure flag (only in production)
  - SameSite: "strict"
            │
            ▼
Return 201 response with:
  - success: true
  - user: newUser
            │
            ▼
If any error occurs at any point → Log error and return 500: "Internal Server Error"

*/
