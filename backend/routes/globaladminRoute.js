import express from 'express';
import {
    loginAdmin
} from '../controllers/globaladminController.js';
import Company from '../models/Company.js';
import University from '../models/University.js';
import Application from '../models/Application.js';
import { sendCompanyRegistrationEmail } from '../services/emailCompany.js';
import { sendApprovalEmail } from '../services/emailUniversity.js';



 

const adminRouter = express.Router();

// Route pour la connexion admin existante
adminRouter.post('/login', loginAdmin);

// Route pour obtenir la liste des universités
adminRouter.get('/universities', async (req, res) => {
    try {
        const universities = await University.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: universities.length,
            universities
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Route pour créer une nouvelle demande d'inscription d'université
adminRouter.post('/universities/request-registration', async (req, res) => {
    try {
        const university = new University({
            ...req.body,
            status: 'pending'
        });

        await university.save();

        res.status(201).json({
            success: true,
            message: 'University registration request submitted successfully',
            data: university
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        } else if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'University name or contact email already exists'
            });
        } else {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
});


// Route to update university status
adminRouter.put('/university-status', async (req, res) => {
    try {
        const { universityId, status, reason } = req.body;

        // Data validation
        if (!universityId || !status || !['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }

        // Find and update the university
        const university = await University.findByIdAndUpdate(
            universityId,
            { 
                status,
                ...(status === 'rejected' && { rejectionReason: reason }),
                ...(status === 'approved' && { approvedAt: new Date() })
            },
            { new: true, runValidators: true }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        // Send approval email if status is approved
        if (status === 'approved') {
            try {
                await sendApprovalEmail(
                    university.contactPerson.email,
                    university.name
                );
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
                // Don't fail the whole request if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: `University ${status} successfully`,
            data: university
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Route pour obtenir les détails d'une université spécifique
adminRouter.get('/universities/:id', async (req, res) => {
    try {
        const university = await University.findById(req.params.id);
        
        if (!university) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        res.status(200).json({
            success: true,
            data: university
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


 

// Route pour obtenir la liste de toutes les entreprises
adminRouter.get('/companies', async (req, res) => {
    try {
        // Optionnel: Ajouter une authentification/autorisation ici pour s'assurer que seul un admin peut accéder
        // if (!req.admin) { return res.status(403).json({ success: false, message: 'Unauthorized' }); }

        const companies = await Company.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: companies.length,
            companies
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching companies',
            error: error.message
        });
    }
});
// Route pour mettre à jour le statut d'une entreprise (approve/reject)
adminRouter.put('/company-status', async (req, res) => {
    try {
        // Optionnel: Ajouter une authentification/autorisation ici
        // if (!req.admin) { return res.status(403).json({ success: false, message: 'Unauthorized' }); }

        const { companyId, status, reason } = req.body;

        // Validation des données
        if (!companyId || !status || !['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data: companyId and valid status are required.'
            });
        }

        // Trouver et mettre à jour l'entreprise
        const company = await Company.findByIdAndUpdate(
            companyId,
            {
                status,
                ...(status === 'rejected' && { rejectionReason: reason }),
                ...(status === 'approved' && { approvedAt: new Date() })
            },
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Envoyer un email d'approbation si le statut est 'approved'
        if (status === 'approved') {
            try {
                // FIXED: Actually call the email function instead of just logging
                await sendCompanyRegistrationEmail(
                    company.email_contact, 
                    company.nom, 
                    company._id
                );
                console.log(`Approval email sent to ${company.email_contact}`);
            } catch (emailError) {
                console.error('Failed to send approval email to company:', emailError);
                // Don't fail the whole request if email fails
            }
        } else if (status === 'rejected') {
            try {
                // Optional: Send rejection email (you need to create this function)
                await sendCompanyRejectionEmail(company.email_contact, company.nom, reason);
                console.log(`Rejection email sent to ${company.email_contact}`);
            } catch (emailError) {
                console.error('Failed to send rejection email to company:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: `Company ${status} successfully`,
            data: company
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error updating company status',
            error: error.message
        });
    }
});

// Additional function for rejection emails (optional)
export const sendCompanyRejectionEmail = async (email, companyName, reason) => {
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Company Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Company Application Status Update',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">Application Status Update</h2>
                    <p>Dear ${companyName},</p>
                    <p>Thank you for your interest in joining our platform. Unfortunately, your application has not been approved at this time.</p>
                    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                    <p>If you have any questions or would like to reapply in the future, please contact our support team.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #7f8c8d;">
                        © ${new Date().getFullYear()} Company Platform. All rights reserved.
                    </p>
                </div>
            `,
            text: `Application Status Update\n\nDear ${companyName},\n\nThank you for your interest in joining our platform. Unfortunately, your application has not been approved at this time.\n\n${reason ? `Reason: ${reason}\n\n` : ''}If you have any questions or would like to reapply in the future, please contact our support team.`
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending company rejection email:', error);
        throw error;
    }
};

// Route pour obtenir les détails d'une entreprise spécifique
adminRouter.get('/companies/:id', async (req, res) => {
    try {
        // Optionnel: Ajouter une authentification/autorisation ici
        // if (!req.admin) { return res.status(403).json({ success: false, message: 'Unauthorized' }); }

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching company details',
            error: error.message
        });
    }
});
// GET /api/globaladmin/completed-applications
adminRouter.get('/completed-applications', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', university = '', company = '' } = req.query;
        
        // Build the aggregation pipeline for better filtering
        const pipeline = [
            // Match completed applications first
            { $match: { status: 'completed' } },
            
            // Lookup student information
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
            
            // Lookup university information
            {
                $lookup: {
                    from: 'universities',
                    localField: 'student.university',
                    foreignField: '_id',
                    as: 'studentUniversity'
                }
            },
            {
                $addFields: {
                    'student.university': { $arrayElemAt: ['$studentUniversity', 0] }
                }
            },
            
            // Lookup company information
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'company'
                }
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
            
            // Lookup offer information
            {
                $lookup: {
                    from: 'offers',
                    localField: 'offre',
                    foreignField: '_id',
                    as: 'offre'
                }
            },
            { $unwind: { path: '$offre', preserveNullAndEmptyArrays: true } },
            
            // Apply filters only if they have values
            ...(search || university || company ? [{
                $match: {
                    $and: [
                        // Search filter
                        ...(search ? [{
                            $or: [
                                { 'student.name': { $regex: search, $options: 'i' } },
                                { 'student.email': { $regex: search, $options: 'i' } },
                                { 'student.cin': { $regex: search, $options: 'i' } }
                            ]
                        }] : []),
                        
                        // University filter
                        ...(university ? [{
                            'student.university.name': { $regex: university, $options: 'i' }
                        }] : []),
                        
                        // Company filter
                        ...(company ? [{
                            'company.nom': { $regex: company, $options: 'i' }
                        }] : [])
                    ]
                }
            }] : []),
            
            // Sort by application date
            { $sort: { appliedAt: -1 } }
        ];

        // Get total count
        const totalCountPipeline = [...pipeline, { $count: 'total' }];
        const totalCountResult = await Application.aggregate(totalCountPipeline);
        const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

        // Get paginated results
        const paginatedPipeline = [
            ...pipeline,
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ];

        const applications = await Application.aggregate(paginatedPipeline);

        // Format response data with null checks
        const formattedApplications = applications.map(app => ({
            _id: app._id,
            student: {
                _id: app.student?._id || null,
                name: app.student?.name || '',
                email: app.student?.email || '',
                cin: app.student?.cin || '',
                university: app.student?.university?.name || 'Non spécifié',
                studyLevel: app.student?.studyLevel || '',
                specialization: app.student?.specialization || '',
                currentClass: app.student?.currentClass || '',
                academicYear: app.student?.academicYear || ''
            },
            company: {
                _id: app.company?._id || null,
                name: app.company?.nom || '',
                city: app.company?.ville || '',
                country: app.company?.pays || '',
                sector: app.company?.secteur_activite || ''
            },
            offer: {
                _id: app.offre?._id || null,
                title: app.offre?.titre || '',
                type: app.offre?.type || '',
                description: app.offre?.description || ''
            },
            finalGrade: app.finalGrade || 0,
            review: app.review || '',
            appliedAt: app.appliedAt,
            reviewedAt: app.reviewedAt,
            status: app.status,
            testResult: app.testResult || null
        }));

        res.status(200).json({
            success: true,
            data: formattedApplications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount,
                hasNext: parseInt(page) * parseInt(limit) < totalCount,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching completed applications:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures complétées',
            error: error.message
        });
    }
});

// GET /api/globaladmin/completed-applications/export
adminRouter.get('/completed-applications/export', async (req, res) => {
    try {
        const pipeline = [
            { $match: { status: 'completed' } },
            
            // Lookup student information
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
            
            // Lookup university information
            {
                $lookup: {
                    from: 'universities',
                    localField: 'student.university',
                    foreignField: '_id',
                    as: 'studentUniversity'
                }
            },
            {
                $addFields: {
                    'student.university': { $arrayElemAt: ['$studentUniversity', 0] }
                }
            },
            
            // Lookup company information
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'company'
                }
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
            
            // Lookup offer information
            {
                $lookup: {
                    from: 'offers',
                    localField: 'offre',
                    foreignField: '_id',
                    as: 'offre'
                }
            },
            { $unwind: { path: '$offre', preserveNullAndEmptyArrays: true } },
            
            { $sort: { appliedAt: -1 } }
        ];

        const applications = await Application.aggregate(pipeline);

        // Format data for export
        const exportData = applications.map(app => ({
            'Nom Étudiant': app.student?.name || '',
            'Email Étudiant': app.student?.email || '',
            'CIN': app.student?.cin || '',
            'Université': app.student?.university?.name || 'Non spécifié',
            'Niveau': app.student?.studyLevel || '',
            'Spécialisation': app.student?.specialization || '',
            'Classe': app.student?.currentClass || '',
            'Année Académique': app.student?.academicYear || '',
            'Entreprise': app.company?.nom || '',
            'Ville Entreprise': app.company?.ville || '',
            'Secteur': app.company?.secteur_activite || '',
            'Offre': app.offre?.titre || '',
            'Type Offre': app.offre?.type || '',
            'Note Finale': app.finalGrade || '',
            'Avis': app.review || '',
            'Date Candidature': app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
            'Date Révision': app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : ''
        }));

        res.status(200).json({
            success: true,
            data: exportData
        });

    } catch (error) {
        console.error('Error exporting completed applications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export des candidatures',
            error: error.message
        });
    }
});

// GET /api/globaladmin/completed-applications/stats
adminRouter.get('/completed-applications/stats', async (req, res) => {
    try {
        const pipeline = [
            { $match: { status: 'completed' } },
            
            // Lookup student information
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
            
            // Lookup university information
            {
                $lookup: {
                    from: 'universities',
                    localField: 'student.university',
                    foreignField: '_id',
                    as: 'studentUniversity'
                }
            },
            {
                $addFields: {
                    'student.university': { $arrayElemAt: ['$studentUniversity', 0] }
                }
            },
            
            // Lookup company information
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'company'
                }
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } }
        ];

        const applications = await Application.aggregate(pipeline);

        // Calculate basic stats
        const totalCount = applications.length;
        const grades = applications
            .map(app => app.finalGrade)
            .filter(grade => grade !== null && grade !== undefined && grade > 0);
        
        const gradeStats = {
            averageGrade: grades.length > 0 ? 
                Math.round((grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 100) / 100 : 0,
            minGrade: grades.length > 0 ? Math.min(...grades) : 0,
            maxGrade: grades.length > 0 ? Math.max(...grades) : 0
        };

        // Group by university
        const universityStats = applications.reduce((acc, app) => {
            const university = app.student?.university?.name || 'Non spécifié';
            if (!acc[university]) {
                acc[university] = { count: 0, grades: [] };
            }
            acc[university].count++;
            if (app.finalGrade && app.finalGrade > 0) {
                acc[university].grades.push(app.finalGrade);
            }
            return acc;
        }, {});

        const byUniversity = Object.entries(universityStats).map(([name, data]) => ({
            _id: name,
            count: data.count,
            averageGrade: data.grades.length > 0 ? 
                Math.round((data.grades.reduce((sum, grade) => sum + grade, 0) / data.grades.length) * 100) / 100 : 0
        })).sort((a, b) => b.count - a.count);

        // Group by company
        const companyStats = applications.reduce((acc, app) => {
            const company = app.company?.nom || 'Non spécifié';
            if (!acc[company]) {
                acc[company] = { count: 0, grades: [] };
            }
            acc[company].count++;
            if (app.finalGrade && app.finalGrade > 0) {
                acc[company].grades.push(app.finalGrade);
            }
            return acc;
        }, {});

        const byCompany = Object.entries(companyStats).map(([name, data]) => ({
            _id: name,
            count: data.count,
            averageGrade: data.grades.length > 0 ? 
                Math.round((data.grades.reduce((sum, grade) => sum + grade, 0) / data.grades.length) * 100) / 100 : 0
        })).sort((a, b) => b.count - a.count).slice(0, 10);

        const stats = {
            totalCount: [{ count: totalCount }],
            gradeStats: [gradeStats],
            byUniversity,
            byCompany
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
});
export default adminRouter;