import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Container, 
    Typography, 
    Box, 
    Chip, 
    TextField,
    Button,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
    Grid
} from '@mui/material';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { addStuff } from '../../redux/userRelated/userHandle';
import { getAllComplains } from '../../redux/complainRelated/complainHandle';

const TeacherComplain = () => {
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
            userType: 'teacher',
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

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Complaint #',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={`#${params.value}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'date',
            headerName: 'Date Submitted',
            width: 150,
            renderCell: (params) => (
                new Date(params.value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            ),
        },
        {
            field: 'complaint',
            headerName: 'Complaint Description',
            width: 300,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value || 'Pending'}
                    size="small"
                    color={params.value === 'Actioned' ? 'success' : 'warning'}
                    variant="filled"
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                            // Handle view complaint details
                            console.log('View complaint:', params.row);
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        View
                    </Button>
                </Box>
            ),
        },
    ];

    const rows = userComplaints.map((complain, index) => ({
        id: index + 1,
        date: complain.date,
        complaint: complain.complaint,
        status: complain.status,
        originalId: complain._id,
        actionedDate: complain.actionedDate
    }));

    return (
        <Container maxWidth="lg">
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

            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" color="primary">
                        My Complaints
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Add Complaint
                    </Button>
                </Box>

                {complainLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            checkboxSelection={false}
                            disableRowSelectionOnClick
                            slots={{
                                toolbar: CustomToolbar,
                            }}
                            sx={{
                                '& .MuiDataGrid-root': {
                                    border: 'none',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '1px solid #e0e0e0',
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    backgroundColor: '#fafafa',
                                },
                                '& .MuiDataGrid-overlay': {
                                    backgroundColor: '#ffffff',
                                },
                            }}
                            localeText={{
                                noRowsLabel: 'No complaints submitted yet.',
                            }}
                        />
                    </Box>
                )}

                {/* Summary Information */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Total Complaints: {userComplaints.length} | 
                        Pending: {userComplaints.filter(c => c.status !== 'Actioned').length} | 
                        Resolved: {userComplaints.filter(c => c.status === 'Actioned').length}
                    </Typography>
                </Box>
            </Box>

            {/* Floating Action Button */}
            <Fab 
                color="primary" 
                aria-label="add complaint"
                onClick={() => setOpenDialog(true)}
                sx={{ 
                    position: 'fixed', 
                    bottom: 24, 
                    right: 24,
                    '&:hover': {
                        transform: 'scale(1.1)'
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
                    bgcolor: 'primary.main',
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
                            sx={{ mr: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitLoading}
                        >
                            {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Complaint'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default TeacherComplain;