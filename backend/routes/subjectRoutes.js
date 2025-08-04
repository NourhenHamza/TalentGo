import express from 'express';
import {
  approveSubject,
  deleteSubject,
  getAllSubjects,
  getMyAssignments, getMyDefense,
  getPendingSubjects,
  getStudentSubject,
  getSubjectById,
  rejectSubject,
  submitSubject
} from '../controllers/subjectController.js';
import authAdmin from '../middlewars/authAdmin.js';
import authUser from '../middlewars/authUser.js';

const router = express.Router();
 
// Routes protégées par authentification étudiant
router.post('/submit', authUser, submitSubject);
router.get('/my-subject', authUser, getStudentSubject);
 
router.delete('/:id', authUser, deleteSubject);
router.get('/my-assignments', authUser, getMyAssignments);
router.get('/my-defense', authUser, getMyDefense);

// Routes pour l'administration des sujets
router.get('/admin/subjects/pending', authAdmin, getPendingSubjects);
router.put('/admin/subjects/:id/approve', authAdmin, approveSubject);
router.put('/admin/subjects/:id/reject', authAdmin, rejectSubject);
router.get('/admin/subjects', authAdmin, getAllSubjects);
router.get('/admin/subjects/:id', authAdmin, getSubjectById);


export default router;