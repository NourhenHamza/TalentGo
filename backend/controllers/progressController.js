import Assignment from '../models/Assignment.js';
import ProgressUpdate from '../models/ProgressUpdate.js';

export const submitProgress = async (req, res) => {
  try {
    console.log("=== submitProgress Called ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    const { progress, fileUrl, week } = req.body;

    // Get userId from the authenticated user (set by authUser middleware)
    const userId = req.user.id || req.user._id;

    if (!userId) {
      console.error("No userId found in req.user");
      return res.status(400).json({ 
        success: false, 
        error: "User ID not found in authentication" 
      });
    }

    console.log("Looking for assignment for userId:", userId);

    // Find assignment for the logged-in student
    const assignment = await Assignment.findOne({
      student: userId,
      status: { $in: ["assigned", "confirmed"] }
    });

    console.log("Found assignment:", assignment);

    if (!assignment) {
      return res.status(400).json({ 
        success: false, 
        error: "No active assignment found for this student" 
      });
    }

    const professorId = assignment.professor;

    const newProgress = new ProgressUpdate({
      progress,
      fileUrl,
      week: week || 1,
      studentId: userId,
      professorId,
      submittedAt: new Date()
    });

    console.log("Creating progress update:", newProgress);

    await newProgress.save();

    console.log("Progress update saved successfully");

    res.status(201).json({
      success: true,
      message: "Progress update submitted successfully",
      data: {
        progress: newProgress
      }
    });

  } catch (error) {
    console.error("Error in submitProgress:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit progress update",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
