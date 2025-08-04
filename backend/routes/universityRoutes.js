import express from "express";
import { getApprovedUniversities,getProfile } from "../controllers/universityController.js";
import authAdmin from "../middlewars/authAdmin.js";
import authCompany from "../middlewars/authCompany.js"; // Assuming you have company authentication middleware
import Application from "../models/Application.js"; // Import the Application model 
import University from "../models/University.js"; // Import the University model
import UserModel from "../models/userModel.js"; // Import the User model for students


const router = express.Router();

router.get("/approved", getApprovedUniversities);
router.get('/profile', authAdmin, getProfile);

// Route pour récupérer les students (pas de changement)
router.get("/students", async (req, res) => {
  const { universityId } = req.query;
  try {
    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID is required" });
    }

    const students = await UserModel.find({ university: universityId }).select(
      "name email cin dateOfBirth studyLevel specialization currentClass academicYear profile studentData accountStatus"
    );

    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route pour récupérer les applications - MODIFIÉE pour confirmed: true
router.get("/applications", async (req, res) => {
  const { universityId } = req.query;
  try {
    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID is required" });
    }

    console.log("Fetching applications with confirmed: true for universityId:", universityId);

    // Changement principal : filtrer par confirmed: true au lieu de status
    const applications = await Application.find({
      confirmed: true  // Récupérer seulement les applications confirmées
    })
      .populate({
        path: "student",
        match: { university: universityId },
        select: "_id name email",
      })
      .populate({
        path: "company",
        select: "nom", // Le nom de l'entreprise
      })
      .populate({
        path: "offre",
        select: "titre", // Changé de "title" à "titre" pour correspondre au schéma
      })
      .select("student company offre status appliedAt confirmed confirmedAt testResult coverLetter notes");

    console.log("Found applications before filtering:", applications.length);

    const filteredApplications = applications.filter((app) => app.student !== null);

    console.log("Applications after filtering by student:", filteredApplications.length);
    console.log("Sample application:", filteredApplications[0]); // Pour debug

    res.json({ success: true, applications: filteredApplications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



 
 

// GET university details by ID
router.get("/:id", authCompany, async (req, res) => {
  try {
    const universityId = req.params.id;

    // Validate ObjectId
    if (!universityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid university ID format",
      });
    }

    // Fetch university by ID
    const university = await University.findById(universityId).select(
      "name status description address contactPerson logo"
    );

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    // Return university details
    res.status(200).json({
      success: true,
      university,
    });
  } catch (error) {
    console.error("Error fetching university:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching university details",
      error: error.message,
    });
  }
});

 
export default router;

