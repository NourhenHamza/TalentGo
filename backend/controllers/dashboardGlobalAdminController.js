import University from '../models/University.js';
import Company from '../models/Company.js';
import UserModel from '../models/userModel.js';
import Application from '../models/Application.js';
import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';

// Fonction principale pour obtenir les données du tableau de bord administrateur global
export const getGlobalAdminDashboardData = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est bien un administrateur global
        if (req.admin?.role !== 'global_admin' && req.admin?.role !== 'admin') {
            console.log('❌ Access denied for role:', req.admin?.role);
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé - Droits administrateur global requis",
                debug: {
                    receivedRole: req.admin?.role,
                    expectedRoles: ['global_admin', 'admin']
                }
            });
        }

        console.log('✅ Dashboard access granted for:', {
            role: req.admin?.role,
            email: req.admin?.email
        });

        // Récupérer toutes les données en parallèle pour optimiser les performances
        const [
            universityRequests,
            companyRequests,
            approvedUniversities,
            approvedCompanies,
            completedStudents,
            globalStats,
            recentActivities
        ] = await Promise.all([
            getUniversityRequests(),
            getCompanyRequests(),
            getApprovedUniversities(),
            getApprovedCompanies(),
            getCompletedStudents(),
            getGlobalStatistics(),
            getRecentActivities()
        ]);

        // Construire les données du tableau de bord
        const dashboardData = {
            requests: {
                universities: universityRequests,
                companies: companyRequests,
                total: universityRequests.length + companyRequests.length
            },
            approved: {
                universities: approvedUniversities,
                companies: approvedCompanies,
                totalUniversities: approvedUniversities.length,
                totalCompanies: approvedCompanies.length
            },
            students: {
                completed: completedStudents,
                totalCompleted: completedStudents.length
            },
            statistics: globalStats,
            activities: recentActivities
        };

        console.log('📊 Dashboard data prepared:', {
            pendingRequests: dashboardData.requests.total,
            approvedUniversities: dashboardData.approved.totalUniversities,
            approvedCompanies: dashboardData.approved.totalCompanies,
            completedStudents: dashboardData.students.totalCompleted
        });

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("❌ Error in getGlobalAdminDashboardData:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des données du tableau de bord",
            error: error.message
        });
    }
};

// Fonction pour récupérer les demandes d'universités en attente
const getUniversityRequests = async () => {
    try {
        const requests = await University.find({ 
            status: 'pending' 
        })
        .select('name location contactEmail contactPhone description submittedAt createdAt')
        .sort({ submittedAt: -1, createdAt: -1 });

        return requests.map(request => ({
            ...request.toObject(),
            type: 'university',
            requestDate: request.submittedAt || request.createdAt
        }));
    } catch (error) {
        console.error("Error fetching university requests:", error);
        return [];
    }
};

// Fonction pour récupérer les demandes d'entreprises en attente
const getCompanyRequests = async () => {
    try {
        const requests = await Company.find({ 
            status: 'pending' 
        })
        .select('nom ville secteur_activite email telephone description logo_url submittedAt createdAt')
        .sort({ submittedAt: -1, createdAt: -1 });

        return requests.map(request => ({
            ...request.toObject(),
            type: 'company',
            requestDate: request.submittedAt || request.createdAt
        }));
    } catch (error) {
        console.error("Error fetching company requests:", error);
        return [];
    }
};

// Fonction pour récupérer les universités approuvées
const getApprovedUniversities = async () => {
    try {
        const universities = await University.find({ 
            status: 'approved' 
        })
        .select('name location contactEmail studentCount approvedAt')
        .sort({ approvedAt: -1 });

        return universities;
    } catch (error) {
        console.error("Error fetching approved universities:", error);
        return [];
    }
};

// Fonction pour récupérer les entreprises approuvées
const getApprovedCompanies = async () => {
    try {
        const companies = await Company.find({ 
            status: 'approved' 
        })
        .select('nom ville secteur_activite email offerCount approvedAt logo_url')
        .sort({ approvedAt: -1 });

        return companies;
    } catch (error) {
        console.error("Error fetching approved companies:", error);
        return [];
    }
};

