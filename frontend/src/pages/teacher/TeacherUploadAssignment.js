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
  Link,
  CircularProgress,
  LinearProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../config";
import GradeDistributionChart from "../../components/GradeDistributionChart";

const validateFile = (file) => {
  if (!file) return false;
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

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
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloaded, setDownloaded] = useState({});

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
          setFilteredSubmissions(res.data);
          setLoadingSubmissions(false);
        })
        .catch((err) => {
          console.error("Failed to fetch submissions", err);
          setLoadingSubmissions(false);
        });
    } else {
      setSubmissions([]);
      setFilteredSubmissions([]);
    }
  }, [selectedAssignmentId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = submissions.filter((submission) =>
        submission.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubmissions(filtered);
    } else {
      setFilteredSubmissions(submissions);
    }
  }, [searchTerm, submissions]);

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

    setUploading(true);
    setUploadProgress(0);

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
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
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
        setErrors({});
        setUploading(false);
        setUploadProgress(0);
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
        setUploading(false);
        setUploadProgress(0);
      });
  };

  function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '_answer.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSaveMarking(submissionId) {
    const submission = submissions.find((sub) => sub._id === submissionId);
    if (!submission) return;

    axios
      .put(`${API_BASE_URL}/submissions/${submissionId}/marking`, {
        grade: submission.grade,
        feedback: submission.feedback,
      })
      .then(() => {
        setAlert({
          open: true,
          message: "Marking saved successfully",
          severity: "success",
        });
      })
      .catch(() => {
        setAlert({
          open: true,
          message: "Failed to save marking",
          severity: "error",
        });
      });
  }

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 1200, boxShadow: 2, mb: 4 }}>
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
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  bgcolor: file ? "#e3f2fd" : "transparent",
                }}
                onClick={() => document.getElementById("fileInput").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFile = e.dataTransfer.files[0];
                    if (validateFile(droppedFile)) {
                      setFile(droppedFile);
                      setErrors((prev) => ({ ...prev, file: null }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        file: "Invalid file type or size. Allowed: pdf, doc, docx, txt, jpg, jpeg, png. Max 5MB.",
                      }));
                    }
                    e.dataTransfer.clearData();
                  }
                }}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (validateFile(selectedFile)) {
                      setFile(selectedFile);
                      setErrors((prev) => ({ ...prev, file: null }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        file: "Invalid file type or size. Allowed: pdf, doc, docx, txt, jpg, jpeg, png. Max 5MB.",
                      }));
                    }
                  }}
                />
                {file ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ mr: 1 }}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      {/* Removed ClearIcon for official look */}
                    </IconButton>
                  </Box>
                ) : (
                  <Typography color="textSecondary">
                    Drag & drop a file here, or click to select file (Max 5MB)
                  </Typography>
                )}
              </Box>
              {errors.file && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.file}
                </Typography>
              )}
            </Grid>
            <Grid item xs={6}>
              <Button
                type="reset"
                variant="outlined"
                color="secondary"
                fullWidth
                disabled={uploading}
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
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3, width: "100%", maxWidth: 1200, boxShadow: 2 }}>
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

            <TextField
              label="Search Students"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {loadingSubmissions ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
              </Box>
            ) : filteredSubmissions.length > 0 ? (
              <Box sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                  <Paper sx={{ flex: 1, p: 2, boxShadow: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Typography>
                      Total Submissions: {filteredSubmissions.length}
                    </Typography>
                    <Typography>
                      Graded: {filteredSubmissions.filter(s => s.grade).length}
                    </Typography>
                    <Typography>
                      Ungraded: {filteredSubmissions.filter(s => !s.grade).length}
                    </Typography>
                  </Paper>
                  <Paper sx={{ flex: 2, p: 2, boxShadow: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Grade Distribution
                    </Typography>
                    <GradeDistributionChart submissions={filteredSubmissions} />
                  </Paper>
                </Box>
                <Box sx={{ maxHeight: 600, overflowY: "auto", width: "100%" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <thead>
                      <tr>
                        <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "15%", fontWeight: "bold" }}>Student Name</th>
                        <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "15%", fontWeight: "bold" }}>Submitted At</th>
                        <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "10%", fontWeight: "bold" }}>Download</th>
                        <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "15%", fontWeight: "bold" }}>Grade</th>
                        <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "30%", fontWeight: "bold" }}>Feedback</th>
                        <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "10%", fontWeight: "bold" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr key={submission._id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "8px", verticalAlign: "top", fontWeight: "bold", wordBreak: "break-word" }}>
                            {submission.studentId?.name || "Unknown"}
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "top", wordBreak: "break-word" }}>
                            {new Date(submission.submittedAt).toLocaleString()}
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "top" }}>
                            {downloaded[submission._id] ? (
                              submission.fileUrl ? (
                                <Link
                                  href={`${API_BASE_URL}${submission.fileUrl}`}
                                  target="_blank"
                                  rel="noopener"
                                  sx={{ textDecoration: "none", color: "primary.main" }}
                                >
                                  View File
                                </Link>
                              ) : (
                                <Typography variant="body2" color="text.secondary">Downloaded</Typography>
                              )
                            ) : (
                              <IconButton
                                onClick={() => {
                                  setDownloaded((prev) => ({ ...prev, [submission._id]: true }));
                                  if (submission.fileUrl) {
                                    window.open(`${API_BASE_URL}${submission.fileUrl}`, '_blank');
                                  } else if (submission.answerText) {
                                    downloadText(submission.answerText, submission.studentId?.name || 'submission');
                                  }
                                }}
                              >
                                <DownloadIcon />
                              </IconButton>
                            )}
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "top" }}>
                            <TextField
                              label="Grade"
                              value={submission.grade || ""}
                              onChange={(e) => {
                                const newGrade = e.target.value;
                                setSubmissions((prev) =>
                                  prev.map((sub) =>
                                    sub._id === submission._id ? { ...sub, grade: newGrade } : sub
                                  )
                                );
                              }}
                              size="small"
                              variant="outlined"
                              type="number"
                              inputProps={{ min: 0, max: 100 }}
                              sx={{ width: "100%" }}
                            />
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "top" }}>
                            <TextField
                              label="Feedback"
                              value={submission.feedback || ""}
                              onChange={(e) => {
                                const newFeedback = e.target.value;
                                setSubmissions((prev) =>
                                  prev.map((sub) =>
                                    sub._id === submission._id ? { ...sub, feedback: newFeedback } : sub
                                  )
                                );
                              }}
                              size="small"
                              variant="outlined"
                              multiline
                              rows={2}
                              sx={{ width: "100%" }}
                            />
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "top" }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleSaveMarking(submission._id)}
                              color="primary"
                              sx={{ width: "100%" }}
                            >
                              Save
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
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
