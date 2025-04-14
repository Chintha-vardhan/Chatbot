import bcrypt from "bcryptjs";
import User from "../models/user.model.js"; 
import { generateToken } from "../lib/u.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        console.log("Request body:", req.body);

        // Validate inputs
        if (!fullName || typeof fullName !== "string") {
            return res.status(400).json({ message: "Full name is required and must be a string" });
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "Valid email is required" });
        }
        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "Password must be a string and at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        generateToken(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });
    } catch (error) {
        console.error("Signup error:", error.stack);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No Email id exists" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            //profilePic:user.profilePic
            token:token
        });
    } catch (error) {
        console.log("Error in login controller:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Server error during logout",
            error: error.message
        });
    }
};

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth",error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
} 