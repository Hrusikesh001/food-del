
import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // A valid customer token is not an admin token.
        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access denied"
            });
        }

        req.admin = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin token"
        });
    }
};

export default adminAuth;
