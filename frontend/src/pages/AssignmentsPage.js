import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AssignmentSubmission from "../components/AssignmentSubmission";
import {
  Container,
  Paper,
  Table,
  TableBody,
  Box,
  TableCell,
  TableContainer,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  TableRow,
  Chip,
  Typography,
  Grid,
  Card,
  TablePagination,
  Button,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { API_BASE_URL } from "../config";

function AssignmentsPage() {
  const { currentUser } = useSelector((state) => state.user);
  const { t } = useTranslation();
  const location = useLocation();

  const studentId = currentUser?._id;
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const filterSubjectId = location.state?.subjectId;
  const filterSubjectName = location.state?.subjectName;

  const formatTimeLeft = (timeDiff) => {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m left`;
  };

  const fetchAssignments = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/assignments/student/${studentId}`);
      setAssignments(res.data.assignments || []);
      setFetchError("");
    } catch (err) {
      console.error("Failed to fetch assignments", err);
      setFetchError("Could not fetch assignments.");
      setAssignments([]);
    }
  }, [studentId]);

  const fetchSubmissions = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/submissions/student/${studentId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
      setSubmissions([]);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAssignments();
      fetchSubmissions();
    }
  }, [studentId, fetchAssignments, fetchSubmissions]);

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/submissions/${submissionId}`);
      // Refresh submissions to update the UI
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to delete submission", err);
      alert("Failed to delete submission. Please try again.");
    }
  };

  const filteredAssignments = filterSubjectId
    ? assignments.filter(assignment => assignment.subject === filterSubjectId)
    : assignments;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAssignments = filteredAssignments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Assignments {filterSubjectName && `for ${filterSubjectName}`}
      </Typography>
      {filterSubjectId && (
        <Button variant="outlined" component={Link} to="/assignments" state={{}} sx={{ mb: 2 }}>
          Clear Filter & Show All
        </Button>
      )}
      {fetchError && <Typography color="error">{fetchError}</Typography>}
      <Grid container spacing={3}>
        {paginatedAssignments.length > 0 ? (
          paginatedAssignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const timeDiff = dueDate - now;
            const isOverdue = timeDiff < 0;
            const submission = submissions.find(sub => sub.assignmentId?._id === assignment._id);
            const isSubmitted = !!submission;
            const timeLeft = isOverdue ? 'Overdue' : formatTimeLeft(timeDiff);
            const status = isSubmitted ? "Submitted" : (isOverdue ? "Missing" : "Pending");

            return (
              <Grid item xs={12} key={assignment._id}>
                <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{assignment.title}</Typography>
                      <Chip
                        label={status}
                        color={isSubmitted ? 'success' : isOverdue ? 'error' : 'warning'}
                        variant="filled"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Due: {dueDate.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.secondary'}>
                      Time Left: {timeLeft}
                    </Typography>
                    {isSubmitted && (
                      <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Grade:
                          <Typography component="span" color={submission.grade ? 'primary.main' : 'text.secondary'} sx={{ ml: 1 }}>
                            {submission.grade || 'Not Graded Yet'}
                          </Typography>
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>
                          Feedback:
                          <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal' }}>
                            {submission.feedback || 'No feedback yet.'}
                          </Typography>
                        </Typography>
                      </Paper>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={`${API_BASE_URL}${assignment.fileUrl}` || '#'}
                        target="_blank"
                        disabled={!assignment.fileUrl}
                      >
                        Download
                      </Button>
                      {!isSubmitted && !isOverdue && (
                        <Button
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={() => setSelectedAssignment(selectedAssignment?._id === assignment._id ? null : assignment)}
                        >
                          Submit
                        </Button>
                      )}
                      {isSubmitted && (
                        <Button
                          variant="outlined" onClick={() => setSelectedAssignment(selectedAssignment?._id === assignment._id ? null : assignment)} disabled={isOverdue}>
                            Edit Submission
                        </Button>
                      )}
                    {isSubmitted && (
                        <Button
                            variant="contained"
                            color="info"
                            onClick={() => setViewingSubmission(submission)}
                        >
                            View Submission
                        </Button>
                    )}
                      {isSubmitted && !isOverdue && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteSubmission(submission._id)}
                            sx={{ ml: 1 }}
                        >
                            Delete Submission
                        </Button>
                      )}
                    </Box>
                  </Box>
                  {selectedAssignment?._id === assignment._id && (
                    <AssignmentSubmission
                      assignmentId={selectedAssignment._id}
                      studentId={studentId}
                      onClose={() => setSelectedAssignment(null)}
                      onSubmitted={() => {
                        fetchSubmissions();
                        setSelectedAssignment(null);
                      }}
                    />
                  )}
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Typography>No assignments found.</Typography>
          </Grid>
        )}
      </Grid>

      <TablePagination
        component="div"
        count={filteredAssignments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[6, 12, 24]}
        sx={{ mt: 2 }}
      />

      {viewingSubmission && (
        <Dialog open={!!viewingSubmission} onClose={() => setViewingSubmission(null)} fullWidth maxWidth="sm">
          <DialogTitle>Submission Details</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Grade:
              </Typography>
              <Typography variant="h6" color={viewingSubmission.grade ? 'primary.main' : 'text.secondary'}>
                {viewingSubmission.grade || 'Not Graded Yet'}
              </Typography>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Feedback:</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, background: '#f9f9f9' }}>
                  <Typography variant="body2">{viewingSubmission.feedback || 'No feedback available.'}</Typography>
                </Paper>
              </Box>
              {viewingSubmission.answerText && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Submitted Text:</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
                    {viewingSubmission.answerText}
                  </Paper>
                </Box>
              )}
              {viewingSubmission.fileUrl && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Submitted File:</Typography>
                  <Button
                    variant="outlined"
                    href={`${API_BASE_URL}${viewingSubmission.fileUrl}`}
                    target="_blank"
                    startIcon={<DownloadIcon />}
                    sx={{ mt: 1 }}
                  >
                    View/Download File
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewingSubmission(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}

export default AssignmentsPage;