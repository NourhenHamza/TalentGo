import Application from '../models/Application.js';
import Subject from '../models/Subject.js';
import Report from '../models/Report.js';
import Assignment from '../models/Assignment.js';
import Defense from '../models/Defense.js';
import UserModel from '../models/userModel.js';
import Company from '../models/Company.js';

// Fonction principale pour obtenir les données du tableau de bord étudiant
export const getStudentDashboardData = async (req, res) => {
    try {
        const studentId = req.user?.id || req.userId || req.body.userId;
        
        if (!studentId) {
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié" 
            });
        }

        // Récupérer les informations de l'étudiant
        const student = await UserModel.findById(studentId)
            .populate('university', 'name location')
            .select('name email university specialization currentClass');

        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: "Étudiant non trouvé" 
            });
        }

        // Récupérer toutes les données en parallèle pour optimiser les performances
        const [
            applications,
            subject,
            reports,
            assignment,
            defense
        ] = await Promise.all([
            getStudentApplications(studentId),
            getStudentSubject(studentId),
            getStudentReports(studentId),
            getStudentAssignment(studentId),
            getStudentDefense(studentId)
        ]);

        // Construire les données du tableau de bord avec SEULEMENT les données réelles
        const dashboardData = {
            studentInfo: {
                name: student.name,
                email: student.email,
                specialization: student.specialization,
                currentClass: student.currentClass,
                universityName: student.university?.name,
                pfeStatus: determinePfeStatus(subject, assignment, defense)
            },
            project: subject ? await processProjectData(subject) : null,
            professor: assignment?.professor ? await processProfessorData(assignment.professor) : null,
            applications: await processApplicationsData(applications),
            // SUPPRIMÉ: deadlines générées automatiquement
            activities: generateActivitiesFromRealData(applications, subject, assignment, reports, defense),
            grades: calculateGrades(subject, reports, defense),
            // SUPPRIMÉ: resources hardcodées
            // SUPPRIMÉ: meetings générées automatiquement
            progress: calculateProgress(applications, subject, assignment, reports, defense),
            reports: {
                list: reports,
                count: reports.length
            },
            defense: defense
        };

        res.status(200).json({ 
            success: true, 
            data: dashboardData 
        });

    } catch (error) {
        console.error("Error in getStudentDashboardData:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des données du tableau de bord",
            error: error.message 
        });
    }
};

