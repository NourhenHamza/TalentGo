// adminController.js
 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { emitAssignmentEvent } from '../events/index.js';
import Assignment from '../models/Assignment.js';
import Subject from '../models/Subject.js';
import University from '../models/University.js';
import ProfessorModel from './../models/ProfessorModel.js'; // Assurez-vous que le chemin est correct
import userModel from './../models/userModel.js';

const getProjects = async (req, res) => {
  try {
    const projects = await Subject.find({})
      .populate('proposedBy', 'name email profile')
      .populate('supervisor', 'name email profile department')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      projects,
      count: projects.length,
      message: "Projects retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching projects" 
    });
  }
};

// Make sure to import Professor model at the top of your file
// import Professor from '../models/Professor.js'; // or whatever your import path is

const assignProject = async (req, res) => {
  try {
    const { projectId, professorId } = req.body;

    // Validate input
    if (!projectId || !professorId) {
      return res.status(400).json({
        success: false,
        message: "Project ID and Professor ID are required"
      });
    }

    // Get the full project with student and university populated
    const project = await Subject.findById(projectId)
      .populate({
        path: 'proposedBy',
        populate: {
          path: 'university',
          model: 'University'
        }
      })
      .exec();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Vérifier si l'étudiant proposant le projet est associé à une université
    if (!project.proposedBy?.university) {
      return res.status(400).json({
        success: false,
        message: "The student proposing the project must be associated with a university"
      });
    }

    // Récupérer le professeur pour accéder à son université
    const professor = await ProfessorModel.findById(professorId);

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor not found"
      });
    }

    // Check if professor has reached max students limit
    if (professor.professorData.currentStudents >= professor.professorData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Professor has reached maximum student capacity"
      });
    }

    // Mettre à jour le projet avec le superviseur, le statut et la date d'affectation
    const updatedProject = await Subject.findByIdAndUpdate(
      projectId,
      {
        supervisor: professorId,
        status: 'assigned',
        assignedDate: new Date()
      },
      { new: true }
    );

    // Create assignment with university from the professor
    const newAssignment = new Assignment({
      student: project.proposedBy._id,
      subject: projectId,
      professor: professorId,
      university: professor.university, // Add the university from professor
      status: 'assigned'
    });

    const savedAssignment = await newAssignment.save();

    // **FIX: Increment the professor's current students count**
    await ProfessorModel.findByIdAndUpdate(
      professorId,
      { 
        $inc: { 'professorData.currentStudents': 1 } 
      }
    );

    // Fully populate the assignment for the response
    const populatedAssignment = await Assignment.findById(savedAssignment._id)
      .populate('student')
      .populate('professor')
      .populate('subject')
      .populate('university');

    // Emit assignment created event
    emitAssignmentEvent('created', populatedAssignment.toObject());

    res.status(200).json({
      success: true,
      project: updatedProject,
      assignment: populatedAssignment,
      message: "Project assigned successfully"
    });

  } catch (error) {
    console.error('Error assigning project:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign project"
    });
  }
};
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    // Check if project exists
    const project = await Subject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Delete related assignments
    await Assignment.deleteMany({ project: projectId });
    
    // Delete the project
    await Subject.findByIdAndDelete(projectId);
    
    res.status(200).json({
      success: true,
      message: "Project and related assignments deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project"
    });
  }
};

// Professor Management Controllers
const addProfessor = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    let universityId = null;

    // Si une université est connectée, utilisez son ID
    if (req.university && req.university.universityData && req.university.universityData.id) {
      universityId = req.university.universityData.id;
    } else if (!req.admin) {
      // Si ni admin ni université n'est connecté, ou si l'admin n'est pas censé ajouter des profs sans université
      return res.status(403).json({
        success: false,
        message: "Unauthorized to add professor without a linked university."
      });
    }

    // Validation
    if (!name || !email || !password || !department) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters" 
      });
    }

    // Check if professor exists
    const existingProfessor = await ProfessorModel.findOne({ email });
    if (existingProfessor) {
      return res.status(409).json({ 
        success: false, 
        message: "Professor already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create professor
    const newProfessor = new ProfessorModel({
      name,
      email,
      password: hashedPassword,
      department,
      university: universityId, // Assigner l'ID de l'université
      date: Date.now()
    });

    await newProfessor.save();

    // Return professor data without password
    const professorData = newProfessor.toObject();
    delete professorData.password;

    res.status(201).json({
      success: true,
      professor: professorData,
      message: "Professor added successfully"
    });
  } catch (error) {
    console.error('Error adding professor:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add professor"
    });
  }
};

// MODIFICATION ICI : allProfessors pour filtrer par université
const allProfessors = async (req, res) => {
  try {
    let query = {}; // Initialiser un objet de requête vide

    // Vérifier si la requête provient d'une université authentifiée
    if (req.university && req.university.universityData && req.university.universityData.id) {
      query.university = req.university.universityData.id;
      console.log(`Fetching professors for university ID: ${query.university}`);
    } else if (req.admin) {
      // Si un administrateur est connecté, aucun filtre d'université spécifique n'est appliqué,
      // ce qui signifie que tous les professeurs seront récupérés.
      console.log("Fetching all professors for admin.");
    } else {
      // Si ni admin ni université n'est authentifié (devrait être géré par le middleware authAdmin avant)
      return res.status(403).json({
        success: false,
        message: "Access denied. Not authorized to view professors."
      });
    }

    const professors = await ProfessorModel.find(query) // Appliquer le filtre de la requête
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      professors,
      count: professors.length,
      message: "Professors retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch professors"
    });
  }
};

 


const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 1. Check if it's the super admin
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                token,
                role: 'admin',
                message: "Admin logged in successfully"
            });
        }

        // 2. Check for university login
        const university = await University.findOne({
            $or: [
                { 'loginCredentials.email': email },
                { 'contactPerson.email': email }
            ],
            status: 'approved'
        }).select('+loginCredentials.password');

        if (!university) {
            return res.status(401).json({
                success: false,
                message: "No approved university found with these credentials"
            });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, university.loginCredentials.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 4. Update last login
        university.loginCredentials.lastLogin = new Date();
        await university.save();

        // 5. Create token
        const token = jwt.sign(
            { 
                id: university._id,
                email: university.loginCredentials.email || university.contactPerson.email,
                role: 'university',
                name: university.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            role: 'university',
            university: {
                id: university._id,
                name: university.name,
                email: university.loginCredentials.email || university.contactPerson.email
            },
            message: "University logged in successfully"
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
};


const adminDashboard = async (req, res) => {
  try {
    const [professors, users,  projects] = await Promise.all([
      ProfessorModel.find({}),
      userModel.find({}),
      Subject.find({})
    ]);

   

    res.status(200).json({
      success: true,
      data: dashData,
      message: "Dashboard data retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard"
    });
  }
};
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({})
      .populate('student', 'name email')
      .populate('professor', 'name email department')
      .populate('project', 'title description')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      assignments,
      count: assignments.length,
      message: "Assignments retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assignments"
    });
  }
};
export {
  addProfessor,
  adminDashboard,
  allProfessors, assignProject,
  deleteProject,
  getAssignments, getProjects, loginAdmin
};
