import { upsertStreamUser } from "../lib/stream.js";
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

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });

            console.log(`Stream User Created for ${newUser.fullName}`)
        } catch (error) {
            console.log("Error Creating Stream User: ", error);
        }


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
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid Credentials" });

        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // create a new token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // put token in the cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        /* 
        What Changes in the JWT token when it is generated once again:

        1. iat (Issued At) Claim

            This is a timestamp showing when the token was created.

            Every new login = new time = new iat.

        2. exp (Expiration Time) Claim

            Changes based on when the token was issued and the expiresIn duration.

            Even if it's always set to 7 days, the exact expiration timestamp will differ.

        3. The JWT Signature

            The final part of the JWT, which is based on:

            The payload + header + secret

            Even small changes in the payload (like iat) = new signature.
        */

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Error in login controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logged Out Successfully" });
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
