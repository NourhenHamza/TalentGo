import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import ProgressUpdate from '../models/ProgressUpdate.js';

// --- FONCTION UTILITAIRE DYNAMIQUE ---
/**
 * Calcule le numéro de la semaine ISO 8601 pour une date donnée.
 * @param {Date} d - La date pour laquelle calculer la semaine.
 * @returns {number} Le numéro de la semaine.
 */
const getWeekNumber = (d) => {
  // Copie de la date pour ne pas modifier l'original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Le jeudi de la même semaine détermine le numéro de la semaine
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Date du premier jour de l'année
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calcul du numéro de la semaine
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

// Debug endpoint to check progress entries for all weeks
export const debugGetAllProgress = async (req, res) => {
  try {
    const professorId = req.professor.id;
    
    // Find all assignments for this professor
    const assignments = await Assignment.find({ professor: professorId }).lean();
    
    if (!assignments || assignments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No students assigned to this professor",
        data: []
      });
    }
    
    const studentIds = assignments.map(assignment => assignment.student);
    
    // Get weeks with progress entries
    const weeks = await ProgressUpdate.distinct('week', {
      studentId: { $in: studentIds }
    });
    
    // Count progress entries per week
    const weekCounts = await Promise.all(weeks.map(async (week) => {
      const count = await ProgressUpdate.countDocuments({
        studentId: { $in: studentIds },
        week: week
      });
      
      return { week, count };
    }));
    
    // Get current week number
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const currentWeek = Math.floor(diff / oneWeek) + 1;
    
    return res.status(200).json({
      success: true,
      data: {
        studentCount: studentIds.length,
        weeks: weekCounts.sort((a, b) => b.week - a.week),
        currentWeek
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred',
      error: error.message
    });
  }
};

// FONCTION CORRIGÉE: Récupérer la progression de la semaine en cours avec les informations du projet
export const getCurrentWeekProgress = async (req, res) => {
  try {
    const professorObjectId = req.professor.id;

    // Trouver toutes les affectations pour ce professeur
    const assignments = await Assignment.find({ professor: professorObjectId })
      .populate('subject', 'title') // Peupler les informations du sujet
      .lean();

    if (!assignments || assignments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        currentWeek: 0,
        message: "Aucune affectation trouvée pour ce professeur."
      });
    }

    const studentIds = assignments.map(assignment => assignment.student);

    // Trouver la progression la plus récente
    const latestProgress = await ProgressUpdate.findOne({
      studentId: { $in: studentIds }
    }).sort({ week: -1 }).lean();

    if (!latestProgress) {
      return res.status(200).json({
        success: true,
        data: [],
        currentWeek: 0,
        message: "Aucune progression trouvée."
      });
    }

    const mostRecentWeek = latestProgress.week;

    // Récupérer toutes les progressions de la semaine la plus récente
    const progressUpdates = await ProgressUpdate.find({
      studentId: { $in: studentIds },
      week: mostRecentWeek
    })
    .populate('studentId', 'name') // Récupérer le nom de l'étudiant
    .sort({ createdAt: -1 })
    .lean();

    // Enrichir chaque progression avec les informations du projet via Assignment
    const enrichedProgressUpdates = progressUpdates.map(progress => {
      // Trouver l'affectation correspondante pour cet étudiant
      const assignment = assignments.find(
        assign => assign.student.toString() === progress.studentId._id.toString()
      );

      return {
        ...progress,
        subjectId: assignment ? assignment.subject : null
      };
    });

    console.log('[DEBUG] Données enrichies envoyées au frontend:', enrichedProgressUpdates);

    return res.status(200).json({ 
      success: true, 
      data: enrichedProgressUpdates, 
      currentWeek: mostRecentWeek 
    });

  } catch (error) {
    console.error('Erreur dans getCurrentWeekProgress:', error);
    return res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur.', 
        error: error.message 
    });
  }
};

// FONCTION CORRIGÉE: Récupérer l'historique des progressions avec les informations du projet
export const getAllProgressHistory = async (req, res) => {
  try {
    const professorId = req.professor.id;
    const { week, studentId } = req.query;

    console.log('[DEBUG] getAllProgressHistory called with:', { professorId, week, studentId });

    // ÉTAPE 1: Trouver toutes les affectations pour ce professeur (SANS filtrer par université ici)
    const assignments = await Assignment.find({ 
      professor: professorId
    })
    .populate('subject', 'title') // Peupler les informations du sujet
    .lean();

    console.log('[DEBUG] Assignments trouvées:', assignments.length);

    if (!assignments || assignments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Aucune affectation trouvée pour ce professeur."
      });
    }

    const studentIds = assignments.map(assignment => assignment.student);
    console.log('[DEBUG] Student IDs:', studentIds);

    // ÉTAPE 2: Construire la requête pour ProgressUpdate
    const query = {
      studentId: { $in: studentIds }
    };

    if (week && week !== 'all') {
      query.week = parseInt(week);
    }
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      query.studentId = studentId;
    }

    console.log('[DEBUG] Query pour ProgressUpdate:', query);

    // ÉTAPE 3: Récupérer les progressions
    const progressUpdates = await ProgressUpdate.find(query)
      .populate('studentId', 'name') // Récupérer le nom de l'étudiant
      .sort({ week: -1, createdAt: -1 })
      .lean();

    console.log('[DEBUG] ProgressUpdates trouvées:', progressUpdates.length);

    // ÉTAPE 4: Enrichir chaque progression avec les informations du projet via Assignment
    const enrichedProgressUpdates = progressUpdates.map(progress => {
      // Trouver l'affectation correspondante pour cet étudiant
      const assignment = assignments.find(
        assign => assign.student.toString() === progress.studentId._id.toString()
      );

      return {
        ...progress,
        subjectId: assignment ? assignment.subject : null
      };
    });

    console.log('[DEBUG] Données enrichies:', enrichedProgressUpdates.length);

    return res.status(200).json({ 
      success: true, 
      data: enrichedProgressUpdates 
    });

  } catch (error) {
    console.error('Erreur dans getAllProgressHistory:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur du serveur lors de la récupération de l\'historique.', 
      error: error.message 
    });
  }
};