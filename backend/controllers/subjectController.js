import mongoose from 'mongoose';
import { emitSubjectEvent } from '../events/index.js';
import Assignment from '../models/Assignment.js'; // Importer le modèle Assignment
import Defense from '../models/Defense.js';
import ProfessorModel from '../models/ProfessorModel.js';
import Report from '../models/Report.js';
import Subject from '../models/Subject.js';
import UserModel from '../models/userModel.js';
// Soumettre un projet
export const submitSubject = async (req, res) => {
    try {
        const { title, description, technologies, company, speciality } = req.body;
        const userId = req.body.userId; 
        
        console.log("[submitSubject] Received userId:", userId);

        if (!userId) {
            console.error("[submitSubject] userId is missing from req.body");
            return res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié ou ID manquant" 
            });
        }

        if (!title || !description || !company) {
            return res.status(400).json({
                success: false,
                message: "Titre, description et entreprise sont requis"
            });
        }

        // ÉTAPE CRUCIALE : Récupérer l'utilisateur pour obtenir son université
        const user = await UserModel.findById(userId).populate('university');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        if (!user.university) {
            return res.status(400).json({
                success: false,
                message: "L'utilisateur n'est associé à aucune université"
            });
        }

        console.log("[submitSubject] User university:", user.university._id);

        // Créer le nouveau sujet avec l'ID de l'université de l'étudiant
        const newSubject = await Subject.create({
            title,
            description,
            technologies: technologies || [],
            company,
            speciality: speciality || [],
            proposedBy: userId,
            university: user.university._id, // 🎯 AJOUT AUTOMATIQUE DE L'UNIVERSITÉ
            status: 'suggested'
        });

        // Mettre à jour le statut de l'étudiant
        await UserModel.findByIdAndUpdate(userId, {
            'studentData.pfeSubmitted': true
        });

        console.log("[submitSubject] Subject created successfully:", newSubject._id);
        console.log("[submitSubject] Associated with university:", user.university._id);

        res.status(201).json({ 
            success: true, 
            data: newSubject,
            message: "Sujet soumis avec succès et associé à votre université"
        });

    } catch (error) {
        console.error("[submitSubject] Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la soumission du projet." 
        });
    }
};

// Nom de fichier probable : controllers/reportController.js


// Fonction pour récupérer les sujets assignés à l'étudiant (inchangée)
export const getMyAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }
    
    const assignments = await Assignment.find({ 
      student: studentId, 
      status: 'assigned' 
    })
    .populate('subject', 'title')
    .sort({ createdAt: -1 });
    
    console.log(`[getMyAssignments] Found ${assignments.length} confirmed assignments for student ${studentId}`);
    
    return res.status(200).json(assignments);
  } catch (error) {
    console.error('[getMyAssignments] Error fetching assignments:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching assignments"
    });
  }
};

// Nom de fichier : controllers/subjectController.js

// ... (importations et autres fonctions)

