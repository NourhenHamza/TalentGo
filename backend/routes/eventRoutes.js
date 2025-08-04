import express from 'express';
import {
  createEvent,
  getUniversityEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  publishEvent,
  
} from '../controllers/eventController.js';
import authAdmin from '../middlewars/authAdmin.js'
import authCompany from '../middlewars/authUser.js'
import authUser from '../middlewars/authCompany.js'


const router = express.Router();



// Routes pour les universités (nécessitent une authentification)
router.post('/',authAdmin, createEvent);
router.get('/university/:university_id',authAdmin, getUniversityEvents);
router.get('/:id', getEventById);
router.put('/:id',authAdmin, updateEvent);
router.delete('/:id',authAdmin, deleteEvent);
router.patch('/:id/publish',authAdmin, publishEvent);

export default router;