// FIXED: Fonction pour récupérer les étudiants ayant complété leur candidature
const getCompletedStudents = async () => {
    try {
        console.log('🔍 Fetching completed students...');
        
        // Récupérer les étudiants qui ont des candidatures acceptées et confirmées
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

        // Enrichir avec les informations de sujet et feedback
        const enrichedStudents = await Promise.all(
            completedApplications.map(async (app) => {
                try {
                    if (!app.student) {
                        console.warn(`⚠️  Application ${app._id} has no student data`);
                        return null;
                    }

                    // Récupérer le sujet proposé par l'étudiant
                    const subject = await Subject.findOne({ 
                        proposedBy: app.student._id 
                    }).select('title status submittedAt approvedAt');

                    // Récupérer l'assignation de superviseur
                    const assignment = await Assignment.findOne({
                        student: app.student._id
                    }).populate('professor', 'name email department');

                    return {
                        _id: app._id,
                        student: {
                            _id: app.student._id,
                            name: app.student.name,
                            email: app.student.email,
                            specialization: app.student.specialization,
                            currentClass: app.student.currentClass
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
                        completionStatus: determineCompletionStatus(app, subject, assignment)
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
        return validStudents;
        
    } catch (error) {
        console.error("❌ Error fetching completed students:", error);
        return [];
    }
};

// Fonction pour déterminer le statut de completion d'un étudiant
const determineCompletionStatus = (application, subject, assignment) => {
    if (assignment && assignment.status === 'confirmed') {
        return 'project_started';
    }
    if (subject && subject.status === 'assigned_to_professor') {
        return 'supervisor_assigned';
    }
    if (subject && subject.status === 'approved') {
        return 'subject_approved';
    }
    if (subject && subject.status === 'suggested') {
        return 'subject_pending';
    }
    if (application.confirmed) {
        return 'application_confirmed';
    }
    return 'application_accepted';
};

// FIXED: Fonction pour récupérer les statistiques globales
const getGlobalStatistics = async () => {
    try {
        const [
            totalUniversities,
            totalCompanies,
            totalStudents,
            totalApplications,
            pendingUniversities,
            pendingCompanies,
            approvalStats,
            monthlyStats
        ] = await Promise.all([
            University.countDocuments({ status: 'approved' }),
            Company.countDocuments({ status: 'approved' }),
            // FIXED: Remove role filter since userModel doesn't have a role field
            UserModel.countDocuments({}), // Count all users (all are students)
            Application.countDocuments(),
            University.countDocuments({ status: 'pending' }),
            Company.countDocuments({ status: 'pending' }),
            calculateApprovalStats(),
            calculateMonthlyStats()
        ]);

        return {
            totals: {
                universities: totalUniversities,
                companies: totalCompanies,
                students: totalStudents,
                applications: totalApplications
            },
            pending: {
                requests: pendingUniversities + pendingCompanies,
                universities: pendingUniversities,
                companies: pendingCompanies
            },
            approval: approvalStats,
            monthly: monthlyStats
        };
    } catch (error) {
        console.error("Error calculating global statistics:", error);
        return {
            totals: { universities: 0, companies: 0, students: 0, applications: 0 },
            pending: { requests: 0, universities: 0, companies: 0 },
            approval: { rate: 0, averageResponseTime: 0, approved: 0, rejected: 0 },
            monthly: { newUniversities: 0, newCompanies: 0, newStudents: 0 }
        };
    }
};

// Fonction pour calculer les statistiques d'approbation
const calculateApprovalStats = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [approvedUniversities, approvedCompanies, rejectedUniversities, rejectedCompanies] = await Promise.all([
            University.countDocuments({ 
                status: 'approved', 
                approvedAt: { $gte: thirtyDaysAgo } 
            }),
            Company.countDocuments({ 
                status: 'approved', 
                approvedAt: { $gte: thirtyDaysAgo } 
            }),
            University.countDocuments({ 
                status: 'rejected', 
                updatedAt: { $gte: thirtyDaysAgo } 
            }),
            Company.countDocuments({ 
                status: 'rejected', 
                updatedAt: { $gte: thirtyDaysAgo } 
            })
        ]);

        const approvedCount = approvedUniversities + approvedCompanies;
        const rejectedCount = rejectedUniversities + rejectedCompanies;
        const totalProcessed = approvedCount + rejectedCount;
        const approvalRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 100) : 0;

        return {
            rate: approvalRate,
            averageResponseTime: 1.2,
            approved: approvedCount,
            rejected: rejectedCount
        };
    } catch (error) {
        console.error("Error calculating approval stats:", error);
        return { rate: 0, averageResponseTime: 0, approved: 0, rejected: 0 };
    }
};

// FIXED: Fonction pour calculer les statistiques mensuelles
const calculateMonthlyStats = async () => {
    try {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const [newUniversities, newCompanies, newStudents] = await Promise.all([
            University.countDocuments({ 
                createdAt: { $gte: currentMonth } 
            }),
            Company.countDocuments({ 
                createdAt: { $gte: currentMonth } 
            }),
            // FIXED: Remove role filter since userModel doesn't have a role field
            UserModel.countDocuments({ 
                createdAt: { $gte: currentMonth } 
            })
        ]);

        return {
            newUniversities,
            newCompanies,
            newStudents
        };
    } catch (error) {
        console.error("Error calculating monthly stats:", error);
        return { newUniversities: 0, newCompanies: 0, newStudents: 0 };
    }
};

// Fonction pour récupérer les activités récentes
const getRecentActivities = async () => {
    try {
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
        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

    } catch (error) {
        console.error("Error fetching recent activities:", error);
        return [];
    }
};

// Fonction pour approuver une demande d'université
export const approveUniversityRequest = async (req, res) => {
    try {
        const { universityId } = req.params;
        const adminId = req.admin?.id;

        const university = await University.findByIdAndUpdate(
            universityId,
            {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: adminId
            },
            { new: true }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "Université non trouvée"
            });
        }

        console.log('✅ University approved:', university.name);

        res.status(200).json({
            success: true,
            message: "Université approuvée avec succès",
            data: university
        });

    } catch (error) {
        console.error("Error approving university:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'approbation de l'université",
            error: error.message
        });
    }
};

