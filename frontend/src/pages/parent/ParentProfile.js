import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, CircularProgress, Card, CardContent, Avatar, Divider, Container, Paper, Button, Modal, TextField, Snackbar, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../redux/userRelated/userHandle';
import { underControl } from '../../redux/userRelated/userSlice';

const ParentProfile = () => {
    const { currentUser, loading } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status } = useSelector((state) => state.user);

    const [open, setOpen] = React.useState(false);
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [openSnackbar, setOpenSnackbar] = React.useState(false);

    // Helper function to get class name
    const getClassName = (sclassName) => {
        if (!sclassName) return null;
        
        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (typeof sclassName === 'string' && sclassName.length === 24 && /^[0-9a-fA-F]{24}$/.test(sclassName)) {
            return null; // Hide ObjectId, show nothing instead
        }
        
        if (typeof sclassName === 'string') return sclassName;
        if (typeof sclassName === 'object' && sclassName.sclassName) return sclassName.sclassName;
        if (typeof sclassName === 'object' && sclassName.name) return sclassName.name;
        return null; // Hide unknown formats
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePasswordChange = () => {
        dispatch(updateUser({ oldPassword, newPassword }, currentUser._id, 'Parent/password'));
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    React.useEffect(() => {
        if (status === 'added') {
            // Success UI feedback
            setOpenSnackbar(true);
            // Reset fields and close modal
            setOldPassword('');
            setNewPassword('');
            setOpen(false);
            // Redirect to parent home page with success message flag
            navigate('/Parent/dashboard?msg=password-changed');
            // Reset status
            dispatch(underControl());
        }
    }, [status, dispatch, navigate]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Loading profile...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!currentUser) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">No parent information available.</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                    sx={{ 
                        width: 100, 
                        height: 100, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}
                >
                    {currentUser.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Parent Profile
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Manage your account information
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Personal Information Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        '&:hover': { 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                        },
                        transition: 'box-shadow 0.3s ease'
                    }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Personal Information
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Full Name
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {currentUser.name}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Email Address
                                </Typography>
                                <Typography variant="body1">
                                    {currentUser.email}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Phone Number
                                </Typography>
                                <Typography variant="body1">
                                    {currentUser.phone || 'Not provided'}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button variant="contained" onClick={handleOpen} sx={{ minWidth: 150 }}>
                                    Change Password
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* Children Information Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        '&:hover': { 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                        },
                        transition: 'box-shadow 0.3s ease'
                    }}>
                        <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 2, textAlign: 'center' }}>
                            <FamilyRestroomIcon sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Children Information
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                                {currentUser.children ? currentUser.children.length : 0} {currentUser.children?.length === 1 ? 'Child' : 'Children'}
                            </Typography>
                            
                            {currentUser.children && currentUser.children.length > 0 ? (
                                <Box>
                                    {currentUser.children.map((child, index) => (
                                        <Box key={index} sx={{ 
                                            mb: 2, 
                                            p: 2, 
                                            bgcolor: 'grey.100', 
                                            borderRadius: 1,
                                            borderLeft: '3px solid',
                                            borderLeftColor: 'primary.main'
                                        }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                {child.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Roll: {child.rollNum}
                                            </Typography>
                                            {getClassName(child.sclassName) && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Class: {getClassName(child.sclassName)}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <FamilyRestroomIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        No children linked
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Change Password Modal */}
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
                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Change Password
                    </Typography>
                    <TextField
                        label="Old Password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleClose} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handlePasswordChange} variant="contained">
                            Change Password
                        </Button>
                    </Box>
                </Box>
            </Modal>
            
            {/* Success Snackbar */}
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
};

export default ParentProfile;