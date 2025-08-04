import mongoose from "mongoose";
import dotenv from "dotenv";
import ProgressUpdate from "./models/ProgressUpdate.js"; // Adjust path if necessary

dotenv.config();

// Replace with your MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pfe_management_db";

const seedProgressUpdates = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    const studentId = "67ebe2269ee120752e4fad6b";
    const subjectId = "67f073d763b31d9b71acfe07";

    const updates = [
      {
        studentId,
        subjectId,
        week: 1,
        progress: "Completed introduction and basic concepts.",
        feedback: "Great start, keep going!",
      },
      {
        studentId,
        subjectId,
        week: 2,
        progress: "Learned about core principles and did two assignments.",
        feedback: "Solid progress.",
      },
      {
        studentId,
        subjectId,
        week: 3,
        progress: "Practiced more problems and discussed doubts.",
        feedback: "Improving steadily.",
        fileUrl :"https://www.youtube.com/",
      },
    ];

    await ProgressUpdate.deleteMany({ studentId, subjectId }); // optional: to avoid duplicates
    await ProgressUpdate.insertMany(updates);

    console.log("Progress updates seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedProgressUpdates();