// Fonction pour rejeter une demande d'université
export const rejectUniversityRequest = async (req, res) => {
    try {
        const { universityId } = req.params;
        const { reason } = req.body;
        const adminId = req.admin?.id;

        const university = await University.findByIdAndUpdate(
            universityId,
            {
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: adminId,
                rejectionReason: reason
            },
            { new: true }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "Université non trouvée"
            });
        }

        console.log('❌ University rejected:', university.name, 'Reason:', reason);

        res.status(200).json({
            success: true,
            message: "Université rejetée",
            data: university
        });

    } catch (error) {
        console.error("Error rejecting university:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du rejet de l'université",
            error: error.message
        });
    }
};

// Fonction pour approuver une demande d'entreprise
export const approveCompanyRequest = async (req, res) => {
    try {
        const { companyId } = req.params;
        const adminId = req.admin?.id;

        const company = await Company.findByIdAndUpdate(
            companyId,
            {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: adminId
            },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Entreprise non trouvée"
            });
        }

        console.log('✅ Company approved:', company.nom);

        res.status(200).json({
            success: true,
            message: "Entreprise approuvée avec succès",
            data: company
        });

    } catch (error) {
        console.error("Error approving company:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'approbation de l'entreprise",
            error: error.message
        });
    }
};

// Fonction pour rejeter une demande d'entreprise
export const rejectCompanyRequest = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { reason } = req.body;
        const adminId = req.admin?.id;

        const company = await Company.findByIdAndUpdate(
            companyId,
            {
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: adminId,
                rejectionReason: reason
            },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Entreprise non trouvée"
            });
        }

        console.log('❌ Company rejected:', company.nom, 'Reason:', reason);

        res.status(200).json({
            success: true,
            message: "Entreprise rejetée",
            data: company
        });

    } catch (error) {
        console.error("Error rejecting company:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du rejet de l'entreprise",
            error: error.message
        });
    }
};

export default {
    getGlobalAdminDashboardData,
    approveUniversityRequest,
    rejectUniversityRequest,
    approveCompanyRequest,
    rejectCompanyRequest
};