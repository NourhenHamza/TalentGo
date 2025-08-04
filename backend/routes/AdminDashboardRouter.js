import express from 'express';
import mongoose from 'mongoose';
import Defense from '../models/Defense.js';
import Professor from '../models/ProfessorModel.js';
import Subject from '../models/Subject.js';
import User from '../models/userModel.js';


const router = express.Router();

// Endpoint to fetch dashboard statistics (unprotected)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching dashboard data with query:', req.query);
    const universityId = req.query.universityId;

    if (!universityId) {
      return res.status(400).json({ success: false, message: 'University ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(universityId)) {
      return res.status(400).json({ success: false, message: 'Invalid university ID' });
    }

    // Fetch counts
    const professorsCount = await Professor.countDocuments({ university: universityId });
    const studentsCount = await User.countDocuments({ university: universityId });
    const projectsCount = await Subject.countDocuments({ university: universityId, status: 'approved' });
    const defensesScheduledCount = await Defense.countDocuments({ 
      university: universityId, 
      status: 'scheduled' 
    });

    // Fetch new counts for the week/month/semester
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const semesterStart = new Date(new Date().getFullYear(), 8, 1);

    const professorsNew = await Professor.countDocuments({ 
      university: universityId, 
      createdAt: { $gte: oneWeekAgo } 
    });
    const studentsNew = await User.countDocuments({ 
      university: universityId, 
      createdAt: { $gte: semesterStart } 
    });
    const projectsNew = await Subject.countDocuments({ 
      university: universityId, 
      createdAt: { $gte: oneMonthAgo }, 
      status: 'approved' 
    });
    const defensesUpcoming = await Defense.countDocuments({ 
      university: universityId, 
      status: 'scheduled', 
      date: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } 
    });

    // Calculate percentages
    const totalProjects = await Subject.countDocuments({ university: universityId });
    const completedProjects = await Subject.countDocuments({ 
      university: universityId, 
      status: 'approved' 
    });
    const projectCompletion = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    const totalDefenses = await Defense.countDocuments({ university: universityId });
    const scheduledDefenses = await Defense.countDocuments({ 
      university: universityId, 
      status: 'scheduled' 
    });
    const defensePreparation = totalDefenses > 0 ? Math.round((scheduledDefenses / totalDefenses) * 100) : 0;

    const approvedReports = await User.countDocuments({ 
      university: universityId, 
      'studentData.finalReportApproved': true 
    });
    const totalStudents = await User.countDocuments({ university: universityId });
    const documentation = totalStudents > 0 ? Math.round((approvedReports / totalStudents) * 100) : 0;

    const responseData = {
      Professors: professorsCount || 0,
      Students: studentsCount || 0,
      Projects: projectsCount || 0,
      DefensesScheduled: defensesScheduledCount || 0,
      ProfessorsNew: professorsNew || 0,
      StudentsNew: studentsNew || 0,
      ProjectsNew: projectsNew || 0,
      DefensesUpcoming: defensesUpcoming || 0,
      ProjectCompletion: projectCompletion || 0,
      DefensePreparation: defensePreparation || 0,
      Documentation: documentation || 0,
    };

    console.log('Dashboard response data:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/defenses/upcoming', async (req, res) => {
  try {
    console.log('Fetching upcoming defenses with query:', req.query);
    const universityId = req.query.universityId;

    if (!universityId) {
      return res.status(400).json({ success: false, message: 'University ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(universityId)) {
      return res.status(400).json({ success: false, message: 'Invalid university ID' });
    }

    const defenses = await Defense.find({ 
      university: universityId, 
      status: 'scheduled', 
      date: { $gte: new Date() } 
    })
      .populate({
        path: 'student',
        select: 'name',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'subject',
        select: 'title',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'jury',
        select: 'name',
        options: { strictPopulate: false }
      })
      .sort({ date: 1 })
      .limit(5)
      .lean();

    console.log('Raw defenses data:', defenses);

    const formattedDefenses = defenses.map(defense => {
      const studentName = defense.student?.name || 'Unknown';
      const projectTitle = defense.subject?.title || 'Unknown';
      const supervisorName = defense.jury?.[0]?.name || 'Unknown';
      
      if (studentName === 'Unknown') console.warn(`Student not found for defense: ${defense._id}`);
      if (supervisorName === 'Unknown') console.warn(`Jury not found for defense: ${defense._id}`);
      
      return {
        studentName,
        projectTitle,
        supervisorName,
        date: defense.date,
        status: defense.status, // Ajout du statut
      };
    });

    console.log('Upcoming defenses response:', formattedDefenses);
    res.json(formattedDefenses);
  } catch (error) {
    console.error('Error fetching upcoming defenses:', error);
    res.status(500).json({ success: false, message: 'Internal server error', data: [] });
  }
});
router.get('/projects/status-analytics', async (req, res) => {
  try {
    console.log('Fetching project status analytics with query:', req.query);
    const universityId = req.query.universityId;

    if (!universityId) {
      return res.status(400).json({ success: false, message: 'University ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(universityId)) {
      return res.status(400).json({ success: false, message: 'Invalid university ID' });
    }

    // Récupérer les données de statut des projets groupées par statut
    const statusCounts = await Subject.aggregate([
      {
        $match: { university: new mongoose.Types.ObjectId(universityId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Récupérer les données de statut des projets par mois pour la courbe temporelle
    const monthlyData = await Subject.aggregate([
      {
        $match: { 
          university: new mongoose.Types.ObjectId(universityId),
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), 0, 1) // Depuis le début de l'année
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Récupérer les données de statut des projets par spécialité
    const specialityData = await Subject.aggregate([
      {
        $match: { university: new mongoose.Types.ObjectId(universityId) }
      },
      {
        $unwind: '$speciality'
      },
      {
        $group: {
          _id: {
            speciality: '$speciality',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Formater les données pour le frontend
    const statusDistribution = {
      suggested: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    statusCounts.forEach(item => {
      if (statusDistribution.hasOwnProperty(item._id)) {
        statusDistribution[item._id] = item.count;
      }
    });

    // Formater les données mensuelles pour la courbe
    const monthlyStatusData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialiser les données pour chaque mois
    months.forEach((month, index) => {
      monthlyStatusData[month] = {
        suggested: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    });

    // Remplir avec les données réelles
    monthlyData.forEach(item => {
      const monthName = months[item._id.month - 1];
      if (monthlyStatusData[monthName] && monthlyStatusData[monthName].hasOwnProperty(item._id.status)) {
        monthlyStatusData[monthName][item._id.status] = item.count;
      }
    });

    // Formater les données par spécialité
    const specialityStatusData = {};
    specialityData.forEach(item => {
      if (!specialityStatusData[item._id.speciality]) {
        specialityStatusData[item._id.speciality] = {
          suggested: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
      }
      specialityStatusData[item._id.speciality][item._id.status] = item.count;
    });

    const responseData = {
      statusDistribution,
      monthlyData: monthlyStatusData,
      specialityData: specialityStatusData,
      totalProjects: Object.values(statusDistribution).reduce((sum, count) => sum + count, 0)
    };

    console.log('Project status analytics response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching project status analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


export default router;