// --- FONCTION submitReport CORRIGÉE ---
export const submitReport = async (req, res) => {
  try {
    const { fileUrl, subjectId, studentName, cinNumber } = req.body;
    const studentId = req.user.id;

    console.log("[submitReport] Received data:", { fileUrl, subjectId, studentId, studentName, cinNumber });

    if (!fileUrl || !subjectId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log("[submitReport] Checking for existing report...");
    const existingReport = await Report.findOne({ student: studentId, subject: subjectId });
    
    if (existingReport) {
      // If report exists and is rejected, update it (resubmission)
      if (existingReport.status === 'rejected') {
        console.log("[submitReport] Resubmitting rejected report...");
        
        existingReport.fileUrl = fileUrl;
        existingReport.status = 'pending';
        existingReport.feedback = ''; // Clear previous feedback
        if (studentName) existingReport.studentName = studentName;
        if (cinNumber) existingReport.cinNumber = cinNumber;

        await existingReport.save();

        console.log("[submitReport] Report resubmitted successfully:", existingReport._id);

        return res.status(200).json({
          success: true,
          message: "Report resubmitted successfully",
          report: existingReport
        });
      } else {
        // If report exists and is not rejected, don't allow resubmission
        return res.status(409).json({ 
          success: false, 
          message: "You have already submitted a report for this subject",
          status: existingReport.status 
        });
      }
    }

    console.log("[submitReport] Verifying assignment...");
    const assignment = await Assignment.findOne({ student: studentId, subject: subjectId, status: 'assigned' });
    if (!assignment) {
      return res.status(403).json({ success: false, message: "You are not assigned to this subject" });
    }

    console.log("[submitReport] Creating new report...");
    const newReport = new Report({
      student: studentId,
      subject: subjectId,
      fileUrl: fileUrl,
      type: 'final',
      status: 'pending',
      studentName: studentName || '',
      cinNumber: cinNumber || ''
    });

    await newReport.save();

    console.log("[submitReport] Report created successfully:", newReport._id);

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report: newReport
    });

  } catch (error) {
    console.error('[submitReport] Error submitting report:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "An error occurred while submitting the report" });
  }
};

export const getMySubmission = async (req, res) => {
  console.log("\n--- [getMySubmission] DÉBUT DE LA REQUÊTE ---");
  try {
    const userId = req.user.id;
    console.log(`[LOG 1] ID de l'utilisateur authentifié: ${userId}`);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    const { subjectId } = req.query;
    console.log(`[LOG 2] ID du sujet reçu: ${subjectId}`);
    if (!subjectId) {
      return res.status(400).json({ success: false, message: "Subject ID is required." });
    }

    console.log("[LOG 3] Validation du format de l'ObjectID pour le sujet...");
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: "Invalid Subject ID format." });
    }
    console.log("[LOG 3] ... Validation réussie.");

    console.log("[LOG 4] Exécution de Report.findOne...");
    const report = await Report.findOne({
      student: userId,
      subject: subjectId,
    });

    if (!report) {
      console.log("[LOG 5] Aucun rapport trouvé. Réponse 404.");
      console.log("--- [getMySubmission] FIN (Succès, 404) ---\n");
      return res.status(404).json({ success: false, message: "No submission found for this subject." });
    }
    console.log("[LOG 5] Rapport trouvé. ID:", report._id.toString());

    console.log("[LOG 6] Exécution de report.populate('subject', 'title')...");
    await report.populate('subject', 'title');
    console.log("[LOG 6] ... Peuplement réussi.");

    console.log("[LOG 7] Envoi de la réponse 200.");
    console.log("--- [getMySubmission] FIN (Succès, 200) ---\n");
    return res.status(200).json({ success: true, report: report });

  } catch (error) {
    console.error("\n--- [getMySubmission] ERREUR FATALE DANS LE BLOC CATCH ---");
    console.error(error);
    console.error("--- FIN DU RAPPORT D'ERREUR ---\n");
    
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Check server logs.",
    });
  }
};

