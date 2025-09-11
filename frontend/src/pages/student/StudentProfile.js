import React, { useState } from 'react'
import styled from 'styled-components';
import { Card, CardContent, Typography, Grid, Box, Avatar, Container, Paper, TextField, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

// You should have an action like updateStudentProfile in your redux/actions
// import { updateStudentProfile } from '../../redux/actions/userActions';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { currentUser, response, error } = useSelector((state) => state.user);

  // Local state for editable fields
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: currentUser.name || '',
    rollNum: currentUser.rollNum || '',
    dob: currentUser.dob || '',
    gender: currentUser.gender || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    emergencyContact: currentUser.emergencyContact || '',
  });

  const sclassName = currentUser.sclassName;
  const studentSchool = currentUser.school;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: currentUser.name || '',
      rollNum: currentUser.rollNum || '',
      dob: currentUser.dob || '',
      gender: currentUser.gender || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      address: currentUser.address || '',
      emergencyContact: currentUser.emergencyContact || '',
    });
  };

  const handleSave = () => {
    // dispatch(updateStudentProfile(form));
    setEditMode(false);
    // Optionally show a success message
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Avatar alt="Student Avatar" sx={{ width: 150, height: 150 }}>
                {String(form.name).charAt(0)}
              </Avatar>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              {editMode ? (
                <TextField
                  name="name"
                  label="Name"
                  value={form.name}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="h5" component="h2" textAlign="center">
                  {form.name}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              {editMode ? (
                <TextField
                  name="rollNum"
                  label="Roll Number"
                  value={form.rollNum}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="subtitle1" component="p" textAlign="center">
                  Student Roll No: {form.rollNum}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography variant="subtitle1" component="p" textAlign="center">
                Class: {sclassName?.sclassName}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography variant="subtitle1" component="p" textAlign="center">
                School: {studentSchool?.schoolName}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {editMode ? (
                <TextField
                  name="dob"
                  label="Date of Birth"
                  value={form.dob}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography variant="subtitle1" component="p">
                  <strong>Date of Birth:</strong> {form.dob || 'N/A'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {editMode ? (
                <TextField
                  name="gender"
                  label="Gender"
                  value={form.gender}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography variant="subtitle1" component="p">
                  <strong>Gender:</strong> {form.gender || 'N/A'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {editMode ? (
                <TextField
                  name="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography variant="subtitle1" component="p">
                  <strong>Email:</strong> {form.email || 'N/A'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {editMode ? (
                <TextField
                  name="phone"
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography variant="subtitle1" component="p">
                  <strong>Phone:</strong> {form.phone || 'N/A'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {editMode ? (
                <TextField
                  name="address"
                  label="Address"
                  value={form.address}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography variant="subtitle1" component="p">
                  <strong>Address:</strong> {form.address || 'N/A'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {editMode ? (
                <TextField
                  name="emergencyContact"
                  label="Emergency Contact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography variant="subtitle1" component="p">
                  <strong>Emergency Contact:</strong> {form.emergencyContact || 'N/A'}
                </Typography>
              )}
            </Grid>
          </Grid>
          <Box mt={2} display="flex" justifyContent="flex-end">
            {editMode ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 1 }}>
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default StudentProfile

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;