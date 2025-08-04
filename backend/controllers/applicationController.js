// controllers/applicationController.js
import Application from '../models/Application.js';
import CV from '../models/CV.js';
import OffreStageEmploi from '../models/OffreStageEmploi.js';

// @desc    Soumettre une candidature à une offre
// @route   POST /api/applications
// @access  Private (Student)
export const applyToOffre = async (req, res) => {
  try {
    const { offreId, cvId, coverLetter, testResult } = req.body;
    // Correction: utiliser req.user.id du middleware d'authentification
    const studentId = req.user?.id || req.user?._id;

    console.log('Application Controller - applyToOffre:', {
      offreId,
      cvId,
      studentId,
      coverLetterLength: coverLetter?.length || 0,
      testResult: testResult ? {
        testId: testResult.testId,
        score: testResult.score,
        passed: testResult.passed
      } : null,
      userFromToken: req.user
    });

    // Vérifier que l'utilisateur est connecté
    if (!studentId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié." 
      });
    }

    // Vérifier que l'offre existe et la populer
    const offre = await OffreStageEmploi.findById(offreId).populate('entreprise_id').populate('test');
    if (!offre) {
      return res.status(404).json({ 
        success: false, 
        message: "Offre non trouvée." 
      });
    }

    console.log('Offre trouvée:', offre.titre);

    // Vérifier que le CV appartient bien à l'étudiant
    const cv = await CV.findOne({ _id: cvId, student: studentId });
    if (!cv) {
      console.log('CV non trouvé pour:', { cvId, studentId });
      return res.status(404).json({ 
        success: false, 
        message: "CV non trouvé." 
      });
    }

    console.log('CV trouvé:', cv.filename);

    // Vérifier qu'il n'y a pas déjà une candidature
    const existingApplication = await Application.findOne({ 
      offre: offreId, 
      student: studentId 
    });
    
    if (existingApplication) {
      console.log('Candidature déjà existante:', existingApplication._id);
      return res.status(409).json({ 
        success: false, 
        message: "Vous avez déjà postulé à cette offre.",
        application: existingApplication
      });
    }

    // FIXED: Remove the student existence check that was causing the error
    // The student ID comes from the JWT token, so we know it exists
    // If you need to verify the student exists, use the correct model:
    
    // Option 1: Skip the student verification (recommended)
    // The JWT middleware already verified the user exists
    
    // Option 2: If you must verify, use the correct model (uncomment and adjust):
    /*
    const student = await Student.findById(studentId); // Use correct model name
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Étudiant non trouvé." 
      });
    }
    console.log('Étudiant trouvé:', student.name || student.email);
    */

    // Préparer les données de la candidature
    const applicationData = {
      offre: offreId,
      student: studentId,
      company: offre.entreprise_id._id,
      cv: cvId,
      coverLetter: coverLetter?.trim() || '',
      status: 'pending',
      appliedAt: new Date()
    };

    // Ajouter les résultats du test si disponibles
    if (testResult && testResult.testId) {
      applicationData.testResult = {
        testId: testResult.testId,
        resultId: testResult.resultId || null,
        score: Number(testResult.score) || 0,
        passed: Boolean(testResult.passed),
        completedAt: new Date()
      };
      
      console.log('Test result inclus:', applicationData.testResult);
    }

    // Créer la nouvelle candidature
    const newApplication = new Application(applicationData);

    console.log('Création de la candidature:', {
      offre: offreId,
      student: studentId,
      company: offre.entreprise_id._id,
      cv: cvId,
      hasTestResult: !!testResult
    });

    const savedApplication = await newApplication.save();
    console.log('Candidature sauvegardée:', savedApplication._id);

    // Populer les données pour la réponse
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate({
        path: 'offre',
        select: 'titre type_offre localisation date_limite_candidature',
        populate: {
          path: 'entreprise_id',
          select: 'nom logo_url'
        }
      })
      .populate('cv', 'filename uploadedAt')
      .populate('student', 'name email');

    console.log('Application créée avec succès:', populatedApplication._id);

    res.status(201).json({ 
      success: true, 
      message: "Candidature soumise avec succès !", 
      application: populatedApplication 
    });

  } catch (error) {
    console.error("Erreur lors de la soumission de la candidature:", error);
    
    // Gestion des erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Erreur de validation: ${messages.join(', ')}` 
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "Vous avez déjà postulé à cette offre." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la soumission de la candidature.",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};
// @desc    Récupérer toutes les candidatures d'un étudiant
// @route   GET /api/applications/my-applications
// @access  Private (Student)
export const getMyApplications = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    
    if (!studentId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié." 
      });
    }

    console.log('Récupération des candidatures pour l\'étudiant:', studentId);

    const applications = await Application.find({ student: studentId })
      .populate({
        path: 'offre',
        select: 'titre type_offre localisation date_limite_candidature',
        populate: {
          path: 'entreprise_id',
          select: 'nom logo_url',
        },
      })
      .populate('cv', 'filename uploadedAt')
      .populate('student', 'name email')
      .sort({ appliedAt: -1 });

    console.log(`${applications.length} candidatures trouvées`);

    res.status(200).json({ 
      success: true, 
      applications,
      count: applications.length
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la récupération des candidatures.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Vérifier si l'étudiant a déjà postulé à une offre
// @route   GET /api/applications/check/:offreId
// @access  Private (Student)
export const checkApplicationExists = async (req, res) => {
  try {
    const { offreId } = req.params;
    const studentId = req.user?.id || req.user?._id;

    if (!studentId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié." 
      });
    }

    console.log('Vérification candidature pour:', { offreId, studentId });

    const application = await Application.findOne({ 
      offre: offreId, 
      student: studentId 
    })
    .populate('cv', 'filename')
    .populate({
      path: 'offre',
      select: 'titre',
      populate: {
        path: 'entreprise_id',
        select: 'nom'
      }
    });

    console.log('Application trouvée:', !!application);

    res.status(200).json({ 
      success: true, 
      hasApplied: !!application,
      application: application || null
    });
    
  } catch (error) {
    console.error("Erreur lors de la vérification de candidature:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la vérification.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Récupérer les candidatures pour une offre spécifique (pour l'entreprise)
// @route   GET /api/applications/offre/:offreId
// @access  Private (Company)
export const getApplicationsForOffre = async (req, res) => {
  try {
    const { offreId } = req.params;
    const companyId = req.user?.id || req.user?._id;

    if (!companyId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié." 
      });
    }

    // Vérifier que l'offre appartient à cette entreprise
    const offre = await OffreStageEmploi.findOne({ 
      _id: offreId, 
      entreprise_id: companyId 
    });
    
    if (!offre) {
      return res.status(404).json({ 
        success: false, 
        message: "Offre non trouvée ou vous n'avez pas l'autorisation." 
      });
    }

    const applications = await Application.find({ offre: offreId })
      .populate({
        path: 'student',
        select: 'name email profile dateOfBirth university specialization currentClass'
      })
      .populate('cv', 'filename filepath uploadedAt')
      .sort({ appliedAt: 1 });

    res.status(200).json({ 
      success: true, 
      applications,
      offre: offre,
      count: applications.length
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures pour l'offre:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la récupération des candidatures.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mettre à jour le statut d'une candidature
// @route   PUT /api/applications/:id/status
// @access  Private (Company)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const companyId = req.user?.id || req.user?._id;

    if (!companyId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié." 
      });
    }

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Statut de candidature invalide." 
      });
    }

    const application = await Application.findById(id)
      .populate('offre', 'entreprise_id titre');
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: "Candidature non trouvée." 
      });
    }

    // Vérifier que l'entreprise a le droit de modifier cette candidature
    if (application.offre.entreprise_id.toString() !== companyId) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous n'avez pas l'autorisation de modifier cette candidature." 
      });
    }

    application.status = status;
    application.reviewedAt = new Date();
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    const updatedApplication = await Application.findById(id)
      .populate('student', 'name email')
      .populate('offre', 'titre')
      .populate('cv', 'filename');

    res.status(200).json({ 
      success: true, 
      message: "Statut de candidature mis à jour.", 
      application: updatedApplication 
    });
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de candidature:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la mise à jour du statut.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Supprimer une candidature (pour l'étudiant avant révision)
// @route   DELETE /api/applications/:id
// @access  Private (Student)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id || req.user?._id;

    if (!studentId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié." 
      });
    }

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: "Candidature non trouvée." 
      });
    }

    // Vérifier que la candidature appartient à l'étudiant
    if (application.student.toString() !== studentId) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous n'avez pas l'autorisation de supprimer cette candidature." 
      });
    }

    // Ne permettre la suppression que si la candidature n'a pas encore été révisée
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible de supprimer une candidature déjà révisée par l'entreprise." 
      });
    }

    await Application.findByIdAndDelete(id);

    console.log('Candidature supprimée:', id);

    res.status(200).json({ 
      success: true, 
      message: "Candidature supprimée avec succès." 
    });
    
  } catch (error) {
    console.error("Erreur lors de la suppression de la candidature:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la suppression.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const checkApplicationStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id; // Depuis votre middleware d'auth
    
    const existingApplication = await Application.findOne({
      offre: offerId,
      student: userId
    }).populate('offre', 'title company');
    
    res.json({
      hasApplied: !!existingApplication,
      application: existingApplication
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la candidature:', error);
    res.status(500).json({ message: error.message });
  }
};
















// controllers/applicationController.js (Ajoutez ces fonctions à la fin du fichier)

// ... (vos imports et fonctions existantes) ...

// @desc    Récupérer toutes les candidatures pour les offres d'une entreprise
// @route   GET /api/applications/company-applications
// @access  Private (Company)
// In your API routes (e.g., routes/applications.js)
export const getApplicationsForCompanyOffers = async (req, res) => {
  try {
    const companyId = req.query.companyId || req.company.companyData.id;
    
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company not authenticated. Company ID missing."
      });
    }

    // Get filter parameters from query
    const { search, status, category } = req.query;
    
    console.log('Fetching applications for company:', companyId);
    console.log('Filter parameters:', { search, status, category });

    // Build offer filter with category
    let offerFilter = { entreprise_id: companyId };
    if (category && category.trim() !== '') {
      offerFilter.categorie = category; // Filter by categorie field
    }

    // Find all offers for this company, filtered by category if provided
    const companyOffers = await OffreStageEmploi.find(offerFilter).select('_id titre categorie');
    const offerIds = companyOffers.map(offer => offer._id);

    if (offerIds.length === 0) {
      return res.status(200).json({
        success: true,
        applicationsByOffer: [],
        message: "No offers found for this company, therefore no applications."
      });
    }

    // Build filter query for applications
    let applicationFilter = { offre: { $in: offerIds } };
    
    // Filter by status if provided (now includes 'completed')
    if (status && status.trim() !== '') {
      applicationFilter.status = status;
    }

    console.log('Final application filter:', applicationFilter);

    // Find applications with filters
    let applicationsQuery = Application.find(applicationFilter)
      .populate({
        path: 'offre',
        select: 'titre type_offre localisation categorie', // Include categorie in populated offer
        populate: {
          path: 'entreprise_id',
          select: 'nom logo_url'
        }
      })
      .populate({
        path: 'student',
        select: 'name email profile.phone profile.linkedin profile.bio studyLevel specialization currentClass'
      })
      .populate('cv', 'filename filepath uploadedAt')
      .sort({ appliedAt: -1 });

    let applications = await applicationsQuery;

    // Apply search filter after population (for student name and offer title)
    if (search && search.trim() !== '') {
      const searchTerm = search.toLowerCase().trim();
      applications = applications.filter(app => {
        const studentName = app.student?.name?.toLowerCase() || '';
        const offerTitle = app.offre?.titre?.toLowerCase() || '';
        return studentName.includes(searchTerm) || offerTitle.includes(searchTerm);
      });
    }

    // Group applications by offer
    const applicationsByOffer = companyOffers.map(offer => {
      const offerApplications = applications.filter(app => 
        app.offre && app.offre._id.equals(offer._id)
      );
      
      return {
        offerDetails: offer,
        applications: offerApplications
      };
    });

    // Filter out offers with no applications (if filters are applied)
    const filteredApplicationsByOffer = applicationsByOffer.filter(offerGroup => 
      offerGroup.applications.length > 0
    );

    console.log(`${applications.length} applications found after filtering for ${companyOffers.length} offers.`);

    res.status(200).json({
      success: true,
      applicationsByOffer: filteredApplicationsByOffer,
      totalApplications: applications.length,
      appliedFilters: { search, status, category }
    });

  } catch (error) {
    console.error("Error fetching applications for company:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching company applications.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// New endpoint to get distinct categories
export const getOfferCategories = async (req, res) => {
  try {
    const companyId = req.query.companyId || req.company.companyData.id;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Entreprise non authentifiée."
      });
    }

    const categories = await OffreStageEmploi.distinct('categorie', { entreprise_id: companyId });
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des catégories."
    });
  }
};

