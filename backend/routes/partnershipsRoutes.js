import express from "express";
import { jwtDecode } from "jwt-decode"; // Use ES module import
import mongoose from "mongoose";
import { emitPartnershipEvent } from '../events/index.js';
import Company from "../models/Company.js";
import Partnership from "../models/Partnership.js";
import University from "../models/University.js";

const router = express.Router();

// POST /api/partnerships/request
// Create or retrieve a partnership request
 
 
router.post("/request", async (request, response) => {
  try {
    const { initiator_type, initiator_id, target_type, target_id, request_message } = request.body;

    // Validate request body
    if (!initiator_type || !initiator_id || !target_type || !target_id) {
      return response.status(400).json({
        success: false,
        message: "initiator_type, initiator_id, target_type, and target_id are required",
      });
    }

    // Validate types
    if (!["University", "Company"].includes(initiator_type) || !["University", "Company"].includes(target_type)) {
      return response.status(400).json({
        success: false,
        message: "initiator_type and target_type must be either 'University' or 'Company'",
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(initiator_id) || !mongoose.Types.ObjectId.isValid(target_id)) {
      return response.status(400).json({
        success: false,
        message: "Invalid initiator_id or target_id",
      });
    }

    // Prevent self-partnership
    if (initiator_type === target_type && initiator_id === target_id) {
      return response.status(400).json({
        success: false,
        message: "Initiator and target cannot be the same entity",
      });
    }

    // Check for existing partnership (either direction)
    let partnership = await Partnership.findOne({
      $or: [
        { initiator_type, initiator_id, target_type, target_id },
        { initiator_type: target_type, initiator_id: target_id, target_type: initiator_type, target_id: initiator_id },
      ],
    });

    if (partnership) {
      // Determine the company's role in the existing partnership
      const isInitiator = partnership.initiator_id.toString() === initiator_id && partnership.initiator_type === initiator_type;
      const role = isInitiator ? "initiator" : "target";
      const message = isInitiator
        ? `Existing partnership request found with status: ${partnership.status}`
        : `Incoming partnership request from ${partnership.initiator_type.toLowerCase()}`;

      return response.status(200).json({
        success: true,
        message,
        partnership,
        role,
      });
    }

    // Create new partnership if none exists
    partnership = new Partnership({
      initiator_type,
      initiator_id,
      target_type,
      target_id,
      request_message: request_message || `Partnership request from ${initiator_type.toLowerCase()}`,
      status: "pending",
    });

    await partnership.save();

    // Populate initiator and target details for the event
    const populatedPartnership = await Partnership.findById(partnership._id)
      .populate('initiator_id', 'nom email_contact')
      .populate('target_id', 'nom contactPerson.email');

    // Emit the partnership requested event
    emitPartnershipEvent('requested', populatedPartnership.toObject());

    return response.status(201).json({
      success: true,
      message: "Partnership request created successfully",
      partnership,
      role: "initiator",
    });
  } catch (error) {
    console.error("Error in POST /api/partnerships/request:", {
      message: error.message,
      stack: error.stack,
      body: request.body,
    });
    return response.status(500).json({
      success: false,
      message: "Server error: " + (error.message || "Unknown error"),
    });
  }
});
 


// PATCH /api/partnerships/:id
// Accept or reject a partnership request
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid partnership ID",
      });
    }

    // Validate action
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'accept' or 'reject'",
      });
    }

    // Find partnership
    const partnership = await Partnership.findById(id);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    // Verify token
    const token = req.headers["ctoken"] || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid token: missing id or role",
        });
      }
    } catch (err) {
      console.error("JWT decode error in PATCH:", {
        message: err.message,
        stack: err.stack,
        token,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Normalize role for comparison (case-insensitive)
    const requesterId = decoded.id;
    const requesterRole = decoded.role.toLowerCase();
    const targetType = partnership.target_type.toLowerCase();

    // Verify requester is the target
    if (partnership.target_id.toString() !== requesterId || targetType !== requesterRole) {
      return res.status(403).json({
        success: false,
        message: `Only the target can ${action} the partnership`,
        details: {
          target_id: partnership.target_id.toString(),
          requester_id: requesterId,
          target_type: partnership.target_type,
          requester_role: decoded.role,
        },
      });
    }

    // Verify pending status
    if (partnership.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Partnership is not in pending status, current status: ${partnership.status}`,
      });
    }

    if (action === "accept") {
      partnership.status = "accepted";
      partnership.response_message = "Partnership accepted";
      await partnership.save();
      console.log(`Partnership accepted: ${id}`);
      return res.status(200).json({
        success: true,
        message: "Partnership request accepted successfully",
        partnership,
      });
    } else {
      await Partnership.deleteOne({ _id: id });
      console.log(`Partnership rejected and deleted: ${id}`);
      return res.status(200).json({
        success: true,
        message: "Partnership request rejected successfully",
      });
    }
  } catch (error) {
    console.error(`Error in PATCH /api/partnerships/${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      message: "Server error: " + (error.message || "Unknown error"),
    });
  }
});

