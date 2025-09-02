const Assignment = require("../models/Assignment");

// Submit a new assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, studentId } = req.body;

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      studentId,
    });

    await assignment.save();
    res.status(201).json({ message: "Assignment submitted successfully", assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignments by student
exports.getAssignmentsByStudent = async (req, res) => {
  try {
    const assignments = await Assignment.find({ studentId: req.params.studentId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assignments (for admin/teacher)
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
