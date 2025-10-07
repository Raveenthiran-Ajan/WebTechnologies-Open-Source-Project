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
    Grid,
    IconButton,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
} from '@mui/material';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { addLeaveRequest, deleteLeaveRequest } from '../../redux/leaveRequestRelated/leaveRequestHandle';
import { getLeaveRequestsByParent } from '../../redux/leaveRequestRelated/leaveRequestHandle';

const ParentLeaveRequest = () => {
    const dispatch = useDispatch();
    const { currentUser, status, error: userError } = useSelector((state) => state.user);
    const { leaveRequestsList, loading: leaveLoading, error: leaveError } = useSelector((state) => state.leaveRequest);
    const [loading, setLoading] = useState(false);

    const [openDialog, setOpenDialog] = useState(false);
    const [student, setStudent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [viewing, setViewing] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0); // 0 for pending, 1 for processed

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            if (!currentUser?._id) return;

            try {
                setLoading(true);
                await dispatch(getLeaveRequestsByParent(currentUser._id));
            } catch (error) {
                console.error('Error fetching leave requests:', error);
                setMessage("Error loading leave requests. Please refresh the page.");
                setAlertSeverity('error');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaveRequests();
    }, [dispatch, currentUser?._id]);

    const userLeaveRequests = React.useMemo(() => {
        if (!leaveRequestsList || typeof leaveRequestsList !== 'object') {
            return { pending: [], processed: [] };
        }
        return {
            pending: Array.isArray(leaveRequestsList.pending) ? leaveRequestsList.pending : [],
            processed: Array.isArray(leaveRequestsList.processed) ? leaveRequestsList.processed : []
        };
    }, [leaveRequestsList]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!student || !startDate || !endDate || !reason.trim()) {
            setMessage("Please fill all required fields.");
            setAlertSeverity('warning');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setMessage("End date cannot be before start date.");
            setAlertSeverity('warning');
            return;
        }

        setSubmitLoading(true);
        const fields = {
            user: currentUser._id,
            student,
            date,
            startDate,
            endDate,
            reason: reason.trim(),
            school: currentUser.school._id,
        };

        try {
            const result = await dispatch(addLeaveRequest(fields));
            if (result.success) {
                setMessage("Leave request submitted successfully!");
                setAlertSeverity('success');
                setOpenDialog(false);
                setStudent('');
                setStartDate('');
                setEndDate('');
                setReason('');
                setDate(new Date().toISOString().split('T')[0]);
                await dispatch(getLeaveRequestsByParent(currentUser._id));
            } else {
                setMessage(result.message || "Error submitting leave request.");
                setAlertSeverity('error');
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            setMessage("Error submitting leave request. Please try again.");
            setAlertSeverity('error');
        } finally {
            setSubmitLoading(false);
        }
    };

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
            headerName: 'Request #',
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
            field: 'student',
            headerName: 'Student',
            width: 150,
            renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {params.value.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Roll: {params.value.rollNum}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'dateRange',
            headerName: 'Leave Period',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                    <Typography variant="body2">
                        {new Date(params.row.startDate).toLocaleDateString()} - {new Date(params.row.endDate).toLocaleDateString()}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'reason',
            headerName: 'Reason',
            width: 200,
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
            field: 'approvedBy',
            headerName: 'Approved By',
            width: 150,
            renderCell: (params) => (
                tabValue === 1 && params.value ? ( // Only show for processed requests
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {params.value.name || 'N/A'}
                    </Typography>
                ) : null
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
                    color={
                        params.value === 'Approved' ? 'success' :
                        params.value === 'Rejected' ? 'error' : 'warning'
                    }
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
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {tabValue === 0 ? ( // Only show delete for pending requests
                        <IconButton
                            color="error"
                            onClick={() => handleDelete(params.row)}
                            title="Delete Request"
                        >
                            <DeleteIcon />
                        </IconButton>
                    ) : (
                        // Show view button for processed requests
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleView(params.row)}
                            sx={{ textTransform: 'none' }}
                        >
                            View Details
                        </Button>
                    )}
                </Box>
            ),
        },
    ];

    const currentRequests = tabValue === 0 ? userLeaveRequests.pending : userLeaveRequests.processed;

    const rows = currentRequests.map((request, index) => ({
        id: index + 1,
        date: request.date || new Date().toISOString(),
        student: request.student,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        status: request.status || 'Pending',
        _id: request._id,
        approvedBy: request.approvedBy,
        approvedDate: request.approvedDate,
        rejectionReason: request.rejectionReason
    }));

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleView = (row) => {
        setViewing(row);
        setOpenViewDialog(true);
    };

    const handleDelete = async (row) => {
        if (window.confirm('Are you sure you want to delete this leave request?')) {
            try {
                await dispatch(deleteLeaveRequest(row._id));
                setMessage('Leave request deleted successfully');
                setAlertSeverity('success');
                if (currentUser) {
                    await dispatch(getLeaveRequestsByParent(currentUser._id));
                }
            } catch (error) {
                console.error('Error deleting leave request:', error);
                setMessage('Failed to delete leave request. Please try again.');
                setAlertSeverity('error');
            }
        }
    };

    return (
        <Container maxWidth="lg">
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
                        Leave Requests
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Request Leave
                    </Button>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="parent leave request tabs">
                        <Tab label={`Pending Requests (${userLeaveRequests.pending.length})`} />
                        <Tab label={`Processed Requests (${userLeaveRequests.processed.length})`} />
                    </Tabs>
                </Box>

                {leaveLoading ? (
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
                                noRowsOverlay: () => (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Typography>No leave requests found</Typography>
                                    </Box>
                                )
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
                        />
                    </Box>
                )}

                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {tabValue === 0
                            ? `Pending Requests: ${currentRequests.length}`
                            : `Processed Requests: ${currentRequests.length} | Approved: ${currentRequests.filter(r => r.status === 'Approved').length} | Rejected: ${currentRequests.filter(r => r.status === 'Rejected').length}`
                        }
                    </Typography>
                </Box>
            </Box>

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
                    Request Leave
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Select Student</InputLabel>
                                    <Select
                                        value={student}
                                        onChange={(e) => setStudent(e.target.value)}
                                        label="Select Student"
                                    >
                                        {currentUser?.children?.map((child) => (
                                            <MenuItem key={child._id} value={child._id}>
                                                {child.name} (Roll: {child.rollNum})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Reason for Leave"
                                    multiline
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide detailed reason for the leave request..."
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
                            {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog
                open={!!viewing}
                onClose={() => setViewing(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: '1px solid #e0e0e0',
                        background: 'linear-gradient(to right, #1976d2, #2196f3)',
                        color: 'white',
                        py: 2
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Leave Request Details
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    {viewing && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Student</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {viewing.student?.name || 'N/A'} (Roll: {viewing.student?.rollNum || 'N/A'})
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Leave Period</Typography>
                                <Typography variant="body1">
                                    {new Date(viewing.startDate).toLocaleDateString()} - {new Date(viewing.endDate).toLocaleDateString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                <Chip
                                    label={viewing.status || 'Pending'}
                                    size="small"
                                    color={
                                        viewing.status === 'Approved' ? 'success' :
                                        viewing.status === 'Rejected' ? 'error' : 'warning'
                                    }
                                    variant="filled"
                                    sx={{ mt: 1 }}
                                />
                            </Grid>

                            {viewing.approvedBy && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Approved By</Typography>
                                    <Typography variant="body1">
                                        {viewing.approvedBy.name || 'N/A'}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        mt: 1,
                                        p: 2,
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            color: '#2c3e50',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {viewing.reason}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {viewing.status === 'Rejected' && viewing.rejectionReason && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Rejection Reason</Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            mt: 1,
                                            p: 2,
                                            backgroundColor: '#ffebee',
                                            border: '1px solid #ffcdd2',
                                            borderRadius: 1
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                whiteSpace: 'pre-wrap',
                                                color: '#c62828',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {viewing.rejectionReason}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Requested Date</Typography>
                                <Typography variant="body1">
                                    {new Date(viewing.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </Grid>

                            {viewing.approvedDate && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {viewing.status === 'Approved' ? 'Approved Date' : 'Rejected Date'}
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(viewing.approvedDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => setViewing(null)}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ParentLeaveRequest;
