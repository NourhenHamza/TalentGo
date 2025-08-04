import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';

const authCompany = async (req, res, next) => {
    try {
        // Get token from multiple possible headers
        let token = req.headers.token ||
                    req.headers.ctoken ||
                    req.headers.authorization;
                 
        // Handle Authorization header if present
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7).trim();
            } else {
                token = authHeader.trim();
            }
        } else if (token) {
            token = token.trim();
        }

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required or invalid format"
            });
        }

        // Clean the token - remove any remaining 'Bearer ' prefix
        if (token.startsWith('Bearer ')) {
            token = token.substring(7).trim();
        }

        // Verify JWT format
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            return res.status(401).json({
                success: false,
                message: "Invalid JWT format"
            });
        }
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Only proceed if role is company
        if (decoded.role !== 'company') {
            return res.status(403).json({
                success: false,
                message: "Access denied - Invalid role"
            });
        }

        // Find the company and verify status
        const company = await Company.findOne({
            _id: decoded.id,
            status: 'approved',
            registrationCompletedAt: { $exists: true }
        }).select('-password');

        if (!company) {
            return res.status(403).json({
                success: false,
                message: "Company not found, not approved, or registration not completed"
            });
        }

        // Attach company data to request
        req.company = {
            ...decoded,
            companyData: {
                id: company._id,
                name: company.nom,
                email: company.email_contact,
                status: company.status
            }
        };

        next();

    } catch (error) {
        console.error('Company auth error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again",
                expiredAt: error.expiredAt
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid JWT encoding or malformed token"
            });
        }

        // Generic error response to ensure JSON is always returned
        res.status(500).json({
            success: false,
            message: "Company authentication failed due to an unexpected error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default authCompany;