// DELETE /api/partnerships/:id
// Delete a partnership or request
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid partnership ID",
      });
    }

    // Find partnership
    const partnership = await Partnership.findById(id);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    // Verify token
    const token = req.headers["ctoken"] || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid token: missing id or role",
        });
      }
    } catch (err) {
      console.error("JWT decode error in DELETE:", {
        message: err.message,
        stack: err.stack,
        token,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Normalize role for comparison
    const requesterId = decoded.id;
    const requesterRole = decoded.role.toLowerCase();
    const initiatorType = partnership.initiator_type.toLowerCase();
    const targetType = partnership.target_type.toLowerCase();

    // Verify requester is either initiator or target
    const isInitiator = partnership.initiator_id.toString() === requesterId && initiatorType === requesterRole;
    const isTarget = partnership.target_id.toString() === requesterId && targetType === requesterRole;

    if (!isInitiator && !isTarget) {
      return res.status(403).json({
        success: false,
        message: "Only the initiator or target can delete the partnership",
        details: {
          initiator_id: partnership.initiator_id.toString(),
          target_id: partnership.target_id.toString(),
          requester_id: requesterId,
          initiator_type: partnership.initiator_type,
          target_type: partnership.target_type,
          requester_role: decoded.role,
        },
      });
    }

    await Partnership.deleteOne({ _id: id });
    console.log(`Partnership deleted: ${id}`);
    return res.status(200).json({
      success: true,
      message: partnership.status === "accepted" ? "Partnership deleted successfully" : "Partnership request deleted successfully",
    });
  } catch (error) {
    console.error(`Error in DELETE /api/partnerships/${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      message: "Server error: " + (error.message || "Unknown error"),
    });
  }
});
// GET /api/partnerships/:id
// Get partnership details by ID with full initiator and target information
// GET /api/partnerships/:id
// Get partnership details by ID with full initiator and target information
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid partnership ID",
      });
    }

    // First find the partnership without population to get the types
    const partnership = await Partnership.findById(id);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    // Now populate with the correct models based on types
    const populatedPartnership = await Partnership.findById(id)
      .populate({
        path: 'initiator_id',
        select: '-password -loginCredentials.password -__v',
        model: partnership.initiator_type // Use the type from the partnership
      })
      .populate({
        path: 'target_id',
        select: '-password -__v',
        model: partnership.target_type // Use the type from the partnership
      });

    // Verify the requester has access (either initiator or target)
    const token = req.headers["ctoken"] || req.headers["atoken"] || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid token: missing id or role",
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Check if user is either initiator or target
    const isInitiator = populatedPartnership.initiator_id._id.toString() === decoded.id;
    const isTarget = populatedPartnership.target_id._id.toString() === decoded.id;

    if (!isInitiator && !isTarget) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this partnership",
      });
    }

    // Format the response based on the partnership type
    const responseData = {
      success: true,
      partnership: {
        _id: populatedPartnership._id,
        status: populatedPartnership.status,
        createdAt: populatedPartnership.createdAt,
        updatedAt: populatedPartnership.updatedAt,
        request_message: populatedPartnership.request_message,
        response_message: populatedPartnership.response_message,
        initiator: formatEntity(populatedPartnership.initiator_type, populatedPartnership.initiator_id),
        target: formatEntity(populatedPartnership.target_type, populatedPartnership.target_id),
        yourRole: isInitiator ? 'initiator' : 'target'
      }
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error(`Error in GET /api/partnerships/${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + (error.message || "Unknown error"),
    });
  }
});














