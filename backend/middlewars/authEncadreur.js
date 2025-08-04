// middlewares/authEncadreurMiddleware.js
import jwt from 'jsonwebtoken';
import EncadreurExterne from '../models/EncadreurExterne.js';

// Middleware pour les Encadreurs (utilise eToken)
export const authEncadreurMiddleware = async (req, res, next) => {
    try {
        // Récupération du token depuis les headers
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authentification requise"
            });
        }

        const eToken = authHeader.split(' ')[1].trim();

        if (!eToken || eToken === 'null' || eToken === 'undefined') {
            return res.status(401).json({
                success: false,
                message: "Token invalide"
            });
        }

        // Vérification du token
        const decoded = jwt.verify(eToken, process.env.JWT_SECRET);
        
        // Vérification que c'est bien un Encadreur
        if (decoded.role !== 'Encadreur') {
            return res.status(403).json({
                success: false,
                message: "Accès refusé - Encadreur requis"
            });
        }
        
        // Vérification de l'encadreur
        const encadreur = await EncadreurExterne.findOne({
            _id: decoded.encadreurId,
            role_interne: 'Encadreur',
            est_actif: true,
            status: 'approved'
        }).select('-mot_de_passe_hache -refreshToken');

        if (!encadreur) {
            return res.status(403).json({
                success: false,
                message: "Encadreur non trouvé, désactivé ou non approuvé"
            });
        }

        // Ajout des infos encadreur à la requête
        req.encadreur = {
            encadreurId: encadreur._id,
            email: encadreur.email,
            role: encadreur.role_interne,
            encadreurData: encadreur
        };

        next();

    } catch (error) {
        console.error('Erreur d\'authentification encadreur:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expirée",
                code: "TOKEN_EXPIRED"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token invalide",
                code: "INVALID_TOKEN"
            });
        }

        res.status(500).json({
            success: false,
            message: "Erreur d'authentification encadreur"
        });
    }
};

// Middleware pour les Recruteurs (utilise rToken)
export const authRecruteurMiddleware = async (req, res, next) => {
    try {
        // Récupération du refresh token depuis les cookies ou le body
        const rToken = req.cookies.rToken || req.body.rToken || req.headers['x-refresh-token'];
        
        if (!rToken) {
            return res.status(401).json({
                success: false,
                message: "Token de session requis"
            });
        }

        // Vérification du refresh token
        const decoded = jwt.verify(rToken, process.env.JWT_EXPIRES_IN);
        
        // Vérification que c'est bien un Recruteur
        if (decoded.role !== 'Recruteur') {
            return res.status(403).json({
                success: false,
                message: "Accès refusé - Recruteur requis"
            });
        }
        
        // Vérification du recruteur et du token en base
        const recruteur = await EncadreurExterne.findOne({
            _id: decoded.encadreurId,
            role_interne: 'Recruteur',
            refreshToken: rToken,
            est_actif: true,
            status: 'approved'
        }).select('-mot_de_passe_hache +refreshToken');

        if (!recruteur) {
            return res.status(403).json({
                success: false,
                message: "Session invalide ou expirée"
            });
        }

        // Ajout des infos recruteur à la requête
        req.encadreur = {
            encadreurId: recruteur._id,
            email: recruteur.email,
            role: recruteur.role_interne,
            encadreurData: recruteur
        };

        next();

    } catch (error) {
        console.error('Erreur d\'authentification recruteur:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expirée, veuillez vous reconnecter",
                code: "REFRESH_TOKEN_EXPIRED"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token invalide",
                code: "INVALID_TOKEN"
            });
        }

        res.status(500).json({
            success: false,
            message: "Erreur d'authentification recruteur"
        });
    }
};

// Middleware combiné qui détecte automatiquement le type de token
export const authCombinedMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const rToken = req.cookies.rToken || req.body.rToken || req.headers['x-refresh-token'];
        
        // Si on a un Bearer token, c'est probablement un Encadreur
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authEncadreurMiddleware(req, res, next);
        }
        
        // Si on a un refresh token, c'est probablement un Recruteur
        if (rToken) {
            return authRecruteurMiddleware(req, res, next);
        }
        
        // Aucun token trouvé
        return res.status(401).json({
            success: false,
            message: "Authentification requise"
        });
        
    } catch (error) {
        console.error('Erreur d\'authentification combinée:', error);
        res.status(500).json({
            success: false,
            message: "Erreur d'authentification"
        });
    }
};

export default { authEncadreurMiddleware, authRecruteurMiddleware, authCombinedMiddleware };