import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Button,
    TextField,
    Modal,
    Box,
    Snackbar,
    Alert,
    Container,
    Paper,
    Typography,
    Avatar
} from '@mui/material';
import { updateUser } from '../../redux/userRelated/userHandle';
import { underControl } from '../../redux/userRelated/userSlice';
import styled from 'styled-components';

const AdminProfile = () => {
    const { currentUser, status } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePasswordChange = () => {
        dispatch(updateUser({ oldPassword, newPassword }, currentUser._id, 'Admin/password'));
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
        <>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <StyledPaper elevation={3}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}>
                            {String(currentUser.name).charAt(0)}
                        </Avatar>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {currentUser.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            {currentUser.email}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            {currentUser.schoolName}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpen}
                            sx={{ mt: 3, borderRadius: '20px', py: 1, px: 3 }}
                        >
                            Change Password
                        </Button>
                    </Box>
                </StyledPaper>
            </Container>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyles}>
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
        </>
    );
}

const StyledPaper = styled(Paper)`
  padding: 32px;
  margin: auto;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

const modalStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default AdminProfile;
