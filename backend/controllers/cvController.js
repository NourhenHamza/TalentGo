import CV from '../models/CV.js';
import fs from 'fs';
import path from 'path';
import UserModel from '../models/userModel.js';

// Upload CV supplémentaire (après inscription)
export const uploadCV = async (req, res) => {
  console.log("--- Début du contrôleur uploadCV ---");
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);
  console.log("req.user:", req.user);
  
  // Vérification du fichier
  if (!req.file) {
    console.log("❌ Aucun fichier fourni dans req.file");
    return res.status(400).json({
      success: false,
      message: "Aucun fichier CV n'a été fourni."
    });
  }

  // Extraction de l'ID utilisateur avec plusieurs méthodes
  const studentId = req.user?.id || req.user?._id || req.user?.userId || req.body?.userId;
  console.log("studentId extrait:", studentId);
  console.log("req.user complet:", JSON.stringify(req.user, null, 2));
  
  if (!studentId) {
    console.log("❌ Authentification échouée - aucun ID utilisateur trouvé");
    // Supprimer le fichier uploadé si l'authentification échoue
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Erreur lors de la suppression du fichier:", unlinkErr);
      });
    }
    return res.status(401).json({
      success: false,
      message: "Authentification requise. ID utilisateur manquant."
    });
  }

  try {
    // Vérifier si l'utilisateur existe
    const userExists = await UserModel.findById(studentId);
    if (!userExists) {
      console.log("❌ Utilisateur non trouvé:", studentId);
      // Supprimer le fichier uploadé
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Erreur lors de la suppression du fichier:", unlinkErr);
        });
      }
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé."
      });
    }

    // Créer l'URL complète pour accéder au fichier
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/api/cvs/file/${req.file.filename}`;
    
    // Récupérer la description optionnelle du CV
    const { description } = req.body;
    
    console.log("💾 Création du CV avec les données:", {
      student: studentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      fileUrl: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
         
    const newCV = new CV({
      student: studentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      fileUrl: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      cvType: 'additional', // CV supplémentaire
      isActive: true, // Ce nouveau CV devient actif
      description: description || `CV supplémentaire - ${new Date().toLocaleDateString()}`
    });

    const savedCV = await newCV.save();
    console.log("✅ CV supplémentaire enregistré avec succès:", savedCV._id);

    res.status(201).json({
      success: true,
      message: "CV supplémentaire téléchargé avec succès !",
      cv: savedCV
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement du CV:", error);
    console.error("❌ Stack trace:", error.stack);
         
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Erreur lors de la suppression du fichier:", unlinkErr);
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Un fichier avec ce nom existe déjà."
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'enregistrement du CV.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPrimaryCV = async (req, res) => {
    try {
        console.log('🚀 =========================');
        console.log('🚀 getPrimaryCV DÉMARRÉ');
        console.log('🚀 =========================');
        console.log('📝 req.user:', req.user);
        console.log('📝 req.cookies:', req.cookies);
        console.log('📝 req.headers.authorization:', req.headers.authorization);
        
        // Extraction de l'ID utilisateur avec plusieurs méthodes
        const studentId = req.user?.id || req.user?._id || req.user?.userId || req.body?.userId;
        console.log('👤 studentId extrait:', studentId);
        console.log('👤 req.user complet:', JSON.stringify(req.user, null, 2));
        
        if (!studentId) {
            console.error('❌ ERREUR: Aucun studentId trouvé');
            return res.status(401).json({
                success: false,
                message: "Authentification requise. ID utilisateur manquant.",
                debug: {
                    user: req.user,
                    cookies: req.cookies,
                    authorization: req.headers.authorization
                }
            });
        }

        // Vérifier si l'utilisateur existe
        const userExists = await UserModel.findById(studentId);
        if (!userExists) {
            console.log("❌ Utilisateur non trouvé:", studentId);
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé."
            });
        }

        console.log('🔍 Recherche du CV primaire pour studentId:', studentId);
        
        // Chercher le CV primaire
        const primaryCV = await CV.findOne({
            student: studentId,
            cvType: 'primary'
        });

        console.log('📄 Résultat de la recherche CV primaire:', primaryCV);

        if (!primaryCV) {
            console.log('⚠️ Aucun CV primaire trouvé, recherche de tous les CVs...');
            
            // Chercher tous les CVs de l'utilisateur pour debug
            const allCVs = await CV.find({ student: studentId });
            console.log('📋 Tous les CVs trouvés:', allCVs);
            
            // Si aucun CV primaire, chercher le CV actif le plus récent
            const activeCV = await CV.findOne({
                student: studentId,
                isActive: true
            }).sort({ uploadedAt: -1 });
            
            if (activeCV) {
                console.log('📄 CV actif trouvé à la place:', activeCV);
                return res.status(200).json({
                    success: true,
                    cv: activeCV,
                    message: "CV actif retourné (pas de CV primaire trouvé)"
                });
            }
            
            return res.status(404).json({
                success: false,
                message: "Aucun CV principal trouvé.",
                debug: {
                    studentId: studentId,
                    totalCVs: allCVs.length,
                    cvs: allCVs.map(cv => ({
                        id: cv._id,
                        type: cv.cvType,
                        filename: cv.filename,
                        isActive: cv.isActive
                    }))
                }
            });
        }

        console.log('✅ CV primaire trouvé, envoi de la réponse');
        res.status(200).json({
            success: true,
            cv: primaryCV
        });

    } catch (error) {
        console.error('💥 ERREUR dans getPrimaryCV:', error);
        console.error('💥 Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération du CV primaire.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Nouvelle fonction pour servir les fichiers CV
export const getCVFile = async (req, res) => {
  try {
    const { filename } = req.params;
    console.log('🔍 Recherche du fichier:', filename);
    
    // Vérifier si le fichier existe en base
    const cv = await CV.findOne({ filename });
    if (!cv) {
      console.log('❌ CV non trouvé en base:', filename);
      return res.status(404).json({
        success: false,
        message: "Fichier CV non trouvé."
      });
    }

    // Construire le chemin du fichier
    const filePath = path.resolve(cv.filepath);
    console.log('📁 Chemin du fichier:', filePath);
    
    // Vérifier si le fichier existe physiquement
    if (!fs.existsSync(filePath)) {
      console.log('❌ Fichier physique non trouvé:', filePath);
      return res.status(404).json({
        success: false,
        message: "Fichier physique non trouvé."
      });
    }

    // Définir les headers appropriés
    res.setHeader('Content-Type', cv.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${cv.originalName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('✅ Envoi du fichier');
    // Envoyer le fichier
    res.sendFile(filePath);

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du fichier CV:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du fichier."
    });
  }
};

// Récupérer tous les CV d'un étudiant
export const getMyCVs = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id || req.user?.userId || req.body?.userId;
    console.log('🔍 getMyCVs pour studentId:', studentId);
        
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise."
      });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await UserModel.findById(studentId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé."
      });
    }

    // Récupérer tous les CV de l'étudiant, triés par date
    const cvs = await CV.find({ student: studentId }).sort({ uploadedAt: -1 });
    console.log('📋 CVs trouvés:', cvs.length);
        
    res.status(200).json({
      success: true,
      cvs
    });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des CV:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des CV."
    });
  }
};

// Récupérer le CV actif de l'étudiant
export const getActiveCV = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id || req.user?.userId || req.body?.userId;
    console.log('🔍 getActiveCV pour studentId:', studentId);
    
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise."
      });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await UserModel.findById(studentId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé."
      });
    }

    // Utiliser la méthode statique pour récupérer le CV actif ou chercher manuellement
    let activeCV;
    if (CV.getActiveCV) {
      activeCV = await CV.getActiveCV(studentId);
    } else {
      activeCV = await CV.findOne({
        student: studentId,
        isActive: true
      }).sort({ uploadedAt: -1 });
    }

    if (!activeCV) {
      return res.status(404).json({
        success: false,
        message: "Aucun CV actif trouvé."
      });
    }

    res.status(200).json({
      success: true,
      cv: activeCV
    });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du CV actif:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du CV actif."
    });
  }
};

// Supprimer un CV
export const deleteCV = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id || req.user?.userId || req.body?.userId;
    const { cvId } = req.params;
    
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise."
      });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await UserModel.findById(studentId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé."
      });
    }

    // Trouver le CV
    const cv = await CV.findOne({ 
      _id: cvId, 
      student: studentId 
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV non trouvé."
      });
    }

    // Empêcher la suppression du CV primaire
    if (cv.cvType === 'primary') {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer le CV principal."
      });
    }

    // Supprimer le fichier physique
    if (cv.filepath && fs.existsSync(cv.filepath)) {
      fs.unlinkSync(cv.filepath);
      console.log('✅ Fichier physique supprimé:', cv.filepath);
    }

    // Supprimer de la base de données
    await CV.findByIdAndDelete(cvId);
    console.log('✅ CV supprimé de la base de données:', cvId);

    res.status(200).json({
      success: true,
      message: "CV supprimé avec succès."
    });

  } catch (error) {
    console.error("❌ Erreur lors de la suppression du CV:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression du CV."
    });
  }
};