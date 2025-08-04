// routes/applicationRoutes.js
import express from 'express';
import {
  applyToOffre,
  checkApplicationStatus, // Nouvelle fonction
  getConfirmedStudents,
  confirmApplication,
  deleteApplication,
  getApplicationsForCompanyOffers,
  getApplicationsForOffre,
  getMyApplications,
  getOfferCategories,
  updateApplicationStatus,
  updateApplicationStatusByCompany
} from '../controllers/applicationController.js';
import authCompany from '../middlewars/authCompany.js';
import authUser from '../middlewars/authUser.js';

const router = express.Router();

router.post('/', authUser, applyToOffre);
router.get('/my-applications', authUser, getMyApplications);
router.get('/check/:offerId', authUser, checkApplicationStatus); // Nouvelle route
router.get('/offre/:offreId', authUser, getApplicationsForOffre); // Pour les entreprises
router.put('/:id/status', authUser, updateApplicationStatus); // Pour les entreprises
router.delete('/:id', authUser, deleteApplication);
router.put('/:id/confirm', authUser, confirmApplication);

// Routes Entreprise
router.get('/company-applications', authCompany, getApplicationsForCompanyOffers); 
router.get('/categories', authCompany, getOfferCategories);
router.put('/:id/status-by-company', authCompany, updateApplicationStatusByCompany); 
// NOUVELLE ROUTE SEULEMENT
router.get('/confirmed-students', authCompany, getConfirmedStudents);


export default router;