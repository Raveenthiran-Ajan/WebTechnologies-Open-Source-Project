import React, { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const AssignmentSubmission = function ({ assignmentId, studentId, onClose, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("studentId", studentId);
    if (file) {
      formData.append("file", file);
    }
    if (answerText) {
      formData.append("answerText", answerText);
    }

    console.log("Submitting submission with formData:", formData);

    axios
      .post("http://localhost:5000/submissions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(function (res) {
        console.log("Backend response:", res.data);
        setAlert({
          open: true,
          message: "Submission uploaded successfully!",
          severity: "success",
        });
        setFile(null);
        setAnswerText("");
        if (onSubmitted) onSubmitted();
      })
      .catch(function (err) {
        console.error("Upload failed:", err.response ? err.response.data : err);
        setAlert({
          open: true,
          message:
            (err.response && err.response.data.error) ||
            "Failed to upload submission.",
          severity: "error",
        });
      });
  }

  return React.createElement(
    Box,
    { sx: { mt: 2, display: "flex", justifyContent: "center" } },
    React.createElement(
      Paper,
      { sx: { p: 3, width: "100%", boxShadow: 2 } },
      React.createElement(Typography, { variant: "h6", mb: 2 }, "Submit Assignment"),
      React.createElement(
        "form",
        { onSubmit: handleSubmit },
        React.createElement(
          Grid,
          { container: true, spacing: 2 },
          React.createElement(
            Grid,
            { item: true, xs: 12 },
            React.createElement(TextField, {
              label: "Answer Text (optional)",
              fullWidth: true,
              value: answerText,
              onChange: (e) => setAnswerText(e.target.value),
              multiline: true,
              rows: 3,
            })
          ),
          React.createElement(
            Grid,
            { item: true, xs: 12 },
            React.createElement("input", {
              type: "file",
              accept: ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
              onChange: (e) => setFile(e.target.files[0]),
              style: { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" },
            })
          ),
          React.createElement(
            Grid,
            { item: true, xs: 6 },
            React.createElement(
              Button,
              { type: "button", variant: "outlined", color: "secondary", fullWidth: true, onClick: onClose },
              "Cancel"
            )
          ),
          React.createElement(
            Grid,
            { item: true, xs: 6 },
            React.createElement(
              Button,
              { type: "submit", variant: "contained", color: "primary", fullWidth: true },
              "Submit"
            )
          )
        )
      )
    ),
    React.createElement(
      Snackbar,
      {
        open: alert.open,
        autoHideDuration: 4000,
        onClose: () => setAlert({ ...alert, open: false }),
      },
      React.createElement(Alert, { severity: alert.severity, sx: { width: "100%" } }, alert.message)
    )
  );
};

export default AssignmentSubmission;
