import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Box,
    Chip,
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
    TextField,
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getLeaveRequestsByTeacher, updateLeaveRequest } from '../../redux/leaveRequestRelated/leaveRequestHandle';

const TeacherLeaveRequests = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { leaveRequestsList, loading: leaveLoading } = useSelector((state) => state.leaveRequest);

    const [viewing, setViewing] = useState(null);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0); // 0 for pending, 1 for processed

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            if (!currentUser?._id) return;

            try {
                await dispatch(getLeaveRequestsByTeacher(currentUser._id));
            } catch (error) {
                console.error('Error fetching leave requests:', error);
                setMessage("Error loading leave requests. Please refresh the page.");
                setAlertSeverity('error');
            }
        };
        fetchLeaveRequests();
    }, [dispatch, currentUser?._id]);

    const teacherLeaveRequests = React.useMemo(() => {
        if (!leaveRequestsList || typeof leaveRequestsList !== 'object') {
            return { pending: [], processed: [] };
        }
        return {
            pending: Array.isArray(leaveRequestsList.pending) ? leaveRequestsList.pending : [],
            processed: Array.isArray(leaveRequestsList.processed) ? leaveRequestsList.processed : []
        };
    }, [leaveRequestsList]);

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
                        {params.value?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Roll: {params.value?.rollNum || 'N/A'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'parent',
            headerName: 'Parent',
            width: 150,
            renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {params.value?.name || 'N/A'}
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
            field: 'date',
            headerName: 'Requested Date',
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
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleView(params.row)}
                        title="View Details"
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {params.row.status === 'Pending' ? (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleAction(params.row, 'approve')}
                                sx={{ minWidth: 'auto', px: 1 }}
                            >
                                <CheckCircleIcon fontSize="small" />
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleAction(params.row, 'reject')}
                                sx={{ minWidth: 'auto', px: 1 }}
                            >
                                <CancelIcon fontSize="small" />
                            </Button>
                        </>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {params.row.status === 'Approved' ? 'Approved' : 'Rejected'}
                        </Typography>
                    )}
                </Box>
            ),
        },
    ];

    const currentRequests = tabValue === 0 ? teacherLeaveRequests.pending : teacherLeaveRequests.processed;

    const rows = currentRequests.map((request, index) => ({
        id: index + 1,
        date: request.date || new Date().toISOString(),
        student: request.student,
        parent: request.user,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        status: request.status,
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
    };

    const handleAction = (request, action) => {
        setSelectedRequest(request);
        setActionType(action);
        setRejectionReason('');
        setOpenActionDialog(true);
    };

    const handleActionSubmit = async () => {
        if (!selectedRequest) return;

        setSubmitLoading(true);
        try {
            const updateData = {
                status: actionType === 'approve' ? 'Approved' : 'Rejected',
                approvedBy: currentUser._id,
                rejectionReason: actionType === 'reject' ? rejectionReason.trim() : null
            };

            const result = await dispatch(updateLeaveRequest(selectedRequest._id, updateData));
            if (result.success) {
                setMessage(`Leave request ${actionType}d successfully!`);
                setAlertSeverity('success');
                setOpenActionDialog(false);
                await dispatch(getLeaveRequestsByTeacher(currentUser._id));
            } else {
                setMessage(result.message || `Error ${actionType}ing leave request.`);
                setAlertSeverity('error');
            }
        } catch (error) {
            console.error(`Error ${actionType}ing leave request:`, error);
            setMessage(`Error ${actionType}ing leave request. Please try again.`);
            setAlertSeverity('error');
        } finally {
            setSubmitLoading(false);
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
                        Leave Requests Management
                    </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="leave request tabs">
                        <Tab label={`Pending Requests (${teacherLeaveRequests.pending.length})`} />
                        <Tab label={`Processed Requests (${teacherLeaveRequests.processed.length})`} />
                    </Tabs>
                </Box>

                {leaveLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: '100%' }}>
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
                                        <Typography>No pending leave requests found</Typography>
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
                                <Typography variant="subtitle2" color="textSecondary">Parent</Typography>
                                <Typography variant="body1">
                                    {viewing.parent?.name || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Leave Period</Typography>
                                <Typography variant="body1">
                                    {new Date(viewing.startDate).toLocaleDateString()} - {new Date(viewing.endDate).toLocaleDateString()}
                                </Typography>
                            </Grid>

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
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setViewing(null)}
                    >
                        Close
                    </Button>
                    {viewing && viewing.status === 'Pending' && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    setViewing(null);
                                    handleAction(viewing, 'approve');
                                }}
                                sx={{ mr: 1 }}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    setViewing(null);
                                    handleAction(viewing, 'reject');
                                }}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Action Dialog */}
            <Dialog
                open={openActionDialog}
                onClose={() => setOpenActionDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    bgcolor: actionType === 'approve' ? 'success.main' : 'error.main',
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedRequest && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    {actionType === 'approve' ? 'Are you sure you want to approve this leave request?' : 'Please provide a reason for rejection:'}
                                </Typography>
                            </Grid>
                            {actionType === 'reject' && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Rejection Reason"
                                        multiline
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide detailed reason for rejection..."
                                        required
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Student: {selectedRequest.student?.name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Period: {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setOpenActionDialog(false)}
                        sx={{ mr: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleActionSubmit}
                        variant="contained"
                        color={actionType === 'approve' ? 'success' : 'error'}
                        disabled={submitLoading || (actionType === 'reject' && !rejectionReason.trim())}
                    >
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> :
                         actionType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherLeaveRequests;