import University from "../models/University.js";

export const getApprovedUniversities = async (req, res) => {
  try {
    const universities = await University.find({
      status: "approved"
    }).select("_id name description logo address").sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: universities.length,
      universities
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des universités approuvées:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des universités"
    });
  }
};


export const getProfile = async (req, res) => {
  try {
    const universityId = req.university.id;
    
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found"
      });
    }

    res.status(200).json({
      success: true,
      university
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
