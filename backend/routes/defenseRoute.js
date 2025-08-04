import express from 'express';
import moment from 'moment';
import mongoose from 'mongoose';
import { emitDefenseEvent } from '../events/index.js';
import authAdmin from "../middlewars/authAdmin.js";
import Availability from '../models/Availability.js';
import Defense from '../models/Defense.js';
import Professor from '../models/ProfessorModel.js';
import Report from '../models/Report.js';
import Subject from '../models/Subject.js';
import University from "../models/University.js";
const router = express.Router();

// Get all professor availabilities organized by day
router.get('/allProfessorAvailability', authAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get the university from the authenticated request
    let universityId;
    
    if (req.university) {
      // If it's a university user, get their university ID
      universityId = req.university.universityData.id;
    } else if (req.admin) {
      // If it's an admin, they can see all (optional: you can restrict this too)
      // For now, let's assume admin can see all universities
      universityId = null;
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    console.log('Filtering by university:', universityId);

    // Build the base filter for availability
    const filter = { active: true };

    // Add date filtering if provided
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDateObj;
      }

      filter.availableSlots = {
        $elemMatch: {
          date: dateFilter
        }
      };
    }

    // Find availabilities and populate professor with university filter
    const availabilities = await Availability.find(filter).populate({
      path: 'professor',
      select: 'name email professorData university',
      // Only include professors from the same university
      match: universityId ? { university: universityId } : {}
    });

    const availabilityByDay = {};

    for (const availability of availabilities) {
      // Skip if professor is null (didn't match university filter) or doesn't exist
      if (!availability.professor) {
        continue;
      }
      
      const professor = availability.professor;
      
      // Double-check university matching (extra security)
      if (universityId && professor.university.toString() !== universityId.toString()) {
        continue;
      }
      
      const professorInfo = {
        professorId: professor._id,
        name: professor.name,
        email: professor.email,
        currentDefenses: professor.professorData?.currentDefenses || 0,
        maxDefenses: professor.professorData?.maxDefenses || 10,
        university: professor.university // Include university for debugging
      };
      
      for (const slot of availability.availableSlots) {
        if (!slot.date || !slot.time) {
          continue;
        }
        
        const slotDate = new Date(slot.date);
        const dateKey = slotDate.toISOString().split('T')[0];
        
        if (!availabilityByDay[dateKey]) {
          availabilityByDay[dateKey] = [];
        }
        
        availabilityByDay[dateKey].push({
          ...professorInfo,
          time: slot.time
        });
      }
    }

    console.log(`Found ${Object.keys(availabilityByDay).length} days with availability for university:`, universityId);

    return res.json({
      success: true,
      message: `Professor availabilities retrieved successfully (${Object.keys(availabilityByDay).length} days)`,
      availability: availabilityByDay,
      universityId: universityId // For debugging
    });
  } catch (error) {
    console.error('Error fetching professor availabilities:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching professor availabilities',
      error: error.message
    });
  }
});
 router.post('/request', async (req, res) => {
  try {
    const { preferredDate, notes, studentId, universityId } = req.body;
    
    // Validation de l'université
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ 
        success: false, 
        message: 'University not found' 
      });
    }

    // Validation de l'étudiant
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid student ID is required' 
      });
    }

    // Récupération du sujet proposé par l'étudiant
    const subject = await Subject.findOne({ proposedBy: studentId });
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: 'No subject found for this student' 
      });
    }

    // Validation de la date
    if (!preferredDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Defense date and time are required' 
      });
    }

    const defenseDate = new Date(preferredDate);
    if (isNaN(defenseDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid date format' 
      });
    }

    if (defenseDate < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Defense date must be in the future' 
      });
    }

    // Vérification des défenses existantes
    const existingDefense = await Defense.findOne({
      student: studentId,
      subject: subject._id,
      status: { $in: ['pending', 'scheduled', 'completed'] }
    }).lean();

    if (existingDefense) {
      return res.status(409).json({
        success: false,
        message: 'You already have a defense request for this subject',
        existingDefenseId: existingDefense._id,
        existingDefenseStatus: existingDefense.status
      });
    }

    // Vérification du rapport final validé (avec débogage)
    const existingReport = await Report.findOne({
      student: studentId,
      subject: subject._id,
      type: 'final',
      status: 'validated'
    }).lean();

    if (!existingReport) {
      // Récupération de tous les rapports pour débogage
      const allStudentReports = await Report.find({
        student: studentId,
        subject: subject._id
      }).lean();

      return res.status(403).json({
        success: false,
        message: 'You must have a validated final report for this subject',
        debugInfo: {
          searchedCriteria: {
            student: studentId,
            subject: subject._id,
            type: 'final',
            status: 'validated'
          },
          existingReports: allStudentReports.map(r => ({
            id: r._id,
            type: r.type,
            status: r.status,
            createdAt: r.createdAt
          }))
        }
      });
    }

    // Création de la défense
    const defense = new Defense({
      student: studentId,
      subject: subject._id,
      date: defenseDate,
      status: 'pending',
      university: universityId,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await defense.save();

    // Peuplement des données pour la réponse
    const populatedDefense = await Defense.findById(defense._id)
      .populate('student', '_id name email')
      .populate('subject', '_id title code')
      .populate('university', '_id name');
      // Déclencher l'événement 'defense:requested'
    // Assurez-vous que populatedDefense contient toutes les données nécessaires pour le template
    emitDefenseEvent('requested', populatedDefense.toObject());

    // Réponse succès
    return res.status(201).json({
      success: true,
      message: 'Defense request submitted successfully',
      defense: {
        id: populatedDefense._id,
        student: {
          id: populatedDefense.student._id,
          name: populatedDefense.student.name,
          email: populatedDefense.student.email
        },
        subject: {
          id: populatedDefense.subject._id,
          title: populatedDefense.subject.title,
          code: populatedDefense.subject.code
        },
        university: {
          id: populatedDefense.university._id,
          name: populatedDefense.university.name
        },
        date: populatedDefense.date,
        status: populatedDefense.status,
        notes: populatedDefense.notes,
        createdAt: populatedDefense.createdAt
      }
    });

  } catch (error) {
    console.error('Defense creation error:', error);
    
    // Journalisation plus détaillée en développement
    const errorResponse = {
      success: false,
      message: 'An unexpected error occurred',
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
      errorResponse.fullError = JSON.stringify(error, Object.getOwnPropertyNames(error));
    }

    return res.status(500).json(errorResponse);
  }
});
// Dans votre fichier de routes pour les sujets (ex: subjectRoutes.js)
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const subject = await Subject.findOne({ proposedBy: studentId })
      .select('_id title code description proposedBy');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'No subject found for this student' });
    }

    return res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching student subject:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching student subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

 
