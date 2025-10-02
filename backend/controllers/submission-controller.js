const Submission = require("../models/submission");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for submission file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/submissions/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
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
      .populate("assignmentId", "title dueDate")
      .select("assignmentId submittedAt grade feedback fileUrl answerText"); // include grade, feedback, fileUrl, answerText fields
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.upload = upload;

// Update submission (student can edit)
exports.updateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answerText } = req.body;
    let fileUrl = null;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // If new file, delete old file and set new
    if (req.file) {
      if (submission.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', submission.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      fileUrl = `/uploads/submissions/${req.file.filename}`;
    }

    submission.answerText = answerText || submission.answerText;
    if (fileUrl) submission.fileUrl = fileUrl;

    await submission.save();
    res.json({ message: "Submission updated successfully", submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete submission
exports.deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Delete file if exists
    if (submission.fileUrl) {
      const filePath = path.join(__dirname, '..', submission.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Submission.findByIdAndDelete(submissionId);
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add updateSubmissionMarking function to update grade and feedback
exports.updateSubmissionMarking = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    submission.grade = grade;
    submission.feedback = feedback;

    await submission.save();
    res.json({ message: "Marking updated successfully", submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
