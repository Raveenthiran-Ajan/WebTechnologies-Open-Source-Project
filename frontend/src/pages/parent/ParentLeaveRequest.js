import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
    FormControlLabel,
    Checkbox,
    Input,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PreviewIcon from '@mui/icons-material/Preview';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
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

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const ParentLeaveRequest = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { leaveRequestsList, loading: leaveLoading } = useSelector((state) => state.leaveRequest);
    const { t } = useTranslation();

    const [openDialog, setOpenDialog] = useState(false);
    const [student, setStudent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [viewing, setViewing] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const today = new Date().toISOString().split('T')[0];
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [tabValue, setTabValue] = useState(0); // 0 for pending, 1 for processed
    const [isEmergency, setIsEmergency] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, request: null });

    const canPreview = (mimeType) => {
        return mimeType.startsWith('image/') || mimeType === 'application/pdf';
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) return <ImageIcon />;
        if (mimeType === 'application/pdf') return <PictureAsPdfIcon />;
        return <AttachFileIcon />;
    };

    const getFileType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'Image';
        if (mimeType === 'application/pdf') return 'PDF Document';
        if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Word Document';
        if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'Excel Document';
        return 'Document';
    };

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            if (!currentUser?._id) return;

            try {
                await dispatch(getLeaveRequestsByParent(currentUser._id));
            } catch (error) {
                console.error('Error fetching leave requests:', error);
                setMessage("Error loading leave requests. Please refresh the page.");
                setAlertSeverity('error');
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
            setMessage(t('parentLeaveRequest.fillRequiredFields'));
            setAlertSeverity('warning');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison

        // Only validate past dates if not an emergency
        if (!isEmergency) {
            if (new Date(startDate) < today) {
                setMessage(t('parentLeaveRequest.startDatePastError'));
                setAlertSeverity('warning');
                return;
            }

            if (new Date(endDate) < today) {
                setMessage(t('parentLeaveRequest.endDatePastError'));
                setAlertSeverity('warning');
                return;
            }
        }

        if (new Date(startDate) > new Date(endDate)) {
            setMessage(t('parentLeaveRequest.endDateBeforeStartError'));
            setAlertSeverity('warning');
            return;
        }

        setSubmitLoading(true);
        const formData = new FormData();
        formData.append('user', currentUser._id);
        formData.append('student', student);
        formData.append('date', date);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('reason', reason.trim());
        formData.append('school', currentUser.school._id);
        formData.append('isEmergency', isEmergency);

        // Add attachments
        attachments.forEach((file, index) => {
            formData.append('attachments', file);
        });

        try {
            const result = await dispatch(addLeaveRequest(formData));
            if (result.success) {
                setMessage("Leave request submitted successfully!");
                setAlertSeverity('success');
                setOpenDialog(false);
                setStudent('');
                setStartDate('');
                setEndDate('');
                setReason('');
                setDate(new Date().toISOString().split('T')[0]);
                setIsEmergency(false);
                setAttachments([]);
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
            headerName: t('parentLeaveRequest.requestNumber'),
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
            headerName: t('parentLeaveRequest.student'),
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
            headerName: t('parentLeaveRequest.leavePeriod'),
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
            headerName: t('parentLeaveRequest.reason'),
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
            headerName: t('parentLeaveRequest.processedBy'),
            width: 150,
            renderCell: (params) => (
                tabValue === 1 && params.value ? ( // Only show for processed requests
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {params.value.name || 'N/A'}
                    </Typography>
                ) : tabValue === 0 ? ( // Show "Not yet" for pending requests
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {t('parentLeaveRequest.notYet')}
                    </Typography>
                ) : null
            ),
        },
        {
            field: 'status',
            headerName: t('parentLeaveRequest.status'),
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
            headerName: t('parentLeaveRequest.actions'),
            width: 200,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(params.row)}
                        sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
                    >
                        {t('parentLeaveRequest.viewDetails')}
                    </Button>
                    {tabValue === 0 && ( // Only show delete for pending requests
                        <IconButton
                            color="error"
                            onClick={() => handleDelete(params.row)}
                            title="Delete Request"
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
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
        rejectionReason: request.rejectionReason,
        isEmergency: request.isEmergency
    }));

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleView = (row) => {
        setViewing(row);
    };

    const handleDelete = (row) => {
        setDeleteDialog({ open: true, request: row });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.request) return;

        try {
            await dispatch(deleteLeaveRequest(deleteDialog.request._id));
            setMessage('Leave request deleted successfully');
            setAlertSeverity('success');
            setDeleteDialog({ open: false, request: null });
            if (currentUser) {
                await dispatch(getLeaveRequestsByParent(currentUser._id));
            }
        } catch (error) {
            console.error('Error deleting leave request:', error);
            setMessage('Failed to delete leave request. Please try again.');
            setAlertSeverity('error');
            setDeleteDialog({ open: false, request: null });
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
                        {t('parentLeaveRequest.title')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        {t('parentLeaveRequest.requestLeave')}
                    </Button>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="parent leave request tabs">
                        <Tab label={`${t('parentLeaveRequest.pendingRequests')} (${userLeaveRequests.pending.length})`} />
                        <Tab label={`${t('parentLeaveRequest.processedRequests')} (${userLeaveRequests.processed.length})`} />
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
                                        <Typography>{t('parentLeaveRequest.noLeaveRequests')}</Typography>
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
                            ? t('parentLeaveRequest.summaryPending', { count: currentRequests.length })
                            : t('parentLeaveRequest.summaryProcessed', {
                                count: currentRequests.length,
                                approved: currentRequests.filter(r => r.status === 'Approved').length,
                                rejected: currentRequests.filter(r => r.status === 'Rejected').length
                            })
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
                    {t('parentLeaveRequest.requestLeaveDialog')}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>{t('parentLeaveRequest.selectStudent')}</InputLabel>
                                    <Select
                                        value={student}
                                        onChange={(e) => setStudent(e.target.value)}
                                        label={t('parentLeaveRequest.selectStudent')}
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
                                    label={t('parentLeaveRequest.startDate')}
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        min: isEmergency ? undefined : today
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('parentLeaveRequest.endDate')}
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        min: isEmergency ? undefined : today
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isEmergency}
                                            onChange={(e) => setIsEmergency(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={t('parentLeaveRequest.emergencyLeave')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t('parentLeaveRequest.reasonForLeave')}
                                    multiline
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide detailed reason for the leave request..."
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    {t('parentLeaveRequest.attachEvidence')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ alignSelf: 'flex-start' }}
                                    >
                                        {t('parentLeaveRequest.chooseFiles')}
                                        <Input
                                            type="file"
                                            multiple
                                            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                setAttachments(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
                                            }}
                                            sx={{ display: 'none' }}
                                        />
                                    </Button>
                                    {attachments.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {attachments.map((file, index) => (
                                                <Chip
                                                    key={index}
                                                    label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                                                    onDelete={() => {
                                                        setAttachments(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    icon={<AttachFileIcon />}
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        Maximum 5 files, 10MB each. Supported: Images, PDFs, Documents
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setOpenDialog(false)}
                            sx={{ mr: 1 }}
                        >
                            {t('parentLeaveRequest.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitLoading}
                        >
                            {submitLoading ? <CircularProgress size={24} color="inherit" /> : t('parentLeaveRequest.submitRequest')}
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
                        {t('parentLeaveRequest.leaveRequestDetails')}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    {viewing && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentLeaveRequest.student')}</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {viewing.student?.name || 'N/A'} (Roll: {viewing.student?.rollNum || 'N/A'})
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentLeaveRequest.leavePeriod')}</Typography>
                                <Typography variant="body1">
                                    {new Date(viewing.startDate).toLocaleDateString()} - {new Date(viewing.endDate).toLocaleDateString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                                    <Chip
                                        label={viewing.status || 'Pending'}
                                        size="small"
                                        color={
                                            viewing.status === 'Approved' ? 'success' :
                                            viewing.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                        variant="filled"
                                    />
                                    {viewing.isEmergency && (
                                        <Chip
                                            label="Emergency"
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </Grid>

                            {viewing.approvedBy && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {viewing.status === 'Approved' ? t('parentLeaveRequest.approvedBy') : t('parentLeaveRequest.rejectedBy')}
                                    </Typography>
                                    <Typography variant="body1">
                                        {viewing.approvedBy.name || 'N/A'}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentLeaveRequest.reason')}</Typography>
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
                                    <Typography variant="subtitle2" color="textSecondary">{t('parentLeaveRequest.rejectionReason')}</Typography>
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

                            {viewing.attachments && viewing.attachments.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Attachments</Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {viewing.attachments.map((attachment, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                                {getFileIcon(attachment.mimeType)}
                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                    {getFileType(attachment.mimeType)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {canPreview(attachment.mimeType) && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<PreviewIcon />}
                                                            onClick={() => {
                                                                setPreviewFile(attachment);
                                                                setOpenPreview(true);
                                                            }}
                                                            sx={{ minWidth: 'auto', fontSize: '0.75rem', py: 0.5 }}
                                                        >
                                                            Preview
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<AttachFileIcon />}
                                                        component="a"
                                                        href={`${REACT_APP_BASE_URL}/download/leave-request/${attachment.filename}`}
                                                        target="_blank"
                                                        sx={{ minWidth: 'auto', fontSize: '0.75rem', py: 0.5 }}
                                                    >
                                                        Download
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentLeaveRequest.requestedDate')}</Typography>
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
                                        {viewing.status === 'Approved' ? t('parentLeaveRequest.approvedDate') : t('parentLeaveRequest.rejectedDate')}
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
                        {t('parentLeaveRequest.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, request: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {t('parentLeaveRequest.confirmDelete')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('parentLeaveRequest.confirmDeleteMessage')}
                    </Typography>
                    {deleteDialog.request && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t('parentLeaveRequest.studentLabel')} {deleteDialog.request.student?.name}
                            </Typography>
                            <Typography variant="body2">
                                {t('parentLeaveRequest.periodLabel')} {new Date(deleteDialog.request.startDate).toLocaleDateString()} - {new Date(deleteDialog.request.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                                {t('parentLeaveRequest.reasonLabel')} {deleteDialog.request.reason}
                            </Typography>
                        </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {t('parentLeaveRequest.cannotUndo')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, request: null })}
                        sx={{ mr: 1 }}
                    >
                        {t('parentLeaveRequest.cancel')}
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                    >
                        {t('parentLeaveRequest.delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Document Preview Dialog */}
            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { height: '80vh' }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {previewFile && getFileIcon(previewFile.mimeType)}
                        {previewFile?.originalName}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {previewFile && (
                        <Box sx={{ width: '100%', height: '100%', minHeight: '400px' }}>
                            {previewFile.mimeType.startsWith('image/') ? (
                                <img
                                    src={`${REACT_APP_BASE_URL}/preview/leave-request/${previewFile.filename}`}
                                    alt={previewFile.originalName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : previewFile.mimeType === 'application/pdf' ? (
                                <iframe
                                    src={`${REACT_APP_BASE_URL}/preview/leave-request/${previewFile.filename}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    title={previewFile.originalName}
                                />
                            ) : null}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        component="a"
                        href={`${REACT_APP_BASE_URL}/download/leave-request/${previewFile?.filename}`}
                        target="_blank"
                        variant="contained"
                    >
                        {t('parentLeaveRequest.download')}
                    </Button>
                    <Button onClick={() => setOpenPreview(false)}>
                        {t('parentLeaveRequest.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ParentLeaveRequest;
