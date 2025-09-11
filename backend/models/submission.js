const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  fileUrl: { type: String }, // optional if students upload files
  answerText: { type: String }, // optional if text answers
  submittedAt: { type: Date, default: Date.now },
  grade: { type: String }, // optional (for teacher grading)
  feedback: { type: String } // optional (teacher feedback)
});

module.exports = mongoose.model("Submission", submissionSchema);
