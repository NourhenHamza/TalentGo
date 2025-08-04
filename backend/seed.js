import mongoose from 'mongoose';
import ProfessorModel from './models/ProfessorModel.js';
import UserModel from './models/userModel.js';
import SubjectModel from './models/Subject.js';
import Assignment from './models/Assignment.js';

const seedAssignments = async () => {
    try {
        // Connexion à la base de données
        await mongoose.connect('mongodb://localhost:27017/pfe_management_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connexion à la base de données réussie.");

        // Recherche du professeur
        const professor = await ProfessorModel.findOne({ email: "eyoueya86@gmail.com" });
        if (!professor) {
            console.log("❌ Professeur introuvable.");
            return;
        }

        // Recherche des étudiants
        const students = await UserModel.find({});
        if (students.length === 0) {
            console.log("❌ Aucun étudiant trouvé.");
            return;
        }

        let assignmentsCreated = 0; // Compteur d'assignments créés

        for (let student of students) {
            // Récupérer les sujets proposés par l'étudiant
            const subjects = await SubjectModel.find({ proposedBy: student._id });

            if (subjects.length === 0) {
                console.log(`⚠️ L'étudiant ${student.name} n'a proposé aucun sujet.`);
                continue;
            }

            for (let subject of subjects) {
                // Assigner le professeur comme superviseur
                subject.supervisor = professor._id;
                await subject.save();

                // Vérification avant de créer un assignment
                const existingAssignment = await Assignment.findOne({
                    student: student._id,
                    subject: subject._id,
                    professor: professor._id
                });

                if (!existingAssignment) {
                    const assignment = new Assignment({
                        student: student._id,
                        subject: subject._id,
                        professor: professor._id,
                        status: 'assigned',
                    });

                    await assignment.save();
                    assignmentsCreated++;
                }
            }
        }

        console.log(`✅ ${assignmentsCreated} assignments insérés avec succès.`);
    } catch (error) {
        console.error("❌ Erreur lors de l'insertion des assignments:", error);
    } finally {
        mongoose.connection.close(); // Fermer la connexion après exécution
        console.log("🔌 Connexion MongoDB fermée.");
    }
};

seedAssignments();
