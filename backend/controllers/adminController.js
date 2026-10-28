
import jwt from "jsonwebtoken";
import validator from "validator";

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error("Admin credentials are not configured");

            return res.status(500).json({
                success: false,
                message: "Admin login is not configured"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (
            !validator.isEmail(normalizedEmail) ||
            normalizedEmail !== adminEmail.trim().toLowerCase() ||
            password !== adminPassword
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            {
                id: "foodtaxi-admin",
                role: "admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin login failed"
        });
    }
};

export { adminLogin };