// @desc    Mettre à jour le statut d'une candidature par l'entreprise
// @route   PUT /api/applications/:id/status-by-company
// @access  Private (Company)
export const updateApplicationStatusByCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, finalGrade, review } = req.body;
    
    // Get companyId from req.company (set by authCompany middleware)
    const companyId = req.company?.companyData?.id || req.company?.id;
    
    console.log('🔍 Update status request:', {
      applicationId: id,
      status,
      companyId,
      finalGrade,
      finalGradeType: typeof finalGrade,
      review: review ? `Review provided (${review.length} chars)` : 'No review',
      fullRequestBody: JSON.stringify(req.body, null, 2)
    });

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company not authenticated. Company ID missing."
      });
    }

    // Validate status
    if (!['pending', 'reviewed', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status."
      });
    }

    // Enhanced validation for completed status
    if (status === 'completed') {
      console.log('🔍 Validating completed status data:', {
        finalGrade,
        finalGradeType: typeof finalGrade,
        finalGradeValue: finalGrade,
        review,
        reviewType: typeof review,
        reviewLength: review ? review.length : 0
      });

      // Validate finalGrade
      if (finalGrade === null || finalGrade === undefined || finalGrade === '') {
        return res.status(400).json({
          success: false,
          message: "Final grade is required when marking as completed."
        });
      }

      const grade = parseFloat(finalGrade);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        return res.status(400).json({
          success: false,
          message: "Final grade must be a valid number between 0 and 100."
        });
      }

      // Validate review
      if (!review || typeof review !== 'string' || review.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "A comprehensive review (minimum 10 characters) is required when marking as completed."
        });
      }
    }

    // Find the application
    const application = await Application.findById(id).populate('offre', 'entreprise_id');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    console.log('🔍 Application found:', {
      applicationId: application._id,
      offerCompanyId: application.offre.entreprise_id,
      requestCompanyId: companyId,
      currentStatus: application.status,
      currentFinalGrade: application.finalGrade,
      currentReview: application.review
    });

    // Verify permissions
    if (!application.offre.entreprise_id.equals(companyId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this application."
      });
    }

    // 🔥 DIRECT FIELD ASSIGNMENT - This ensures the fields are set
    console.log('🔥 Before update:', {
      currentStatus: application.status,
      currentFinalGrade: application.finalGrade,
      currentReview: application.review,
      currentNotes: application.notes
    });

    // Update basic fields
    application.status = status;
    application.reviewedAt = new Date();
    
    // Update notes if provided
    if (notes !== undefined && notes !== null) {
      application.notes = notes;
    }

    // 🔥 CRITICAL: Direct assignment for completed status
    if (status === 'completed') {
      const grade = parseFloat(finalGrade);
      const cleanReview = review.trim();
      
      console.log('🔥 Setting completed status fields:', {
        finalGrade: grade,
        review: cleanReview,
        reviewLength: cleanReview.length
      });

      // Direct assignment
      application.finalGrade = grade;
      application.review = cleanReview;
      
      // Force mark fields as modified (important for Mongoose)
      application.markModified('finalGrade');
      application.markModified('review');
    }

    console.log('🔥 After assignment before save:', {
      status: application.status,
      finalGrade: application.finalGrade,
      review: application.review,
      notes: application.notes,
      reviewedAt: application.reviewedAt
    });

    // Save the application
    await application.save();

    console.log('🔥 After save:', {
      status: application.status,
      finalGrade: application.finalGrade,
      review: application.review,
      notes: application.notes
    });

    // Fetch the updated application with full population
    const updatedApplication = await Application.findById(id)
      .populate({
        path: 'offre',
        select: 'titre type_offre localisation',
        populate: {
          path: 'entreprise_id',
          select: 'nom logo_url'
        }
      })
      .populate({
        path: 'student',
        select: 'name email profile.phone profile.linkedin profile.bio studyLevel specialization currentClass'
      })
      .populate('cv', 'filename filepath uploadedAt');

    console.log('✅ Final result:', {
      applicationId: updatedApplication._id,
      status: updatedApplication.status,
      finalGrade: updatedApplication.finalGrade,
      hasReview: !!updatedApplication.review,
      reviewLength: updatedApplication.review ? updatedApplication.review.length : 0,
      notes: updatedApplication.notes
    });

    res.status(200).json({
      success: true,
      message: status === 'completed' 
        ? "Application marked as completed with final evaluation." 
        : "Application status updated successfully.",
      application: updatedApplication
    });

  } catch (error) {
    console.error("❌ Error updating application status:", error);
    
    // Enhanced error logging
    if (error.name === 'ValidationError') {
      console.error("❌ Validation Error Details:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
        validationErrors: error.errors,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while updating status.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

 

export const confirmApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // From your authUser middleware

        console.log("Confirming application:", id, "for user:", userId);

        // Find the application
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        // Check if the application belongs to the authenticated user
        if (!application.student || application.student.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only confirm your own applications"
            });
        }

        // Check if the application is accepted
        if (application.status !== 'accepted') {
            return res.status(400).json({
                success: false,
                message: "Only accepted applications can be confirmed"
            });
        }

        // Check if already confirmed
        if (application.confirmed) {
            return res.status(400).json({
                success: false,
                message: "Application is already confirmed"
            });
        }

        // Update the application to confirmed
        application.confirmed = true;
        application.confirmedAt = new Date();
        await application.save();

        res.json({
            success: true,
            message: "Application confirmed successfully",
            application
        });

    } catch (error) {
        console.error("Error confirming application:", error);
        res.status(500).json({
            success: false,
            message: "Server error while confirming application"
        });
    }
};

 

