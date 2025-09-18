import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const TeacherMarking = () => {
  const { studentId, subjectId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Fetch submissions for the student and subject
    axios
      .get(`${API_BASE_URL}/submissions/student/${studentId}`)
      .then((res) => {
        // Filter submissions by subjectId if needed
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setAlert({ open: true, message: 'Failed to fetch submissions', severity: 'error' });
        setLoading(false);
      });
  }, [studentId]);

  const handleGradeChange = (index, value) => {
    const newSubmissions = [...submissions];
    newSubmissions[index].grade = value;
    setSubmissions(newSubmissions);
  };

  const handleFeedbackChange = (index, value) => {
    const newSubmissions = [...submissions];
    newSubmissions[index].feedback = value;
    setSubmissions(newSubmissions);
  };

  const handleSubmit = () => {
    // Update each submission marking
    Promise.all(
      submissions.map((submission) =>
        axios.put(`${API_BASE_URL}/submissions/${submission._id}/marking`, {
          grade: submission.grade,
          feedback: submission.feedback,
        })
      )
    )
      .then(() => {
        setAlert({ open: true, message: 'Marking updated successfully', severity: 'success' });
      })
      .catch(() => {
        setAlert({ open: true, message: 'Failed to update marking', severity: 'error' });
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Marking for Student {studentId}
      </Typography>
      {loading ? (
        <Typography>Loading submissions...</Typography>
      ) : submissions.length === 0 ? (
        <Typography>No submissions found for this student.</Typography>
      ) : (
        submissions.map((submission, index) => (
          <Box key={submission._id} sx={{ mb: 3, border: '1px solid #ccc', p: 2, borderRadius: 2 }}>
            <Typography variant="h6">Assignment: {submission.assignmentId?.title || 'N/A'}</Typography>
            <TextField
              label="Grade"
              value={submission.grade || ''}
              onChange={(e) => handleGradeChange(index, e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Feedback"
              value={submission.feedback || ''}
              onChange={(e) => handleFeedbackChange(index, e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
          </Box>
        ))
      )}
      <Button variant="contained" onClick={handleSubmit} disabled={loading || submissions.length === 0}>
        Save Marking
      </Button>
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        Back
      </Button>
    </Box>
  );
};

export default TeacherMarking;
