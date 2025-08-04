import express from "express";
import {
  debugGetAllProgress,
  getAllProgressHistory,
  getCurrentWeekProgress,
} from '../controllers/professorProgressController.js';
import {
  submitProgress,
} from "../controllers/progressController.js";
import authProfessor from '../middlewars/authProfessor.js';
import authUser from "../middlewars/authUser.js";

const router = express.Router();

// Route: Submit a progress update
router.post("/submit",authUser, submitProgress);


// Protect all routes with professor authentication
router.use(authProfessor);

// Get current week progress for professor's students
router.get('/current', getCurrentWeekProgress);

// Get all progress history for professor's students
router.get('/history', getAllProgressHistory);



// Debug endpoint
router.get('/debug', debugGetAllProgress);


export default router;
