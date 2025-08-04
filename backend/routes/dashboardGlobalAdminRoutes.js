// routes/dashboardGlobalAdminRoutes.js - Fixed Routes pour l'administrateur global

import express from 'express';
import {
    getGlobalAdminDashboardData,
    approveUniversityRequest,
    rejectUniversityRequest,
    approveCompanyRequest,
    rejectCompanyRequest
} from '../controllers/dashboardGlobalAdminController.js';
import { authGlobalAdmin } from '../middlewars/authGlobalAdmin.js';

// Import des modèles nécessaires pour les routes supplémentaires
import University from '../models/University.js';
import Company from '../models/Company.js';
import UserModel from '../models/userModel.js';
import Application from '../models/Application.js';
import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification d'administrateur global
router.use(authGlobalAdmin);

// Route pour récupérer les données du tableau de bord
router.get('/dashboard', getGlobalAdminDashboardData);

// Routes pour la gestion des demandes d'universités
router.put('/universities/:universityId/approve', approveUniversityRequest);
router.put('/universities/:universityId/reject', rejectUniversityRequest);

// Routes pour la gestion des demandes d'entreprises
router.put('/companies/:companyId/approve', approveCompanyRequest);
router.put('/companies/:companyId/reject', rejectCompanyRequest);

// Route pour récupérer toutes les demandes en attente
router.get('/requests/pending', async (req, res) => {
    try {
        const [universityRequests, companyRequests] = await Promise.all([
            University.find({ status: 'pending' })
                .select('name location contactEmail contactPhone description submittedAt createdAt')
                .sort({ submittedAt: -1, createdAt: -1 }),
            Company.find({ status: 'pending' })
                .select('nom ville secteur_activite email telephone description logo_url submittedAt createdAt')
                .sort({ submittedAt: -1, createdAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            data: {
                universities: universityRequests,
                companies: companyRequests,
                total: universityRequests.length + companyRequests.length
            }
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des demandes en attente",
            error: error.message
        });
    }
});

// Route pour récupérer les entités approuvées
router.get('/approved', async (req, res) => {
    try {
        const [universities, companies] = await Promise.all([
            University.find({ status: 'approved' })
                .select('name location contactEmail studentCount approvedAt')
                .sort({ approvedAt: -1 }),
            Company.find({ status: 'approved' })
                .select('nom ville secteur_activite email offerCount approvedAt logo_url')
                .sort({ approvedAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            data: {
                universities,
                companies,
                totalUniversities: universities.length,
                totalCompanies: companies.length
            }
        });
    } catch (error) {
        console.error("Error fetching approved entities:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des entités approuvées",
            error: error.message
        });
    }
});

// FIXED: Route pour récupérer les étudiants ayant complété leur candidature
router.get('/students/completed', async (req, res) => {
    try {
        console.log('🔍 Fetching completed students from route...');
        
        // Récupérer les candidatures acceptées et confirmées
        const completedApplications = await Application.find({
            status: 'accepted',
            confirmed: true
        })
        .populate({
            path: 'student', 
            select: 'name email specialization currentClass university',
            populate: {
                path: 'university',
                select: 'name location'
            }
        })
        .populate('company', 'nom ville secteur_activite')
        .sort({ confirmedAt: -1 });

        console.log(`📊 Found ${completedApplications.length} completed applications`);

        // Enrichir avec les informations de sujet et superviseur
        const enrichedStudents = await Promise.all(
            completedApplications.map(async (app) => {
                try {
                    if (!app.student) {
                        console.warn(`⚠️  Application ${app._id} has no student data`);
                        return null;
                    }

                    // Rechercher le sujet proposé par l'étudiant
                    const subject = await Subject.findOne({ 
                        proposedBy: app.student._id 
                    }).select('title status submittedAt approvedAt');

                    // Rechercher l'assignation du superviseur
                    const assignment = await Assignment.findOne({
                        student: app.student._id
                    }).populate('professor', 'name email department');

                    // Déterminer le statut de completion
                    let completionStatus = 'application_confirmed';
                    if (subject) {
                        if (subject.status === 'approved' && assignment?.professor) {
                            completionStatus = 'project_started';
                        } else if (assignment?.professor) {
                            completionStatus = 'supervisor_assigned';
                        } else if (subject.status === 'approved') {
                            completionStatus = 'subject_approved';
                        } else {
                            completionStatus = 'subject_pending';
                        }
                    } else if (app.status === 'accepted') {
                        completionStatus = 'application_accepted';
                    }

                    return {
                        _id: app._id,
                        student: {
                            _id: app.student._id,
                            name: app.student.name,
                            email: app.student.email,
                            specialization: app.student.specialization || 'N/A',
                            currentClass: app.student.currentClass || 'N/A'
                        },
                        university: app.student.university || null,
                        company: app.company,
                        application: {
                            status: app.status,
                            appliedAt: app.appliedAt,
                            acceptedAt: app.acceptedAt,
                            confirmedAt: app.confirmedAt,
                            feedback: app.feedback || null
                        },
                        subject: subject ? {
                            title: subject.title,
                            status: subject.status,
                            submittedAt: subject.submittedAt,
                            approvedAt: subject.approvedAt
                        } : null,
                        supervisor: assignment?.professor ? {
                            name: assignment.professor.name,
                            email: assignment.professor.email,
                            department: assignment.professor.department
                        } : null,
                        completionStatus
                    };
                } catch (enrichError) {
                    console.error(`❌ Error enriching student data for application ${app._id}:`, enrichError);
                    // Retourner les données de base en cas d'erreur
                    return {
                        _id: app._id,
                        student: app.student ? {
                            _id: app.student._id,
                            name: app.student.name,
                            email: app.student.email,
                            specialization: app.student.specialization || 'N/A',
                            currentClass: app.student.currentClass || 'N/A'
                        } : null,
                        university: app.student?.university || null,
                        company: app.company,
                        application: {
                            status: app.status,
                            appliedAt: app.appliedAt,
                            acceptedAt: app.acceptedAt,
                            confirmedAt: app.confirmedAt,
                            feedback: app.feedback || null
                        },
                        subject: null,
                        supervisor: null,
                        completionStatus: 'application_confirmed'
                    };
                }
            })
        );

        // Filtrer les éléments null
        const validStudents = enrichedStudents.filter(student => student !== null);
        
        console.log(`✅ Successfully enriched ${validStudents.length} students`);

        res.status(200).json({
            success: true,
            data: {
                students: validStudents,
                total: validStudents.length
            }
        });
    } catch (error) {
        console.error("❌ Error fetching completed students:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des étudiants",
            error: error.message
        });
    }
});

// FIXED: Route pour récupérer les statistiques globales
router.get('/statistics', async (req, res) => {
    try {
        console.log('🔍 Fetching global statistics...');
        
        // Calculer les statistiques de base
        const [
            totalUniversities,
            totalCompanies,
            totalStudents,
            totalApplications,
            pendingUniversities,
            pendingCompanies
        ] = await Promise.all([
            University.countDocuments({ status: 'approved' }),
            Company.countDocuments({ status: 'approved' }),
            // FIXED: Remove role filter since UserModel doesn't have a role field
            UserModel.countDocuments({}), // Count all users (all are students)
            Application.countDocuments(),
            University.countDocuments({ status: 'pending' }),
            Company.countDocuments({ status: 'pending' })
        ]);

        console.log('📊 Basic statistics calculated:', {
            totalUniversities,
            totalCompanies,
            totalStudents,
            totalApplications
        });

        // Calculer les statistiques mensuelles (30 derniers jours)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            newUniversitiesThisMonth,
            newCompaniesThisMonth,
            newStudentsThisMonth,
            approvedRequestsThisMonth,
            rejectedRequestsThisMonth
        ] = await Promise.all([
            University.countDocuments({ 
                status: 'approved',
                approvedAt: { $gte: thirtyDaysAgo }
            }),
            Company.countDocuments({ 
                status: 'approved',
                approvedAt: { $gte: thirtyDaysAgo }
            }),
            // FIXED: Remove role filter since UserModel doesn't have a role field
            UserModel.countDocuments({ 
                createdAt: { $gte: thirtyDaysAgo }
            }),
            Promise.all([
                University.countDocuments({ 
                    status: 'approved',
                    approvedAt: { $gte: thirtyDaysAgo }
                }),
                Company.countDocuments({ 
                    status: 'approved',
                    approvedAt: { $gte: thirtyDaysAgo }
                })
            ]).then(([unis, comps]) => unis + comps),
            Promise.all([
                University.countDocuments({ 
                    status: 'rejected',
                    updatedAt: { $gte: thirtyDaysAgo }
                }),
                Company.countDocuments({ 
                    status: 'rejected',
                    updatedAt: { $gte: thirtyDaysAgo }
                })
            ]).then(([unis, comps]) => unis + comps)
        ]);

        // Calculer le taux d'approbation
        const totalRequestsThisMonth = approvedRequestsThisMonth + rejectedRequestsThisMonth;
        const approvalRate = totalRequestsThisMonth > 0 
            ? Math.round((approvedRequestsThisMonth / totalRequestsThisMonth) * 100)
            : 0;

        console.log('📈 Monthly statistics calculated:', {
            newUniversitiesThisMonth,
            newCompaniesThisMonth,
            newStudentsThisMonth,
            approvalRate
        });

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    universities: totalUniversities,
                    companies: totalCompanies,
                    students: totalStudents,
                    applications: totalApplications
                },
                pending: {
                    universities: pendingUniversities,
                    companies: pendingCompanies,
                    requests: pendingUniversities + pendingCompanies
                },
                monthly: {
                    newUniversities: newUniversitiesThisMonth,
                    newCompanies: newCompaniesThisMonth,
                    newStudents: newStudentsThisMonth
                },
                approval: {
                    rate: approvalRate,
                    approved: approvedRequestsThisMonth,
                    rejected: rejectedRequestsThisMonth,
                    averageResponseTime: 1.2 // Default value, can be calculated more precisely
                }
            }
        });
    } catch (error) {
        console.error("❌ Error fetching statistics:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des statistiques",
            error: error.message
        });
    }
});

