import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Box, 
    Avatar, 
    Chip, 
    Grid,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { addStuff } from '../../redux/userRelated/userHandle';
import { getAllComplains } from '../../redux/complainRelated/complainHandle';

const ParentComplaints = () => {
    const dispatch = useDispatch();
    const { currentUser, status, error: userError } = useSelector((state) => state.user);
    const { complainsList, loading: complainLoading } = useSelector((state) => state.complain);
    
    const [openDialog, setOpenDialog] = useState(false);
    const [complaint, setComplaint] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    useEffect(() => {
        if (currentUser && currentUser.school) {
            dispatch(getAllComplains(currentUser.school._id, "Complain"));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === "added") {
            setSubmitLoading(false);
            setMessage("Complaint submitted successfully!");
            setAlertSeverity('success');
            setOpenDialog(false);
            setComplaint('');
            setDate(new Date().toISOString().split('T')[0]);
            // Refresh complaints list
            if (currentUser && currentUser.school) {
                dispatch(getAllComplains(currentUser.school._id, "Complain"));
            }
        } else if (userError) {
            setSubmitLoading(false);
            setMessage("Error submitting complaint. Please try again.");
            setAlertSeverity('error');
        }
    }, [status, userError, dispatch, currentUser]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!complaint.trim()) {
            setMessage("Please enter a complaint description.");
            setAlertSeverity('warning');
            return;
        }

        setSubmitLoading(true);
        const fields = {
            user: currentUser._id,
            userType: 'parent',
            date,
            complaint: complaint.trim(),
            school: currentUser.school._id,
        };
        dispatch(addStuff(fields, "Complain"));
    };

    // Filter complaints by current user
    const userComplaints = complainsList ? complainsList.filter(complain => {
        if (!complain.user) return false;
        
        // Handle both string and object user references
        const complainUserId = typeof complain.user === 'string' 
            ? complain.user 
            : complain.user._id;
            
        return complainUserId === currentUser._id;
    }) : [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                    sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}
                >
                    <ReportProblemIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    My Complaints
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<ReportProblemIcon />}
                        label={`${userComplaints.length} Total Complaints`} 
                        color="primary" 
                        size="large"
                    />
                </Box>
            </Box>

            {/* Alert Messages */}
            {message && (
                <Alert 
                    severity={alertSeverity} 
                    sx={{ mb: 3 }}
                    onClose={() => setMessage('')}
                >
                    {message}
                </Alert>
            )}

            {/* Complaints List */}
            {complainLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : userComplaints.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <ReportProblemIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>No complaints submitted yet.</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click the + button to submit your first complaint.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {userComplaints.map((complain, index) => (
                        <Grid item xs={12} key={complain._id || index}>
                            <Card sx={{ 
                                borderRadius: 3,
                                '&:hover': { 
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                                },
                                transition: 'all 0.3s ease-in-out'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    p: 3
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <ReportProblemIcon sx={{ fontSize: 30 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Complaint #{index + 1}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    Submitted on {new Date(complain.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip 
                                            label={complain.status || "Pending"} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: complain.status === 'Actioned' 
                                                    ? 'rgba(76, 175, 80, 0.8)' 
                                                    : 'rgba(255,255,255,0.25)', 
                                                color: 'white',
                                                fontWeight: 'bold',
                                                border: '1px solid rgba(255,255,255,0.3)'
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
                                        {complain.complaint}
                                    </Typography>
                                    {complain.status === 'Actioned' && complain.actionedDate && (
                                        <Box sx={{ 
                                            mt: 2, 
                                            p: 2, 
                                            bgcolor: 'success.light', 
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                                                ✓ Action taken on {new Date(complain.actionedDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Floating Action Button */}
            <Fab 
                color="primary" 
                aria-label="add complaint"
                onClick={() => setOpenDialog(true)}
                sx={{ 
                    position: 'fixed', 
                    bottom: 24, 
                    right: 24,
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                    },
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                <AddIcon />
            </Fab>

            {/* Add Complaint Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    Submit New Complaint
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Complaint Description"
                                    multiline
                                    rows={4}
                                    value={complaint}
                                    onChange={(e) => setComplaint(e.target.value)}
                                    placeholder="Please describe your complaint in detail..."
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button 
                            onClick={() => setOpenDialog(false)}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            disabled={submitLoading}
                            sx={{ 
                                borderRadius: 2,
                                background: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e9639b 0%, #e8d441 100%)',
                                }
                            }}
                        >
                            {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Submit Complaint"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default ParentComplaints;