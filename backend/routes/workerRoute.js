import bcrypt from 'bcryptjs';
import express from 'express';
import mongoose from 'mongoose';
import {
  login,
  logoutEncadreur,
  refreshEncadreurToken,
  refreshRecruteurToken
} from '../controllers/EncadreurController.js';
import {
  authCombinedMiddleware
} from '../middlewars/authEncadreur.js';
import EncadreurExterne from '../models/EncadreurExterne.js';
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { 
      entreprise_id, 
      email, 
      mot_de_passe_hache, 
      nom, 
      prenom, 
      telephone, 
      role_interne 
    } = req.body;

    // 1. Validation des données
    if (!mongoose.Types.ObjectId.isValid(entreprise_id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID entreprise invalide" 
      });
    }

    const requiredFields = ['email', 'mot_de_passe_hache', 'nom', 'prenom', 'role_interne'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Champs obligatoires manquants: ${missingFields.join(', ')}`
      });
    }

    // 2. Vérification de l'existence de l'email (tous statuts confondus)
    const existingUser = await EncadreurExterne.findOne({ email });

    if (existingUser) {
      // Cas 1: Utilisateur déjà approuvé
      if (existingUser.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }
      
      // Cas 2: Utilisateur en attente ou supprimé - on le supprime pour recréer
      await EncadreurExterne.deleteOne({ _id: existingUser._id });
    }

    // 3. Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe_hache, 12);

    // 4. Création du nouvel utilisateur
    const newUser = new EncadreurExterne({
      entreprise_id,
      email,
      mot_de_passe_hache: hashedPassword,
      nom,
      prenom,
      telephone,
      poste: role_interne === 'Recruteur' ? 'Recruteur RH' : 'Superviseur PFE',
      role_interne,
      status: 'approved',
      est_actif: true
    });

    await newUser.save();

    // 5. Préparation de la réponse
    const userResponse = newUser.toObject();
    delete userResponse.mot_de_passe_hache;

    return res.status(201).json({
      success: true,
      message: `${role_interne} créé avec succès`,
      data: userResponse
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Gestion spécifique des erreurs MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà',
        error: 'DUPLICATE_EMAIL'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  }
});

 



















 

// Routes publiques
router.post('/login', login);

// Routes pour les Encadreurs (utilise eToken)
router.post('/refresh-token', refreshEncadreurToken);
 

// Routes pour les Recruteurs (utilise rToken)
router.post('/verify-session', refreshRecruteurToken);
 

// Routes communes (détection automatique)
router.post('/logout', authCombinedMiddleware, logoutEncadreur);
 

// Routes spécifiques selon le rôle
router.get('/dashboard', authCombinedMiddleware, (req, res) => {
    const { role } = req.encadreur;
    
    if (role === 'Encadreur') {
        // Logique pour dashboard Encadreur
        res.json({
            success: true,
            message: "Dashboard Encadreur",
            dashboardType: "supervisor",
            data: {
                // données spécifiques aux encadreurs
            }
        });
    } else if (role === 'Recruteur') {
        // Logique pour dashboard Recruteur
        res.json({
            success: true,
            message: "Dashboard Recruteur",
            dashboardType: "recruiter",
            data: {
                // données spécifiques aux recruteurs
            }
        });
    }
});

 

export default router;