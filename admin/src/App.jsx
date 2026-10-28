
import React, { useState } from "react";
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Login from "./pages/Login/Login";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected admin dashboard
const AdminDashboard = ({ url, onLogout }) => {
    return (
        <div>
            <Navbar onLogout={onLogout} />
            <hr />

            <div className="app-content">
                <Sidebar />

                <Routes>
                    <Route
                        path="/add"
                        element={<Add url={url} />}
                    />
                    <Route
                        path="/list"
                        element={<List url={url} />}
                    />
                    <Route
                        path="/orders"
                        element={<Orders url={url} />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/orders" replace />}
                    />
                </Routes>
            </div>
        </div>
    );
};

const App = () => {
    const url = "http://localhost:4000";

    const [token, setToken] = useState(
        () => localStorage.getItem("adminToken") || ""
    );

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setToken("");
    };

    return (
        <>
            <ToastContainer />

            {!token ? (
                <Routes>
                    <Route
                        path="*"
                        element={<Login setToken={setToken} />}
                    />
                </Routes>
            ) : (
                <AdminDashboard
                    url={url}
                    onLogout={handleLogout}
                />
            )}
        </>
    );
};

export default App;