router.get('/list', async (req, res) => {
  try {
    const { studentName, subject, universityId } = req.query;

    // Validate universityId if provided
    if (universityId && !mongoose.Types.ObjectId.isValid(universityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid university ID',
      });
    }

    // Build the match stage for the aggregation pipeline
    const matchStage = {
      status: 'pending',
    };

    // Add additional filters if provided
    if (studentName) matchStage['student.name'] = { $regex: studentName, $options: 'i' };
    if (subject) matchStage['subject.title'] = { $regex: subject, $options: 'i' };
    if (universityId) matchStage.university = new mongoose.Types.ObjectId(universityId); // Fixed: Use 'new' to instantiate ObjectId

    // Use aggregation pipeline for more control
    const defenses = await Defense.aggregate([
      { $match: matchStage },
      { $addFields: { jurySize: { $size: { $ifNull: ["$jury", []] } } } },
      { $match: { jurySize: 0 } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'jury',
          foreignField: '_id',
          as: 'jury',
        },
      },
    ]);

    console.log('Found defenses:', defenses.length); // Log the number of defenses found

    res.status(200).json({
      success: true,
      defenses,
    });
  } catch (error) {
    console.error('Defense list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch defenses',
    });
  }
});




 
// ... (vos autres routes)

router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid defense ID' });
    }

    const defense = await Defense.findById(id);
    if (!defense) {
      return res.status(404).json({ success: false, message: 'Defense not found' });
    }

    if (defense.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Defense is not in pending status' });
    }

    // Mettre à jour le statut de la soutenance à 'scheduled' (comme demandé par l'université)
    defense.status = 'scheduled';
    // Si vous avez un champ 'acceptedBy' qui stocke l'ID de l'université qui accepte
    // defense.acceptedBy.push(req.user.universityId); // Exemple si l'université est authentifiée
    await defense.save();

    let populatedDefense;
    try {
      // Assurez-vous que 'student' et 'professor' sont des champs réels dans votre modèle Defense
      // Si 'professor' n'est pas un champ direct, vous devrez l'ajouter à votre modèle Defense
      // Ou peupler 'jury' et extraire le professeur de là si c'est l'intention
      populatedDefense = await Defense.findById(id)
        .populate('student', 'firstName lastName email')
          // Assurez-vous que 'professor' est un champ dans Defense
        .populate('subject', 'title')
        .populate('jury', 'firstName lastName email');

      // Si 'professor' n'est pas un champ direct dans Defense, mais vous voulez le professeur qui a accepté
      // Vous devrez adapter cette logique à la façon dont vous liez le professeur à la soutenance
      // Pour l'exemple, je vais supposer que le professeur est le 'req.user' qui déclenche l'action
      // OU que le professeur est déjà lié à la défense via un champ 'professor' direct.
      // Si 'professor' n'est pas un champ direct dans Defense, vous devez l'ajouter.
      // Par exemple, si le professeur qui accepte est celui qui est connecté:
      if (!populatedDefense.professor && req.user && req.user.role === 'professor') {
          populatedDefense.professor = await mongoose.model('Professor').findById(req.user.id).select('firstName lastName email');
      }

    } catch (popError) {
      console.warn('Population failed:', popError.message);
      populatedDefense = defense; // Fallback to non-populated defense
    }

    // Déclencher l'événement 'defense:accepted'
    // Assurez-vous que populatedDefense contient toutes les données nécessaires pour le template
    emitDefenseEvent('accepted', populatedDefense.toObject());

    res.status(200).json({
      success: true,
      message: 'Defense accepted and scheduled successfully',
      defense: populatedDefense
    });
  } catch (error) {
    console.error('Accept defense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept defense',
      error: error.message
    });
  }
});


