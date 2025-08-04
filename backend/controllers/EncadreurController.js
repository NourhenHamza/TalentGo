// controllers/authEncadreurController.js
import jwt from 'jsonwebtoken';
import EncadreurExterne from '../models/EncadreurExterne.js';

// controllers/EncadreurController.js

// Génération des tokens (cette fonction devrait être définie avant login)
export const generateTokens = (payload) => {
  // Assurez-vous que les secrets sont définis dans vos variables d'environnement
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    throw new Error('JWT_SECRET ou JWT_EXPIRES_IN n\'est pas configuré dans .env');
  }

  // Signez l'eToken (token d'accès) avec JWT_SECRET
  const eToken = jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '15m' 
  });

  // Signez le rToken (refresh token) avec JWT_EXPIRES_IN
  const rToken = jwt.sign(payload, process.env.JWT_EXPIRES_IN, { 
    expiresIn: '7d'  // Durée plus longue pour le refresh token
  });

  return { eToken, rToken };
};

export const login = async (req, res) => {
    console.log('Tentative de login avec:', req.body);
    
    try {
        // Vérification de la configuration JWT mise à jour
        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
            throw new Error('Configuration JWT manquante - JWT_SECRET et JWT_EXPIRES_IN doivent être définis dans .env');
        }

        const { email, password, role_interne } = req.body;

        // Vérification des entrées
        if (!email || !password || !role_interne) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, mot de passe et rôle requis" 
            });
        }

        // Vérification du rôle
        if (!['Encadreur', 'Recruteur'].includes(role_interne)) {
            return res.status(400).json({ 
                success: false, 
                message: "Rôle invalide" 
            });
        }

        // Recherche de l'encadreur
        const encadreur = await EncadreurExterne.findOne({ 
            email, 
            role_interne 
        }).select('+mot_de_passe_hache +refreshToken'); // Assurez-vous de sélectionner le mot de passe haché et le refreshToken

        if (!encadreur) {
            return res.status(401).json({ 
                success: false, 
                message: "Identifiants invalides" 
            });
        }

        // Vérification du statut du compte
        if (!encadreur.est_actif || encadreur.status !== 'approved') {
            return res.status(401).json({ 
                success: false, 
                message: "Compte inactif ou en attente d'approbation" 
            });
        }

        // Vérification du mot de passe
        // Assurez-vous que votre modèle EncadreurExterne a une méthode comparePassword
        const isMatch = await encadreur.comparePassword(password); 
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Identifiants invalides" 
            });
        }

        // Préparation du payload pour les tokens
        const tokenPayload = {
            encadreurId: encadreur._id,
            email: encadreur.email,
            role: encadreur.role_interne,
            entrepriseId: encadreur.entreprise_id
        };

        // Génération des tokens (eToken est l'access token, rToken est le refresh token)
        const { eToken, rToken } = generateTokens(tokenPayload);

        // Préparation de la réponse de base
        const responseData = {
            success: true,
            message: "Connexion réussie",
            user: {
                id: encadreur._id,
                email: encadreur.email,
                nom: encadreur.nom,
                prenom: encadreur.prenom,
                role: encadreur.role_interne,
                entreprise_id: encadreur.entreprise_id,
                poste: encadreur.poste,
                telephone: encadreur.telephone
            }
        };

        // Gestion spécifique par rôle
        if (role_interne === 'Encadreur') {
            // Pour les Encadreurs, on renvoie directement l'eToken (access token)
            responseData.token = eToken; 
        } else if (role_interne === 'Recruteur') {
            // Pour les Recruteurs, on renvoie un access token et le refresh token dans la réponse JSON
            responseData.accessToken = eToken; // L'access token pour les requêtes API
            responseData.refreshToken = rToken; // Le refresh token pour le renouvellement (à stocker dans localStorage)

            // Stockage du refresh token en base de données (toujours recommandé)
            await EncadreurExterne.findByIdAndUpdate(encadreur._id, { 
                refreshToken: rToken 
            });
            
            // *** Suppression de la ligne res.cookie car vous voulez le stocker dans localStorage ***
            // res.cookie('refreshToken', rToken, { ... }); 
        }

        return res.json(responseData);

    } catch (error) {
        console.error('Erreur de connexion:', error);
        
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la connexion",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined // Afficher l'erreur détaillée en dev
        });
    }
};

 

 

