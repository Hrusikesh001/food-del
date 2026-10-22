
import { sendEmail } from "../services/emailService.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Normal email/password login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        // Google-only accounts do not have a password
        if (!user || !user.password) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = createToken(user._id);
        return res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Error"
        });
    }
};

// Normal email/password registration
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;

    try {
        if (!name || !email || !password) {
            return res.json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Please enter a strong password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const exists = await userModel.findOne({ email: normalizedEmail });

        if (exists) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = createToken(user._id);

        void sendEmail({
            to: user.email,
            subject: "Welcome to FoodTaxi!",
            text: `Hi ${user.name},

Welcome to FoodTaxi! Your account has been created successfully.

You can now explore our menu and order your favourite food.

Thank you for joining FoodTaxi!

Team FoodTaxi`
        });

        return res.json({ success: true, token });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Error"
        });
    }
};

// Google Sign-In
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error("GOOGLE_CLIENT_ID is not configured");
            return res.status(500).json({
                success: false,
                message: "Google authentication is not configured"
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (
            !payload ||
            !payload.sub ||
            !payload.email ||
            payload.email_verified !== true
        ) {
            return res.status(401).json({
                success: false,
                message: "Google account email could not be verified"
            });
        }

        const googleId = payload.sub;
        const email = payload.email.trim().toLowerCase();
        const name = payload.name?.trim() || email.split("@")[0];

        let user = await userModel.findOne({ googleId });

        if (!user) {
            // Reuse an existing account if its verified email matches.
            user = await userModel.findOne({ email });

            if (user) {
                user.googleId = googleId;
                await user.save();
            } else {
                user = await userModel.create({
                    name,
                    email,
                    googleId,
                    cartData: {}
                });

                void sendEmail({
                    to: user.email,
                    subject: "Welcome to FoodTaxi!",
                    text: `Hi ${user.name},

Welcome to FoodTaxi! Your account has been created successfully using Google Sign-In.

You can now explore our menu and order your favourite food.

Thank you for joining FoodTaxi!

Team FoodTaxi`
                });
            }
        }

        const token = createToken(user._id);

        return res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error("Google authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};

export { loginUser, registerUser, googleAuth };