// Supprimer un projet
export const deleteSubject = async (req, res) => {
  try {
    // Revenir à req.body.userId comme dans le code original
    const userId = req.body.userId; 
    console.log("[deleteSubject] Received userId:", userId, "for subjectId:", req.params.id);

    if (!userId) {
        console.error("[deleteSubject] userId is missing from req.body");
        return res.status(401).json({ success: false, message: "Utilisateur non authentifié ou ID manquant" });
    }

    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      proposedBy: userId,
      status: { $in: ['suggested', 'rejected'] } 
    });

    if (!subject) {
      console.log(`[deleteSubject] Subject not found or not authorized for deletion: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Projet non trouvé, non autorisé à supprimer, ou déjà approuvé/en cours" 
      });
    }
    console.log(`[deleteSubject] Subject deleted: ${req.params.id}`);

    // Supprimer aussi l'assignation associée s'il y en avait une
    await Assignment.deleteOne({ subjectId: req.params.id });
    console.log(`[deleteSubject] Assignment potentially deleted for subject: ${req.params.id}`);

    // Mettre à jour le statut de l'étudiant
    await UserModel.findByIdAndUpdate(userId, {
      'studentData.pfeSubmitted': false
    });

    res.status(200).json({ success: true, message: "Projet supprimé" });
  } catch (error) {
    console.error("[deleteSubject] Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression du projet." });
  }
};



export const getMyDefense = async (req, res) => {
  try {
    // Check if user is authenticated (req.user should be set by authUser middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    // Use req.user.id instead of req.body.userId
    const defense = await Defense.findOne({ student: req.user.id })
      .populate('studentDetails', 'name email')
      .populate('subjectDetails', 'title code')
      .populate('juryDetails', 'name email role')
      .populate('acceptedBy', 'name')
      .populate('rejectedBy', 'name');

    if (!defense) {
      return res.status(404).json({
        success: false,
        message: "No defense scheduled yet"
      });
    }

    // Format the response
    const response = {
      id: defense._id,
      date: defense.date,
      status: defense.status,
      notes: defense.notes,
      student: defense.studentDetails,
      subject: defense.subjectDetails,
      jury: defense.juryDetails,
      acceptedBy: defense.acceptedBy,
      rejectedBy: defense.rejectedBy,
      createdAt: defense.createdAt,
      updatedAt: defense.updatedAt
    };

    res.status(200).json({ success: true, data: response });
    
  } catch (error) {
    console.error('[Defense Controller Error]:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch defense information",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Approve Subject (Ne gère plus l'assignation ici)



// Récupérer le projet de l'étudiant avec son superviseur assigné (via Assignment)
export const getStudentSubject = async (req, res) => {
  try {
    // Get userId from authenticated user (assuming it's set by an auth middleware)
    const userId = req.user.id; // Or req.userId, depending on your auth middleware
    console.log("[getStudentSubject] Received userId from auth middleware:", userId);

    if (!userId) {
        console.error("[getStudentSubject] userId is missing from req.body");
        return res.status(401).json({ success: false, message: "Utilisateur non authentifié ou ID manquant" });
    }

    // 1. Find subject proposed by student
    console.log(`[getStudentSubject] Searching for subject with proposedBy: ${userId}`);
    let subject = await Subject.findOne({ 
      proposedBy: userId 
    }).populate('proposedBy', 'name email profile')
      .lean(); // Use lean() to get a plain JS object
    
    // If no subject is found for this student
    if (!subject) {
        console.log(`[getStudentSubject] No subject found for userId: ${userId}`);
        return res.status(200).json({ success: true, data: null, message: "Aucun projet trouvé pour cet étudiant." });
    }
    console.log(`[getStudentSubject] Found subject: ${subject._id}`);

    // 2. Look for an assignment for this subject
    console.log(`[getStudentSubject] Searching for assignment with subject ID: ${subject._id}`);
    
    // IMPORTANT: Here we're not populating professor - just getting the professor ID
    const assignment = await Assignment.findOne({ subject: subject._id });
    
    if (!assignment) {
        console.log(`[getStudentSubject] No assignment found for subject ${subject._id}`);
        subject.supervisor = null;
    } else {
        console.log(`[getStudentSubject] Assignment found with professor ID: ${assignment.professor}`);
        
        // 3. Now explicitly fetch the professor details from ProfessorModel using the ID
        if (assignment.professor) {
            const professor = await ProfessorModel.findById(assignment.professor)
                .select('name email profile');
                
            if (professor) {
                console.log(`[getStudentSubject] Professor details retrieved: ${professor.name}`);
                subject.supervisor = professor;
            } else {
                console.log(`[getStudentSubject] Professor with ID ${assignment.professor} not found in database`);
                subject.supervisor = null;
            }
        } else {
            console.log(`[getStudentSubject] Assignment has no professor ID`);
            subject.supervisor = null;
        }
    }
    
    console.log("[getStudentSubject] Sending subject data:", subject);
    
    res.status(200).json({ success: true, data: subject });

  } catch (error) {
    console.error("[getStudentSubject] Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération du projet et de l'assignation." });
  }
};

// Récupérer tous les sujets en attente (status: 'suggested') - FILTRÉ PAR UNIVERSITÉ
export const getPendingSubjects = async (req, res) => {
  try {
    let filter = { status: 'suggested' };
    
    // Si c'est une université connectée, filtrer par son ID
    if (req.university) {
      filter.university = req.university.universityData.id;
      console.log(`[getPendingSubjects] Filtering for university: ${req.university.universityData.id}`);
    }
    // Si c'est un admin, pas de filtre université (voit tout)
    
    const pendingSubjects = await Subject.find(filter)
      .populate({
        path: 'proposedBy',
        select: 'name email profile cin dateOfBirth gender university studyLevel specialization currentClass academicYear studentData',
        populate: {
          path: 'university',
          select: 'name code city country'
        }
      })
      .populate('university', 'name code city country')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: pendingSubjects.length,
      data: pendingSubjects 
    });
  } catch (error) {
    console.error("[getPendingSubjects] Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des sujets en attente" 
    });
  }
};

export const approveSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    console.log(`[approveSubject] Approving subject: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID de sujet invalide" });
    }

    // Construire le filtre de recherche
    let findFilter = { _id: id };
    
    // Si c'est une université, s'assurer qu'elle ne peut approuver que ses sujets
    if (req.university) {
      findFilter.university = req.university.universityData.id;
      console.log(`[approveSubject] University ${req.university.universityData.id} trying to approve subject ${id}`);
    }

    const subject = await Subject.findOne(findFilter);
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: req.university ? "Sujet non trouvé ou non autorisé pour votre université" : "Sujet non trouvé" 
      });
    }

    // Vérifier que le sujet appartient bien à l'université (double sécurité)
    if (req.university && subject.university.toString() !== req.university.universityData.id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous n'êtes pas autorisé à approuver ce sujet" 
      });
    }

    // Mettre à jour seulement le statut et le feedback
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        feedback: feedback || "Votre sujet a été approuvé.",
      },
      { new: true }
    );

    // Populate the subject for the event
    const populatedSubject = await Subject.findById(id).populate('university');
    
    // Emit the approval event
    emitSubjectEvent('approved', populatedSubject.toObject());

    console.log(`[approveSubject] Subject ${id} approved successfully by ${req.university ? 'university' : 'admin'}.`);
    res.status(200).json({ 
        success: true, 
        message: "Sujet approuvé avec succès. L'assignation du superviseur doit être faite séparément.", 
        data: updatedSubject 
    });

  } catch (error) {
    console.error("[approveSubject] Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'approbation du sujet" });
  }
};

