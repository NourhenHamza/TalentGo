import bcrypt from 'bcryptjs';
import express from "express";
import { body, validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import { emitCompanyEvent } from '../events/index.js';
import authCompany from '../middlewars/authCompany.js';
import Application from "../models/Application.js";
import Company from '../models/Company.js';
import EncadreurExterne from '../models/EncadreurExterne.js';
import UserModel from "../models/userModel.js";
import { sendRecruiterInvitation, sendSupervisorInvitation } from '../services/emailWorkers.js';
 
const router = express.Router();



router.post('/register', async (req, res) => {
  try {
    const {
      nom,
      adresse,
      ville,
      code_postal,
      pays,
      email_contact,
      telephone_contact,
      description,
      secteur_activite,
      site_web
    } = req.body;

    // Validate required fields
    if (!nom || !adresse || !ville || !pays || !email_contact) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir tous les champs obligatoires'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ 
      $or: [
        { nom },
        { email_contact }
      ]
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'Une entreprise avec ce nom ou email existe déjà'
      });
    }

    // Create new company
    const newCompany = new Company({
      nom,
      adresse,
      ville,
      code_postal,
      pays,
      email_contact,
      telephone_contact,
      description,
      secteur_activite,
      site_web,
      status: 'pending',
      est_active: true
    });

    await newCompany.save();

    // Send confirmation email (optional)
    // await sendRegistrationConfirmation(email_contact, nom);

    return res.status(201).json({
      success: true,
      message: 'Demande d\'inscription soumise avec succès. En attente d\'approbation.',
      company: {
        id: newCompany._id,
        nom: newCompany.nom,
        email: newCompany.email_contact,
        status: newCompany.status
      }
    });

  } catch (error) {
    console.error('Company registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription de l\'entreprise',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// Route to verify token (used by frontend to check auth status)
router.get('/verify-token', authCompany, async (req, res) => {
    try {
        // If authCompany middleware passed, the token is valid
        res.status(200).json({
            success: true,
            company: req.company.companyData
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
});
 

 

 

// Route to get students with confirmed applications for the company
router.get("/students", authCompany, async (req, res) => {
  try {
    const companyId = req.company.companyData.id; // Extract companyId from authCompany
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    console.log("Fetching students for companyId:", companyId); // Debug

    // Find applications where the company matches and confirmed is true
    const applications = await Application.find({
      company: companyId,
      confirmed: true,
    })
      .populate({
        path: "student",
        select: "name email cin dateOfBirth studyLevel specialization currentClass academicYear profile studentData accountStatus university",
        populate: {
          path: "university",
          select: "name city",
        },
      })
      .populate({
        path: "offre",
        select: "titre",
      })
      .select("student offre status appliedAt confirmed confirmedAt testResult coverLetter notes");

    // Extract unique students from applications
    const students = applications
      .filter((app) => app.student !== null)
      .map((app) => ({
        ...app.student._doc,
        applications: [
          {
            _id: app._id,
            offreTitle: app.offre?.titre || "Unknown Offer",
            status: app.status,
            appliedAt: app.appliedAt,
            confirmed: app.confirmed,
            confirmedAt: app.confirmedAt,
            testResult: app.testResult
              ? {
                  score: app.testResult.score || "N/A",
                  passed: app.testResult.passed || false,
                  completedAt: app.testResult.completedAt || null,
                }
              : null,
            coverLetter: app.coverLetter || "No cover letter",
            notes: app.notes || "No notes",
          },
        ],
      }))
      .reduce((unique, student) => {
        const existing = unique.find((s) => s._id.toString() === student._id.toString());
        if (existing) {
          existing.applications.push(...student.applications);
          return unique;
        }
        return [...unique, student];
      }, []);

    console.log("Found students:", students.length); // Debug
    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students for company:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

 
 

 

// GET /api/companies/:id
// Fetch company details by ID
 

 

 

 
 
 // Route pour récupérer les superviseurs (AVANT /:companyId)
 router.get('/supervisors', authCompany, async (req, res) => { // Ajout de authCompany
    try {
        // L'ID de l'entreprise est maintenant disponible via req.company.companyData.id
        const companyId = req.company.companyData.id;
        console.log("CompanyId authentifié:", companyId);

        const supervisors = await EncadreurExterne.find({
            entreprise_id: companyId,
            role_interne: 'Encadreur', // Filtrer spécifiquement pour les encadreurs
            status: 'approved' // Filtrer pour les statuts approuvés
        })
            .select('prenom nom email poste telephone est_actif'); // Sélectionner les champs nécessaires

        console.log(`Trouvé ${supervisors.length} superviseurs pour l'entreprise ${companyId}`);

        return res.status(200).json({
            success: true,
            supervisors: supervisors.map(s => ({ // Mapper les données pour le frontend
                _id: s._id,
                prenom: s.prenom || '',
                nom: s.nom || '',
                email: s.email,
                poste: s.poste || '',
                telephone: s.telephone || '', // Inclure le téléphone
                est_actif: s.est_actif || false
            })),
            count: supervisors.length,
            // appliedFilter: { entreprise_id: companyId, role_interne: 'Encadreur', status: 'approved' } // Utile pour le debug
        });
 } catch (error) {
        console.error("Erreur lors de la récupération des superviseurs:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur base de données",
            error: error.message
        });
    }
});

 
// Get all recruiters for a company (updated to use query parameter)
router.get('/recruiters', authCompany, async (req, res) => {
    try {
        const companyId = req.query.companyId || req.company.companyData.id;
        
        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const recruiters = await EncadreurExterne.find({
            entreprise_id: companyId,
            role_interne: 'Recruteur',
          status: 'approved'

        }).select('prenom nom email poste est_actif');

        res.status(200).json({
            success: true,
            recruiters: recruiters.map(r => ({
                _id: r._id,
                prenom: r.prenom || '',
                nom: r.nom || '',
                email: r.email,
                poste: r.poste || '',
                est_actif: r.est_actif || false
            }))
        });
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recruiters'
        });
    }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    // Find company
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Map schema fields to expected frontend format
    const companyData = {
      _id: company._id,
      nom: company.nom,
      address: {
        street: company.adresse || "",
        city: company.ville || "",
        zipCode: company.code_postal || "",
        country: company.pays || "",
      },
      contactPerson: {
        name: "", // Add actual contact person name if available
        email: company.email_contact || "",
        phone: company.telephone_contact || "",
      },
      description: company.description || "",
      secteur_activite: company.secteur_activite || "",
      site_web: company.site_web || "",
      logo_url: company.logo_url || "",
      status: company.status,
      est_active: company.est_active,
    };

    return res.status(200).json({
      success: true,
      company: companyData,
    });
  } catch (error) {
    console.error(`Error in GET /api/companies/${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      message: "Server error: " + (error.message || "Unknown error"),
    });
  }
});

// 1. Route GET /view/:id - Voir les détails d'un encadreur externe
router.get('/view/:id', authCompany, async (req, res) => {
    try {
        // Vérifier que l'encadreur existe et appartient à l'entreprise
        const encadreur = await EncadreurExterne.findOne({
            _id: req.params.id,
            company: req.company._id
        }).select('-password -__v');

        if (!encadreur) {
            return res.status(404).json({
                success: false,
                message: 'Encadreur non trouvé ou accès non autorisé'
            });
        }

        res.status(200).json({
            success: true,
            data: encadreur
        });

    } catch (error) {
        console.error('Erreur viewEncadreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// 2. Route PUT /edit/:id - Modifier un encadreur externe
router.put('/edit_supervisor/:id', 
    authCompany,
    [
        body('prenom').optional().trim().escape(),
        body('nom').optional().trim().escape(),
        body('poste').optional().trim().escape(),
        body('telephone').optional().trim().escape()
    ],
    async (req, res) => {
        // Validation des données
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        try {
            const { prenom, nom, poste, telephone } = req.body;

            // Mise à jour uniquement des champs autorisés
            const updatedEncadreur = await EncadreurExterne.findOneAndUpdate(
                { 
                    _id: req.params.id,
                    company: req.company._id 
                },
                { 
                    prenom,
                    nom,
                    poste,
                    telephone,
                    updatedAt: Date.now()
                },
                { 
                    new: true,
                    runValidators: true 
                }
            ).select('-password -__v');

            if (!updatedEncadreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Encadreur non trouvé ou modification non autorisée'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Encadreur mis à jour avec succès',
                data: updatedEncadreur
            });

        } catch (error) {
            console.error('Erreur editEncadreur:', error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: Object.values(error.errors).map(val => val.message)
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }
);

// 3. Route PUT /status - Activer/désactiver un encadreur
router.put('/supervisor-status', 
    authCompany,
    [
        body('encadreurId').notEmpty().withMessage('ID encadreur requis'),
        body('isActive').isBoolean().withMessage('isActive doit être un booléen')
    ],
    async (req, res) => {
        // Validation des données
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        try {
            const { encadreurId, isActive } = req.body;

            const encadreur = await EncadreurExterne.findOneAndUpdate(
                { 
                    _id: encadreurId,
                    company: req.company._id 
                },
                { 
                    est_actif: isActive,
                    updatedAt: Date.now() 
                },
                { new: true }
            ).select('-password -__v');

            if (!encadreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Encadreur non trouvé ou action non autorisée'
                });
            }

            res.status(200).json({
                success: true,
                message: `Encadreur ${isActive ? 'activé' : 'désactivé'} avec succès`,
                data: encadreur
            });

        } catch (error) {
            console.error('Erreur toggleStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du changement de statut'
            });
        }
    }
);


// View recruiter details
// Edit recruiter
// In your recruiterRoutes.js
router.put('/edit-recruiter/:id', 
    authCompany,
    [
        body('prenom').optional().trim().escape(),
        body('nom').optional().trim().escape(),
        body('poste').optional().trim().escape(),
        body('telephone').optional().trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        try {
            console.log('Editing recruiter:', {
                params: req.params,
                body: req.body,
                company: req.company._id
            });

            const updatedRecruiter = await EncadreurExterne.findOneAndUpdate(
                { 
                    _id: req.params.id,
                    company: req.company._id 
                },
                req.body,
                { 
                    new: true,
                    runValidators: true 
                }
            ).select('-password -__v');

            if (!updatedRecruiter) {
                console.error('Recruiter not found:', req.params.id);
                return res.status(404).json({
                    success: false,
                    message: 'Recruiter not found or not authorized'
                });
            }

            console.log('Successfully updated recruiter:', updatedRecruiter);
            res.status(200).json({
                success: true,
                recruiter: updatedRecruiter
            });

        } catch (error) {
            console.error('Error updating recruiter:', {
                message: error.message,
                stack: error.stack,
                fullError: error
            });
            res.status(500).json({
                success: false,
                message: 'Error updating recruiter',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);
router.put('/recruiter-status', 
    authCompany,
    [
        body('recruiterId').notEmpty(),
        body('isActive').isBoolean()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        
        try {
            console.log('Request body:', req.body);
            console.log('Company ID:', req.company?._id);
            console.log('Recruiter ID:', req.body.recruiterId);
            
            const recruiter = await EncadreurExterne.findOneAndUpdate(
                { 
                    _id: req.body.recruiterId,
                    company: req.company._id 
                },
                { est_actif: req.body.isActive },
                { new: true }
            ).select('-password -__v');
            
            console.log('Found recruiter:', recruiter);
            
            if (!recruiter) {
                return res.status(404).json({
                    success: false,
                    message: 'Recruiter not found'
                });
            }
            
            res.status(200).json({
                success: true,
                recruiter
            });
        } catch (error) {
            console.error('Error updating recruiter status:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing status',
                error: error.message // Add this for debugging
            });
        }
    }
);

 
// Route pour créer une entreprise
router.post(
  "/register",
  [
    body("nom").notEmpty().withMessage("Le nom de l'entreprise est requis"),
    body("adresse").notEmpty().withMessage("L'adresse est requise"),
    body("ville").notEmpty().withMessage("La ville est requise"),
    body("pays").notEmpty().withMessage("Le pays est requis"),
    body("email_contact")
      .isEmail()
      .withMessage("Veuillez fournir un email valide")
      .normalizeEmail(),
  ],
  async (req, res) => {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Création de l'entreprise avec status par défaut "pending"
      const entreprise = new Company({
        ...req.body,
        status: "pending", // Définit explicitement le statut à "pending"
      });

      await entreprise.save();

      res.status(201).json({
        success: true,
        data: entreprise,
        message: "Entreprise créée avec succès, en attente d'approbation",
      });
    } catch (error) {
      if (error.code === 11000) {
        // Gestion des erreurs de duplication (nom ou email unique)
        return res.status(400).json({
          success: false,
          message: "Une entreprise avec ce nom ou cet email existe déjà",
        });
      }
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'entreprise",
        error: error.message,
      });
    }
  }
);

// Route pour approuver/rejeter une entreprise (admin seulement)
router.patch(
  "/:id/status",
  [
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("Le statut doit être 'approved' ou 'rejected'"),
    body("adminId").notEmpty().withMessage("ID admin requis"),
  ],
  async (req, res) => {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status } = req.body;
      const { id } = req.params;

      // Mise à jour simple sans populate
      const entreprise = await Company.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!entreprise) {
        return res.status(404).json({ 
          success: false, 
          message: "Entreprise non trouvée" 
        });
      }

      // Émission de l'événement avec les données de base
      emitCompanyEvent(status, {
        _id: entreprise._id,
        nom: entreprise.nom,
        email_contact: entreprise.email_contact,
        status: entreprise.status
        // Ajoutez d'autres champs nécessaires pour votre template
      });

      res.status(200).json({
        success: true,
        data: entreprise,
        message: `Statut de l'entreprise mis à jour: ${status}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du statut",
        error: error.message,
      });
    }
  }
);

// Route to get company by ID (for the registration page)
router.get('/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;

        // Validate companyId format (assuming MongoDB ObjectId)
        if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company ID format'
            });
        }

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if company is approved
        if (company.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Company is not approved yet'
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });

    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching company information'
        });
    }
});

// Route to complete company registration (set password)
router.put('/complete-registration/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { password } = req.body;

        // Validate input
        if (!companyId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and password are required'
            });
        }

        // Validate companyId format
        if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company ID format'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Find the company
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if company is approved
        if (company.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Company is not approved yet'
            });
        }

        // Check if company already has a password
        if (company.password) {
            return res.status(400).json({
                success: false,
                message: 'Registration already completed. Please go to login page.'
            });
        }

        // Hash the password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the company with the hashed password
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                password: hashedPassword,
                registrationCompletedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        // Remove password from response
        const { password: _, ...companyResponse } = updatedCompany.toObject();

        res.status(200).json({
            success: true,
            message: 'Registration completed successfully',
            data: companyResponse
        });

    } catch (error) {
        console.error('Error completing registration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error completing registration'
        });
    }
});

// Route to check if company registration is complete
router.get('/:companyId/registration-status', async (req, res) => {
    try {
        const { companyId } = req.params;

        // Validate companyId format
        if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company ID format'
            });
        }

        const company = await Company.findById(companyId).select('password status nom email_contact');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                hasPassword: !!company.password,
                status: company.status,
                nom: company.nom,
                email_contact: company.email_contact
            }
        });

    } catch (error) {
        console.error('Error checking registration status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error checking registration status'
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const company = await Company.findOne({ email_contact: email }).select('+password');
        
        if (!company || !(await company.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        if (company.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Company account not yet approved'
            });
        }

        if (!company.registrationCompletedAt) {
            return res.status(403).json({
                success: false,
                message: 'Please complete your registration first'
            });
        }

        // Verify JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            throw new Error('Server configuration error');
        }

        const token = jwt.sign(
            { 
                id: company._id, 
                email: company.email_contact,
                role: 'company' 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        company.lastLogin = new Date();
        await company.save();

        res.status(200).json({
            success: true,
            token,
            company: {
                id: company._id,
                name: company.nom,
                email: company.email_contact,
                status: company.status
            }
        });

    } catch (error) {
        console.error('Company login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Protected company route example
router.get('/dashboard', authCompany, (req, res) => {
    res.json({
        success: true,
        message: `Welcome ${req.company.companyData.name}`,
        company: req.company.companyData
    });
});
// Add this to CompanyRoute.js
router.get('/check-auth', authCompany, (req, res) => {
    res.status(200).json({
        success: true,
        company: req.company.companyData
    });
}); 









 
 
// Inviter un recruteur
router.post('/invite-recruiter', authCompany, async (req, res) => {
  try {
    const { email } = req.body;
    const { company } = req;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Vérifier si le recruteur existe déjà
    const existingRecruiter = await EncadreurExterne.findOne({ 
      email, 
      entreprise_id: company.companyData.id,
      status: { $ne: 'deleted' }
    });

    if (existingRecruiter) {
      return res.status(400).json({ 
        success: false, 
        message: existingRecruiter.status === 'pending' 
          ? 'Invitation already sent to this email' 
          : 'Recruiter already exists for this company' 
      });
    }

    // Créer un enregistrement "pending"
    await EncadreurExterne.create({
      email,
      entreprise_id: company.companyData.id,
      status: 'pending',
      role_interne: 'Recruteur'
    });

    // Envoyer l'email avec l'ID entreprise
    await sendRecruiterInvitation(email, company.companyData.name, company.companyData.id);

    res.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      data: { email }
    });

  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send invitation' 
    });
  }
});

