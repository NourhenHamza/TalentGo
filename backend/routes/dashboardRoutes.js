// routes/dashboardRoutes.js - Routes mises à jour pour utiliser les modèles existants

import express from 'express';
import authUser from '../middlewars/authUser.js'; // Middleware d'authentification
import { getStudentDashboardData } from '../controllers/dashboardController.js';

// Import des modèles existants
import Application from '../models/Application.js';
import Subject from '../models/Subject.js';
import Report from '../models/Report.js';
import Assignment from '../models/Assignment.js';
import Defense from '../models/Defense.js';
import UserModel from '../models/userModel.js';
import Company from '../models/Company.js';

const router = express.Router();

// Route principale pour obtenir les données du tableau de bord étudiant
// GET /api/dashboard/student
router.get('/student', authUser, getStudentDashboardData);



// Routes additionnelles pour des données spécifiques

// Route pour obtenir uniquement les candidatures de l'étudiant
router.get('/student/applications', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        const applications = await Application.find({ student: studentId })
            .populate('company', 'nom ville secteur_activite logo_url')
            .sort({ appliedAt: -1 });

        // Traiter les candidatures pour gérer les références manquantes
        const processedApplications = applications.map(app => ({
            ...app.toObject(),
            offer: {
                title: app.offerTitle || "Offre de stage",
                type: app.offerType || "internship",
                company: app.company,
                location: app.company?.ville || "Non spécifié",
                status: "active"
            },
            cv: {
                title: app.cvTitle || "CV Principal",
                filename: app.cvFilename || "cv.pdf"
            }
        }));

        res.status(200).json({ 
            success: true, 
            data: processedApplications 
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des candidatures",
            error: error.message 
        });
    }
});

// Route pour obtenir uniquement le sujet de l'étudiant
router.get('/student/subject', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        const subject = await Subject.findOne({ proposedBy: studentId })
            .populate('university', 'name location');

        // Gérer le fait que company est un String dans Subject
        let processedSubject = null;
        if (subject) {
            let companyDetails = null;
            if (subject.company) {
                // Essayer de trouver l'entreprise par nom
                companyDetails = await Company.findOne({ 
                    nom: { $regex: new RegExp(subject.company, 'i') } 
                });
            }

            processedSubject = {
                ...subject.toObject(),
                companyDetails: companyDetails
            };
        }

        res.status(200).json({ 
            success: true, 
            data: processedSubject 
        });
    } catch (error) {
        console.error("Error fetching subject:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération du sujet",
            error: error.message 
        });
    }
});

// Route pour obtenir uniquement les rapports de l'étudiant
router.get('/student/reports', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        const reports = await Report.find({ student: studentId })
            .populate('subject', 'title')
            .sort({ submittedAt: -1 });

        res.status(200).json({ 
            success: true, 
            data: reports 
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des rapports",
            error: error.message 
        });
    }
});

// Route pour obtenir l'assignation de superviseur de l'étudiant
router.get('/student/assignment', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        const assignment = await Assignment.findOne({ 
            student: studentId,
            status: { $in: ['assigned', 'confirmed'] }
        })
        .populate('subject', 'title description company')
        .populate('university', 'name');

        // Note: Le modèle Assignment référence Professor qui n'est pas fourni
        // Nous simulons les données du professeur
        let processedAssignment = null;
        if (assignment) {
            processedAssignment = {
                ...assignment.toObject(),
                professor: {
                    _id: assignment.professor,
                    name: "Dr. Ahmed Ben Ali", // Données simulées
                    email: "ahmed.benali@university.edu",
                    profile: {
                        phone: "+216 12 345 678",
                        office: "Bureau 201"
                    },
                    department: "Informatique",
                    specializations: ["Intelligence Artificielle", "Développement Web"]
                }
            };
        }

        res.status(200).json({ 
            success: true, 
            data: processedAssignment 
        });
    } catch (error) {
        console.error("Error fetching assignment:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération de l'assignation",
            error: error.message 
        });
    }
});

// Route pour obtenir les informations de soutenance de l'étudiant
router.get('/student/defense', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        const defense = await Defense.findOne({ student: studentId })
            .populate('subject', 'title')
            .populate('assignment', 'status');

        res.status(200).json({ 
            success: true, 
            data: defense 
        });
    } catch (error) {
        console.error("Error fetching defense:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération de la soutenance",
            error: error.message 
        });
    }
});

