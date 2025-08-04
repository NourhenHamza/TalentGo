import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ProfessorModel from "../models/ProfessorModel.js";
import Assignment from '../models/Assignment.js';

 

const ProfessorsList = async (req,res) => {
    try {
        const Professors = await ProfessorModel.find({}).select(['-password', '-email'])
        res.json({success:true , Professors})
        
    } catch (error) {
         console.log(error);
        res.json({ success: false, message: error.message });
        
    }
}

// api for Professor login
const loginProfessor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const professor = await ProfessorModel.findOne({ email });

        if (!professor) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, professor.password);

        if (isMatch) {
            const token = jwt.sign({ id: professor._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
 
    
  
 
// api to get Professor profile 
const getProfessorProfile = async (req, res) => {
    try {

        const {docId}=req.body
        
        const profileData = await ProfessorModel.findById(docId).select('-password')
        
        res.json({success:true,profileData})
    } catch (error) {
         console.log(error)
         res.json({success:false,message:error.message}) 
    }
    
}

// api to update Professor profile data
const updateProfessorProfile = async (req, res) => {
    try {
        const { preferences, maxStudents } = req.body;
        const professor = await ProfessorModel.findByIdAndUpdate(
            req.professor.id, // Utiliser l'ID du professeur extrait du token
            { $set: { preferences, 'professorData.maxStudents': maxStudents } },
            { new: true }
        );
        
        if (!professor) {
            return res.status(404).json({ success: false, message: "Professeur non trouvé." });
        }

        res.json({ success: true, professor });
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
}

// Obtenir les données du professeur
const getProfessorData = async (req, res) => {
    try {
        const professor = await ProfessorModel.findById(req.professor.id).select("preferences professorData");
        if (!professor) {
            return res.status(404).json({ success: false, message: "Professeur non trouvé" });
        }
        res.status(200).json({ success: true, data: professor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// Mettre à jour les préférences et le nombre max d'étudiants
const updateProfessorData = async (req, res) => {
    try {
        const { preferences, maxStudents } = req.body;

        const updatedProfessor = await ProfessorModel.findByIdAndUpdate(
            req.professor.id,
            { 
                preferences, 
                "professorData.maxStudents": maxStudents 
            },
            { new: true, runValidators: true }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ success: false, message: "Professeur non trouvé" });
        }

        res.status(200).json({ success: true, message: "Données mises à jour", data: updatedProfessor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};



const getAssignments = async (req, res) => {
    try {
        console.log('Professeur dans req.professor :', req.professor); // Vérifie le contenu de req.professor
        const professor = await ProfessorModel.findById(req.professor.id);

        if (!professor) {
            return res.status(404).json({ message: "Professeur non trouvé" });
        }

        // Ajout de 'technologies' dans le populate de subject
        const assignments = await Assignment.find({ professor: professor._id })
            .populate('student', 'name email')  // Récupère les infos de l'étudiant
            .populate('subject', 'title technologies'); // Maintenant on récupère aussi les technologies !

        return res.status(200).json(assignments);
    } catch (error) {
        console.error('Erreur dans la récupération des assignments :', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};




export {
    getProfessorProfile, loginProfessor, ProfessorsList, updateProfessorProfile, getProfessorData, updateProfessorData, getAssignments
};

