import express from 'express';
import jwt from 'jsonwebtoken';
import { getMySubmission } from '../controllers/subjectController.js';
import { emitReportEvent } from '../events/index.js';
import authUser from '../middlewars/authUser.js';
import Assignment from '../models/Assignment.js';
import ProfessorModel from '../models/ProfessorModel.js';
import Report from '../models/Report.js';

const reportRouter = express.Router();
reportRouter.get('/my-submission',authUser, getMySubmission);
// Récupérer tous les rapports pour un professeur connecté
// Route modifiée pour accepter le token depuis l'URL ET l'en-tête Authorization
reportRouter.get('/reports', async (req, res) => {
    try {
        // ===== AUTHENTIFICATION MANUELLE =====
        let token = null;
        let professorId = null;

        // 1. Essayer de récupérer le token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        
        // 2. Si pas de token dans l'en-tête, essayer depuis les paramètres de requête
        if (!token && req.query.professorId) {
            token = req.query.professorId;
        }

        // 3. Vérifier si on a un token
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Token manquant. Utilisez l'en-tête Authorization ou le paramètre professorId." 
            });
        }

        // 4. Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Vérifier que le professeur existe
        const professor = await ProfessorModel.findById(decoded.id);
        if (!professor) {
            return res.status(404).json({ 
                success: false, 
                message: "Professeur non trouvé." 
            });
        }

        professorId = professor._id;

        // ===== LOGIQUE PRINCIPALE DE LA ROUTE =====
        
        // ÉTAPE 1: Récupérer les assignments qui correspondent à l'ID du professeur
        const assignments = await Assignment.find({ professor: professorId })
            .populate('student', 'name email')
            .populate('subject', 'title description');
        
        if (!assignments || assignments.length === 0) {
            return res.json({
                success: true,
                reports: [],
                message: "Aucune assignation trouvée pour ce professeur",
                totalReports: 0,
                assignments: 0
            });
        }

        // ÉTAPE 2: Extraire les IDs des sujets (subjects) de ces assignments
        const subjectIds = assignments.map(a => a.subject?._id).filter(Boolean);

        if (subjectIds.length === 0) {
            return res.json({
                success: true,
                reports: [],
                message: "Aucun sujet valide trouvé dans les assignations",
                totalReports: 0,
                assignments: assignments.length
            });
        }

        // ÉTAPE 3: Filtrer les rapports qui ont les mêmes IDs de sujets
        const reports = await Report.find({
            subject: { $in: subjectIds }
        })
        .populate('student', 'name email profile')
        .populate('subject', 'title description company technologies')
        .sort({ createdAt: -1 });

        // Enrichir les rapports avec les détails
        const enrichedReports = reports.map(report => {
            const reportObj = report.toObject();
            return {
                ...reportObj,
                studentDetails: {
                    _id: report.student._id,
                    name: report.student.name,
                    email: report.student.email,
                    profile: report.student.profile
                },
                subjectDetails: {
                    _id: report.subject._id,
                    title: report.subject.title,
                    description: report.subject.description,
                    company: report.subject.company,
                    technologies: report.subject.technologies
                }
            };
        });

        res.json({
            success: true,
            reports: enrichedReports,
            totalReports: enrichedReports.length,
            assignments: assignments.length,
            professorInfo: {
                id: professorId,
                name: professor.name,
                email: professor.email
            }
        });

    } catch (error) {
        // Gestion spécifique des erreurs JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token invalide ou mal formé."
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expiré. Veuillez vous reconnecter."
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des rapports",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Nouvelle route pour valider un rapport
reportRouter.post('/professor/validate-report', async (req, res) => {
    console.log("🔍 [POST] /professor/validate-report called");
    
    try {
        // Vérification des paramètres requis
        const { reportId, feedback } = req.body;
        
        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "L'ID du rapport est requis"
            });
        }
        
        // ===== AUTHENTIFICATION MANUELLE =====
        let token = null;
        let professorId = null;

        // 1. Récupérer le token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
            console.log("📋 Token trouvé dans Authorization header");
        } else {
            console.log("❌ Aucun token trouvé dans l'en-tête Authorization");
            return res.status(401).json({ 
                success: false, 
                message: "Token d'authentification manquant" 
            });
        }

        // 2. Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`✅ Token décodé pour l'ID: ${decoded.id}`);

        // 3. Vérifier que le professeur existe
        const professor = await ProfessorModel.findById(decoded.id);
        if (!professor) {
            console.log("❌ Professeur non trouvé dans la base de données");
            return res.status(404).json({ 
                success: false, 
                message: "Professeur non trouvé" 
            });
        }

        professorId = professor._id;
        console.log(`👨‍🏫 Professor authentifié: ${professor.name || professor.email} (ID: ${professorId})`);

        // ===== LOGIQUE PRINCIPALE DE LA ROUTE =====
        
        // 1. Vérifier que le rapport existe
        const report = await Report.findById(reportId);
        if (!report) {
            console.log(`❌ Rapport non trouvé: ${reportId}`);
            return res.status(404).json({
                success: false,
                message: "Rapport non trouvé"
            });
        }
        
        // 2. Vérifier que le professeur est bien assigné au sujet du rapport
        const assignment = await Assignment.findOne({
            professor: professorId,
            subject: report.subject
        });
        
        if (!assignment) {
            console.log(`❌ Le professeur n'est pas assigné à ce sujet: ${report.subject}`);
            return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à valider ce rapport"
            });
        }

        // 3. Mettre à jour le statut du rapport
        report.status = 'validated';
        if (feedback) {
            report.feedback = feedback;
        }
        
        await report.save();
        
        // Émettre l'événement avec le rapport correct
        emitReportEvent('validated', report.toObject());
        
        console.log(`✅ Rapport validé avec succès: ${reportId}`);
        
        res.json({
            success: true,
            message: "Rapport validé avec succès",
            report: {
                _id: report._id,
                status: report.status,
                feedback: report.feedback
            }
        });

    } catch (error) {
        console.error('❌ Error validating report:', error);
        
        // Gestion spécifique des erreurs JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token invalide ou mal formé"
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expiré. Veuillez vous reconnecter"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la validation du rapport",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Nouvelle route pour rejeter un rapport
reportRouter.post('/professor/reject-report', async (req, res) => {
    console.log("🔍 [POST] /professor/reject-report called");
    
    try {
        // Vérification des paramètres requis
        const { reportId, feedback } = req.body;
        
        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "L'ID du rapport est requis"
            });
        }
        
        if (!feedback || feedback.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Un feedback est requis pour rejeter un rapport"
            });
        }
        
        // ===== AUTHENTIFICATION MANUELLE =====
        let token = null;
        let professorId = null;

        // 1. Récupérer le token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
            console.log("📋 Token trouvé dans Authorization header");
        } else {
            console.log("❌ Aucun token trouvé dans l'en-tête Authorization");
            return res.status(401).json({ 
                success: false, 
                message: "Token d'authentification manquant" 
            });
        }

        // 2. Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`✅ Token décodé pour l'ID: ${decoded.id}`);

        // 3. Vérifier que le professeur existe
        const professor = await ProfessorModel.findById(decoded.id);
        if (!professor) {
            console.log("❌ Professeur non trouvé dans la base de données");
            return res.status(404).json({ 
                success: false, 
                message: "Professeur non trouvé" 
            });
        }

        professorId = professor._id;
        console.log(`👨‍🏫 Professor authentifié: ${professor.name || professor.email} (ID: ${professorId})`);

        // ===== LOGIQUE PRINCIPALE DE LA ROUTE =====
        
        // 1. Vérifier que le rapport existe
        const report = await Report.findById(reportId);
        if (!report) {
            console.log(`❌ Rapport non trouvé: ${reportId}`);
            return res.status(404).json({
                success: false,
                message: "Rapport non trouvé"
            });
        }
        
        // 2. Vérifier que le professeur est bien assigné au sujet du rapport
        const assignment = await Assignment.findOne({
            professor: professorId,
            subject: report.subject
        });
        
        if (!assignment) {
            console.log(`❌ Le professeur n'est pas assigné à ce sujet: ${report.subject}`);
            return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à rejeter ce rapport"
            });
        }
        
        // 3. Mettre à jour le statut du rapport
        report.status = 'rejected';
        report.feedback = feedback;
        
        await report.save();
        
        // Émettre l'événement pour le rejet du rapport
        emitReportEvent('rejected', report.toObject());
        
        console.log(`✅ Rapport rejeté avec succès: ${reportId}`);
        
        res.json({
            success: true,
            message: "Rapport rejeté avec succès",
            report: {
                _id: report._id,
                status: report.status,
                feedback: report.feedback
            }
        });

    } catch (error) {
        console.error('❌ Error rejecting report:', error);
        
        // Gestion spécifique des erreurs JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token invalide ou mal formé"
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expiré. Veuillez vous reconnecter"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors du rejet du rapport",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default reportRouter;
