const Submission = require("../models/submission");

// Student submits an assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, answerText } = req.body;
    let fileUrl = null;

    if (req.file) {
      fileUrl = `/uploads/submissions/${req.file.filename}`;
    }

    const submission = new Submission({
      assignmentId,
      studentId,
      fileUrl,
      answerText
    });

    await submission.save();
    res.status(201).json({ message: "Submission uploaded successfully", submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all submissions for an assignment (teacher view)
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
      .populate("studentId", "name email"); // show student info
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all submissions by a student (student view)
exports.getSubmissionsByStudent = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate("assignmentId", "title dueDate");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