// Reject Subject - FILTRÉ PAR UNIVERSITÉ
export const rejectSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    console.log(`[rejectSubject] Rejecting subject: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID de sujet invalide" });
    }

    if (!feedback) {
      return res.status(400).json({ success: false, message: "Un feedback est requis pour rejeter un sujet" });
    }

    // Construire le filtre de recherche
    let findFilter = { _id: id };
    
    // Si c'est une université, s'assurer qu'elle ne peut rejeter que ses sujets
    if (req.university) {
      findFilter.university = req.university.universityData.id;
      console.log(`[rejectSubject] University ${req.university.universityData.id} trying to reject subject ${id}`);
    }

    const subject = await Subject.findOne(findFilter);
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: req.university ? "Sujet non trouvé ou non autorisé pour votre université" : "Sujet non trouvé" 
      });
    }

    // Vérifier que le sujet appartient bien à l'université (double sécurité)
    if (req.university && subject.university.toString() !== req.university.universityData.id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous n'êtes pas autorisé à rejeter ce sujet" 
      });
    }

    // Mettre à jour statut, feedback et s'assurer que supervisor est null
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { status: 'rejected', feedback, supervisor: null }, 
      { new: true }
    );

    // Populate the subject for the event
    const populatedSubject = await Subject.findById(id).populate('university');
    
    // Emit the rejection event
    emitSubjectEvent('rejected', populatedSubject.toObject());

    // Supprimer l'assignation si elle existait
    await Assignment.deleteOne({ subjectId: id });
    console.log(`[rejectSubject] Assignment potentially deleted for subject: ${id}`);

    console.log(`[rejectSubject] Subject ${id} rejected successfully by ${req.university ? 'university' : 'admin'}.`);
    res.status(200).json({ success: true, message: "Sujet rejeté avec succès", data: updatedSubject });
  } catch (error) {
    console.error("[rejectSubject] Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors du rejet du sujet" });
  }
};

// Get all subjects with complete population - FILTRÉ PAR UNIVERSITÉ
export const getAllSubjects = async (req, res) => {
  try {
    const { status, company, search } = req.query;
    const filter = {};
    
    // Filtrage par université si c'est une université connectée
    if (req.university) {
      filter.university = req.university.universityData.id;
      console.log(`[getAllSubjects] Filtering for university: ${req.university.universityData.id}`);
    }
    
    if (status) filter.status = status;
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let subjects = await Subject.find(filter)
      .populate({
        path: 'proposedBy',
        select: 'name email profile cin dateOfBirth gender university studyLevel specialization currentClass academicYear studentData',
        populate: {
          path: 'university',
          select: 'name code city country'
        }
      })
      .populate('university', 'name code city country')
      .sort({ createdAt: -1 })
      .lean(); 

    // For each subject, find assignment and add supervisor
    for (let subject of subjects) {
        const assignment = await Assignment.findOne({ subject: subject._id })
                                         .populate('professor', 'name email profile');
        if (assignment && assignment.professor) {
            subject.supervisor = assignment.professor;
        } else {
            subject.supervisor = null;
        }
    }

    console.log(`[getAllSubjects] Found ${subjects.length} subjects for ${req.university ? 'university' : 'admin'}`);
    res.status(200).json({ 
      success: true, 
      count: subjects.length,
      data: subjects 
    });
  } catch (error) {
    console.error("[getAllSubjects] Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des sujets" 
    });
  }
};

// Get subject by ID with complete population - FILTRÉ PAR UNIVERSITÉ
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sujet invalide"
      });
    }
    
    // Construire le filtre de recherche
    let findFilter = { _id: id };
    
    // Si c'est une université, filtrer par son ID
    if (req.university) {
      findFilter.university = req.university.universityData.id;
      console.log(`[getSubjectById] University ${req.university.universityData.id} requesting subject ${id}`);
    }
    
    let subject = await Subject.findOne(findFilter)
      .populate({
        path: 'proposedBy',
        select: 'name email profile cin dateOfBirth gender university studyLevel specialization currentClass academicYear studentData',
        populate: {
          path: 'university',
          select: 'name code city country'
        }
      })
      .populate('university', 'name code city country')
      .lean(); 
    
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: req.university ? "Sujet non trouvé ou non autorisé pour votre université" : "Sujet non trouvé" 
      });
    }

    // Look for assignment
    const assignment = await Assignment.findOne({ subject: subject._id })
                                     .populate('professor', 'name email profile');
    if (assignment && assignment.professor) {
        subject.supervisor = assignment.professor;
    } else {
        subject.supervisor = null;
    }

    res.status(200).json({ 
      success: true, 
      data: subject 
    });
  } catch (error) {
    console.error("[getSubjectById] Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du sujet" 
    });
  }
};