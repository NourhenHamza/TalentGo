import jwt from 'jsonwebtoken';
import ProfessorModel from '../models/ProfessorModel.js';
const authProfessor = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Token manquant ou mal formé." });

        }

        const token = authHeader.split(" ")[1];  // Extraire le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Vérifier le token

        const professor = await ProfessorModel.findById(decoded.id);
        if (!professor) {
            return res.status(404).json({ success: false, message: "Professeur non trouvé." });
        }

        // Mettre l'objet du professeur dans req.professor
        req.professor = { id: professor._id };  
        next();
    } catch (error) {
        console.error("Erreur d'authentification:", error);
        return res.status(401).json({ success: false, message: "Token invalide. Veuillez vous reconnecter." });
    }
};

export default authProfessor;
