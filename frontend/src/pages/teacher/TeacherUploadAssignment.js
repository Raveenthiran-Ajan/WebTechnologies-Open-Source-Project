import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../config";

const TeacherUploadAssignment = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    // Fetch assignments by current teacher
    if (currentUser && currentUser._id) {
      axios
        .get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`)
        .then((res) => {
          setAssignments(res.data);
          if (res.data.length > 0) {
            setSelectedAssignmentId(res.data[0]._id);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch assignments", err);
        });
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedAssignmentId) {
      setLoadingSubmissions(true);
      axios
        .get(`${API_BASE_URL}/submissions/assignment/${selectedAssignmentId}`)
        .then((res) => {
          setSubmissions(res.data);
          setLoadingSubmissions(false);
        })
        .catch((err) => {
          console.error("Failed to fetch submissions", err);
          setLoadingSubmissions(false);
        });
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignmentId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !subject || !dueDate) {
      setAlert({
        open: true,
        message: "Please fill in all required fields (title, subject, deadline).",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("dueDate", dueDate);
    formData.append("teacherId", currentUser._id);
    formData.append("classId", currentUser.teachSclass._id);
    if (file) {
      formData.append("file", file);
    }

    axios
      .post(`${API_BASE_URL}/assignments/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setAlert({
          open: true,
          message: "Assignment uploaded successfully!",
          severity: "success",
        });
        // Clear form
        setTitle("");
        setDescription("");
        setSubject("");
        setDueDate("");
        setFile(null);
        // Refresh assignments list
        return axios.get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`);
      })
      .then((res) => {
        setAssignments(res.data);
        if (res.data.length > 0) {
          setSelectedAssignmentId(res.data[0]._id);
        }
      })
      .catch((err) => {
        setAlert({
          open: true,
          message:
            (err.response && err.response.data.error) ||
            "Failed to upload assignment.",
          severity: "error",
        });
      });
  };

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 800, boxShadow: 2, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Upload Assignment
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                fullWidth
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Deadline Date and Time"
                type="datetime-local"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                type="reset"
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setSubject("");
                  setDueDate("");
                  setFile(null);
                }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Upload
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3, width: "100%", maxWidth: 800, boxShadow: 2 }}>
        <Typography variant="h6" mb={2}>
          View Student Submissions
        </Typography>

        {assignments.length > 0 ? (
          <>
            <TextField
              select
              label="Select Assignment"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              SelectProps={{
                native: true,
              }}
              fullWidth
              sx={{ mb: 2 }}
            >
              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title}
                </option>
              ))}
            </TextField>

            {loadingSubmissions ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
              </Box>
            ) : submissions.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Answer Text</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Feedback</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>{submission.studentId?.name || "Unknown"}</TableCell>
                      <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {submission.fileUrl ? (
                          <Link href={`${API_BASE_URL}${submission.fileUrl}`} target="_blank" rel="noopener">
                            View File
                          </Link>
                        ) : (
                          "No File"
                        )}
                      </TableCell>
                      <TableCell>{submission.answerText || "-"}</TableCell>
                      <TableCell>{submission.grade || "-"}</TableCell>
                      <TableCell>{submission.feedback || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No submissions found for this assignment.</Typography>
            )}
          </>
        ) : (
          <Typography>No assignments found. Please upload an assignment first.</Typography>
        )}
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherUploadAssignment;
