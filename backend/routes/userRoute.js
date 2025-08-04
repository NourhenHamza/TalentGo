import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';


import {
  getProfile,
  logout,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  updateProfile,
  updateUserProfile,
  verifyEmail
} from '../controllers/userController.js';
import authAdmin from '../middlewars/authAdmin.js';
import authUser from '../middlewars/authUser.js';
import upload from '../middlewars/multer.js';
import Professor from '../models/ProfessorModel.js';
import ProvisionalProfessor from '../models/ProvisionalProfessor.js';
import University from '../models/University.js';
import UserModel from '../models/userModel.js';
import { sendInvitationEmail } from '../services/emailService.js';

const userRouter = express.Router();


import fs from 'fs';
import multer from 'multer';
import path from 'path';



import CV from '../models/CV.js';



const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Créer le dossier s'il n'existe pas
    const uploadDir = 'uploads/cvs/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-primary-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, DOC et DOCX sont autorisés!'), false);
    }
  }
});

// Register Student avec upload CV obligatoire
userRouter.post('/register', uploadCV.single('cv'), async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password,
      cin,
      dateOfBirth,
      gender,
      university,
      studyLevel,
      specialization,
      currentClass,
      academicYear,
      phone, 
      linkedin, 
      bio,
      street,
      city,
      zipCode,
      country,
      gpa
    } = req.body;

    // Récupérer les informations du fichier CV uploadé
    const cvFile = req.file;

    // === VALIDATION DES CHAMPS OBLIGATOIRES ===
    if (!name || !email || !password) {
      // Supprimer le fichier si validation échoue
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Nom, email et mot de passe sont requis' });
    }

    if (!cin || !dateOfBirth || !gender) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'CIN, date de naissance et genre sont requis' });
    }

    if (!university || !studyLevel || !specialization || !currentClass || !academicYear) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Toutes les informations académiques sont requises' });
    }

    if (!phone || !city) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Téléphone et ville sont requis' });
    }

    // === VALIDATION DU CV (OBLIGATOIRE) ===
    if (!cvFile) {
      return res.json({ success: false, message: 'Le CV est obligatoire lors de l\'inscription' });
    }

    // Vérifier le type de fichier CV
    const allowedCVTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedCVTypes.includes(cvFile.mimetype)) {
      fs.unlink(cvFile.path, (err) => {
        if (err) console.error('Erreur suppression fichier:', err);
      });
      return res.json({ 
        success: false, 
        message: 'Le CV doit être au format PDF, DOC ou DOCX' 
      });
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (cvFile.size > maxSize) {
      fs.unlink(cvFile.path, (err) => {
        if (err) console.error('Erreur suppression fichier:', err);
      });
      return res.json({ 
        success: false, 
        message: 'Le CV ne doit pas dépasser 5MB' 
      });
    }

    // === VALIDATIONS SPÉCIFIQUES ===
    
    // Validate email
    if (!validator.isEmail(email)) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Entrez un email valide' });
    }

    if (password.length < 8) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    if (!/^\d{8}$/.test(cin)) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Le CIN doit contenir exactement 8 chiffres' });
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    let calculatedAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    if (calculatedAge < 16) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'L\'étudiant doit avoir au moins 16 ans' });
    }

    const validStudyLevels = ['licence', 'master', 'cycle_ingenieur', 'doctorat'];
    if (!validStudyLevels.includes(studyLevel)) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Niveau d\'études invalide' });
    }

    if (!['male', 'female'].includes(gender)) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Genre invalide' });
    }

    if (!/^\d{4}-\d{4}$/.test(academicYear)) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Format d\'année académique invalide (ex: 2024-2025)' });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Un compte avec cet email existe déjà' });
    }

    const existingCIN = await UserModel.findOne({ cin });
    if (existingCIN) {
      if (cvFile && cvFile.path) {
        fs.unlink(cvFile.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.json({ success: false, message: 'Un compte avec ce numéro CIN existe déjà' });
    }

    // === HASHAGE DU MOT DE PASSE ===
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // === PRÉPARATION DE L'URL DU CV ===
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/api/uploads/cvs/${cvFile.filename}`;

    // === PRÉPARATION DES DONNÉES UTILISATEUR ===
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      cin: cin.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      university,
      studyLevel,
      specialization: specialization.trim(),
      currentClass: currentClass.trim(),
      academicYear: academicYear.trim(),
      profile: {
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : '',
        bio: bio ? bio.trim() : '',
        address: {
          street: street ? street.trim() : '',
          city: city.trim(),
          zipCode: zipCode ? zipCode.trim() : '',
          country: country || 'Tunisia'
        }
      },
      
      // === CV PRINCIPAL (AJOUTÉ DIRECTEMENT DANS LE USER) ===
      primaryCV: {
        filename: cvFile.filename,
        originalName: cvFile.originalname,
        filepath: cvFile.path,
        fileUrl: fileUrl,
        mimetype: cvFile.mimetype,
        size: cvFile.size,
        uploadedAt: new Date()
      },
      
      // Données étudiant
      studentData: {
        pfeSubmitted: false,
        finalReportApproved: false,
        defenseRequested: false,
        pfeStatus: 'not_started',
        gpa: gpa ? parseFloat(gpa) : undefined
      },
      accountStatus: 'pending',
      isAccountVerified: false
    };

    const newUser = new UserModel(userData);
    const user = await newUser.save();

    // === CRÉATION D'UNE ENTRÉE CV DANS LA COLLECTION CV (OPTIONNEL POUR COMPATIBILITÉ) ===
    const primaryCVEntry = new CV({
      student: user._id,
      filename: cvFile.filename,
      originalName: cvFile.originalname,
      filepath: cvFile.path,
      fileUrl: fileUrl,
      mimetype: cvFile.mimetype,
      size: cvFile.size,
      cvType: 'primary',
      isActive: true,
      description: 'CV d\'inscription'
    });
    
    await primaryCVEntry.save();

    // === GÉNÉRATION DU TOKEN ===
    const token = jwt.sign({ 
      id: user._id,
      university: user.university,
      role: 'student'
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('Generated token for user:', user._id, 'Role: student');

    return res.status(201).json({ 
      success: true, 
      message: 'Compte étudiant créé avec succès',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cin: user.cin,
        university: user.university,
        studyLevel: user.studyLevel,
        specialization: user.specialization,
        currentClass: user.currentClass,
        profile: user.profile,
        primaryCV: user.primaryCV,
        studentData: user.studentData,
        accountStatus: user.accountStatus,
        role: 'student'
      }
    });
  } catch (error) {
    console.log('Erreur lors de l\'inscription:', error);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erreur lors de la suppression du fichier:', err);
      });
    }
    
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(400).json({ 
        success: false, 
        message: `${field === 'email' ? 'Email' : field === 'cin' ? 'CIN' : 'Cette valeur'} "${value}" est déjà utilisé(e)` 
      });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de la création du compte' });
  }
});

// Login Route
userRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, university: user.university, role: user.role || 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Generated token for user:', user._id, 'Role:', user.role || 'student');

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        university: user.university,
        profile: user.profile,
        studentData: user.studentData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

userRouter.post('/logout', logout);
userRouter.post('/send-verify-otp', authUser, sendVerifyOtp);
userRouter.post('/verify-account', authUser, verifyEmail);
userRouter.post('/send-reset-otp', sendResetOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);

// Provisional Professor Routes
userRouter.post('/provisional-professor', authAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    let universityId;
    if (req.university) {
      universityId = req.university.universityData.id;
    } else if (req.admin) {
      universityId = req.body.universityId;
      if (!universityId) {
        return res.status(400).json({ message: 'University ID is required for admin requests.' });
      }
    } else {
      return res.status(403).json({ message: 'Access denied.' });
    }

    console.log('Creating provisional professor with:', { email, universityId });

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const university = await University.findById(universityId);
    if (!university) {
      return res.status(400).json({ message: 'University not found.' });
    }

    const existingProfessor = await ProvisionalProfessor.findOne({ email });
    if (existingProfessor) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const existingActiveProfessor = await Professor.findOne({ email });
    if (existingActiveProfessor) {
      return res.status(400).json({ message: 'Email is already registered as an active professor.' });
    }

    const newProvisionalProfessor = new ProvisionalProfessor({
      email,
      university: universityId
    });
        
    await newProvisionalProfessor.save();
    console.log('Provisional professor created:', newProvisionalProfessor._id);

    try {
      const emailResult = await sendInvitationEmail(email, newProvisionalProfessor._id);
      console.log('Invitation email sent successfully:', emailResult.messageId);
            
      res.status(201).json({
        message: 'Professor created and invitation email sent successfully!',
        data: {
          id: newProvisionalProfessor._id,
          email: newProvisionalProfessor.email,
          university: university.name,
          registrationUrl: emailResult.registrationUrl
        },
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      res.status(201).json({
        message: 'Professor created but invitation email failed to send.',
        data: {
          id: newProvisionalProfessor._id,
          email: newProvisionalProfessor.email,
          university: university.name
        },
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Error creating provisional Professor:', error);
    res.status(500).json({
      message: 'Server error while creating Professor.',
      error: error.message
    });
  }
});

userRouter.get('/provisional-professor', async (req, res) => {
  try {
    const professors = await ProvisionalProfessor.find()
      .populate('university', 'name')
      .lean();
    res.status(200).json(professors || []);
  } catch (error) {
    console.error('Error fetching provisional Professors:', error);
    res.status(500).json({ message: 'Failed to fetch provisional Professors.' });
  }
});

userRouter.delete('/provisional-professor/:id', async (req, res) => {
  try {
    const deletedProfessor = await ProvisionalProfessor.findByIdAndDelete(req.params.id);
    if (!deletedProfessor) {
      return res.status(404).json({ success: false, message: 'Professor not found' });
    }
    res.status(200).json({ success: true, message: 'Professor deleted successfully' });
  } catch (error) {
    console.error('Error deleting professor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete professor' });
  }
});

userRouter.get('/provisional-professor/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching provisional professor with ID: ${id}`);
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid professor ID format' 
      });
    }

    const professor = await ProvisionalProfessor.findById(id).populate('university', 'name');
    if (!professor) {
      console.log(`Professor not found with ID: ${id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Professor not found or invitation expired' 
      });
    }

    console.log(`Found professor: ${professor.email}`);
    res.status(200).json({
      success: true,
      data: {
        email: professor.email,
        university: professor.university ? professor.university.name : 'Unknown University',
        universityId: professor.university ? professor.university._id : null
      }
    });
  } catch (error) {
    console.error('Error fetching provisional professor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching professor',
      error: error.message 
    });
  }
});

userRouter.post('/complete-profile-professor', async (req, res) => {
  const { id, name, password, phone, linkedin, bio, preferences } = req.body;
  console.log('Completing professor profile for ID:', id);
  try {
    if (!id || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'ID, name, and password are required'
      });
    }

    const provisionalProfessor = await ProvisionalProfessor.findById(id).populate('university');
    if (!provisionalProfessor) {
      return res.status(404).json({
        success: false,
        message: 'Professor not found or invitation expired'
      });
    }

    if (!provisionalProfessor.university) {
      return res.status(400).json({
        success: false,
        message: 'University not found for this professor invitation'
      });
    }

    const existingActiveProfessor = await Professor.findOne({ email: provisionalProfessor.email });
    if (existingActiveProfessor) {
      return res.status(400).json({
        success: false,
        message: 'A professor with this email already exists. Please contact the administrator.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newProfessor = new Professor({
      name: name.trim(),
      email: provisionalProfessor.email,
      password: hashedPassword,
      profile: {
        phone: phone ? phone.trim() : '',
        linkedin: linkedin ? linkedin.trim() : '',
        bio: bio ? bio.trim() : ''
      },
      preferences: preferences || [],
      university: provisionalProfessor.university._id
    });

    await newProfessor.save();
    console.log('New professor created:', newProfessor._id);
    await ProvisionalProfessor.findByIdAndDelete(id);
    console.log('Provisional professor deleted:', id);

    res.status(201).json({
      success: true,
      message: 'Professor account created successfully',
      data: {
        professor: {
          id: newProfessor._id,
          name: newProfessor.name,
          email: newProfessor.email,
          university: provisionalProfessor.university.name
        }
      }
    });
  } catch (error) {
    console.error('Error completing professor profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists. Please contact university administration.'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating professor account',
      error: error.message
    });
  }
});

userRouter.get('/test-provisional', async (req, res) => {
  try {
    const professors = await ProvisionalProfessor.find().populate('university');
    res.json({
      count: professors.length,
      professors: professors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



userRouter.put('/update-profile', authUser, updateUserProfile); //

userRouter.get('/profile', authUser, getProfile);
userRouter.put('/profile', authUser, updateProfile);


export default userRouter;