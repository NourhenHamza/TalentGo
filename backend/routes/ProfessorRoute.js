import express from 'express';
import { 
  getProfessorProfile, 
  loginProfessor, 
  ProfessorsList, 
  updateProfessorProfile,
  getProfessorData, 
  updateProfessorData, 
  getAssignments 
} from '../controllers/ProfessorController.js';
import Availability from '../models/Availability.js';
import authProfessor from '../middlewars/authProfessor.js';

const ProfessorRouter = express.Router();

// Other professor routes
ProfessorRouter.get('/list', ProfessorsList);
ProfessorRouter.post('/login', loginProfessor);

// Profile routes
ProfessorRouter.get('/profile', authProfessor, getProfessorProfile);
ProfessorRouter.post('/update-profile', authProfessor, updateProfessorProfile);

// Additional professor data routes
ProfessorRouter.get("/me", authProfessor, getProfessorData);
ProfessorRouter.put("/update", authProfessor, updateProfessorData);

// Route for assignments
ProfessorRouter.get("/assignments", authProfessor, getAssignments);

// Helper functions
const isValidTimeSlot = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) return false;
  const [hours] = time.split(':').map(Number);
  return hours >= 8 && hours < 18;
};

const createDateTime = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

// Format date for comparison
const formatSlotKey = (date) => {
  const d = new Date(date);
  const datePart = d.toISOString().split('T')[0];
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return `${datePart}T${time}`;
};

// GET endpoint - Fetch professor's availability
ProfessorRouter.get('/availability', async (req, res) => {
  try {
    const professorId = req.query.professorId;
    
    if (!professorId) {
      return res.status(400).json({ message: 'Professor ID is required' });
    }

    // Debug: Log the professor ID
    console.log('Fetching availability for professor:', professorId);

    const availability = await Availability.findOne({ professor: professorId })
      .sort({ createdAt: -1 });
    
    // Debug log
    console.log('Found availability:', availability ? 'Yes' : 'No');

    if (!availability || !availability.availableSlots || availability.availableSlots.length === 0) {
      // Return empty array if no availability found
      return res.status(200).json([]);
    }

    // Map slots to ISO strings
    const formattedSlots = availability.availableSlots.map(slot => {
      try {
        // Format date as ISO string for date part
        const datePart = slot.date.toISOString().split('T')[0];
        // Create a DateTime object from date and time
        const dateTime = createDateTime(datePart, slot.time);
        // Return the full ISO string
        return dateTime.toISOString();
      } catch (error) {
        console.error('Error formatting slot:', error, slot);
        return null;
      }
    }).filter(Boolean); // Remove any null values
    
    return res.status(200).json(formattedSlots);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// POST endpoint - Save professor's availability
ProfessorRouter.post('/availability', async (req, res) => {
  try {
    const { dates, professorId, datesToRemove } = req.body;
  
    // Debug log
    console.log('Saving availability for professor:', professorId);
    console.log('Dates to add:', dates ? dates.length : 0);
    console.log('Dates to remove:', datesToRemove ? datesToRemove.length : 0);
  
    if (!professorId) {
      return res.status(400).json({ message: 'Professor ID is required' });
    }
  
    // Get current availability
    let availability = await Availability.findOne({ professor: professorId });
    
    if (!availability) {
      // Create new availability if none exists
      availability = new Availability({
        professor: professorId,
        availableSlots: []
      });
    }
    
    // Create a map of existing slots for faster lookups
    const existingSlots = new Map();
    if (availability.availableSlots && availability.availableSlots.length > 0) {
      availability.availableSlots.forEach(slot => {
        // Check if slot.date exists before attempting to use it
        if (slot && slot.date) {
          const dateStr = slot.date.toISOString().split('T')[0];
          const key = `${dateStr}T${slot.time}`;
          existingSlots.set(key, slot);
        } else {
          console.warn('Found invalid slot without date:', slot);
        }
      });
    }
  
    // Create a set of slots to remove
    const slotsToRemove = new Set();
    if (Array.isArray(datesToRemove) && datesToRemove.length > 0) {
      datesToRemove.forEach(dateStr => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date to remove:', dateStr);
            return;
          }
          const datePart = date.toISOString().split('T')[0];
          const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          slotsToRemove.add(`${datePart}T${time}`);
        } catch (err) {
          console.error('Error processing date to remove:', err, dateStr);
        }
      });
    }
  
    // Process the new dates to add
    const newSlots = [];
    if (Array.isArray(dates) && dates.length > 0) {
      for (const dateStr of dates) {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', dateStr);
            continue;
          }
  
          const datePart = date.toISOString().split('T')[0];
          const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
          if (!isValidTimeSlot(time)) {
            console.warn('Invalid time slot:', time);
            continue;
          }
  
          const slotKey = `${datePart}T${time}`;
          
          // If marked for removal, remove it from the removal set
          if (slotsToRemove.has(slotKey)) {
            slotsToRemove.delete(slotKey);
          }
          
          // Only add if not already existing
          if (!existingSlots.has(slotKey)) {
            // Ensure we're creating valid date objects
            const cleanDate = new Date(datePart);
            
            // Check if date is valid before adding
            if (!isNaN(cleanDate.getTime())) {
              newSlots.push({
                date: cleanDate,
                time
              });
            } else {
              console.warn('Invalid date created:', datePart);
            }
          }
        } catch (err) {
          console.error('Error processing new date:', err, dateStr);
        }
      }
    }
    
    // Merge all the slots
    const mergedSlots = [];
    
    // Add existing slots that aren't marked for removal
    for (const [key, slot] of existingSlots.entries()) {
      if (!slotsToRemove.has(key)) {
        mergedSlots.push(slot);
      }
    }
    
    // Add new slots
    mergedSlots.push(...newSlots);
    
    // Update the availability
    availability.availableSlots = mergedSlots;
    
    console.log('About to save availability with', mergedSlots.length, 'slots');
    
    // Save the updated availability
    const savedAvailability = await availability.save();
    console.log('Successfully saved availability with', savedAvailability.availableSlots.length, 'slots');
  
    // Return formatted response
    const formattedResponse = availability.availableSlots
      .filter(slot => slot && slot.date && slot.time) // Ensure slots have required fields
      .map(slot => {
        try {
          const datePart = slot.date.toISOString().split('T')[0];
          const dateTime = createDateTime(datePart, slot.time);
          return dateTime.toISOString();
        } catch (err) {
          console.error('Error formatting slot for response:', err, slot);
          return null;
        }
      })
      .filter(Boolean); // Remove any null values
  
    return res.status(201).json(formattedResponse);
  } catch (error) {
    console.error('Error saving availability with detailed stack:', error);
    
    // Enhanced error logging for mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation Error Details:', JSON.stringify(error.errors, null, 2));
      
      // Return more specific error information
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    
    return res.status(500).json({ 
      message: error.message || 'Server error',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

export default ProfessorRouter;
