import express from 'express';
import {
  createOffre,
  deleteOffre,
  disablePublicTestLink,
  enablePublicTestLink,
  generatePublicTestLink,
  getCompanyPublicApplications,
  getOffreById,
  getOffres,
  getOffresByCompany,
  getPublicApplicationStats,
  servePublicCV,
  togglePublishForStudentsStatus,
  togglePublishStatus,
  updateOffre,
  updatePublicApplicationStatus
} from '../controllers/offreController.js';
import authCompany from '../middlewars/authCompany.js';

const router = express.Router();
router.get('/uploads/public-cvs/:filename', servePublicCV);

router.get("/public-applications", getCompanyPublicApplications);
router.put("/public-applications/:applicationId/status", updatePublicApplicationStatus);
router.get('/company/:companyId', getOffresByCompany);
router.get('/company/me', authCompany, getOffresByCompany);
router.get('/', getOffres);
router.get('/:id', getOffreById);
 
router.delete('/:id', authCompany, deleteOffre);
router.put('/:id/toggle-publish', authCompany, togglePublishStatus);
router.put('/:id/toggle-publish-students', authCompany, togglePublishForStudentsStatus);
router.post("/:id/generate-public-link", authCompany, generatePublicTestLink);
router.delete("/:id/disable-public-link", authCompany, disablePublicTestLink);
router.put("/:id/enable-public-link", authCompany, enablePublicTestLink);
router.get("/:id/public-applications-stats", authCompany, getPublicApplicationStats);
router.post('/', authCompany, createOffre); // Créer une nouvelle offre
router.put('/:id', authCompany, updateOffre); // Mettre à jour une offre
export default router;