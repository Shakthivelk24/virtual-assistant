import jwt from 'jsonwebtoken';

// Authentication Middleware
const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Get token from cookies
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" }); // No token, unauthorized
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.userId=verified.id; // Attach userId to request object
        next(); // Proceed to next middleware/controller
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });  // Handle verification errors
    }
}
export default isAuth;