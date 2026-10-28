
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },

    items: {
        type: Array,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    address: {
        type: Object,
        required: true
    },

    status: {
        type: String,
        default: "Food Processing"
    },

    statusHistory: {
        type: [
            {
                status: {
                    type: String,
                    required: true
                },
                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: () => [
            {
                status: "Food Processing",
                updatedAt: new Date()
            }
        ]
    },

    assignedRider: {
        type: String,
        default: null
    },

    riderLocation: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        updatedAt: {
            type: Date,
            default: null
        }
    },

    estimatedDeliveryAt: {
        type: Date,
        default: null
    },

    date: {
        type: Date,
        default: Date.now
    },

    stripeSessionId: {
        type: String,
        default: null
    },

    payment: {
        type: Boolean,
        default: false
    }
});

const orderModel =
    mongoose.models.order ||
    mongoose.model("order", orderSchema);

export default orderModel;
