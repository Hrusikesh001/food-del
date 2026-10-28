
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Please log in again."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;

        // Preserve compatibility with existing controllers
        if (req.body) {
            req.body.userId = decoded.id;
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default authMiddleware;
