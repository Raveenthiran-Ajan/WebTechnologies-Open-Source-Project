import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Button, Modal, Box, TextField, Snackbar, Alert, Chip } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/userRelated/userHandle';
import { getTeacherDetails } from '../../redux/teacherRelated/teacherHandle';
import { underControl } from '../../redux/userRelated/userSlice';

const TeacherProfile = () => {
 const dispatch = useDispatch();
 const { currentUser, status } = useSelector((state) => state.user);
 const { teacherDetails } = useSelector((state) => state.teacher);

 const [open, setOpen] = useState(false);
 const [oldPassword, setOldPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');

 const [openSnackbar, setOpenSnackbar] = useState(false);

 const teachSclass = currentUser.teachSclass;
 const teachSubject = currentUser.teachSubject;
 const teachSchool = currentUser.school;

 const teacherData = teacherDetails || currentUser;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePasswordChange = () => {
    dispatch(updateUser({ oldPassword, newPassword }, currentUser._id, 'Teacher/password'));
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

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: 2 
    }}>
      <ProfileCard>
        <ProfileCardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Teacher Profile
          </Typography>
          <ProfileText><strong>Name:</strong> {teacherData?.name || 'N/A'}</ProfileText>
          <ProfileText><strong>Email:</strong> {teacherData?.email || 'N/A'}</ProfileText>
          <ProfileText><strong>School:</strong> {teacherData?.school?.schoolName || 'Not Assigned'}</ProfileText>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Assigned Classes:</Typography>
            {teacherData?.teachSclasses && teacherData.teachSclasses.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {teacherData.teachSclasses.map((cls) => (
                  <Chip key={cls._id} label={cls.sclassName} color="primary" variant="outlined" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No classes assigned</Typography>
            )}
          </Box>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Assigned Subjects:</Typography>
            {teacherData?.teachSubjects && teacherData.teachSubjects.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {teacherData.teachSubjects.map((sub) => (
                  <Chip key={sub._id} label={sub.subName} color="secondary" variant="outlined" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No subjects assigned</Typography>
            )}
          </Box>
          
          {teacherData?.attendanceClass && (
            <ProfileText><strong>Class Teacher for:</strong> {teacherData.attendanceClass.sclassName}</ProfileText>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleOpen}>Change Password</Button>
          </Box>
        </ProfileCardContent>
      </ProfileCard>
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
    </Box>
  )
}

export default TeacherProfile

const ProfileCard = styled(Card)`
  width: 600px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const ProfileCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileText = styled(Typography)`
  margin: 10px;
`;
