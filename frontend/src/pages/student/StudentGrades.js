import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Tooltip,
  Chip,
} from '@mui/material';
import { API_BASE_URL } from '../../config';

const gradeColor = (grade) => {
  if (!grade) return 'default';
  return 'success';  // all grades green as requested
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
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, margin: '20px auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        My Grades and Feedback
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
        Review your submitted assignments, grades, and teacher feedback here.
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="student grades table">
        <TableHead>
          <TableRow>
            <TableCell>Assignment Title</TableCell>
            <TableCell>Submitted At</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Feedback</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission._id} hover>
              <TableCell>{submission.assignmentId?.title || '-'}</TableCell>
              <TableCell>
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleString()
                  : '-'}
              </TableCell>
              <TableCell>
                {submission.grade ? (
                  <Chip
                    label={submission.grade}
                    color={gradeColor(submission.grade)}
                    size="small"
                  />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {submission.feedback ? (
                  <Tooltip title={submission.feedback} arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'help',
                      }}
                    >
                      {submission.feedback}
                    </Typography>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default StudentGrades;
