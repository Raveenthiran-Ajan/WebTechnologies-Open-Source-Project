import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Divider
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { API_BASE_URL } from '../../config';

// Grade color mapping
const gradeColors = {
  'A+': '#1976d2',
  A: '#388e3c',
  'B+': '#0288d1',
  B: '#fbc02d',
  C: '#ffa726',
  D: '#e57373',
  F: '#d32f2f',
};

const getGradeColor = (grade) => gradeColors[grade] || '#90caf9';

// Helper to get color based on marks
const getGradeColorByMarks = (marks) => {
  if (typeof marks !== "number") return "#bdbdbd";
  if (marks >= 75) return "#388e3c";      // Green
  if (marks >= 65) return "#fbc02d";      // Yellow
  if (marks >= 55) return "#ffa726";      // Orange
  return "#d32f2f";                       // Red
};

const StudentGrades = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      setLoading(true);
      fetch(`${API_BASE_URL}/submissions/student/${currentUser._id}`)
        .then((res) => res.json())
        .then((data) => {
          setSubmissions(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch submissions:', err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        No submissions found.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 3 },
        minHeight: "100vh",
        fontFamily: "'Poppins', 'Roboto', sans-serif"
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          letterSpacing: "0.04em",
          mb: 3,
          textShadow: "0 2px 8px #90caf9"
        }}
      >
        My Grades
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 5,
          boxShadow: "0 8px 32px 0 rgba(25, 118, 210, 0.12)",
          background: "#fff",
          border: "1.5px solid #e3f2fd",
          maxWidth: 700,
          mx: "auto"
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em"
                }}
              >
                Assignment
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em",
                  textAlign: "center"
                }}
              >
                Submitted At
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em",
                  textAlign: "center"
                }}
              >
                Grade
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em",
                  textAlign: "center"
                }}
              >
                Feedback
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission, idx) => (
              <TableRow
                key={submission._id}
                sx={{
                  backgroundColor: idx % 2 === 0 ? "#f7fafd" : "#f0f4f8",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                  transition: "background 0.3s"
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>
                  {submission.assignmentId?.title || "-"}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontWeight: 500 }}>
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {(() => {
                    // Use submission.grade as the numeric mark (since that's what your backend sends)
                    let marks = submission.grade;
                    if (typeof marks === "string" && marks.trim() !== "") marks = parseFloat(marks);
                    if (marks === undefined || marks === null || marks === "" || isNaN(marks)) marks = null;
                    let color = "#bdbdbd";
                    if (typeof marks === "number" && !isNaN(marks)) {
                      if (marks >= 75) color = "#388e3c";      // Green
                      else if (marks >= 65) color = "#fbc02d"; // Yellow
                      else if (marks >= 55) color = "#ffa726"; // Orange
                      else color = "#d32f2f";                  // Red
                    }
                    return (
                      <Box
                        sx={{
                          backgroundColor: color,
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          letterSpacing: "0.08em",
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.10)",
                          border: "2px solid #fff"
                        }}
                      >
                        {marks !== null ? marks : "-"}
                      </Box>
                    );
                  })()}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {submission.feedback ? (
                    <Tooltip title={submission.feedback} arrow>
                      <Chip
                        label="View Feedback"
                        sx={{
                          textTransform: "capitalize",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: "medium",
                          borderRadius: 2,
                          px: 2,
                          py: 1,
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#d1e8ff",
                            boxShadow: "0 4px 8px rgba(25, 118, 210, 0.2)",
                          },
                        }}
                        onClick={() => {
                          // Handle feedback view, e.g., open dialog or new page
                          alert(`Feedback: ${submission.feedback}`);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentGrades;