// Fonction pour récupérer les candidatures de l'étudiant
const getStudentApplications = async (studentId) => {
    try {
        const applications = await Application.find({ student: studentId })
            .populate('company', 'nom ville secteur_activite logo_url')
            .sort({ appliedAt: -1 });

        return applications.map(app => ({
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
    } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
};

// Fonction pour récupérer le sujet de l'étudiant avec logique de statut corrigée
const getStudentSubject = async (studentId) => {
    try {
        const subject = await Subject.findOne({ proposedBy: studentId })
            .populate('university', 'name location');

        if (!subject) return null;

        // Vérifier s'il y a une assignation pour ce sujet
        const assignment = await Assignment.findOne({ 
            subject: subject._id,
            student: studentId 
        });

        // LOGIQUE DE STATUT CORRIGÉE
        let correctedStatus = subject.status;
        
        // Si le sujet est marqué comme "approved" dans la DB mais qu'il y a une assignation
        // alors le vrai statut dépend de l'assignation
        if (subject.status === 'approved' && assignment) {
            if (assignment.status === 'assigned' || assignment.status === 'confirmed') {
                correctedStatus = 'assigned_to_professor';
            }
        }
        
        // Si le sujet est marqué comme "suggested" mais qu'il devrait être "approved"
        // (cela peut arriver si la DB n'est pas mise à jour correctement)
        if (subject.status === 'suggested' && assignment) {
            correctedStatus = 'assigned_to_professor';
        }

        return {
            ...subject.toObject(),
            status: correctedStatus, // Utiliser le statut corrigé
            assignment: assignment
        };
    } catch (error) {
        console.error("Error fetching subject:", error);
        return null;
    }
};

// Fonction pour récupérer les rapports de l'étudiant
const getStudentReports = async (studentId) => {
    try {
        const reports = await Report.find({ student: studentId })
            .populate('subject', 'title')
            .sort({ submittedAt: -1 });

        return reports;
    } catch (error) {
        console.error("Error fetching reports:", error);
        return [];
    }
};

// Fonction pour récupérer l'assignation de l'étudiant avec populate du professeur
const getStudentAssignment = async (studentId) => {
    try {
        const assignment = await Assignment.findOne({ 
            student: studentId,
            status: { $in: ['assigned', 'confirmed'] }
        })
        .populate('subject', 'title description company')
        .populate('university', 'name')
        .populate('professor'); // Populate le professeur pour récupérer ses vraies données

        return assignment;
    } catch (error) {
        console.error("Error fetching assignment:", error);
        return null;
    }
};

// Fonction pour récupérer la soutenance de l'étudiant
const getStudentDefense = async (studentId) => {
    try {
        const defense = await Defense.findOne({ student: studentId })
            .populate('subject', 'title')
            .populate('assignment', 'status');

        return defense;
    } catch (error) {
        console.error("Error fetching defense:", error);
        return null;
    }
};

// Fonction pour déterminer le statut global du PFE
const determinePfeStatus = (subject, assignment, defense) => {
    if (defense) {
        if (defense.status === 'completed') return 'completed';
        if (defense.status === 'scheduled') return 'defense_scheduled';
    }
    
    if (assignment) {
        if (assignment.status === 'confirmed') return 'in_progress';
        if (assignment.status === 'assigned') return 'supervisor_assigned';
    }
    
    if (subject) {
        if (subject.status === 'assigned_to_professor') return 'supervisor_assigned';
        if (subject.status === 'approved') return 'subject_approved';
        if (subject.status === 'suggested') return 'subject_pending';
    }
    
    return 'not_started';
};

// Fonction pour traiter les données du projet avec statut corrigé
const processProjectData = async (subject) => {
    let companyDetails = null;
    if (subject.company) {
        companyDetails = await Company.findOne({ 
            nom: { $regex: new RegExp(subject.company, 'i') } 
        });
    }

    return {
        _id: subject._id,
        title: subject.title,
        description: subject.description,
        status: subject.status, // Utilise le statut corrigé de getStudentSubject
        technologies: subject.technologies || [],
        company: subject.company,
        companyDetails: companyDetails,
        startDate: subject.startDate,
        estimatedDuration: subject.estimatedDuration,
        objectives: subject.objectives || [],
        deliverables: subject.deliverables || [],
        feedback: subject.feedback
    };
};

// Fonction pour traiter les données du professeur - CORRIGÉE pour utiliser les vraies données
const processProfessorData = async (professorData) => {
    try {
        // Si professorData est déjà un objet peuplé (grâce au populate), l'utiliser directement
        if (professorData && typeof professorData === 'object' && professorData._id) {
            return {
                _id: professorData._id,
                name: professorData.name || `${professorData.firstName || ''} ${professorData.lastName || ''}`.trim(),
                email: professorData.email,
                profile: {
                    phone: professorData.profile?.phone || professorData.phone,
                    office: professorData.profile?.office || professorData.office
                },
                department: professorData.department || professorData.profile?.department,
                specializations: professorData.specializations || professorData.profile?.specializations || []
            };
        }
        
        // Si professorData est un ID, essayer de le récupérer depuis UserModel
        if (professorData && (typeof professorData === 'string' || professorData.toString)) {
            const professor = await UserModel.findById(professorData)
                .select('name firstName lastName email profile department specializations phone office');
            
            if (professor) {
                return {
                    _id: professor._id,
                    name: professor.name || `${professor.firstName || ''} ${professor.lastName || ''}`.trim(),
                    email: professor.email,
                    profile: {
                        phone: professor.profile?.phone || professor.phone,
                        office: professor.profile?.office || professor.office
                    },
                    department: professor.department || professor.profile?.department,
                    specializations: professor.specializations || professor.profile?.specializations || []
                };
            }
        }
        
        // Fallback si aucune donnée n'est trouvée
        console.warn("Professor data not found, using fallback");
        return {
            _id: professorData,
            name: "Professeur non trouvé",
            email: "N/A",
            profile: {
                phone: "N/A",
                office: "N/A"
            },
            department: "N/A",
            specializations: []
        };
        
    } catch (error) {
        console.error("Error processing professor data:", error);
        
        // Fallback en cas d'erreur
        return {
            _id: professorData,
            name: "Erreur de récupération",
            email: "N/A",
            profile: {
                phone: "N/A",
                office: "N/A"
            },
            department: "N/A",
            specializations: []
        };
    }
};

// Fonction pour traiter les données des candidatures
const processApplicationsData = async (applications) => {
    const stats = {
        total: applications.length,
        accepted: applications.filter(app => app.status === 'accepted').length,
        pending: applications.filter(app => app.status === 'pending').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        confirmed: applications.filter(app => app.confirmed === true).length
    };

    return {
        list: applications,
        stats: stats
    };
};

// Fonction pour générer les activités récentes SEULEMENT à partir de données réelles
const generateActivitiesFromRealData = (applications, subject, assignment, reports, defense) => {
    const activities = [];
    
    // Activités liées aux candidatures (DONNÉES RÉELLES)
    applications.forEach(app => {
        if (app.status === 'accepted') {
            activities.push({
                _id: `activity_app_${app._id}`,
                action: `Candidature acceptée pour "${app.offer.title}"`,
                date: app.acceptedAt || app.appliedAt,
                type: "application",
                status: "accepted"
            });
        }
        
        if (app.confirmed) {
            activities.push({
                _id: `activity_app_confirmed_${app._id}`,
                action: `Candidature confirmée pour "${app.offer.title}"`,
                date: app.confirmedAt,
                type: "application",
                status: "confirmed"
            });
        }
    });
    
    // Activités liées au sujet (DONNÉES RÉELLES)
    if (subject) {
        if (subject.submittedAt) {
            activities.push({
                _id: `activity_subject_${subject._id}`,
                action: `Sujet proposé: "${subject.title}"`,
                date: subject.submittedAt,
                type: "subject",
                status: "suggested"
            });
        }
        
        if (subject.approvedAt && subject.status !== 'suggested') {
            activities.push({
                _id: `activity_subject_approved_${subject._id}`,
                action: `Sujet approuvé: "${subject.title}"`,
                date: subject.approvedAt,
                type: "subject",
                status: "approved"
            });
        }
    }
    
    // Activités liées à l'assignation (DONNÉES RÉELLES)
    if (assignment && assignment.assignedAt) {
        activities.push({
            _id: `activity_assignment_${assignment._id}`,
            action: `Superviseur assigné pour le projet: "${subject?.title || 'Projet PFE'}"`,
            date: assignment.assignedAt,
            type: "assignment",
            status: "assigned"
        });
    }
    
    // Activités liées aux rapports (DONNÉES RÉELLES)
    reports.forEach(report => {
        activities.push({
            _id: `activity_report_${report._id}`,
            action: `Rapport soumis: "${report.title || 'Rapport de progression'}"`,
            date: report.submittedAt,
            type: "report",
            status: report.status
        });
    });
    
    // Activités liées à la soutenance (DONNÉES RÉELLES)
    if (defense) {
        if (defense.scheduledAt) {
            activities.push({
                _id: `activity_defense_scheduled_${defense._id}`,
                action: `Soutenance planifiée pour le ${new Date(defense.scheduledAt).toLocaleDateString('fr-FR')}`,
                date: defense.scheduledAt,
                type: "defense",
                status: "scheduled"
            });
        }
        
        if (defense.completedAt) {
            activities.push({
                _id: `activity_defense_completed_${defense._id}`,
                action: `Soutenance terminée avec succès`,
                date: defense.completedAt,
                type: "defense",
                status: "completed"
            });
        }
    }
    
    // Trier par date décroissante et limiter à 10 activités
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
};

// Fonction pour calculer les notes (SEULEMENT à partir de données réelles)
const calculateGrades = (subject, reports, defense) => {
    const grades = {
        proposal: null,
        progressReports: [],
        finalReport: null,
        defense: null,
        overall: null
    };
    
    // Note de la proposition (DONNÉES RÉELLES)
    if (subject && subject.proposalGrade) {
        grades.proposal = subject.proposalGrade;
    }
    
    // Notes des rapports de progression (DONNÉES RÉELLES)
    reports.forEach(report => {
        if (report.grade && report.type !== 'final') {
            grades.progressReports.push({
                type: report.type || 'monthly',
                grade: report.grade,
                date: report.submittedAt
            });
        } else if (report.grade && report.type === 'final') {
            grades.finalReport = {
                grade: report.grade,
                date: report.submittedAt
            };
        }
    });
    
    // Note de soutenance (DONNÉES RÉELLES)
    if (defense && defense.grade) {
        grades.defense = {
            grade: defense.grade,
            mention: defense.mention
        };
    }
    
    // Calcul de la moyenne générale (SEULEMENT si des notes existent)
    const allGrades = [];
    if (grades.proposal) allGrades.push(grades.proposal);
    grades.progressReports.forEach(report => allGrades.push(report.grade));
    if (grades.finalReport) allGrades.push(grades.finalReport.grade);
    if (grades.defense) allGrades.push(grades.defense.grade);
    
    if (allGrades.length > 0) {
        grades.overall = allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
    }
    
    return grades;
};

// Fonction pour calculer la progression avec logique corrigée
const calculateProgress = (applications, subject, assignment, reports, defense) => {
    const progress = {
        applicationPhase: false,
        subjectProposed: false,
        subjectApproved: false,
        supervisorAssigned: false,
        projectStarted: false,
        reportsSubmitted: false,
        defenseScheduled: false,
        projectCompleted: false
    };
    
    // Phase de candidatures
    if (applications.some(app => app.status === 'accepted' && app.confirmed)) {
        progress.applicationPhase = true;
    }
    
    // Sujet proposé
    if (subject) {
        progress.subjectProposed = true;
        
        // Sujet approuvé - LOGIQUE CORRIGÉE
        if (subject.status === 'approved' || subject.status === 'assigned_to_professor') {
            progress.subjectApproved = true;
        }
        
        // Superviseur assigné - LOGIQUE CORRIGÉE
        if (subject.status === 'assigned_to_professor' || (assignment && assignment.status === 'assigned')) {
            progress.supervisorAssigned = true;
        }
        
        // Projet démarré
        if (assignment && assignment.status === 'confirmed') {
            progress.projectStarted = true;
        }
    }
    
    // Rapports soumis
    if (reports.length > 0) {
        progress.reportsSubmitted = true;
    }
    
    // Soutenance planifiée
    if (defense && defense.status === 'scheduled') {
        progress.defenseScheduled = true;
    }
    
    // Projet terminé
    if (defense && defense.status === 'completed') {
        progress.projectCompleted = true;
    }
    
    return progress;
};

export default {
    getStudentDashboardData
};
