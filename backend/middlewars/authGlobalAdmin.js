// middleware/authGlobalAdmin.js
import jwt from 'jsonwebtoken';

export const authGlobalAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'accès manquant'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier que c'est un token d'administrateur global
        // Accepter à la fois 'global_admin' et 'admin' pour la compatibilité
        if (decoded.role !== 'global_admin' && decoded.role !== 'admin') {
            console.log('❌ Access denied for role:', decoded.role);
            console.log('📋 Token payload:', decoded);
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - Droits administrateur requis',
                debug: {
                    receivedRole: decoded.role,
                    expectedRoles: ['global_admin', 'admin']
                }
            });
        }

        // Log pour debug
        console.log('✅ Global admin authenticated:', {
            role: decoded.role,
            email: decoded.email,
            id: decoded.id
        });

        req.admin = decoded;
        next();

    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Erreur d\'authentification',
            error: error.message
        });
    }
};
