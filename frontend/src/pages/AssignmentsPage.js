import React, { useState, useEffect } from "react";
import axios from "axios";
import AssignmentSubmission from "../components/AssignmentSubmission";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
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
  const [studentId, setStudentId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const formatTimeLeft = (timeDiff) => {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m left`;
  };

  const fetchAssignments = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/assignments/student/${studentId}`);
      setAssignments(res.data.assignments || []);
      setFetchError("");
    } catch (err) {
      setFetchError("Could not fetch assignments.");
      setAssignments([]);
    }
  };

  const fetchSubmissions = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/submissions/student/${studentId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchAssignments();
      fetchSubmissions();
    }
    // eslint-disable-next-line
  }, [studentId]);

  return (
    <div>
      <h1>Assignments</h1>
      <div>
        <label>Enter Student ID to view assignments: </label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Student ID"
        />
        <button onClick={fetchAssignments}>Fetch Assignments</button>
      </div>
      {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Time Left</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const now = new Date();
              const timeDiff = dueDate - now;
              const isOverdue = timeDiff < 0;
              const isSubmitted = submissions.some(sub => sub.assignmentId === assignment._id);
              const timeLeft = isOverdue ? '❌ Overdue' : formatTimeLeft(timeDiff);

              return (
                <TableRow key={assignment._id} sx={{ bgcolor: assignment._id % 2 === 0 ? 'action.hover' : 'background.paper' }}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{assignment.title}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{dueDate.toLocaleDateString()}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {isSubmitted ? (
                      <Chip icon={<CheckCircleIcon />} label="Submitted" color="success" variant="outlined" sx={{ borderRadius: '16px' }} />
                    ) : isOverdue ? (
                      <Chip icon={<WarningIcon />} label="Overdue" color="error" variant="outlined" sx={{ borderRadius: '16px' }} />
                    ) : (
                      <Chip icon={<ScheduleIcon />} label="Pending" color="warning" variant="outlined" sx={{ borderRadius: '16px' }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={timeLeft} variant="outlined" sx={{ borderRadius: '16px', fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={assignment.fileUrl || '#'}
                      target="_blank"
                      disabled={!assignment.fileUrl}
                      sx={{ mr: 1, minWidth: 100 }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      disabled={isSubmitted || isOverdue}
                      onClick={() => setSelectedAssignment(assignment)}
                      sx={{ minWidth: 100 }}
                    >
                      Submit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedAssignment && (
        <AssignmentSubmission
          assignmentId={selectedAssignment._id}
          studentId={studentId}
          onClose={() => setSelectedAssignment(null)}
          onSubmitted={() => {
            fetchAssignments();
            fetchSubmissions();
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}

export default AssignmentsPage;