// GET /api/partnerships
// Fetch all partnerships for the authenticated user (initiator or target)
router.get('/', async (req, res) => {
  try {
    // Extract token from headers (supporting ctoken, atoken, or Authorization)
    const token = req.headers['ctoken'] || req.headers['atoken'] || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    // Decode token to get user ID and role
    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: missing id or role',
        });
      }
    } catch (err) {
      console.error('JWT decode error in GET /api/partnerships:', {
        message: err.message,
        stack: err.stack,
        token,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID in token',
      });
    }

    console.log('Searching partnerships for user:', {
      id: decoded.id,
      role: decoded.role
    });

    // Normalize role for comparison
    const userRole = decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase(); // "Company" ou "University"
    
    const partnerships = await Partnership.find({
      $or: [
        { initiator_id: decoded.id, initiator_type: userRole },
        { target_id: decoded.id, target_type: userRole },
      ],
    });

    console.log('Found partnerships before population:', partnerships.length);

    if (partnerships.length === 0) {
      return res.status(200).json({
        success: true,
        partnerships: [],
      });
    }

    // Populate partnerships manually to handle different models
    const populatedPartnerships = [];
    
    for (const partnership of partnerships) {
      try {
        // Populate initiator
        let initiator;
        if (partnership.initiator_type === 'Company') {
          initiator = await Company.findById(partnership.initiator_id)
            .select('nom email_contact description adresse ville code_postal pays logo_url');
        } else {
          initiator = await University.findById(partnership.initiator_id)
            .select('name contactPerson.email description address logo');
        }

        // Populate target
        let target;
        if (partnership.target_type === 'Company') {
          target = await Company.findById(partnership.target_id)
            .select('nom email_contact description adresse ville code_postal pays logo_url');
        } else {
          target = await University.findById(partnership.target_id)
            .select('name contactPerson.email description address logo');
        }

        if (initiator && target) {
          populatedPartnerships.push({
            ...partnership.toObject(),
            initiator_id: initiator,
            target_id: target
          });
        }
      } catch (populateError) {
        console.error('Error populating partnership:', populateError);
        // Skip this partnership if population fails
        continue;
      }
    }

    console.log('Successfully populated partnerships:', populatedPartnerships.length);

    // Format partnerships for response
    const formattedPartnerships = populatedPartnerships.map((p) => {
      const isInitiator = p.initiator_id._id.toString() === decoded.id && p.initiator_type === userRole;
      
      return {
        _id: p._id,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        request_message: p.request_message,
        response_message: p.response_message,
        initiator: formatEntity(p.initiator_type, p.initiator_id),
        target: formatEntity(p.target_type, p.target_id),
        yourRole: isInitiator ? 'initiator' : 'target',
      };
    });

    return res.status(200).json({
      success: true,
      partnerships: formattedPartnerships,
    });
  } catch (error) {
    console.error('Error in GET /api/partnerships:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + (error.message || 'Unknown error'),
    });
  }
});

// NOUVELLE ROUTE: GET /api/partnerships/partners
// Récupère la liste des partenaires de l'utilisateur connecté (ceux avec qui il a des partenariats)
router.get('/partners', async (req, res) => {
  try {
    // Extract token from headers
    const token = req.headers['ctoken'] || req.headers['atoken'] || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    // Decode token to get user ID and role
    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: missing id or role',
        });
      }
    } catch (err) {
      console.error('JWT decode error in GET /api/partnerships/partners:', {
        message: err.message,
        stack: err.stack,
        token,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID in token',
      });
    }

    console.log('Fetching partners for user:', {
      id: decoded.id,
      role: decoded.role
    });

    // Normalize role for comparison
    const userRole = decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase(); // "Company" ou "University"
    
    // Chercher tous les partenariats où l'utilisateur apparaît (soit comme initiator soit comme target)
    const partnerships = await Partnership.find({
      $or: [
        { initiator_id: decoded.id, initiator_type: userRole },
        { target_id: decoded.id, target_type: userRole },
      ],
    });

    console.log(`Found ${partnerships.length} partnerships for user`);

    if (partnerships.length === 0) {
      return res.status(200).json({
        success: true,
        partners: [],
        userType: userRole
      });
    }

    const partners = [];
    
    for (const partnership of partnerships) {
      try {
        let partner = null;
        let partnerType = null;
        let partnerId = null;

        // Déterminer qui est le partenaire (l'autre partie)
        if (partnership.initiator_id.toString() === decoded.id && partnership.initiator_type === userRole) {
          // L'utilisateur est l'initiator, donc le partenaire est le target
          partnerId = partnership.target_id;
          partnerType = partnership.target_type;
        } else if (partnership.target_id.toString() === decoded.id && partnership.target_type === userRole) {
          // L'utilisateur est le target, donc le partenaire est l'initiator
          partnerId = partnership.initiator_id;
          partnerType = partnership.initiator_type;
        }

        if (partnerId && partnerType) {
          // Récupérer les données du partenaire
          if (partnerType === 'Company') {
            partner = await Company.findById(partnerId)
              .select('nom email_contact description adresse ville code_postal pays logo_url');
            
            if (partner) {
              partners.push({
                _id: partner._id,
                name: partner.nom,
                type: 'Company',
                email: partner.email_contact,
                description: partner.description,
                address: {
                  street: partner.adresse,
                  city: partner.ville,
                  postalCode: partner.code_postal,
                  country: partner.pays,
                },
                logo: partner.logo_url,
                partnershipStatus: partnership.status,
                partnershipId: partnership._id
              });
            }
          } else if (partnerType === 'University') {
            partner = await University.findById(partnerId)
              .select('name contactPerson.email description address logo');
            
            if (partner) {
              partners.push({
                _id: partner._id,
                name: partner.name,
                type: 'University',
                email: partner.contactPerson?.email,
                description: partner.description,
                address: partner.address,
                logo: partner.logo,
                partnershipStatus: partnership.status,
                partnershipId: partnership._id
              });
            }
          }
        }
      } catch (populateError) {
        console.error('Error populating partner:', populateError);
        continue;
      }
    }

    console.log(`Successfully found ${partners.length} partners for ${userRole}`);

    return res.status(200).json({
      success: true,
      partners: partners,
      userType: userRole
    });

  } catch (error) {
    console.error('Error in GET /api/partnerships/partners:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + (error.message || 'Unknown error'),
    });
  }
});