// Route pour récupérer les activités récentes
router.get('/activities/recent', async (req, res) => {
    try {
        console.log('🔍 Fetching recent activities...');
        
        const activities = [];

        // Récupérer les approbations récentes d'universités
        const recentUniversityApprovals = await University.find({
            status: 'approved',
            approvedAt: { $exists: true }
        })
        .select('name approvedAt approvedBy')
        .sort({ approvedAt: -1 })
        .limit(5);

        recentUniversityApprovals.forEach(uni => {
            activities.push({
                _id: `uni_approval_${uni._id}`,
                type: 'approval',
                entityType: 'university',
                entityName: uni.name,
                action: 'approved',
                date: uni.approvedAt,
                admin: uni.approvedBy || 'admin'
            });
        });

        // Récupérer les approbations récentes d'entreprises
        const recentCompanyApprovals = await Company.find({
            status: 'approved',
            approvedAt: { $exists: true }
        })
        .select('nom approvedAt approvedBy')
        .sort({ approvedAt: -1 })
        .limit(5);

        recentCompanyApprovals.forEach(company => {
            activities.push({
                _id: `company_approval_${company._id}`,
                type: 'approval',
                entityType: 'company',
                entityName: company.nom,
                action: 'approved',
                date: company.approvedAt,
                admin: company.approvedBy || 'admin'
            });
        });

        // Récupérer les rejets récents
        const recentRejections = await Promise.all([
            University.find({
                status: 'rejected',
                updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }).select('name updatedAt').limit(3),
            Company.find({
                status: 'rejected',
                updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }).select('nom updatedAt').limit(3)
        ]);

        recentRejections[0].forEach(uni => {
            activities.push({
                _id: `uni_rejection_${uni._id}`,
                type: 'rejection',
                entityType: 'university',
                entityName: uni.name,
                action: 'rejected',
                date: uni.updatedAt,
                admin: 'admin'
            });
        });

        recentRejections[1].forEach(company => {
            activities.push({
                _id: `company_rejection_${company._id}`,
                type: 'rejection',
                entityType: 'company',
                entityName: company.nom,
                action: 'rejected',
                date: company.updatedAt,
                admin: 'admin'
            });
        });

        // Trier par date décroissante et limiter à 10 activités
        const sortedActivities = activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        console.log(`✅ Found ${sortedActivities.length} recent activities`);

        res.status(200).json({
            success: true,
            data: {
                activities: sortedActivities,
                total: sortedActivities.length
            }
        });
    } catch (error) {
        console.error("❌ Error fetching recent activities:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des activités récentes",
            error: error.message
        });
    }
});

export default router;