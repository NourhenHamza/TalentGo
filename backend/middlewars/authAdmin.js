import jwt from 'jsonwebtoken';
import University from '../models/University.js';

const authAdmin = async (req, res, next) => {
    try {
        // Récupérer le token avec plusieurs tentatives
        let token = req.headers.token || 
                   req.headers.atoken || 
                   req.headers.utoken;
        
        // Si pas trouvé, chercher dans Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } else {
                token = authHeader;
            }
        }

        console.log('Token received:', token ? 'Token present' : 'No token');
        console.log('Headers:', {
            token: req.headers.token ? 'Present' : 'Missing',
            atoken: req.headers.atoken ? 'Present' : 'Missing',
            utoken: req.headers.utoken ? 'Present' : 'Missing',
            authorization: req.headers.authorization ? 'Present' : 'Missing'
        });

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }

        // DEBUG: Afficher le token reçu
        console.log('Raw token:', JSON.stringify(token));
        console.log('Token length:', token.length);
        console.log('Token first 20 chars:', token.substring(0, 20));
        console.log('Token last 20 chars:', token.substring(token.length - 20));

        // Nettoyer le token (enlever les espaces et caractères indésirables)
        token = token.trim();

        // FIXED: Handle the case where token includes the key name (aToken, uToken, etc.)
        // Check if token starts with key names and extract the actual JWT
        if (token.startsWith('aToken') || token.startsWith('uToken') || token.startsWith('token')) {
            // Extract JWT part after the key name
            const jwtMatch = token.match(/eyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=_-]+/);
            if (jwtMatch) {
                token = jwtMatch[0];
                console.log('Extracted JWT from token string:', token.substring(0, 20) + '...');
            }
        }

        // Vérifier si le token est vide après nettoyage
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        // Vérifier que le token a le format JWT (3 parties séparées par des points)
        const tokenParts = token.split('.');
        console.log('Token parts count:', tokenParts.length);
        if (tokenParts.length !== 3) {
            console.log('Invalid JWT format - should have 3 parts separated by dots');
            return res.status(401).json({
                success: false,
                message: "Invalid JWT format"
            });
        }

        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', { role: decoded.role, id: decoded.id, email: decoded.email });

        // Handle admin authentication
        if (decoded.role === 'admin' && decoded.email === process.env.ADMIN_EMAIL) {
            req.admin = decoded;
            console.log('Authenticated as main admin');
            return next();
        }

        // Handle university authentication
        if (decoded.role === 'university') {
            const university = await University.findOne({
                _id: decoded.id,
                status: 'approved'
            });

            if (!university) {
                console.log('University not found or not approved:', decoded.id);
                return res.status(403).json({
                    success: false,
                    message: "University not found or not approved"
                });
            }

            req.university = {
                ...decoded,
                universityData: {
                    id: university._id,
                    name: university.name
                }
            };
            console.log('Authenticated as university:', university.name);
            return next();
        }

        console.log('Invalid role in token:', decoded.role);
        return res.status(403).json({
            success: false,
            message: "Access denied - Invalid role"
        });

    } catch (error) {
        console.error('Auth error:', error);

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
                message: "Invalid token. Please login again"
            });
        }

        res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

export default authAdmin;