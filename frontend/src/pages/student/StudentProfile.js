import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Grid, Box, Avatar, Container, Paper, TextField, Button, Modal, Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/userRelated/userHandle';
import { underControl } from '../../redux/userRelated/userSlice';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { currentUser, status } = useSelector((state) => state.user);

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

  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [openSnackbar, setOpenSnackbar] = useState(false);

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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePasswordChange = () => {
    dispatch(updateUser({ oldPassword, newPassword }, currentUser._id, 'Student/password'));
    handleClose();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    if (status === 'added') {
      setOpenSnackbar(true);
      dispatch(underControl());
    }
  }, [status, dispatch]);

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
            <Button variant="contained" onClick={handleOpen} sx={{ ml: 1 }}>Change Password</Button>
          </Box>
        </CardContent>
      </Card>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <h2 id="modal-modal-title">Change Password</h2>
          <TextField
            label="Old Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button onClick={handlePasswordChange}>Change</Button>
        </Box>
      </Modal>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Password changed successfully!
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default StudentProfile

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;
