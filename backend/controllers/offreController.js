import fs from 'fs';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import Company from "../models/Company.js";
import OffreStageEmploi from "../models/OffreStageEmploi.js";
import PublicApplication from "../models/PublicApplication.js";
import Test from "../models/Test.js";


export const createOffre = async (req, res) => {
  try {
    logRequest(req, 'CREATE_OFFRE_START');

    // 1. Authentification de l'entreprise
    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details
      });
    }
    const { entreprise_id } = tokenResult;

    // 2. Extraction des données du corps de la requête.
    // 'test' contiendra l'objet complet que vous avez décrit si le frontend l'envoie.
    // 'offreData' contiendra le reste (titre, description, etc.).
    const { test, ...offreData } = req.body;

    // 3. Validation des champs principaux de l'offre
    const { titre, description, type_offre, date_limite_candidature, nombre_postes, categorie } = offreData;
    if (!titre || !description || !type_offre || !date_limite_candidature || !nombre_postes || !categorie) {
      return res.status(400).json({
        success: false,
        message: "Les champs titre, description, type_offre, date_limite_candidature, nombre_postes et categorie sont obligatoires.",
      });
    }

    // 4. Vérification de l'existence de l'entreprise
    const companyExists = await Company.findById(entreprise_id);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: "L'entreprise spécifiée n'existe pas.",
      });
    }

    // 5. Création de la nouvelle instance de l'offre
    console.log('CREATE_OFFRE: Assembling the new offer object...');
    const nouvelleOffre = new OffreStageEmploi({
      // --- Champs de base de l'offre ---
      ...offreData,
      entreprise_id,
      date_limite_candidature: new Date(date_limite_candidature),
      nombre_postes: parseInt(nombre_postes),
      remuneration: offreData.hasRemuneration ? offreData.remuneration : undefined,
      
      // --- PARTIE CRUCIALE POUR VOTRE DEMANDE ---
      
      // Le champ 'requiresTest' est défini à 'true' si l'objet 'test' existe, 'false' sinon.
      // Ce champ est au niveau racine de l'offre, comme dans votre exemple.
      requiresTest: !!test, 
      
      // Le champ 'test' de votre schéma Mongoose recevra l'intégralité de l'objet 'test'
      // envoyé par le client. Cela inclut :
      // - testName
      // - description
      // - testDuration
      // - passingScore
      // - maxAttempts
      // - instructions
      // - security (l'objet complet)
      // - questions (le tableau complet)
      // - isActive
      // - availableFrom
      // Tout ce qui est dans l'objet 'test' du req.body sera placé ici.
      test: test ? test : undefined,
    });

    // 6. Sauvegarde dans la base de données
    const offreSauvegardee = await nouvelleOffre.save();
    console.log('CREATE_OFFRE: Offer saved successfully with ID:', offreSauvegardee._id);

    // 7. Préparation de la réponse
    const offreComplete = await OffreStageEmploi.findById(offreSauvegardee._id)
      .populate("entreprise_id", "nom logo secteur")
      .lean();

    console.log('CREATE_OFFRE_SUCCESS: Offer created successfully');
    
    // 8. Envoi de la réponse de succès
    res.status(201).json({
      success: true,
      message: "Offre créée avec succès",
      data: offreComplete,
    });

  } catch (error) {
    console.error("CREATE_OFFRE_ERROR: Unexpected error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Erreur de validation des données.",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de l'offre.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Update offer
// @route   PUT /api/offres/:id
// @access  Private (Company)
export const updateOffre = async (req, res) => {
  try {
    logRequest(req, 'UPDATE_OFFRE_START', { offreId: req.params.id });

    // 1. Extraction et validation du token
    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log('UPDATE_OFFRE_ERROR: Token validation failed');
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details
      });
    }

    const { entreprise_id } = tokenResult;
    const { id } = req.params;

    // 2. Extraction du corps de la requête
    const { test, ...offreData } = req.body;

    console.log('UPDATE_OFFRE: Request body received:', {
      ...offreData,
      hasTest: !!test
    });

    // 3. Validation des champs obligatoires
    const { titre, description, type_offre, date_limite_candidature, nombre_postes, categorie } = offreData;
    if (!titre || !description || !type_offre || !date_limite_candidature || !nombre_postes || !categorie) {
      console.log('UPDATE_OFFRE_ERROR: Missing required fields');
      return res.status(400).json({
        success: false,
        message: "Les champs titre, description, type_offre, date_limite_candidature, nombre_postes et categorie sont obligatoires",
      });
    }

    // 4. Recherche de l'offre à mettre à jour
    const offreToUpdate = await OffreStageEmploi.findOne({ _id: id, entreprise_id });
    if (!offreToUpdate) {
      console.log('UPDATE_OFFRE_ERROR: Offer not found or unauthorized for ID:', id);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    // 5. Mise à jour des champs de l'offre (CORRIGÉ)
    console.log('UPDATE_OFFRE: Updating offer fields');
    
    // Appliquer les modifications de base
    Object.assign(offreToUpdate, offreData);
    
    // Assurer le bon typage des champs spécifiques
    offreToUpdate.date_limite_candidature = new Date(date_limite_candidature);
    offreToUpdate.nombre_postes = parseInt(nombre_postes);
    offreToUpdate.remuneration = offreData.hasRemuneration ? offreData.remuneration : undefined;

    // Gérer le test d'évaluation de manière concise
    if (test && test.testName && test.questions && test.questions.length > 0) {
      console.log('UPDATE_OFFRE: Adding/Updating test data to offer');
      offreToUpdate.test = test; // Assigne l'objet test complet (avec security)
      offreToUpdate.requiresTest = true;
    } else {
      console.log('UPDATE_OFFRE: Removing test data from offer');
      offreToUpdate.test = undefined; // Mongoose supprimera ce champ
      offreToUpdate.requiresTest = false;
    }

    // 6. Sauvegarde des modifications
    const offreMiseAJour = await offreToUpdate.save();
    console.log('UPDATE_OFFRE: Offer updated successfully');

    // 7. Récupération avec les données complètes pour la réponse
    const offreComplete = await OffreStageEmploi.findById(offreMiseAJour._id)
      .populate("entreprise_id", "nom logo secteur")
      .lean();

    console.log('UPDATE_OFFRE_SUCCESS: Offer updated successfully');
    res.status(200).json({
      success: true,
      message: "Offre mise à jour avec succès",
      data: offreComplete,
    });

  } catch (error) {
    console.error("UPDATE_OFFRE_ERROR: Unexpected error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'offre",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Fonction utilitaire pour logger les requêtes
const logRequest = (req, action, additionalInfo = {}) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent");
  const authHeader = req.headers.authorization ? "Present" : "Missing";

  console.log(`[${timestamp}] ${action}`, {
    method: req.method,
    url: req.originalUrl,
    ip,
    userAgent,
    authHeader,
    params: req.params,
    query: req.query,
    ...additionalInfo,
  });
};

// Fonction utilitaire pour extraire et valider le token
const extractAndValidateToken = (req) => {
  logRequest(req, "TOKEN_EXTRACTION_START");

  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  if (!authHeader) {
    console.log("ERROR: No authorization header provided");
    return { error: "No authentication token provided. Please log in.", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token ? `${token.substring(0, 20)}...` : "null");

  if (!token) {
    console.log("ERROR: No token found in authorization header");
    return { error: "No authentication token provided. Please log in.", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", { id: decoded.id, exp: decoded.exp });

    const entreprise_id = decoded.id;
    if (!entreprise_id) {
      console.log("ERROR: No entreprise_id found in token payload");
      return { error: "Invalid token: entreprise_id not found.", status: 400 };
    }

    console.log("Token validation successful, entreprise_id:", entreprise_id);
    return { entreprise_id, decoded };
  } catch (error) {
    console.log("ERROR: Token verification failed:", error.message);
    return {
      error: "Invalid or expired token.",
      status: 401,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

// @desc    Récupérer toutes les offres de stage/emploi avec recherche et filtres
// @route   GET /api/offres
// @access  Public
export const getOffres = async (req, res) => {
  try {
    logRequest(req, "GET_OFFRES_START");

    const { search, type, location, skills, withTest, categorie } = req.query;
    console.log("GET_OFFRES: Query parameters:", { search, type, location, skills, withTest, categorie });

    let query = {};

    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      console.log("GET_OFFRES: Added search filter for:", search);
    }

    if (type) {
      query.type_offre = type;
      console.log("GET_OFFRES: Added type filter:", type);
    }

    if (location) {
      query.localisation = { $regex: location, $options: "i" };
      console.log("GET_OFFRES: Added location filter:", location);
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      query.competences_requises = { $in: skillsArray.map((s) => new RegExp(s, "i")) };
      console.log("GET_OFFRES: Added skills filter:", skillsArray);
    }

    if (categorie) {
      query.categorie = categorie;
      console.log("GET_OFFRES: Added category filter:", categorie);
    }

    query.statut = "active";
    query.isPublishedForStudents = true; // Only show offers published for students
    query.date_limite_candidature = { $gte: new Date() };

    const offres = await OffreStageEmploi.find(query)
      .populate("entreprise_id", "nom email_contact logo_url")
      .sort({ publishedAt: -1, createdAt: -1 });

    console.log("GET_OFFRES_SUCCESS: Found", offres.length, "published offers");

    res.status(200).json({
      success: true,
      data: offres,
    });
  } catch (error) {
    console.error("GET_OFFRES_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des offres",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Récupérer une offre de stage/emploi par ID
// @route   GET /api/offres/:id
// @access  Public
export const getOffreById = async (req, res) => {
  try {

    const offre = await OffreStageEmploi.findById(req.params.id).populate(
      "entreprise_id",
      "nom email_contact logo_url"
    );

    if (!offre) {
      console.log("GET_OFFRE_BY_ID_ERROR: Offer not found for ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée",
      });
    }

    console.log("GET_OFFRE_BY_ID_SUCCESS: Offer found:", offre.titre);
    res.status(200).json({
      success: true,
      data: offre,
    });
  } catch (error) {
    console.error("GET_OFFRE_BY_ID_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l\"offre",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Récupérer toutes les offres d'une entreprise spécifique
// @route   GET /api/offres/company/:companyId
// @access  Public (maintenant retourne toutes les offres, publiées ou non)
export const getOffresByCompany = async (req, res) => {
  try {
    logRequest(req, "GET_OFFRES_BY_COMPANY_START", { companyId: req.params.companyId });

    let companyId = req.params.companyId;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.log("GET_OFFRES_BY_COMPANY_ERROR: Invalid company ID:", companyId);
      return res.status(400).json({
        success: false,
        message: "ID d'entreprise invalide.",
      });
    }

    console.log("GET_OFFRES_BY_COMPANY: Searching all offers for company ID:", companyId);

    const offres = await OffreStageEmploi.find({ entreprise_id: companyId })
      .populate("entreprise_id", "nom email_contact logo_url")
      .sort({ createdAt: -1 });

    console.log("GET_OFFRES_BY_COMPANY: Found", offres.length, "offers for company");

    if (offres.length === 0) {
      console.log("GET_OFFRES_BY_COMPANY: No offers found for company:", companyId);
      return res.status(404).json({
        success: false,
        message: "Aucune offre trouvée pour cette entreprise.",
      });
    }

    console.log("GET_OFFRES_BY_COMPANY_SUCCESS: Returning offers for company");
    res.status(200).json({
      success: true,
      data: offres,
    });
  } catch (error) {
    console.error("GET_OFFRES_BY_COMPANY_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des offres",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Supprimer une offre de stage/emploi
// @route   DELETE /api/offres/:id
// @access  Private (authentifié)
export const deleteOffre = async (req, res) => {
  try {
    logRequest(req, "DELETE_OFFRE_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("DELETE_OFFRE_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("DELETE_OFFRE: Processing for entreprise_id:", entreprise_id);

    const { id } = req.params;

    console.log("DELETE_OFFRE: Finding offer to delete");
    const offre = await OffreStageEmploi.findById(id);

    if (!offre) {
      console.log("DELETE_OFFRE_ERROR: Offer not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée",
      });
    }

    if (offre.entreprise_id.toString() !== entreprise_id) {
      console.log("DELETE_OFFRE_ERROR: Unauthorized deletion attempt for offer:", id);
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cette offre.",
      });
    }

    if (offre.test_id) {
      console.log("DELETE_OFFRE: Deleting associated test");
      await Test.findByIdAndDelete(offre.test_id);
    }

    await offre.deleteOne();
    console.log("DELETE_OFFRE_SUCCESS: Offer deleted successfully");

    res.status(200).json({
      success: true,
      message: "Offre supprimée avec succès",
    });
  } catch (error) {
    console.error("DELETE_OFFRE_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'offre",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Toggle publish status of an offer
// @route   PUT /api/offres/:id/toggle-publish
// @access  Private (Company)
export const togglePublishStatus = async (req, res) => {
  try {
    logRequest(req, "TOGGLE_PUBLISH_STATUS_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("TOGGLE_PUBLISH_STATUS_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("TOGGLE_PUBLISH_STATUS: Processing for entreprise_id:", entreprise_id);

    const { id } = req.params;

    console.log("TOGGLE_PUBLISH_STATUS: Finding offer");
    const offre = await OffreStageEmploi.findOne({ _id: id, entreprise_id });

    if (!offre) {
      console.log("TOGGLE_PUBLISH_STATUS_ERROR: Offer not found or unauthorized for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    let updatedOffre;
    let message;

    if (offre.isPublished) {
      console.log("TOGGLE_PUBLISH_STATUS: Unpublishing offer");
      updatedOffre = await offre.unpublish();
      message = "Offre dépubliée avec succès";
    } else {
      console.log("TOGGLE_PUBLISH_STATUS: Publishing offer");

      if (offre.requiresTest && offre.test && !offre.publicTestLink) {
        console.log("TOGGLE_PUBLISH_STATUS: Generating public test link for offer with test");

        let publicTestLink;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!isUnique && attempts < maxAttempts) {
          publicTestLink = uuidv4();
          const existingOffer = await OffreStageEmploi.findOne({ publicTestLink });
          if (!existingOffer) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          console.log("TOGGLE_PUBLISH_STATUS_ERROR: Failed to generate unique link");
          return res.status(500).json({
            success: false,
            message: "Erreur lors de la génération du lien unique",
          });
        }

        offre.publicTestLink = publicTestLink;
        offre.publicTestEnabled = true;
        offre.publicTestGeneratedAt = new Date();
        offre.publicApplicationsCount = 0;
      }

      try {
        updatedOffre = await offre.publish();
        message = "Offre publiée avec succès";

        if (offre.publicTestLink) {
          const baseUrl = "http://localhost:5173";
          const fullPublicLink = `${baseUrl}/publictest/${offre.publicTestLink}`;
          message += ` - Lien public généré: ${fullPublicLink}`;
        }
      } catch (error) {
        console.log("TOGGLE_PUBLISH_STATUS_ERROR: Cannot publish offer:", error.message);
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    const offreComplete = await OffreStageEmploi.findById(updatedOffre._id)
      .populate("entreprise_id", "nom logo secteur")
      .lean();

    console.log("TOGGLE_PUBLISH_STATUS_SUCCESS: Publish status toggled successfully");
    res.status(200).json({
      success: true,
      message,
      data: {
        ...offreComplete,
        publicTestLink: offre.publicTestLink
          ? `http://localhost:5173/publictest/${offre.publicTestLink}`
          : null,
      },
    });
  } catch (error) {
    console.error("TOGGLE_PUBLISH_STATUS_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de statut de publication",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Toggle publish for students status of an offer
// @route   PUT /api/offres/:id/toggle-publish-students
// @access  Private (Company)
export const togglePublishForStudentsStatus = async (req, res) => {
  try {
    logRequest(req, "TOGGLE_PUBLISH_FOR_STUDENTS_STATUS_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS: Processing for entreprise_id:", entreprise_id);

    const { id } = req.params;

    console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS: Finding offer");
    const offre = await OffreStageEmploi.findOne({ _id: id, entreprise_id });

    if (!offre) {
      console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS_ERROR: Offer not found or unauthorized for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    let updatedOffre;
    let message;

    if (offre.isPublishedForStudents) {
      console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS: Unpublishing for students");
      updatedOffre = await offre.unpublishForStudents();
      message = "Offre dépubliée pour les étudiants avec succès";
    } else {
      console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS: Publishing for students");
      try {
        updatedOffre = await offre.publishForStudents();
        message = "Offre publiée pour les étudiants avec succès";
      } catch (error) {
        console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS_ERROR: Cannot publish for students:", error.message);
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    const offreComplete = await OffreStageEmploi.findById(updatedOffre._id)
      .populate("entreprise_id", "nom logo secteur")
      .lean();

    console.log("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS_SUCCESS: Publish status for students toggled successfully");
    res.status(200).json({
      success: true,
      message,
      data: {
        ...offreComplete,
        publicTestLink: offre.publicTestLink
          ? `http://localhost:5173/publictest/${offre.publicTestLink}`
          : null,
      },
    });
  } catch (error) {
    console.error("TOGGLE_PUBLISH_FOR_STUDENTS_STATUS_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de statut de publication pour étudiants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Générer un lien public pour un test
// @route   POST /api/offres/:id/generate-public-link
// @access  Private (Company)
export const generatePublicTestLink = async (req, res) => {
  try {
    logRequest(req, "GENERATE_PUBLIC_TEST_LINK_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("GENERATE_PUBLIC_TEST_LINK_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("GENERATE_PUBLIC_TEST_LINK: Processing for entreprise_id:", entreprise_id);

    const { id: offreId } = req.params;

    console.log("GENERATE_PUBLIC_TEST_LINK: Finding offer");
    const offre = await OffreStageEmploi.findOne({
      _id: offreId,
      entreprise_id,
    });

    if (!offre) {
      console.log("GENERATE_PUBLIC_TEST_LINK_ERROR: Offer not found or unauthorized");
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    if (!offre.requiresTest || !offre.test) {
      console.log("GENERATE_PUBLIC_TEST_LINK_ERROR: No test associated with offer");
      return res.status(400).json({
        success: false,
        message: "Cette offre n'a pas de test technique associé",
      });
    }

    if (offre.statut !== "active" || new Date() > offre.date_limite_candidature) {
      console.log("GENERATE_PUBLIC_TEST_LINK_ERROR: Offer is inactive or expired");
      return res.status(400).json({
        success: false,
        message: "Impossible de générer un lien pour une offre inactive ou expirée",
      });
    }

    if (offre.publicTestLink) {
      const baseUrl = "http://localhost:5173";
      const fullPublicLink = `${baseUrl}/publictest/${offre.publicTestLink}`;

      console.log("GENERATE_PUBLIC_TEST_LINK: Returning existing public link");
      return res.status(200).json({
        success: true,
        message: "Lien public existant récupéré",
        data: {
          publicTestLink: fullPublicLink,
          uuid: offre.publicTestLink,
          generatedAt: offre.publicTestGeneratedAt,
          isPublished: offre.isPublished,
          isPublishedForStudents: offre.isPublishedForStudents,
          offer: offre,
        },
      });
    }

    console.log("GENERATE_PUBLIC_TEST_LINK: Generating unique UUID");
    let publicTestLink;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      publicTestLink = uuidv4();
      const existingOffer = await OffreStageEmploi.findOne({ publicTestLink });
      if (!existingOffer) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      console.log("GENERATE_PUBLIC_TEST_LINK_ERROR: Failed to generate unique link");
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la génération du lien unique",
      });
    }

    console.log("GENERATE_PUBLIC_TEST_LINK: Updating offer with public link and publishing");
    const updatedOffre = await OffreStageEmploi.findByIdAndUpdate(
      offreId,
      {
        publicTestLink,
        publicTestEnabled: true,
        publicTestGeneratedAt: new Date(),
        publicApplicationsCount: 0,
         // Publish for students when generating public link
        
      },
      { new: true }
    ).populate("entreprise_id", "nom logo secteur");

    const baseUrl = "http://localhost:5173";
    const fullPublicLink = `${baseUrl}/publictest/${publicTestLink}`;

    console.log("GENERATE_PUBLIC_TEST_LINK_SUCCESS: Public link generated and offer published");
    res.status(200).json({
      success: true,
      message: "Lien public généré et offre publiée avec succès",
      data: {
        publicTestLink: fullPublicLink,
        uuid: publicTestLink,
        generatedAt: updatedOffre.publicTestGeneratedAt,
        
        publishedAt: updatedOffre.publishedAt,
        offer: updatedOffre,
      },
    });
  } catch (error) {
    console.error("GENERATE_PUBLIC_TEST_LINK_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la génération du lien public",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Désactiver un lien public
// @route   DELETE /api/offres/:id/disable-public-link
// @access  Private (Company)
export const disablePublicTestLink = async (req, res) => {
  try {
    logRequest(req, "DISABLE_PUBLIC_TEST_LINK_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("DISABLE_PUBLIC_TEST_LINK_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("DISABLE_PUBLIC_TEST_LINK: Processing for entreprise_id:", entreprise_id);

    const { id: offreId } = req.params;

    console.log("DISABLE_PUBLIC_TEST_LINK: Finding offer");
    const offre = await OffreStageEmploi.findOne({
      _id: offreId,
      entreprise_id,
    });

    if (!offre) {
      console.log("DISABLE_PUBLIC_TEST_LINK_ERROR: Offer not found or unauthorized");
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    if (!offre.publicTestLink) {
      console.log("DISABLE_PUBLIC_TEST_LINK_ERROR: No public link exists");
      return res.status(400).json({
        success: false,
        message: "Aucun lien public n'existe pour cette offre",
      });
    }

    console.log("DISABLE_PUBLIC_TEST_LINK: Disabling public link");
    const updatedOffre = await OffreStageEmploi.findByIdAndUpdate(
      offreId,
      {
        publicTestEnabled: false,
      },
      { new: true }
    ).populate("entreprise_id", "nom logo secteur");

    console.log("DISABLE_PUBLIC_TEST_LINK_SUCCESS: Public link disabled successfully");
    res.status(200).json({
      success: true,
      message: "Lien public désactivé avec succès",
      data: {
        offer: updatedOffre,
      },
    });
  } catch (error) {
    console.error("DISABLE_PUBLIC_TEST_LINK_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la désactivation du lien public",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Réactiver un lien public existant
// @route   PUT /api/offres/:id/enable-public-link
// @access  Private (Company)
export const enablePublicTestLink = async (req, res) => {
  try {
    logRequest(req, "ENABLE_PUBLIC_TEST_LINK_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("ENABLE_PUBLIC_TEST_LINK_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("ENABLE_PUBLIC_TEST_LINK: Processing for entreprise_id:", entreprise_id);

    const { id: offreId } = req.params;

    console.log("ENABLE_PUBLIC_TEST_LINK: Finding offer");
    const offre = await OffreStageEmploi.findOne({
      _id: offreId,
      entreprise_id,
    });

    if (!offre) {
      console.log("ENABLE_PUBLIC_TEST_LINK_ERROR: Offer not found or unauthorized");
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    if (!offre.publicTestLink) {
      console.log("ENABLE_PUBLIC_TEST_LINK_ERROR: No public link exists");
      return res.status(400).json({
        success: false,
        message: "Aucun lien public n'existe pour cette offre. Générez-en un nouveau.",
      });
    }

    if (offre.statut !== "active" || new Date() > offre.date_limite_candidature) {
      console.log("ENABLE_PUBLIC_TEST_LINK_ERROR: Offer is inactive or expired");
      return res.status(400).json({
        success: false,
        message: "Impossible d'activer un lien pour une offre inactive ou expirée",
      });
    }

    console.log("ENABLE_PUBLIC_TEST_LINK: Enabling public link");
    const updatedOffre = await OffreStageEmploi.findByIdAndUpdate(
      offreId,
      {
        publicTestEnabled: true,
      },
      { new: true }
    ).populate("entreprise_id", "nom logo secteur");

    const baseUrl = "http://localhost:5173";
    const fullPublicLink = `${baseUrl}/publictest/${offre.publicTestLink}`;

    console.log("ENABLE_PUBLIC_TEST_LINK_SUCCESS: Public link enabled successfully");
    res.status(200).json({
      success: true,
      message: "Lien public réactivé avec succès",
      data: {
        publicTestLink: fullPublicLink,
        uuid: offre.publicTestLink,
        offer: updatedOffre,
      },
    });
  } catch (error) {
    console.error("ENABLE_PUBLIC_TEST_LINK_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la réactivation du lien public",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Obtenir les statistiques des candidatures publiques
// @route   GET /api/offres/:id/public-applications-stats
// @access  Private (Company)
export const getPublicApplicationStats = async (req, res) => {
  try {
    logRequest(req, "GET_PUBLIC_APPLICATION_STATS_START", { offreId: req.params.id });

    const tokenResult = extractAndValidateToken(req);
    if (tokenResult.error) {
      console.log("GET_PUBLIC_APPLICATION_STATS_ERROR: Token validation failed");
      return res.status(tokenResult.status).json({
        success: false,
        message: tokenResult.error,
        error: tokenResult.details,
      });
    }

    const { entreprise_id } = tokenResult;
    console.log("GET_PUBLIC_APPLICATION_STATS: Processing for entreprise_id:", entreprise_id);

    const { id: offreId } = req.params;

    console.log("GET_PUBLIC_APPLICATION_STATS: Finding offer");
    const offre = await OffreStageEmploi.findOne({
      _id: offreId,
      entreprise_id,
    });

    if (!offre) {
      console.log("GET_PUBLIC_APPLICATION_STATS_ERROR: Offer not found or unauthorized");
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou vous n'êtes pas autorisé à la consulter",
      });
    }

    console.log("GET_PUBLIC_APPLICATION_STATS: Calculating statistics");
    const stats = await PublicApplication.aggregate([
      {
        $match: { offre_id: new mongoose.Types.ObjectId(offreId) },
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          reviewedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] },
          },
          acceptedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          averageTestScore: {
            $avg: "$testResult.score",
          },
          testPassRate: {
            $avg: { $cond: ["$testResult.passed", 1, 0] },
          },
          googleAuthCount: {
            $sum: { $cond: [{ $eq: ["$authentication.provider", "google"] }, 1, 0] },
          },
          appleAuthCount: {
            $sum: { $cond: [{ $eq: ["$authentication.provider", "apple"] }, 1, 0] },
          },
        },
      },
    ]);

    console.log("GET_PUBLIC_APPLICATION_STATS: Fetching recent applications");
    const recentApplications = await PublicApplication.find({ offre_id: offreId })
      .sort({ submittedAt: -1 })
      .limit(10)
      .select(
        "personalInfo.firstName personalInfo.lastName personalInfo.email status submittedAt testResult.score testResult.passed authentication.provider"
      );

    const result = {
      stats: stats.length > 0 ? stats[0] : {
        totalApplications: 0,
        pendingApplications: 0,
        reviewedApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        averageTestScore: null,
        testPassRate: null,
        googleAuthCount: 0,
        appleAuthCount: 0,
      },
      recentApplications,
      offer: {
        id: offre._id,
        titre: offre.titre,
        publicTestLink: offre.publicTestLink,
        publicTestEnabled: offre.publicTestEnabled,
        publicTestGeneratedAt: offre.publicTestGeneratedAt,
        publicApplicationsCount: offre.publicApplicationsCount,
        isPublished: offre.isPublished,
        isPublishedForStudents: offre.isPublishedForStudents,
        publishedAt: offre.publishedAt,
      },
    };

    console.log("GET_PUBLIC_APPLICATION_STATS_SUCCESS: Statistics calculated successfully");
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET_PUBLIC_APPLICATION_STATS_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Récupérer toutes les candidatures publiques d'une entreprise
// @route   GET /api/offres/public-applications
// @access  Public or Private (depending on authentication)
export const getCompanyPublicApplications = async (req, res) => {
  try {
    logRequest(req, "GET_COMPANY_PUBLIC_APPLICATIONS_START");

    let entreprise_id;

    if (req.company && req.company.companyData && req.company.companyData.id) {
      entreprise_id = req.company.companyData.id;
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Using company ID from middleware:", entreprise_id);
    } else if (req.headers.authorization) {
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Extracting company ID from token");
      const tokenResult = extractAndValidateToken(req);
      if (tokenResult.error) {
        console.log("GET_COMPANY_PUBLIC_APPLICATIONS_ERROR: Token validation failed");
        return res.status(tokenResult.status).json({
          success: false,
          message: tokenResult.error,
          error: tokenResult.details,
        });
      }
      entreprise_id = tokenResult.entreprise_id;
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Company ID extracted from token:", entreprise_id);
    } else if (req.query.companyId) {
      entreprise_id = req.query.companyId;
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Using company ID from query:", entreprise_id);
    } else {
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS_ERROR: No company ID found");
      return res.status(400).json({
        success: false,
        message: "L'ID de l'entreprise est requis pour accéder à cette ressource.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(entreprise_id)) {
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS_ERROR: Invalid company ID:", entreprise_id);
      return res.status(400).json({
        success: false,
        message: "ID d'entreprise invalide.",
      });
    }

    const {
      search,
      status,
      offer,
      authProvider,
      page = 1,
      limit = 20,
      sortBy = "submittedAt",
      sortOrder = "desc",
    } = req.query;

    console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Query parameters:", {
      search, status, offer, authProvider, page, limit, sortBy, sortOrder,
    });

    const matchStage = {
      $lookup: {
        from: "offrestageemplois",
        localField: "offre_id",
        foreignField: "_id",
        as: "offre_details",
      },
    };

    const unwindStage = {
      $unwind: "$offre_details",
    };

    const filterStage = {
      $match: {
        "offre_details.entreprise_id": new mongoose.Types.ObjectId(entreprise_id),
      },
    };

    if (search) {
      filterStage.$match.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
      ];
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Added search filter for:", search);
    }

    if (status) {
      filterStage.$match.status = status;
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Added status filter:", status);
    }

    if (offer) {
      filterStage.$match.offre_id = new mongoose.Types.ObjectId(offer);
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Added offer filter:", offer);
    }

    if (authProvider) {
      filterStage.$match["authentication.provider"] = authProvider;
      console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Added auth provider filter:", authProvider);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Executing aggregation pipeline");

    const pipeline = [
      matchStage,
      unwindStage,
      filterStage,
      {
        $sort: sort,
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 1,
          personalInfo: 1,
          status: 1,
          submittedAt: 1,
          testResult: 1,
          authentication: 1,
          applicationType: 1,
          companyNotes: 1,
          reviewedAt: 1,
          documents: 1, // ✅ AJOUT: Inclure les documents (CV)
          "offre_details._id": 1,
          "offre_details.titre": 1,
          "offre_details.type_offre": 1,
          "offre_details.localisation": 1,
        },
      },
    ];

    const applications = await PublicApplication.aggregate(pipeline);
    console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Found", applications.length, "applications");

    console.log("GET_COMPANY_PUBLIC_APPLICATIONS: Calculating statistics");
    const statsAggregation = [
      matchStage,
      unwindStage,
      {
        $match: {
          "offre_details.entreprise_id": new mongoose.Types.ObjectId(entreprise_id),
        },
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          pendingApplications: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          reviewedApplications: { $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] } },
          acceptedApplications: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
          rejectedApplications: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          averageTestScore: { $avg: "$testResult.score" },
          testPassRate: { $avg: { $cond: ["$testResult.passed", 1, 0] } },
        },
      },
    ];

    const stats = await PublicApplication.aggregate(statsAggregation);

    const totalAggregation = [
      matchStage,
      unwindStage,
      filterStage,
      {
        $count: "total",
      },
    ];

    const totalResult = await PublicApplication.aggregate(totalAggregation);
    const totalApplications = totalResult.length > 0 ? totalResult[0].total : 0;

    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // ✅ AJOUT: Récupérer les offres pour le filtre
    const offers = await OffreStageEmploi.find({ 
      entreprise_id: new mongoose.Types.ObjectId(entreprise_id),
      publicTestLink: { $exists: true, $ne: null }
    }).select('_id titre').lean();

    console.log("GET_COMPANY_PUBLIC_APPLICATIONS_SUCCESS: Returning applications and statistics");
    res.status(200).json({
      success: true,
      applications: applications.map((app) => ({
        ...app,
        offre_details: {
          _id: app.offre_details._id,
          titre: app.offre_details.titre,
          type_offre: app.offre_details.type_offre,
          localisation: app.offre_details.localisation,
        },
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalApplications,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      stats: stats.length > 0 ? stats[0] : {
        totalApplications: 0,
        pendingApplications: 0,
        reviewedApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        averageTestScore: null,
        testPassRate: null,
      },
      offers: offers, // ✅ AJOUT: Inclure les offres
    });
  } catch (error) {
    console.error("GET_COMPANY_PUBLIC_APPLICATIONS_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des candidatures",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Mettre à jour le statut d'une candidature publique
// @route   PUT /api/offres/public-applications/:applicationId/status
// @access  Private (Company)
export const updatePublicApplicationStatus = async (req, res) => {
  try {
    logRequest(req, "UPDATE_PUBLIC_APPLICATION_STATUS_START", { applicationId: req.params.applicationId });

    let entreprise_id;

    if (req.company && req.company.companyData && req.company.companyData.id) {
      entreprise_id = req.company.companyData.id;
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS: Using company ID from middleware:", entreprise_id);
    } else if (req.headers.authorization) {
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS: Extracting company ID from token");
      const tokenResult = extractAndValidateToken(req);
      if (tokenResult.error) {
        console.log("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: Token validation failed");
        return res.status(tokenResult.status).json({
          success: false,
          message: tokenResult.error,
          error: tokenResult.details,
        });
      }
      entreprise_id = tokenResult.entreprise_id;
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS: Company ID extracted from token:", entreprise_id);
    } else {
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: No authentication provided");
      return res.status(401).json({
        success: false,
        message: "Authentification requise pour modifier le statut d'une candidature.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(entreprise_id)) {
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: Invalid company ID:", entreprise_id);
      return res.status(400).json({
        success: false,
        message: "ID d'entreprise invalide.",
      });
    }

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    console.log("UPDATE_PUBLIC_APPLICATION_STATUS: Request data:", { applicationId, status, notes });

    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: Invalid status:", status);
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    console.log("UPDATE_PUBLIC_APPLICATION_STATUS: Finding application");
    const application = await PublicApplication.findById(applicationId).populate(
      "offre_id"
    );

    if (!application) {
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: Application not found:", applicationId);
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    if (application.offre_id.entreprise_id.toString() !== entreprise_id) {
      console.log("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cette candidature",
      });
    }

    console.log("UPDATE_PUBLIC_APPLICATION_STATUS: Updating application status");
    const updatedApplication = await PublicApplication.findByIdAndUpdate(
      applicationId,
      {
        status,
        companyNotes: notes || application.companyNotes,
        reviewedAt: new Date(),
        reviewedBy: entreprise_id,
      },
      { new: true }
    )
      .populate("offre_id", "titre type_offre localisation")
      .populate("testDetails");

    console.log("UPDATE_PUBLIC_APPLICATION_STATUS_SUCCESS: Application status updated successfully");
    res.status(200).json({
      success: true,
      message: "Statut de la candidature mis à jour avec succès",
      data: {
        application: updatedApplication,
      },
    });
  } catch (error) {
    console.error("UPDATE_PUBLIC_APPLICATION_STATUS_ERROR: Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du statut",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ NOUVELLE FONCTION: Servir les fichiers CV des applications publiques
// @desc    Servir les fichiers CV des applications publiques (inspiré de CompanyApplicationDetailsModal)
// @route   GET /api/uploads/public-cvs/:filename
// @access  Private (Company) - Authentification requise
export const servePublicCV = async (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log(`[servePublicCV] Demande de fichier CV: ${filename}`);

    // Vérifier l'authentification de l'entreprise (comme dans applicationController)
    let companyId;
    if (req.company && req.company.companyData && req.company.companyData.id) {
      companyId = req.company.companyData.id;
    } else if (req.headers.authorization) {
      const tokenResult = extractAndValidateToken(req);
      if (tokenResult.error) {
        return res.status(tokenResult.status).json({
          success: false,
          message: tokenResult.error
        });
      }
      companyId = tokenResult.entreprise_id;
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    // Trouver l'application publique qui contient ce CV
    const application = await PublicApplication.findOne({
      'documents.cv.filename': filename
    }).populate({
      path: 'offre_id',
      select: 'entreprise_id titre'
    });

    if (!application) {
      console.log(`[servePublicCV] Application non trouvée pour le fichier: ${filename}`);
      return res.status(404).json({
        success: false,
        message: "CV non trouvé"
      });
    }

    // Vérifier que l'entreprise a le droit d'accéder à ce CV
    if (!application.offre_id || application.offre_id.entreprise_id.toString() !== companyId) {
      console.log(`[servePublicCV] Accès refusé pour entreprise: ${companyId}`);
      return res.status(403).json({
        success: false,
        message: "Accès refusé à ce CV"
      });
    }

    // Construire le chemin du fichier (comme dans CompanyApplicationDetailsModal)
    // Le frontend utilise: `${BACKEND_URL}/api/uploads/public-cvs/${filename}`
    // Donc nous devons servir depuis le bon répertoire
    const cvData = application.documents.cv;
    
    // Construire le chemin basé sur la structure de stockage
    let cvPath;
    
    // Si le CV a une date d'upload, utiliser la structure par année/mois
    if (cvData.uploadedAt) {
      const uploadedAt = new Date(cvData.uploadedAt);
      const year = uploadedAt.getFullYear().toString();
      const month = (uploadedAt.getMonth() + 1).toString().padStart(2, '0');
      cvPath = path.join(process.cwd(), 'uploads', 'public-cvs', year, month, filename);
    } else {
      // Fallback: chercher directement dans le dossier public-cvs
      cvPath = path.join(process.cwd(), 'uploads', 'public-cvs', filename);
    }

    console.log(`[servePublicCV] Chemin du CV: ${cvPath}`);

    // Vérifier que le fichier existe
    if (!fs.existsSync(cvPath)) {
      // Essayer d'autres emplacements possibles
      const alternativePaths = [
        path.join(process.cwd(), 'uploads', 'cvs', filename), // Même structure que les CV normaux
        path.join(process.cwd(), 'uploads', 'public-cvs', filename), // Directement dans public-cvs
        path.join(process.cwd(), 'uploads', filename) // Directement dans uploads
      ];

      let foundPath = null;
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          foundPath = altPath;
          break;
        }
      }

      if (!foundPath) {
        console.log(`[servePublicCV] Fichier CV non trouvé: ${cvPath}`);
        console.log(`[servePublicCV] Chemins alternatifs testés:`, alternativePaths);
        return res.status(404).json({
          success: false,
          message: "Fichier CV non trouvé sur le serveur"
        });
      }

      cvPath = foundPath;
    }

    // Obtenir les informations du fichier
    const stats = fs.statSync(cvPath);
    const mimetype = cvData.mimetype || 'application/pdf';
    const originalName = cvData.originalName || filename;

    // Configurer les headers (comme dans CompanyApplicationDetailsModal)
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    
    // Headers pour permettre l'affichage dans le navigateur (comme le modal)
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    console.log(`[servePublicCV] Envoi du fichier: ${originalName} (${stats.size} bytes)`);

    // Créer un stream de lecture et l'envoyer
    const fileStream = fs.createReadStream(cvPath);
    
    fileStream.on('error', (error) => {
      console.error(`[servePublicCV] Erreur lors de la lecture du fichier:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Erreur lors de la lecture du fichier CV"
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('[servePublicCV] Erreur:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'accès au CV"
      });
    }
  }
};

