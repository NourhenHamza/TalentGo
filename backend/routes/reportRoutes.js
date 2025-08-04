import express from 'express';
import { 
  submitReport,
  
} from '../controllers/subjectController.js';
import authUser from '../middlewars/authUser.js';

const router = express.Router();

// Submit a new report OR resubmit a rejected report
router.post('/', authUser, submitReport);

export default router;