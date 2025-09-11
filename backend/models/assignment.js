const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  fileUrl: { type: String }, // optional if you add file upload later
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
