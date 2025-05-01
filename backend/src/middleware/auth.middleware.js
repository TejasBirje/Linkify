import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // to do this, we need to add app.use() in server.js

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) return res.status(401).json({ message: "Unauthorized - invalid token" });

        const user = await User.findById(decoded.userId).select("-password"); // in the payload of token, we had provided the userId
    
        if(!user) {
            return res.status(401).json({ message: "Unauthorized - User not found"});
        }

        // add the user to the request 
        req.user = user;

        next();  // call the next function
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}