export const getConfirmedStudents = async (req, res) => {
  try {
    const companyId = req.company?.companyData?.id || req.company?.id;
    
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Entreprise non authentifiée."
      });
    }

    // Récupérer les paramètres de filtrage depuis la query
    const { search, offerId, sortBy = 'confirmedAt', sortOrder = 'desc' } = req.query;
    
    console.log('Récupération des étudiants confirmés pour l\'entreprise:', companyId);
    console.log('Paramètres de filtrage:', { search, offerId, sortBy, sortOrder });

    // Construire le filtre pour les offres de l'entreprise
    let offerFilter = { entreprise_id: companyId };
    if (offerId && offerId.trim() !== '') {
      offerFilter._id = offerId;
    }

    // Trouver toutes les offres de cette entreprise
    const companyOffers = await OffreStageEmploi.find(offerFilter).select('_id titre type_offre localisation');
    const offerIds = companyOffers.map(offer => offer._id);

    if (offerIds.length === 0) {
      return res.status(200).json({
        success: true,
        confirmedStudents: [],
        totalCount: 0,
        statistics: {
          total: 0,
          completed: 0,
          completionRate: 0
        },
        message: "Aucune offre trouvée pour cette entreprise."
      });
    }

    // Construire le filtre pour les candidatures confirmées
    // IMPORTANT: Récupérer TOUTES les candidatures confirmées (accepted ET completed)
    let applicationFilter = { 
      offre: { $in: offerIds },
      confirmed: true,
      status: { $in: ['accepted', 'completed'] } // Les deux statuts possibles
    };

    console.log('Filtre final pour les candidatures:', applicationFilter);

    // Construire la requête de tri
    let sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Récupérer les candidatures confirmées avec population complète
    let confirmedApplications = await Application.find(applicationFilter)
      .populate({
        path: 'offre',
        select: 'titre type_offre localisation date_debut date_fin',
        populate: {
          path: 'entreprise_id',
          select: 'nom logo_url'
        }
      })
      .populate({
        path: 'student',
        select: 'name email profile.phone profile.linkedin profile.bio profile.dateOfBirth profile.address studyLevel specialization currentClass university'
      })
      .populate('cv', 'filename filepath uploadedAt')
      .sort(sortOptions);

    // Appliquer le filtre de recherche après population
    if (search && search.trim() !== '') {
      const searchTerm = search.toLowerCase().trim();
      confirmedApplications = confirmedApplications.filter(app => {
        const studentName = app.student?.name?.toLowerCase() || '';
        const offerTitle = app.offre?.titre?.toLowerCase() || '';
        const studentEmail = app.student?.email?.toLowerCase() || '';
        return studentName.includes(searchTerm) || 
               offerTitle.includes(searchTerm) || 
               studentEmail.includes(searchTerm);
      });
    }

    // Calculer les statistiques
    const totalConfirmed = confirmedApplications.length;
    const completedCount = confirmedApplications.filter(app => app.status === 'completed').length;
    const completionRate = totalConfirmed > 0 ? Math.round((completedCount / totalConfirmed) * 100) : 0;

    // Enrichir les données avec des informations supplémentaires
    const enrichedStudents = confirmedApplications.map(app => ({
      _id: app._id,
      student: app.student,
      offre: app.offre,
      cv: app.cv,
      confirmedAt: app.confirmedAt,
      appliedAt: app.appliedAt,
      status: app.status, // 'accepted' ou 'completed'
      finalGrade: app.finalGrade || null,
      review: app.review || '',
      notes: app.notes || '',
      reviewedAt: app.reviewedAt,
      coverLetter: app.coverLetter,
      // Déterminer le statut d'affichage
      displayStatus: app.status === 'completed' ? 'terminé' : 'confirmé'
    }));

    console.log(`${totalConfirmed} étudiants confirmés trouvés après filtrage.`);
    console.log(`${completedCount} étudiants terminés (${completionRate}% de completion).`);

    res.status(200).json({
      success: true,
      confirmedStudents: enrichedStudents,
      totalCount: totalConfirmed,
      statistics: {
        total: totalConfirmed,
        completed: completedCount,
        pending: totalConfirmed - completedCount,
        completionRate: completionRate
      },
      appliedFilters: { search, offerId, sortBy, sortOrder }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants confirmés:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des étudiants confirmés.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};