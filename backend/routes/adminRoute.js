// adminRouter.js

import bcrypt from 'bcrypt';
import express from 'express';
import {
  addProfessor, adminDashboard,
  allProfessors,
  assignProject,
  deleteProject,
  getAssignments,
  getProjects,
  loginAdmin
} from '../controllers/adminController.js';
import { emitUniversityEvent } from '../events/index.js';
import University from '../models/University.js';
import authAdmin from './../middlewars/authAdmin.js'; // Assurez-vous que le chemin est correct
 
const adminRouter = express.Router();

 

 
import validator from 'validator';
 

adminRouter.get('/universities/check-email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Find university by contactPerson.email or loginCredentials.email
    const university = await University.findOne({
      $or: [
        { 'contactPerson.email': email },
        { 'loginCredentials.email': email }
      ]
    }).select('status contactPerson loginCredentials.password _id');

    if (!university) {
      return res.status(200).json({ 
        exists: false,
        message: 'No university found with this email'
      });
    }

   // Dans adminRouter.js
res.status(200).json({
  exists: true,
  status: university.status,
  hasPassword: !!university.loginCredentials?.password, // <-- C'est cette propriété qui est envoyée
  _id: university._id,
  message: 'University found'
});

  } catch (error) {
    console.error('Error in check-email route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
// Complete registration by setting password
// Complete registration by setting password
adminRouter.patch('/universities/complete-registration/:id', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Check if already has login credentials
    if (university.loginCredentials && university.loginCredentials.password) {
      return res.status(400).json({
        success: false,
        message: 'University already has login credentials set'
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set login credentials
    university.loginCredentials = {
      email: university.contactPerson.email,
      password: hashedPassword,
      lastLogin: null
    };

    const savedUniversity = await university.save();

    // Émission de l'événement après la sauvegarde réussie
    emitUniversityEvent('registered', {
      university: {
        _id: savedUniversity._id,
        name: savedUniversity.name,
        email: savedUniversity.contactPerson.email,
        contactPerson: savedUniversity.contactPerson,
        status: savedUniversity.status
      },
      loginCredentials: {
        email: savedUniversity.loginCredentials.email,
        // Ne pas envoyer le mot de passe même hashé
        initialPasswordSet: true
      },
      entityType: 'university',
      entityId: savedUniversity._id
    });

    res.json({
      success: true,
      message: 'Registration completed successfully'
    });
  } catch (error) {
    console.error('Error in complete-registration route:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
 


  

 


 
 
adminRouter.post('/login', loginAdmin);
adminRouter.post('/add-Professor', authAdmin,addProfessor);

// MODIFICATION ICI : Ajout de authAdmin au middleware
adminRouter.get('/all-professors', authAdmin, allProfessors); 
 
 
adminRouter.get('/dashboard',authAdmin,adminDashboard)
adminRouter.get('/projects',  getProjects);
adminRouter.post('/assign-project', authAdmin, assignProject);
adminRouter.post('/delete-project', deleteProject);
adminRouter.get('/assignments', authAdmin, getAssignments);


export default adminRouter;
