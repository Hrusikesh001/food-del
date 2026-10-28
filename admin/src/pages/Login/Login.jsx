
import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = ({ setToken }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const url = "http://localhost:4000";

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${url}/api/admin/login`,
                { email, password }
            );

            if (response.data.success && response.data.token) {
                localStorage.setItem(
                    "adminToken",
                    response.data.token
                );

                setToken(response.data.token);
            } else {
                setError(
                    response.data.message || "Login failed"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to log in. Check your backend."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <form
                className="admin-login-form"
                onSubmit={handleLogin}
            >
                <h2>FoodTaxi Admin</h2>
                <p>Sign in to manage your food delivery platform.</p>

                <label htmlFor="admin-email">Email</label>
                <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin email"
                    autoComplete="username"
                    required
                />

                <label htmlFor="admin-password">Password</label>
                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    autoComplete="current-password"
                    required
                />

                {error && (
                    <p className="admin-login-error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
