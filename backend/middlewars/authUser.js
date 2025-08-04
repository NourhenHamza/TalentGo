import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    let token = null;

    try {
        console.log("=== authUser Middleware Start ===");
        console.log("Cookies:", req.cookies);
        console.log("Authorization header:", req.headers.authorization);
        console.log("Request URL:", req.url);
        console.log("Request method:", req.method);

        // Priority 1: Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
            console.log("✓ Token found in Authorization header");
        }
        
        // Priority 2: Get token from cookies if not in header
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log("✓ Token found in cookies");
        }

        // If no token found
        if (!token) {
            console.log("✗ No token found anywhere");
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. No token provided.",
                debug: {
                    hasCookies: !!req.cookies,
                    hasAuthHeader: !!req.headers.authorization,
                    cookies: req.cookies,
                    authHeader: req.headers.authorization
                }
            });
        }

        console.log("Token preview:", token.substring(0, 20) + "...");

        // Verify JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("✗ JWT_SECRET not defined in environment variables!");
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error." 
            });
        }

        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✓ Token decoded successfully");
        console.log("Decoded payload:", {
            id: decoded.id,
            role: decoded.role,
            university: decoded.university,
            exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration'
        });

        // Validate user ID
        if (!decoded.id) {
            console.log("✗ No user ID in decoded token");
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token: missing user ID." 
            });
        }

        // Set req.user with consistent structure
        req.user = {
            id: decoded.id,
            _id: decoded.id, // MongoDB compatibility
            userId: decoded.id, // Legacy compatibility
            university: decoded.university,
            role: decoded.role,
            email: decoded.email,
            name: decoded.name,
            ...decoded // Include all other token properties
        };

        // Also set in req.body for legacy compatibility (but prefer req.user)
        req.body.userId = decoded.id;

        console.log("✓ User authenticated successfully:");
        console.log("- User ID:", decoded.id);
        console.log("- Role:", decoded.role);
        console.log("- University:", decoded.university);
        console.log("=== authUser Middleware End (Success) ===");
        
        next();

    } catch (error) {
        console.error("=== authUser Middleware Error ===");
        console.error("Error type:", error.name);
        console.error("Error message:", error.message);
        console.error("Token used:", token ? token.substring(0, 20) + "..." : "undefined");

        let errorMessage = "Authentication failed";
        let statusCode = 401;

        if (error.name === 'TokenExpiredError') {
            errorMessage = "Token has expired. Please login again.";
            console.log("✗ Token expired");
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = "Invalid token. Please login again.";
            console.log("✗ Invalid token format");
        } else if (error.name === 'NotBeforeError') {
            errorMessage = "Token not active yet.";
            console.log("✗ Token not yet active");
        } else {
            errorMessage = "Server error during authentication.";
            statusCode = 500;
            console.log("✗ Unexpected error:", error);
        }
        
        return res.status(statusCode).json({ 
            success: false, 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default authUser;