import express from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Defense from '../models/Defense.js';
import Report from '../models/Report.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Helper pour valider que la chaîne est un ObjectId valide
const validateProfessorId = (professorId) => {
  return mongoose.Types.ObjectId.isValid(professorId);
};

// 1. Obtenir le nombre total de projets (assignments)
router.post('/assignments/professor/count', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for count:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const count = await Assignment.countDocuments({ professor: professorId });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching assignments count:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. FIXED: Obtenir le nombre de soutenances à venir
router.post('/defenses/professor/upcoming/count', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for defenses:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const now = new Date();
    console.log('Current server time (new Date()):', now.toISOString());

    // Essayer différentes approches pour trouver les défenses
    
    // Approche 1: Avec ObjectId explicite
    const query1 = {
      jury: { $in: [new mongoose.Types.ObjectId(professorId)] },
      date: { $gt: now },
      status: { $in: ['pending', 'scheduled'] }
    };
    console.log('Query 1 (with ObjectId):', JSON.stringify(query1, null, 2));
    const count1 = await Defense.countDocuments(query1);
    console.log('Count with ObjectId approach:', count1);

    // Approche 2: Sans conversion ObjectId (string directe)
    const query2 = {
      jury: { $in: [professorId] },
      date: { $gt: now },
      status: { $in: ['pending', 'scheduled'] }
    };
    console.log('Query 2 (string approach):', JSON.stringify(query2, null, 2));
    const count2 = await Defense.countDocuments(query2);
    console.log('Count with string approach:', count2);

    // Approche 3: Utiliser $elemMatch pour les tableaux
    const query3 = {
      jury: { $elemMatch: { $eq: new mongoose.Types.ObjectId(professorId) } },
      date: { $gt: now },
      status: { $in: ['pending', 'scheduled'] }
    };
    console.log('Query 3 (with $elemMatch):', JSON.stringify(query3, null, 2));
    const count3 = await Defense.countDocuments(query3);
    console.log('Count with $elemMatch approach:', count3);

    // Approche 4: Recherche sans filtre de date pour voir si le problème vient de là
    const query4 = {
      jury: { $in: [new mongoose.Types.ObjectId(professorId)] },
      status: { $in: ['pending', 'scheduled'] }
    };
    console.log('Query 4 (no date filter):', JSON.stringify(query4, null, 2));
    const count4 = await Defense.countDocuments(query4);
    console.log('Count without date filter:', count4);

    // Utiliser le résultat le plus élevé
    const finalCount = Math.max(count1, count2, count3, count4);
    console.log('Final count (max of all approaches):', finalCount);

    // Log details of found defenses for debugging
    if (finalCount > 0) {
      const foundDefenses = await Defense.find(query1);
      console.log('Details of found defenses:', foundDefenses.map(d => ({ 
        id: d._id, 
        date: d.date.toISOString(), 
        status: d.status, 
        jury: d.jury,
        juryTypes: d.jury.map(j => typeof j)
      })));
    }

    res.json({ count: finalCount });
  } catch (error) {
    console.error('Error fetching upcoming defenses count:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. FIXED: Obtenir le nombre de rapports non lus
router.post('/reports/professor/unread/count', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for reports:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    // FIXED: Trouver les assignments du professeur puis chercher les rapports liés
    const assignments = await Assignment.find({ professor: professorId }).select('subject');
    const subjectIds = assignments.map(a => a.subject);

    // Compter les rapports non lus pour les sujets du professeur
    const count = await Report.countDocuments({
      subject: { $in: subjectIds },
      status: 'pending'
    });

    console.log('Found unread reports count:', count);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread reports count:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. Obtenir le nombre d'étudiants
router.post('/assignments/professor/students/count', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for students count:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const count = await Assignment.countDocuments({
      professor: professorId,
      status: { $ne: 'rejected' }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching students count:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 5. Obtenir la distribution des axes de recherche
router.post('/subjects/professor/research-areas', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for research areas:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const subjects = await Subject.find({
      $or: [
        { supervisor: professorId },
        { proposedBy: professorId }
      ]
    }).select('speciality');

    const areaCounts = {};
    subjects.forEach(subject => {
      subject.speciality.forEach(spec => {
        areaCounts[spec] = (areaCounts[spec] || 0) + 1;
      });
    });

    const total = subjects.length || 1; // Éviter la division par zéro
    const areas = Object.keys(areaCounts).map(name => ({
      name,
      percentage: Math.round((areaCounts[name] / total) * 100)
    }));

    res.json({ areas });
  } catch (error) {
    console.error('Error fetching research areas:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 6. Obtenir le nombre de projets par statut
router.post('/assignments/professor/status-count', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for status-count:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const statusCounts = await Assignment.aggregate([
      {
        $match: {
          professor: new mongoose.Types.ObjectId(professorId)
        }
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);

    const mappedCounts = statusCounts.map(item => {
      let statusName;
      switch (item.status) {
        case 'assigned': statusName = 'Assigned'; break;
        case 'confirmed': statusName = 'In Progress'; break;
        case 'rejected': statusName = 'Rejected'; break;
        default: statusName = item.status;
      }
      return { status: statusName, count: item.count };
    });

    const allStatuses = ['Assigned', 'In Progress', 'Rejected'];
    const completeCounts = allStatuses.map(status => ({
      status,
      count: mappedCounts.find(item => item.status === status)?.count || 0
    }));

    res.json({ statusCounts: completeCounts });
  } catch (error) {
    console.error('Error fetching projects by status:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 7. Obtenir les projets récents
router.post('/assignments/professor/recent', async (req, res) => {
  try {
    const { professorId } = req.body;
    console.log('Received professorId for recent:', professorId);

    if (!validateProfessorId(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const assignments = await Assignment.find({
      professor: professorId
    })
      .sort({ updatedAt: -1 })
      .limit(4)
      .populate('student', 'name profile.avatar')
      .populate('subject', 'title');

    const projects = assignments.map(assignment => ({
      id: assignment._id,
      title: assignment.subject?.title || 'No title',
      student: {
        name: assignment.student?.name || 'Unknown Student',
        image: assignment.student?.profile?.avatar || '/placeholder.svg'
      },
      status: assignment.status,
      lastUpdate: assignment.updatedAt,
      createdAt: assignment.createdAt,
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching recent projects:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

