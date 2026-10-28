
import orderModel from "../models/orderModel.js";
import { sendEmail } from "../services/emailService.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place a new order
const placeOrder = async (req, res) => {
    const frontendUrl = "http://localhost:5173";

    try {
        const { userId, items, amount, address } = req.body;

        if (
            !userId ||
            !Array.isArray(items) ||
            items.length === 0 ||
            amount === undefined ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required order information"
            });
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address
        });

        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, {
            cartData: {}
        });

        const lineItems = items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100 * 80)
            },
            quantity: item.quantity
        }));

        lineItems.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 * 80
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: "payment",
            client_reference_id: String(newOrder._id),
            metadata: {
                orderId: String(newOrder._id)
            },
            success_url:
                `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:
                `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`
        });

        newOrder.stripeSessionId = session.id;
        await newOrder.save();

        return res.json({
            success: true,
            session_url: session.url
        });
    } catch (error) {
        console.error("Place order error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not place order"
        });
    }
};


// Verify payment with Stripe
const verifyPayment = async (req, res) => {
    const { orderId } = req.body ?? {};

    try {
        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!order.stripeSessionId) {
            return res.status(400).json({
                success: false,
                message: "Stripe session not found"
            });
        }

        const session = await stripe.checkout.sessions.retrieve(
            order.stripeSessionId
        );

        if (session.metadata?.orderId !== String(order._id)) {
            return res.status(400).json({
                success: false,
                message: "Payment session does not match this order"
            });
        }

        if (session.payment_status !== "paid") {
            return res.json({
                success: false,
                message: "Payment is not completed"
            });
        }

        if (order.payment !== true) {
            order.payment = true;
            await order.save();

            const user = await userModel.findById(order.userId);

            if (user?.email) {
                void sendEmail({
                    to: user.email,
                    subject: `FoodTaxi Order Confirmed - ${order._id}`,
                    text: `Hi ${user.name},

Your payment has been successfully received.

Order ID: ${order._id}
Order Amount: ₹${order.amount}

Thank you for ordering with FoodTaxi!

Team FoodTaxi`
                });
            }
        }

        return res.json({
            success: true,
            message: "Payment verified successfully"
        });
    } catch (error) {
        console.error("Payment verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not verify payment"
        });
    }
};


// Fetch orders belonging to the logged-in customer
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ userId: req.userId })
            .sort({ date: -1 });

        return res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Fetch user orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch orders"
        });
    }
};


// List orders for the admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });

        return res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("List orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch orders"
        });
    }
};


// Update order status from the admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body ?? {};

        const allowedStatuses = [
            "Food Processing",
            "Ready for Pickup",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const oldStatus = order.status;

        if (oldStatus === status) {
            return res.json({
                success: true,
                message: "Order status is already up to date"
            });
        }

        if (["Delivered", "Cancelled"].includes(oldStatus)) {
            return res.status(400).json({
                success: false,
                message: "This order is already completed or cancelled"
            });
        }

        order.status = status;

        order.statusHistory.push({
            status,
            updatedAt: new Date()
        });

        await order.save();

        const io = req.app.get("io");

        if (io) {
            io.to(`order:${order._id}`).emit("order:status", {
                orderId: String(order._id),
                status: order.status,
                statusHistory: order.statusHistory,
                updatedAt: new Date()
            });
        }

        const user = await userModel.findById(order.userId);

        if (user?.email) {
            void sendEmail({
                to: user.email,
                subject: `FoodTaxi Order Update: ${status}`,
                text: `Hi ${user.name},

Your FoodTaxi order status has been updated.

Order ID: ${order._id}
Previous Status: ${oldStatus}
Current Status: ${status}

Thank you for ordering with FoodTaxi!

Team FoodTaxi`
            });
        }

        return res.json({
            success: true,
            message: "Status Updated"
        });
    } catch (error) {
        console.error("Update status error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating order status"
        });
    }
};


// Update rider GPS location

const updateRiderLocation = async (req, res) => {
    try {
        const { orderId, latitude, longitude } = req.body ?? {};

        // Validate order ID
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        // Validate coordinates
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            latitude === "" ||
            longitude === "" ||
            latitude === null ||
            longitude === null ||
            latitude === undefined ||
            longitude === undefined ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude and longitude are required"
            });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status !== "Out for Delivery") {
            return res.status(400).json({
                success: false,
                message: "The order must be Out for Delivery"
            });
        }

        // Save coordinates to MongoDB
        order.set("riderLocation.latitude", lat);
        order.set("riderLocation.longitude", lng);
        order.set("riderLocation.updatedAt", new Date());

        await order.save();

        // Read back the saved document to verify persistence
        const savedOrder = await orderModel.findById(orderId).lean();

        if (
            savedOrder?.riderLocation?.latitude == null ||
            savedOrder?.riderLocation?.longitude == null
        ) {
            return res.status(500).json({
                success: false,
                message: "Location was not persisted"
            });
        }

        // Notify subscribed customer
        const io = req.app.get("io");

        if (io) {
            io.to(`order:${savedOrder._id}`).emit("rider:location", {
                orderId: String(savedOrder._id),
                latitude: savedOrder.riderLocation.latitude,
                longitude: savedOrder.riderLocation.longitude,
                updatedAt: savedOrder.riderLocation.updatedAt
            });
        }

        return res.json({
            success: true,
            message: "Rider location updated",
            riderLocation: savedOrder.riderLocation
        });
    } catch (error) {
        console.error("Update rider location error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update rider location"
        });
    }
};


export {
    placeOrder,
    verifyPayment as verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    updateRiderLocation
};
