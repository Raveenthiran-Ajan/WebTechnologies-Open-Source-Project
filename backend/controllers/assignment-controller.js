const Assignment = require("../models/Assignment");
const Student = require("../models/studentSchema");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments/"); // Directory to save files
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

    const { title, description, dueDate, subject, teacherId, classId } = req.body;

    // Validate required fields
    if (!title || !subject || !teacherId || !classId) {
      return res.status(400).json({ error: "Missing required fields" });
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
      classId,
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

    const assignments = await Assignment.find({ classId: student.sclassName._id });
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

exports.submitAssignment = createAssignment;   // teacher creates
exports.getAssignmentsByStudent = getAssignmentsByStudent;
exports.getAllAssignments = getAllAssignments;
exports.getAssignmentsByTeacher = getAssignmentsByTeacher;
exports.upload = upload;
