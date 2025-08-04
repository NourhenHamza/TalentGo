import mongoose from "mongoose";

const progressUpdateSchema = new mongoose.Schema({
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: false,
  },
  week: {
    type: Number,
    required: false,
  },
  progress: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    default: "",
  },
  fileUrl: {
    type: String,
    default: "", 
  },
}, {
  timestamps: true,
});

const ProgressUpdate = mongoose.model("ProgressUpdate", progressUpdateSchema);

export default ProgressUpdate;