router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid defense ID' });
    }

    const defense = await Defense.findById(id);
    if (!defense) {
      return res.status(404).json({ success: false, message: 'Defense not found' });
    }

    if (defense.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Defense is not in pending status' });
    }

    defense.status = 'rejected';
    defense.notes = reason ? `Rejected: ${reason}` : 'Rejected: No reason provided';
    await defense.save();

    let populatedDefense;
    try {
      populatedDefense = await Defense.findById(id)
        .populate('student', 'name email')
        .populate('subject', 'title');
    } catch (popError) {
      console.warn('Population failed:', popError.message);
      populatedDefense = defense; // Fallback to non-populated defense
    }
 emitDefenseEvent('rejected', populatedDefense.toObject());
    res.status(200).json({
      success: true,
      message: 'Defense rejected',
      defense: populatedDefense
    });
  } catch (error) {
    console.error('Reject defense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject defense',
      error: error.message
    });
  }
});

// Get available professors for a defense time slot
router.get('/professoravailable', authAdmin, async (req, res) => {
  try {
    const { defenseId, date, time } = req.query;

    console.log('Query params:', { defenseId, date, time });
    console.log('Auth context:', {
      admin: !!req.admin,
      university: !!req.university,
      adminEmail: req.admin?.email,
      universityId: req.university?.universityData?.id
    });

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Both date and time parameters are required'
      });
    }

    const defenseStart = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!defenseStart.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date or time format. Use YYYY-MM-DD for date and HH:mm for time'
      });
    }

    const defenseEnd = defenseStart.clone().add(1, 'hour');
    const defenseDayStart = defenseStart.clone().startOf('day');
    const defenseDayEnd = defenseStart.clone().endOf('day');

    console.log('Defense time slot:', {
      start: defenseStart.format(),
      end: defenseEnd.format(),
      dayStart: defenseDayStart.format(),
      dayEnd: defenseDayEnd.format()
    });

    // Get university ID from the authenticated token
    let universityId;
    if (req.admin && req.admin.email === process.env.ADMIN_EMAIL) {
      // For main admin, we need to get university from defense or make it required
      if (defenseId && mongoose.Types.ObjectId.isValid(defenseId)) {
        const defense = await Defense.findById(defenseId).select('university');
        if (defense && defense.university) {
          universityId = defense.university;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Defense not found or no university associated'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Defense ID required for main admin'
        });
      }
    } else if (req.university) {
      universityId = req.university.universityData.id;
    } else {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - no university context'
      });
    }

    console.log('University ID:', universityId);

    // Find conflicting defenses (scheduled at the same time)
    const conflictingDefenses = await Defense.find({
      university: new mongoose.Types.ObjectId(universityId),
      status: 'scheduled',
      date: {
        $gte: defenseStart.toDate(),
        $lt: defenseEnd.toDate()
      }
    }).select('jury date');

    console.log('Conflicting defenses found:', conflictingDefenses.length);

    // Get all busy professor IDs
    const busyProfessorIds = [...new Set(
      conflictingDefenses.flatMap(d => d.jury.map(id => id.toString()))
    )];

    console.log('Busy professor IDs:', busyProfessorIds);

    // Find availability records for the requested day
    const availabilityRecords = await Availability.find({
      active: true,
      'availableSlots.date': {
        $gte: defenseDayStart.toDate(),
        $lte: defenseDayEnd.toDate()
      }
    }).populate({
      path: 'professor',
      match: { university: new mongoose.Types.ObjectId(universityId) },
      select: '_id name email professorData preferences profile university'
    }).lean();

    console.log('Raw availability records:', availabilityRecords.length);

    // Filter out records where professor is null (didn't match university filter)
    const validAvailabilityRecords = availabilityRecords.filter(record => record.professor);
    console.log('Valid availability records (with professor):', validAvailabilityRecords.length);

    // Find professors who are available during the requested time slot
    const availableProfessorIds = [];
    
    for (const record of validAvailabilityRecords) {
      const professorId = record.professor._id.toString();
      
      // Skip if professor is busy with another defense
      if (busyProfessorIds.includes(professorId)) {
        console.log(`Professor ${professorId} is busy with another defense`);
        continue;
      }

      const isAvailableAtTime = record.availableSlots.some(slot => {
        const slotDate = moment(slot.date);
        const requestedDate = defenseStart.clone().startOf('day');
        
        // Check if the slot is on the same day
        if (!slotDate.isSame(requestedDate, 'day')) {
          return false;
        }

        // Parse the time from the slot
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotStart = slotDate.clone()
          .set('hour', hours)
          .set('minute', minutes)
          .set('second', 0)
          .set('millisecond', 0);
        const slotEnd = slotStart.clone().add(1, 'hour');
        
        // Check if the defense time overlaps with this availability slot
        const overlaps = (
          defenseStart.isSameOrAfter(slotStart) && defenseStart.isBefore(slotEnd)
        );

        console.log(`Slot check for professor ${professorId}:`, {
          slotDate: slotDate.format('YYYY-MM-DD'),
          requestedDate: requestedDate.format('YYYY-MM-DD'),
          slotTime: slot.time,
          slotStart: slotStart.format('YYYY-MM-DD HH:mm'),
          slotEnd: slotEnd.format('YYYY-MM-DD HH:mm'),
          defenseStart: defenseStart.format('YYYY-MM-DD HH:mm'),
          defenseEnd: defenseEnd.format('YYYY-MM-DD HH:mm'),
          overlaps
        });

        return overlaps;
      });

      if (isAvailableAtTime) {
        availableProfessorIds.push(professorId);
        console.log(`Professor ${professorId} is available at the requested time`);
      }
    }

    console.log('Available professor IDs after time check:', availableProfessorIds);

    // Get professor details with workload check
    const availableProfessors = await Professor.find({
      _id: { $in: availableProfessorIds.map(id => new mongoose.Types.ObjectId(id)) },
      university: new mongoose.Types.ObjectId(universityId),
      $expr: { $lt: ["$professorData.currentDefenses", "$professorData.maxDefenses"] }
    }).select('_id name email preferences professorData profile university').lean();

    console.log('Final available professors after workload check:', availableProfessors.length);

    // Format the response
    const formattedProfessors = availableProfessors.map(prof => ({
      _id: prof._id,
      name: prof.name,
      email: prof.email,
      preferences: prof.preferences || [],
      currentDefenses: prof.professorData?.currentDefenses || 0,
      maxDefenses: prof.professorData?.maxDefenses || 10,
      profile: {
        phone: prof.profile?.phone || '',
        linkedin: prof.profile?.linkedin || '',
        bio: prof.profile?.bio || ''
      },
      university: prof.university
    }));

    res.status(200).json({
      success: true,
      data: formattedProfessors,
      debug: process.env.NODE_ENV === 'development' ? {
        universityId,
        conflictingDefenses: conflictingDefenses.length,
        busyProfessors: busyProfessorIds.length,
        availabilityRecords: validAvailabilityRecords.length,
        availableProfessorIds: availableProfessorIds.length,
        finalCount: availableProfessors.length
      } : undefined
    });

  } catch (error) {
    console.error('Error fetching available professors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available professors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
router.get('/scheduled', async (req, res) => {
  try {
    const { universityId } = req.query;

    // Validate universityId if provided
    if (universityId && !mongoose.Types.ObjectId.isValid(universityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid university ID',
      });
    }

    // Build the query object
    const query = { status: 'scheduled' };
    if (universityId) {
      query.university = new mongoose.Types.ObjectId(universityId); // Filter by universityId
    }

    const defenses = await Defense.find(query)
      .populate('student', 'name email')
      .populate('subject', 'title')
      .populate('jury', 'name email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: defenses.length,
      data: defenses,
    });
  } catch (err) {
    console.error('Error fetching scheduled defenses:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
});
// Get defenses where professor is in jury
router.get('/by-jury/:professorId', async (req, res) => {
  try {
    const { professorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(professorId)) {
      return res.status(400).json({ message: 'Invalid professor ID' });
    }

    const defenses = await Defense.find({ jury: professorId })
      .populate('student', 'name email')
      .populate('subject', 'title')
      .populate('jury', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      defenses
    });
  } catch (error) {
    console.error('Error fetching defenses by jury:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/:id/accept/:professorId', async (req, res) => {
  try {
    const { id, professorId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(professorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        details: {
          defenseId: id,
          professorId: professorId
        }
      });
    }

    const defense = await Defense.findById(id);
    if (!defense) {
      return res.status(404).json({
        success: false,
        message: 'Defense not found',
        details: { defenseId: id }
      });
    }

    // Check if professor is in jury
    const isInJury = defense.jury.some(juryId =>
      juryId.toString() === professorId.toString()
    );

    if (!isInJury) {
      return res.status(403).json({
        success: false,
        message: 'Professor not in jury list',
        details: {
          professorId: professorId,
          juryMembers: defense.jury.map(id => id.toString())
        }
      });
    }

    // Check if already accepted
    const alreadyAccepted = defense.acceptedBy?.some(id =>
      id.toString() === professorId.toString()
    ) || false;

    if (alreadyAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Already accepted by this professor',
        details: { professorId: professorId }
      });
    }

    // Add the professor to the list of acceptedBy
    defense.acceptedBy.push(professorId);

    // Check if all jury members have accepted
    const allAccepted = defense.jury.every(juryId =>
      defense.acceptedBy.some(acceptId =>
        acceptId.toString() === juryId.toString()
      )
    );

    // Update status if all accepted
    if (allAccepted) {
      defense.status = 'scheduled';
    }

    await defense.save();

    return res.json({
      success: true,
      defenseId: defense._id,
      status: defense.status,
      allAccepted,
      acceptCount: defense.acceptedBy.length,
      totalJury: defense.jury.length,
      message: allAccepted
        ? 'Defense scheduled! All jury members accepted'
        : 'Acceptance recorded'
    });
  } catch (error) {
    console.error('Error accepting defense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during acceptance',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Professor reject defense
router.put('/:id/reject/:professorId', async (req, res) => {
  try {
    const { id, professorId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(professorId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format',
        details: {
          defenseId: id,
          professorId: professorId
        }
      });
    }

    const defense = await Defense.findById(id);
    if (!defense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Defense not found',
        details: { defenseId: id }
      });
    }

    // Check if professor is in jury
    const isJuryMember = defense.jury.some(j => 
      j.toString() === professorId.toString()
    );
    
    if (!isJuryMember) {
      return res.status(403).json({
        success: false,
        message: 'Professor not in jury list',
        details: {
          professorId: professorId,
          juryMembers: defense.jury.map(id => id.toString())
        }
      });
    }

    // Update the defense
    const updatedDefense = await Defense.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectedBy: professorId,
        $pull: { acceptedBy: professorId } // Remove from acceptedBy if previously accepted
      },
      { new: true }
    );

    res.json({
      success: true,
      defenseId: updatedDefense._id,
      status: updatedDefense.status,
      message: 'Defense declined successfully'
    });
  } catch (error) {
    console.error('Error rejecting defense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during rejection',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Assign professors to defense
router.post('/assignProfessors', async (req, res) => {
  try {
    const { defenseId, professorIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(defenseId)) {
      return res.status(400).json({ success: false, message: 'Invalid defense ID' });
    }

    if (!Array.isArray(professorIds) || professorIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: 'Invalid professor IDs' });
    }

    const defense = await Defense.findById(defenseId);
    if (!defense) {
      return res.status(404).json({ success: false, message: 'Defense not found' });
    }

    const professors = await Professor.find({ _id: { $in: professorIds } });
    if (professors.length !== professorIds.length) {
      return res.status(400).json({ success: false, message: 'Some professors not found' });
    }

    const overbooked = professors.filter(p => p.professorData.currentDefenses >= p.professorData.maxDefenses);
    if (overbooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Professors at max defenses: ${overbooked.map(p => p.name).join(', ')}`
      });
    }

    defense.jury = professorIds;
    await defense.save();

    await Professor.updateMany(
      { _id: { $in: professorIds } },
      { $inc: { 'professorData.currentDefenses': 1 } }
    );

    res.json({
      success: true,
      message: 'Professors assigned successfully',
      defenseId
    });
  } catch (error) {
    console.error('Error assigning professors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign professors',
      error: error.message
    });
  }
});
router.post('/updateDefenseAndJury', async (req, res) => {
  try {
    const { defenseId, date, time, professorIds } = req.body;

    if (!defenseId || !date || !time || !professorIds || !Array.isArray(professorIds)) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants ou invalides' });
    }

    if (!mongoose.Types.ObjectId.isValid(defenseId)) {
      return res.status(400).json({ success: false, message: 'Format ID défense invalide' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, message: 'Format de date invalide. Utilisez YYYY-MM-DD' });
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ success: false, message: 'Format d\'heure invalide. Utilisez HH:MM' });
    }

    if (professorIds.length === 0 || professorIds.length > 3) {
      return res.status(400).json({ success: false, message: 'Vous devez assigner entre 1 et 3 professeurs' });
    }

    const uniqueProfessorIds = [...new Set(professorIds)];
    if (uniqueProfessorIds.length !== professorIds.length) {
      return res.status(400).json({ success: false, message: 'IDs de professeurs en double' });
    }

    const invalidIds = professorIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ success: false, message: 'Format ID professeur invalide' });
    }

    const [hours, minutes] = time.split(':').map(Number);
    const defenseDate = new Date(date);
    defenseDate.setHours(hours, minutes, 0, 0);

    const defense = await Defense.findById(defenseId);
    if (!defense) {
      return res.status(404).json({ success: false, message: 'Défense non trouvée' });
    }

    const professors = await Professor.find({ _id: { $in: professorIds } });
    if (professors.length !== professorIds.length) {
      return res.status(400).json({ success: false, message: 'Certains professeurs n\'ont pas été trouvés' });
    }

    const objectIdProfessors = professorIds.map(id => new mongoose.Types.ObjectId(id));

    const currentDefensesCounts = await Defense.aggregate([
      {
        $match: {
          status: 'scheduled',
          jury: { $in: objectIdProfessors }
        }
      },
      { $unwind: "$jury" },
      {
        $match: {
          jury: { $in: objectIdProfessors }
        }
      },
      {
        $group: {
          _id: "$jury",
          count: { $sum: 1 }
        }
      }
    ]);

    const defenseCountMap = new Map();
    currentDefensesCounts.forEach(item => {
      defenseCountMap.set(item._id.toString(), item.count);
    });

    const overbookedProfessors = professors.filter(prof => {
      const currentCount = defenseCountMap.get(prof._id.toString()) || 0;
      return currentCount >= prof.professorData.maxDefenses;
    });

    if (overbookedProfessors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Professeur(s) ayant atteint le maximum de défenses: ${
          overbookedProfessors.map(p => p.name).join(', ')
        }`,
        overbookedProfessors: overbookedProfessors.map(p => ({
          id: p._id,
          name: p.name,
          currentDefenses: defenseCountMap.get(p._id.toString()) || 0,
          maxDefenses: p.professorData.maxDefenses
        }))
      });
    }

    defense.date = defenseDate;
    defense.jury = objectIdProfessors;
    await defense.save();

    res.json({
      success: true,
      message: `Défense planifiée avec succès avec ${professorIds.length} professeur(s)`,
      data: {
        defenseId: defense._id,
        date: defenseDate,
        professors: professors.map(p => ({
          id: p._id,
          name: p.name,
          currentDefenses: defenseCountMap.get(p._id.toString()) || 0,
          maxDefenses: p.professorData.maxDefenses
        }))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la défense:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.' });
  }
});



export default router;