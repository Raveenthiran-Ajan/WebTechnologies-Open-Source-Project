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
  LinearProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../config";

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

const AssignmentSubmission = ({ assignmentId, studentId, onClose, onSubmitted, deadline }) => {
  const [file, setFile] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isDeadlineOver, setIsDeadlineOver] = useState(false);

  useEffect(() => {
    // Check if deadline is over
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      setIsDeadlineOver(now > deadlineDate);
    }
  }, [deadline]);

  useEffect(() => {
    // Fetch existing submission for this assignment and student
    async function fetchSubmission() {
      try {
        const res = await axios.get(`${API_BASE_URL}/submissions`, {
          params: { assignmentId, studentId },
        });
        if (res.data && res.data.length > 0) {
          const submission = res.data[0];
          setExistingSubmission(submission);
          setAnswerText(submission.answerText || "");
          setFile(null); // File editing can be handled separately if needed
        } else {
          setExistingSubmission(null);
          setAnswerText("");
          setFile(null);
        }
      } catch (error) {
        console.error("Failed to fetch submission", error);
      }
    }
    fetchSubmission();
  }, [assignmentId, studentId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file && !answerText.trim()) {
      setAlert({
        open: true,
        message: "Please provide either a file or answer text.",
        severity: "error",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("studentId", studentId);
    if (file) {
      formData.append("file", file);
    }
    if (answerText) {
      formData.append("answerText", answerText);
    }

    const request = existingSubmission
      ? axios.put(`${API_BASE_URL}/submissions/${existingSubmission._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        })
      : axios.post(`${API_BASE_URL}/submissions`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        });

    request
      .then((res) => {
        setAlert({
          open: true,
          message: existingSubmission ? "Submission updated successfully!" : "Submission uploaded successfully!",
          severity: "success",
        });
        setFile(null);
        setAnswerText("");
        setErrors({});
        setUploading(false);
        setUploadProgress(0);
        if (onSubmitted) onSubmitted();
        setExistingSubmission(res.data);
      })
      .catch((err) => {
        setAlert({
          open: true,
          message:
            (err.response && err.response.data.error) ||
            "Failed to upload submission.",
          severity: "error",
        });
        setUploading(false);
        setUploadProgress(0);
      });
  };

  const handleDelete = () => {
    if (!existingSubmission) return;
    setUploading(true);
    axios
      .delete(`${API_BASE_URL}/submissions/${existingSubmission._id}`)
      .then(() => {
        setAlert({
          open: true,
          message: "Submission deleted successfully!",
          severity: "success",
        });
        setExistingSubmission(null);
        setAnswerText("");
        setFile(null);
        setUploading(false);
        if (onSubmitted) onSubmitted();
      })
      .catch(() => {
        setAlert({
          open: true,
          message: "Failed to delete submission.",
          severity: "error",
        });
        setUploading(false);
      });
  };

  return (
    <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 600, boxShadow: 2 }}>
        <Typography variant="h6" mb={2}>
          Submit Assignment
        </Typography>
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="textSecondary" align="center">
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Answer Text (optional)"
                fullWidth
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                multiline
                rows={3}
                disabled={isDeadlineOver}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: isDeadlineOver ? "not-allowed" : "pointer",
                  position: "relative",
                  bgcolor: file ? "#e3f2fd" : "transparent",
                }}
                onClick={() => !isDeadlineOver && document.getElementById("fileInputStudent").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isDeadlineOver) return;
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
                  id="fileInputStudent"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (isDeadlineOver) return;
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
                      disabled={isDeadlineOver}
                    >
                      {/* Removed ClearIcon for official look */}
                    </IconButton>
                  </Box>
                ) : (
                  <Typography color={isDeadlineOver ? "text.disabled" : "textSecondary"}>
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
                type="button"
                variant="outlined"
                color="secondary"
                fullWidth
                disabled={uploading}
                onClick={onClose}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              {!existingSubmission && (
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit"}
                </Button>
              )}
              {existingSubmission && !isDeadlineOver && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    disabled={uploading}
                    onClick={handleSubmit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={uploading}
                    onClick={handleDelete}
                    sx={{ mt: 1 }}
                  >
                    Delete
                  </Button>
                </>
              )}
              {existingSubmission && isDeadlineOver && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled
                >
                  Download
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
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

export default AssignmentSubmission;