// ROUTE: GET /api/partnerships/available-partners
// Récupère la liste des partenaires disponibles (ceux qui ne sont pas encore partenaires)
router.get('/available-partners', async (req, res) => {
  try {
    // Extract token from headers
    const token = req.headers['ctoken'] || req.headers['atoken'] || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    // Decode token to get user ID and role
    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: missing id or role',
        });
      }
    } catch (err) {
      console.error('JWT decode error in GET /api/partnerships/available-partners:', {
        message: err.message,
        stack: err.stack,
        token,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID in token',
      });
    }

    console.log('Fetching available partners for user:', {
      id: decoded.id,
      role: decoded.role
    });

    // Normalize role for comparison
    const userRole = decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase(); // "Company" ou "University"
    
    // Récupérer tous les partenariats existants de l'utilisateur
    const existingPartnerships = await Partnership.find({
      $or: [
        { initiator_id: decoded.id, initiator_type: userRole },
        { target_id: decoded.id, target_type: userRole },
      ],
    });

    // Extraire les IDs des partenaires existants
    const existingPartnerIds = [];
    existingPartnerships.forEach(partnership => {
      if (partnership.initiator_id.toString() === decoded.id && partnership.initiator_type === userRole) {
        existingPartnerIds.push(partnership.target_id.toString());
      } else if (partnership.target_id.toString() === decoded.id && partnership.target_type === userRole) {
        existingPartnerIds.push(partnership.initiator_id.toString());
      }
    });

    let availablePartners = [];

    // Si l'utilisateur est une entreprise, récupérer les universités qui ne sont pas déjà partenaires
    if (userRole === 'Company') {
      availablePartners = await University.find({ 
        status: 'accepted',
        _id: { 
          $ne: decoded.id, // Exclure l'utilisateur actuel
          $nin: existingPartnerIds // Exclure les partenaires existants
        }
      }).select('name contactPerson.email description address logo');
      
      // Formater les données des universités
      availablePartners = availablePartners.map(university => ({
        _id: university._id,
        name: university.name,
        type: 'University',
        email: university.contactPerson?.email,
        description: university.description,
        address: university.address,
        logo: university.logo
      }));
    } 
    // Si l'utilisateur est une université, récupérer les entreprises qui ne sont pas déjà partenaires
    else if (userRole === 'University') {
      availablePartners = await Company.find({ 
        status: 'accepted',
        _id: { 
          $ne: decoded.id, // Exclure l'utilisateur actuel
          $nin: existingPartnerIds // Exclure les partenaires existants
        }
      }).select('nom email_contact description adresse ville code_postal pays logo_url');
      
      // Formater les données des entreprises
      availablePartners = availablePartners.map(company => ({
        _id: company._id,
        name: company.nom,
        type: 'Company',
        email: company.email_contact,
        description: company.description,
        address: {
          street: company.adresse,
          city: company.ville,
          postalCode: company.code_postal,
          country: company.pays,
        },
        logo: company.logo_url
      }));
    }

    console.log(`Found ${availablePartners.length} available partners for ${userRole}`);

    return res.status(200).json({
      success: true,
      partners: availablePartners,
      userType: userRole
    });

  } catch (error) {
    console.error('Error in GET /api/partnerships/available-partners:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + (error.message || 'Unknown error'),
    });
  }
});

// Helper function to format university or company data
function formatEntity(type, entity) {
  if (!entity) return null;

  const commonFields = {
    _id: entity._id,
    name: type === 'Company' ? entity.nom : entity.name,
    type: type,
    email: type === 'Company' ? entity.email_contact : entity.contactPerson?.email,
    logo: type === 'Company' ? entity.logo_url : entity.logo,
  };

  if (type === 'University') {
    return {
      ...commonFields,
      description: entity.description,
      address: entity.address,
    };
  } else {
    // Company
    return {
      ...commonFields,
      description: entity.description,
      address: {
        street: entity.adresse,
        city: entity.ville,
        postalCode: entity.code_postal,
        country: entity.pays,
      },
    };
  }
}



export default router;