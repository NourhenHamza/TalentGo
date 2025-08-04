import Event from '../models/Event.js';
import University from '../models/University.js';
import { emitEventsEvent } from '../events/index.js';
import Partnership from '../models/Partnership.js'; // Adjust path as needed
import UserModel from '../models/userModel.js'; // Adjust path as needed
import { NotificationService } from '../services/NotificationService.js'; // Votre service de notification
import { NOTIFICATION_CONFIG } from '../config/notification.config.js'; // Votre configuration de notification

// Créer un nouvel événement
export const createEvent = async (req, res) => {
  try {
    const { university_id, title, description, date, endDate, location, category, contactEmail, isPublic } = req.body;

    // Vérifier que l'université existe
    const university = await University.findById(university_id);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: "Université non trouvée"
      });
    }

    const event = await Event.create({
      university_id,
      title,
      description,
      date,
      endDate,
      location,
      category,
      contactEmail,
      isPublic,
      status: 'draft' // Commencer par un brouillon
    });

    await event.populate('universityDetails');

    res.status(201).json({
      success: true,
      message: "Événement créé avec succès",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir tous les événements d'une université
export const getUniversityEvents = async (req, res) => {
  try {
    const { university_id } = req.params;
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = { university_id };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const events = await Event.find(query)
      .populate('universityDetails', 'name logo')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir un événement spécifique
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id).populate('universityDetails');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour un événement
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé"
      });
    }

    // Empêcher la modification d'événements passés
    if (event.isPastEvent) {
      return res.status(400).json({
        success: false,
        message: "Impossible de modifier un événement passé"
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('universityDetails');

    res.status(200).json({
      success: true,
      message: "Événement mis à jour avec succès",
      data: updatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Supprimer un événement
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé"
      });
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Événement supprimé avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const notificationService = new NotificationService();
export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'published' },
      { new: true, runValidators: true }
    ).populate('universityDetails');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé"
      });
    }

    // Get all students from this university
    const studentQuery = {
      university: event.universityDetails._id,
    };
    console.log('DEBUG: Student query:', JSON.stringify(studentQuery));

    const students = await UserModel.find(studentQuery).select('_id email firstName lastName');

    console.log('DEBUG: Students found by query:', students.length, 'students:', students.map(s => s._id));

    // Get all companies that have partnerships with this university
    const partnerships = await Partnership.find({
      $or: [
        {
          initiator_type: 'University',
          initiator_id: event.universityDetails._id,
          target_type: 'Company',
          status: 'accepted'
        },
        {
          target_type: 'University',
          target_id: event.universityDetails._id,
          initiator_type: 'Company',
          status: 'accepted'
        }
      ]
    }).populate('initiator_id target_id');

    // Extract partner companies with proper field mapping
    const partnerCompanies = partnerships.map(partnership => {
      if (partnership.initiator_type === 'Company' && partnership.target_type === 'University') {
        return partnership.initiator_id;
      } else if (partnership.target_type === 'Company' && partnership.initiator_type === 'University') {
        return partnership.target_id;
      }
      return null;
    }).filter(company => company !== null);

    console.log('👥 Students found:', students.length);
    console.log('🏢 Partner companies found:', partnerCompanies.length);

    // FIXED: Ensure entityId is properly set for the notification system
    const notificationEventData = {
      eventId: event._id,
      entityId: event._id, // This is crucial for the URL generation
      entityType: 'event',
      eventTitle: event.title,
      eventDescription: event.description,
      eventDate: event.date,
      eventLocation: event.location,
      eventCategory: event.category,
      universityId: event.universityDetails._id,
      universityName: event.universityDetails.name,
      universityEmail: event.universityDetails.contactPerson.email,
    };

    console.log('📋 Final notification event data (for triggerNotification):', JSON.stringify(notificationEventData, null, 2));

    // Prepare explicit recipients list
    const explicitRecipientsList = [
        ...students.map(student => ({
            id: student._id.toString(),
            email: student.email,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            type: 'STUDENT'
        })),
        ...partnerCompanies.map(company => ({
            id: company._id.toString(),
            email: company.email_contact || company.email || company.contactEmail,
            name: company.nom || company.name || company.companyName,
            type: 'COMPANY'
        }))
    ];

    console.log('👥 Explicit recipients for notification:', JSON.stringify(explicitRecipientsList, null, 2));

    // Call notification service
    await notificationService.triggerNotification(
      NOTIFICATION_CONFIG.EVENT_TYPES.UNIVERSITY_EVENT_PUBLISHED,
      notificationEventData,
      { explicitRecipients: explicitRecipientsList }
    );

    res.status(200).json({
      success: true,
      message: "Événement publié avec succès",
      data: event,
      notifications: {
        studentsNotified: students.length,
        companiesNotified: partnerCompanies.length,
        totalRecipients: students.length + partnerCompanies.length
      }
    });
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};