// Rafraîchissement du token pour les Encadreurs
export const refreshEncadreurToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Token d'accès requis"
            });
        }

        const eToken = authHeader.split(' ')[1].trim();
        
        // Vérification du token expiré (on accepte les tokens expirés pour le refresh)
        let decoded;
        try {
            decoded = jwt.verify(eToken, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                decoded = jwt.decode(eToken);
            } else {
                throw error;
            }
        }
        
        // Vérification que c'est un Encadreur
        if (decoded.role !== 'Encadreur') {
            return res.status(403).json({
                success: false,
                message: "Accès refusé - Encadreur requis"
            });
        }

        // Vérification en base
        const encadreur = await EncadreurExterne.findOne({
            _id: decoded.encadreurId,
            role_interne: 'Encadreur',
            est_actif: true,
            status: 'approved'
        });

        if (!encadreur) {
            return res.status(403).json({
                success: false,
                message: "Encadreur non trouvé ou non autorisé"
            });
        }

        // Génération d'un nouveau token d'accès
        const { eToken: newEToken } = generateTokens({
            encadreurId: encadreur._id,
            email: encadreur.email,
            role: encadreur.role_interne,
            entrepriseId: encadreur.entreprise_id
        });

        res.status(200).json({
            success: true,
            eToken: newEToken
        });

    } catch (error) {
        console.error('Erreur de rafraîchissement encadreur:', error);
        
        res.status(500).json({
            success: false,
            message: "Erreur de rafraîchissement du token"
        });
    }
};

// Vérification du token pour les Recruteurs
export const refreshRecruteurToken = async (req, res) => {
    try {
        const rToken = req.cookies.rToken || req.body.rToken;
        
        if (!rToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token requis"
            });
        }

        // Vérification du token
        const decoded = jwt.verify(rToken, process.env.JWT_EXPIRES_IN);
        
        // Vérification que c'est un Recruteur
        if (decoded.role !== 'Recruteur') {
            return res.status(403).json({
                success: false,
                message: "Accès refusé - Recruteur requis"
            });
        }

        // Vérification en base
        const recruteur = await EncadreurExterne.findOne({
            _id: decoded.encadreurId,
            role_interne: 'Recruteur',
            refreshToken: rToken,
            est_actif: true,
            status: 'approved'
        }).select('+refreshToken');

        if (!recruteur) {
            return res.status(403).json({
                success: false,
                message: "Refresh token invalide"
            });
        }

        // Le token est valide, on peut continuer avec les données du recruteur
        res.status(200).json({
            success: true,
            user: {
                id: recruteur._id,
                email: recruteur.email,
                nom: recruteur.nom,
                prenom: recruteur.prenom,
                role: recruteur.role_interne,
                entreprise_id: recruteur.entreprise_id
            }
        });

    } catch (error) {
        console.error('Erreur de vérification recruteur:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expirée, veuillez vous reconnecter",
                code: "REFRESH_TOKEN_EXPIRED"
            });
        }

        res.status(500).json({
            success: false,
            message: "Erreur de vérification du token"
        });
    }
};

// Logout différencié
export const logoutEncadreur = async (req, res) => {
    try {
        const { role } = req.encadreur;
        const encadreurId = req.encadreur.encadreurId;
        
        if (role === 'Recruteur') {
            // Suppression du refresh token en base pour les recruteurs
            await EncadreurExterne.findByIdAndUpdate(encadreurId, { refreshToken: null });
            // Suppression du cookie
            res.clearCookie('rToken');
        }
        
        // Pour les Encadreurs, pas besoin de nettoyer en base car ils utilisent des tokens courts

        res.status(200).json({
            success: true,
            message: "Déconnexion réussie"
        });

    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        res.status(500).json({
            success: false,
            message: "Erreur de déconnexion"
        });
    }
};