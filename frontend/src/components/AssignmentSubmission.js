import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AssignmentSubmission = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseCode: "",
    dueDate: "",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [assignments, setAssignments] = useState([]);

  // Fetch assignments from backend
  useEffect(() => {
    fetch("http://localhost:5000/assignments")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error(err));
  }, []);

  // Calculate time left until deadline
  useEffect(() => {
    if (formData.dueDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const deadline = new Date(formData.dueDate);
        const diff = deadline - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          setTimeLeft(`${days} days, ${hours} hours, ${minutes} minutes left`);
        } else {
          setTimeLeft("Deadline passed");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [formData.dueDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setMessage("File size must be less than 5MB.");
      setFile(null);
      return;
    }
    setMessage("");
    setFile(selectedFile);
  };

  const handleSubmit = () => {
  if (!file) {
    setMessage("Please select a PDF file.");
    return;
  }
  const data = new FormData();
  data.append("title", formData.title);
  data.append("description", formData.description);
  data.append("courseCode", formData.courseCode);
  data.append("dueDate", formData.dueDate);
  data.append("file", file);

  fetch("http://localhost:5000/assignments/submit", {
    method: "POST",
    body: data,
  })
    .then((res) => res.json())
    .then((newAssignment) => {
      setAssignments([...assignments, newAssignment]);
      setOpen(false);
      setFormData({ title: "", description: "", courseCode: "", dueDate: "" });
      setFile(null);
      setMessage("Assignment uploaded successfully!");
      setTimeout(() => setMessage(""), 3000); // Clear after 3 seconds
    })
    .catch((err) => {
      setMessage("Upload failed.");
      console.error(err);
    });
};
  return (
    <div style={{ padding: "20px" }}>
      {/* Upload button */}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Upload Assignment
      </Button>

      {/* Dialog / Popup Form */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Course Code"
            name="courseCode"
            fullWidth
            value={formData.courseCode}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Due Date"
            name="dueDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dueDate}
            onChange={handleChange}
          />
          {formData.dueDate && (
            <div>
              <strong>Time left:</strong> {timeLeft}
            </div>
          )}
          <div>
            <label>Upload PDF (max 5MB):</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment List */}
      <h3 style={{ marginTop: "20px" }}>Upcoming Assignments</h3>
      <List>
        {assignments.map((a, index) => (
          <ListItem key={index} secondaryAction={
            <Button
              variant="outlined"
              onClick={() => alert(
                `Title: ${a.title}\nDescription: ${a.description}\nCourse Code: ${a.courseCode}\nDue Date: ${a.dueDate ? new Date(a.dueDate).toLocaleString() : "No Due Date"}`
              )}
            >
              Go to Assignment
            </Button>
          }>
            <ListItemText
              primary={a.title}
              secondary={a.dueDate ? `Due: ${new Date(a.dueDate).toLocaleDateString()}` : "No Due Date"}
            />
          </ListItem>
        ))}
      </List>
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default AssignmentSubmission;