// Route pour obtenir les statistiques rapides de l'étudiant
router.get('/student/stats', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        // Compter les éléments en parallèle
        const [
            applicationsCount,
            subjectExists,
            reportsCount,
            defenseExists
        ] = await Promise.all([
            Application.countDocuments({ student: studentId }),
            Subject.exists({ proposedBy: studentId }),
            Report.countDocuments({ student: studentId }),
            Defense.exists({ student: studentId })
        ]);

        const stats = {
            applications: applicationsCount,
            hasSubject: !!subjectExists,
            reports: reportsCount,
            hasDefense: !!defenseExists
        };

        res.status(200).json({ 
            success: true, 
            data: stats 
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des statistiques",
            error: error.message 
        });
    }
});

// Route pour mettre à jour le statut d'une candidature (confirmation par l'étudiant)
router.put('/student/applications/:applicationId/confirm', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        const { applicationId } = req.params;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        // Vérifier que la candidature appartient à l'étudiant
        const application = await Application.findOne({ 
            _id: applicationId, 
            student: studentId 
        });

        if (!application) {
            return res.status(404).json({ 
                success: false, 
                message: "Candidature non trouvée" 
            });
        }

        // Mettre à jour le statut de confirmation
        application.confirmed = true;
        application.confirmedAt = new Date();
        await application.save();

        res.status(200).json({ 
            success: true, 
            message: "Candidature confirmée avec succès",
            data: application 
        });
    } catch (error) {
        console.error("Error confirming application:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la confirmation de la candidature",
            error: error.message 
        });
    }
});

// Route pour soumettre un nouveau sujet
router.post('/student/subjects', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        const subjectData = req.body;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        // Récupérer les informations de l'étudiant pour obtenir l'université
        const student = await UserModel.findById(studentId).select('university');
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: "Étudiant non trouvé" 
            });
        }

        // Créer le nouveau sujet
        const newSubject = new Subject({
            ...subjectData,
            proposedBy: studentId,
            university: student.university,
            status: 'suggested',
            submittedAt: new Date()
        });

        await newSubject.save();

        res.status(201).json({ 
            success: true, 
            message: "Sujet soumis avec succès",
            data: newSubject 
        });
    } catch (error) {
        console.error("Error submitting subject:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la soumission du sujet",
            error: error.message 
        });
    }
});

// Route pour soumettre un nouveau rapport
router.post('/student/reports', authUser, async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        const reportData = req.body;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        // Créer le nouveau rapport
        const newReport = new Report({
            ...reportData,
            student: studentId,
            submittedAt: new Date()
        });

        await newReport.save();

        res.status(201).json({ 
            success: true, 
            message: "Rapport soumis avec succès",
            data: newReport 
        });
    } catch (error) {
        console.error("Error submitting report:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la soumission du rapport",
            error: error.message 
        });
    }
});

// Route pour obtenir les offres disponibles (si un modèle Offer existe)
router.get('/offers', authUser, async (req, res) => {
    try {
        // Cette route est préparée pour le cas où un modèle Offer serait ajouté
        // Pour l'instant, nous retournons une liste vide ou des données simulées
        const offers = [
            {
                _id: "offer1",
                title: "Stage en développement web",
                type: "internship",
                company: {
                    nom: "TechCorp",
                    ville: "Tunis"
                },
                location: "Tunis",
                duration: 6,
                status: "active",
                description: "Stage de développement d'applications web modernes",
                requirements: ["React", "Node.js", "MongoDB"]
            },
            {
                _id: "offer2",
                title: "Stage en intelligence artificielle",
                type: "internship",
                company: {
                    nom: "AI Solutions",
                    ville: "Sfax"
                },
                location: "Sfax",
                duration: 4,
                status: "active",
                description: "Stage de recherche en IA et machine learning",
                requirements: ["Python", "TensorFlow", "Machine Learning"]
            }
        ];

        res.status(200).json({ 
            success: true, 
            data: offers 
        });
    } catch (error) {
        console.error("Error fetching offers:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des offres",
            error: error.message 
        });
    }
});

export default router;
