const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true }, // Teacher who created it
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true }, // Class it's assigned to
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true },
  // Remove studentId from here - assignments are for the whole class
  filePath: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);