// Invite a supervisor
router.post('/invite-supervisor', authCompany, async (req, res) => {
  try {
    const { email } = req.body;
    const { company } = req;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if supervisor already exists
    const existingSupervisor = await EncadreurExterne.findOne({ 
      email, 
      entreprise_id: company.companyData.id,
      status: { $ne: 'deleted' }
    });

    if (existingSupervisor) {
      return res.status(400).json({ 
        success: false, 
        message: existingSupervisor.status === 'pending' 
          ? 'Invitation already sent to this email' 
          : 'Supervisor already exists for this company' 
      });
    }

    // Create pending record
    await EncadreurExterne.create({
      email,
      entreprise_id: company.companyData.id,
      status: 'pending',
      role_interne: 'Encadreur'
    });

    // Send email with company ID
    await sendSupervisorInvitation(email, company.companyData.name, company.companyData.id);

    res.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      data: { email }
    });

  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send invitation' 
    });
  }
});
 

router.get("/students", async (req, res) => {
  const { universityId } = req.query;
  try {
    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID is required" });
    }

    const students = await UserModel.find({ university: universityId }).select(
      "name email cin dateOfBirth studyLevel specialization currentClass academicYear profile studentData accountStatus"
    );

    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

 
 

router.get("/applications", async (req, res) => {
  const { universityId, status } = req.query;
  try {
    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID is required" });
    }

    // Fetch applications for students from the specified university
    const applications = await Application.find({
      status: status ? { $in: status.split(",") } : { $in: ["accepted", "completed"] },
    })
      .populate({
        path: "student",
        match: { university: universityId }, // Only include students from the specified university
        select: "_id",
      })
      .populate({
        path: "company",
        select: "nom", // Assuming Company model has a name field
      })
      .populate({
        path: "offre",
        select: "title", // Assuming OffreStageEmploi model has a title field
      })
      .select("student company offre status appliedAt confirmed confirmedAt testResult coverLetter notes");

    // Filter out applications where student is null (due to university mismatch)
    const filteredApplications = applications.filter((app) => app.student !== null);

    res.json({ success: true, applications: filteredApplications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

 







 
 
 
 
export default router;