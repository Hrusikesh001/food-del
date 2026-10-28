
import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import orderModel from "./models/orderModel.js";

import foodRouter from "./routes/foodRoute.js";
import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

const allowedOrigins = [
    "http://localhost:5173", // Customer frontend
    "http://localhost:5174"  // Admin frontend
];

// Express CORS configuration
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token", "Authorization"]
}));

app.use(express.json());

// Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "token", "Authorization"]
    }
});

// Make Socket.IO accessible inside controllers using req.app.get("io")
app.set("io", io);

// Authenticate Socket.IO connections using JWT
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication required"));
    }

    try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);

        if (!socket.user.id) {
            return next(new Error("Invalid token payload"));
        }

        next();
    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
});

// Handle authenticated connections and secure order subscriptions
io.on("connection", (socket) => {
    console.log("Authenticated socket connected:", socket.id);

    socket.on("order:subscribe", async (data, callback) => {
        const reply = typeof callback === "function"
            ? callback
            : () => {};

        try {
            const orderId = data?.orderId;

            if (
                typeof orderId !== "string" ||
                !mongoose.isValidObjectId(orderId)
            ) {
                return reply({
                    success: false,
                    message: "Invalid order ID"
                });
            }

            const order = await orderModel.findById(orderId);

            if (!order) {
                return reply({
                    success: false,
                    message: "Order not found"
                });
            }

            const isAdmin = socket.user.role === "admin";
            const isOwner =
                String(order.userId) === String(socket.user.id);

            if (!isAdmin && !isOwner) {
                return reply({
                    success: false,
                    message: "Access denied"
                });
            }

            await socket.join(`order:${order._id}`);

            return reply({
                success: true,
                message: "Order tracking subscription active"
            });
        } catch (error) {
            console.error("Order subscription error:", error);

            return reply({
                success: false,
                message: "Could not subscribe to order"
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

// API routes
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Health check
app.get("/", (req, res) => {
    res.send("API Working");
});

// Start server
const startServer = async () => {
    try {
        await connectDB();

        httpServer.listen(port, () => {
            console.log(`Server Started on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
