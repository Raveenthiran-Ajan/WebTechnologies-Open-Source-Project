const Assignment = require("../models/Assignment");
const Student = require("../models/studentSchema");
const Submission = require("../models/submission");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/assignments/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // Directory to save files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, TXT, JPG, JPEG, PNG files are allowed"));
    }
  },
});

// Teacher creates a new assignment
const mongoose = require("mongoose");
const Sclass = require("../models/sclassSchema");

const createAssignment = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { title, description, dueDate, subject, teacherId } = req.body;
    const classIds = req.body['classIds[]'];

    // Validate required fields
    if (!title || !subject || !teacherId || !classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ error: "Missing required fields or invalid classIds" });
    }

    // Convert dueDate string to Date object if present
    let dueDateObj = null;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid dueDate format" });
      }
    }

    // Get fileUrl from uploaded file if present
    const fileUrl = req.file ? "/" + req.file.path.replace(/\\\\/g, "/").replace(/\\/g, "/") : null;

    const assignment = new Assignment({
      title,
      description,
      dueDate: dueDateObj,
      subject,
      teacherId,
      classIds,
      fileUrl,
    });

    await assignment.save();
    res.status(201).json({ message: "Assignment submitted successfully", assignment });
  } catch (error) {
    console.error("Error in createAssignment:", error);
    if (error instanceof multer.MulterError) {
      // Multer-specific errors
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Student fetches assignments for their class
const getAssignmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('sclassName');
    if (!student) {
      console.log(`Student with id ${studentId} not found`);
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.sclassName || !student.sclassName._id) {
      console.log(`Student class info incomplete for student ${studentId}:`, student.sclassName);
      return res.status(400).json({ error: "Student class information is incomplete" });
    }

    let assignments = await Assignment.find({ classIds: { $in: [student.sclassName._id] } });
    // Map assignments to add subjectName property for frontend compatibility
    assignments = assignments.map(assignment => ({
      ...assignment.toObject(),
      subjectName: assignment.subject || ''
    }));

    console.log(`Assignments found for student ${studentId}:`, assignments);
    res.json({ assignments });
  } catch (error) {
    console.error('Error in getAssignmentsByStudent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Admin/teacher fetch all assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignments by teacher
const getAssignmentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = await Assignment.find({ teacherId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, subject } = req.body;
    const classIds = req.body['classIds[]'];

    const updateData = { title, description, subject };
    if (classIds && Array.isArray(classIds)) {
      updateData.classIds = classIds.filter(cid => cid && cid !== 'undefined');
    }
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
      if (isNaN(updateData.dueDate.getTime())) {
        return res.status(400).json({ error: "Invalid dueDate format" });
      }
    }

    // Handle file update if new file uploaded
    if (req.file) {
      const assignment = await Assignment.findById(id);
      if (assignment && assignment.fileUrl) {
        // Delete old file
        const oldFilePath = path.join(__dirname, '..', assignment.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.fileUrl = "/" + req.file.path.replace(/\\\\/g, "/").replace(/\\/g, "/");
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ message: "Assignment updated successfully", assignment: updatedAssignment });
  } catch (error) {
    console.error("Error in updateAssignment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Extend deadline
const extendDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({ error: "Due date is required" });
    }

    const newDueDate = new Date(dueDate);
    if (isNaN(newDueDate.getTime())) {
      return res.status(400).json({ error: "Invalid due date format" });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(id, { dueDate: newDueDate }, { new: true });
    if (!updatedAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ message: "Deadline extended successfully", assignment: updatedAssignment });
  } catch (error) {
    console.error("Error in extendDeadline:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Delete associated file if exists
    if (assignment.fileUrl) {
      const filePath = path.join(__dirname, '..', assignment.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete associated submissions and their files
    const submissions = await Submission.find({ assignmentId: id });
    for (const submission of submissions) {
      if (submission.fileUrl) {
        const subFilePath = path.join(__dirname, '..', submission.fileUrl);
        if (fs.existsSync(subFilePath)) {
          fs.unlinkSync(subFilePath);
        }
      }
      await Submission.findByIdAndDelete(submission._id);
    }

    await Assignment.findByIdAndDelete(id);
    res.json({ message: "Assignment and associated submissions deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAssignment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.submitAssignment = createAssignment;   // teacher creates
exports.getAssignmentsByStudent = getAssignmentsByStudent;
exports.getAllAssignments = getAllAssignments;
exports.getAssignmentsByTeacher = getAssignmentsByTeacher;
exports.updateAssignment = updateAssignment;
exports.extendDeadline = extendDeadline;
exports.deleteAssignment = deleteAssignment;
exports.upload = upload;
