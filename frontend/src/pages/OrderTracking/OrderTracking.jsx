
import React, { useCallback, useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import L from "leaflet";
import "./OrderTracking.css";

const SOCKET_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const steps = [
    "Food Processing",
    "Ready for Pickup",
    "Out for Delivery",
    "Delivered"
];

// Fix Leaflet marker icons when using Vite.
const riderIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Recenter the map when the rider's location changes.
function RecenterMap({ latitude, longitude }) {
    const map = useMap();

    useEffect(() => {
        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            map.setView([latitude, longitude], map.getZoom());
            setTimeout(() => map.invalidateSize(), 0);
        }
    }, [map, latitude, longitude]);

    return null;
}

const OrderTracking = ({ url = SOCKET_URL }) => {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [riderLocation, setRiderLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connectionStatus, setConnectionStatus] =
        useState("Connecting...");

    // Fetch the customer's order and its last saved rider location.
    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please log in to track your order.");
                return;
            }

            const response = await axios.post(
                `${url}/api/order/userorders`,
                {},
                { headers: { token } }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Could not fetch orders."
                );
            }

            const orders = response.data.data;

            if (!Array.isArray(orders)) {
                throw new Error("Unexpected response while loading orders.");
            }

            const foundOrder = orders.find(
                (item) => String(item._id) === String(orderId)
            );

            if (!foundOrder) {
                setError("Order not found or you do not have access.");
                return;
            }

            setOrder(foundOrder);

            const location = foundOrder.riderLocation;
            const latitude = location?.latitude;
            const longitude = location?.longitude;

            if (
                typeof latitude === "number" &&
                Number.isFinite(latitude) &&
                typeof longitude === "number" &&
                Number.isFinite(longitude)
            ) {
                setRiderLocation({
                    latitude,
                    longitude,
                    updatedAt: location.updatedAt
                });
            } else {
                setRiderLocation(null);
            }
        } catch (err) {
            console.error("Fetch tracking order error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load order."
            );
        } finally {
            setLoading(false);
        }
    }, [url, orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // Connect after the order has loaded. The Boolean dependency changes
    // only when order changes from null to loaded (or back to null).
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !orderId || !order) {
            return;
        }

        const socket = io(url, {
            auth: { token },
            transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
            setConnectionStatus("Connected");

            socket.emit(
                "order:subscribe",
                { orderId },
                (response) => {
                    if (!response?.success) {
                        setConnectionStatus(
                            response?.message || "Tracking unavailable"
                        );
                    }
                }
            );
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
            setConnectionStatus("Live connection unavailable");
        });

        socket.on("disconnect", () => {
            setConnectionStatus("Disconnected");
        });

        socket.on("order:status", (update) => {
            if (String(update.orderId) !== String(orderId)) return;

            setOrder((previousOrder) => {
                if (!previousOrder) return previousOrder;

                return {
                    ...previousOrder,
                    status: update.status,
                    statusHistory:
                        update.statusHistory ??
                        previousOrder.statusHistory
                };
            });
        });

        socket.on("rider:location", (update) => {
            if (String(update.orderId) !== String(orderId)) return;

            const latitude = update.latitude;
            const longitude = update.longitude;

            if (
                typeof latitude !== "number" ||
                !Number.isFinite(latitude) ||
                latitude < -90 ||
                latitude > 90 ||
                typeof longitude !== "number" ||
                !Number.isFinite(longitude) ||
                longitude < -180 ||
                longitude > 180
            ) {
                console.warn("Received invalid rider coordinates:", update);
                return;
            }

            setRiderLocation({
                latitude,
                longitude,
                updatedAt: update.updatedAt
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [url, orderId, Boolean(order)]);

    if (loading) {
        return (
            <div className="tracking-page">
                Loading order tracking...
            </div>
        );
    }

    if (error) {
        return (
            <div className="tracking-page">
                <h2>Order Tracking</h2>
                <p className="tracking-error">{error}</p>
                <Link to="/myorders" className="back-link">
                    Back to My Orders
                </Link>
                <button type="button" onClick={fetchOrder}>
                    Try Again
                </button>
            </div>
        );
    }

    if (!order) return null;

    const isCancelled = order.status === "Cancelled";
    const currentStep = steps.indexOf(order.status);

    const showMap =
        order.status === "Out for Delivery" ||
        order.status === "Delivered";

    return (
        <div className="tracking-page">
            <div className="tracking-header">
                <div>
                    <h2>Track Your Order</h2>
                    <p>Order ID: {order._id}</p>
                </div>

                <span
                    className={`connection-badge ${
                        connectionStatus === "Connected" ? "online" : ""
                    }`}
                >
                    {connectionStatus}
                </span>
            </div>

            <div className="tracking-card">
                <h3>Current Status</h3>
                <p className="current-status">{order.status}</p>

                {isCancelled ? (
                    <p className="tracking-error">
                        This order has been cancelled.
                    </p>
                ) : (
                    <div className="status-timeline">
                        {steps.map((step, index) => {
                            const completed =
                                currentStep >= 0 && index <= currentStep;

                            return (
                                <div
                                    className={`timeline-step ${
                                        completed ? "completed" : ""
                                    }`}
                                    key={step}
                                >
                                    <div className="timeline-dot">
                                        {completed ? "✓" : index + 1}
                                    </div>
                                    <p>{step}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="tracking-details">
                    <p>
                        <strong>Payment:</strong>{" "}
                        {order.payment ? "Paid" : "Pending"}
                    </p>

                    <p>
                        <strong>Total:</strong>{" "}
                        ₹{Number(order.amount).toFixed(2)}
                    </p>

                    <p>
                        <strong>Delivery address:</strong>{" "}
                        {order.address?.street},{" "}
                        {order.address?.city}
                    </p>
                </div>

                <p className="live-note">
                    Order status updates appear here automatically.
                </p>
            </div>

            {!isCancelled && (
                <div className="tracking-card delivery-map-section">
                    <h3>Live Rider Location</h3>

                    {!showMap ? (
                        <p>
                            The live rider map will be available when your
                            order is out for delivery.
                        </p>
                    ) : riderLocation ? (
                        <>
                            <MapContainer
                                key={order._id}
                                center={[
                                    riderLocation.latitude,
                                    riderLocation.longitude
                                ]}
                                zoom={15}
                                scrollWheelZoom={true}
                                style={{
                                    height: "400px",
                                    width: "100%",
                                    borderRadius: "12px"
                                }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <RecenterMap
                                    latitude={riderLocation.latitude}
                                    longitude={riderLocation.longitude}
                                />

                                <Marker
                                    position={[
                                        riderLocation.latitude,
                                        riderLocation.longitude
                                    ]}
                                    icon={riderIcon}
                                >
                                    <Popup>
                                        Rider's latest reported location
                                    </Popup>
                                </Marker>
                            </MapContainer>

                            <p className="live-note">
                                Last location update:{" "}
                                {riderLocation.updatedAt
                                    ? new Date(
                                        riderLocation.updatedAt
                                    ).toLocaleString()
                                    : "Just received"}
                            </p>
                        </>
                    ) : (
                        <p>
                            Waiting for the rider's first location update.
                            Make sure the admin has submitted valid rider
                            coordinates for this order.
                        </p>
                    )}
                </div>
            )}

            <Link to="/myorders" className="back-link">
                ← Back to My Orders
            </Link>
        </div>
    );
};

export default OrderTracking;
