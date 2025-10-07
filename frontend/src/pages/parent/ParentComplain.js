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
    Fab,
    Grid,
    IconButton,
    Paper,
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { addComplaint, deleteComplaint } from '../../redux/complainRelated/complainHandle';
import { getAllComplains } from '../../redux/complainRelated/complainHandle';

const ParentComplaints = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentUser, status, error: userError } = useSelector((state) => state.user);
    const { complainsList, loading: complainLoading, error: complainError } = useSelector((state) => state.complain);
    const [loading, setLoading] = useState(false);
    
    const [openDialog, setOpenDialog] = useState(false);
    const [complaint, setComplaint] = useState('');
    const [title, setTitle] = useState('');
    const [viewing, setViewing] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [openViewDialog, setOpenViewDialog] = useState(false);

    useEffect(() => {
        const fetchComplaints = async () => {
            if (!currentUser?.school?._id) return;
            
            try {
                setLoading(true);
                await dispatch(getAllComplains(currentUser.school._id, "Complain"));
            } catch (error) {
                console.error('Error fetching complaints:', error);
                setMessage(t('parentComplain.errorLoading'));
                setAlertSeverity('error');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, [dispatch, currentUser?.school?._id]);

    const userComplaints = React.useMemo(() => {
        if (!Array.isArray(complainsList) || !currentUser) {
            return [];
        }
        return complainsList.filter(complain => {
            if (!complain || !complain.user) return false;
            const complainUserId = typeof complain.user === 'object' 
                ? complain.user._id 
                : complain.user;
            return complainUserId === currentUser._id;
        });
    }, [complainsList, currentUser]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!complaint.trim() || !title.trim()) {
            setMessage(t('parentComplain.missingFields'));
            setAlertSeverity('warning');
            return;
        }

        setSubmitLoading(true);
        const fields = {
            user: currentUser._id,
            userType: 'parent',
            date,
            title: title.trim(),
            description: complaint.trim(),
            complaint: complaint.trim(),
            school: currentUser.school._id,
        };

        try {
            const result = await dispatch(addComplaint(fields));
            if (result.success) {
                setMessage(t('parentComplain.submitted'));
                setAlertSeverity('success');
                setOpenDialog(false);
                setComplaint('');
                setTitle('');
                setDate(new Date().toISOString().split('T')[0]);
                await dispatch(getAllComplains(currentUser.school._id, "Complain"));
            } else {
                setMessage(result.message || t('parentComplain.submitError'));
                setAlertSeverity('error');
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            setMessage(t('parentComplain.submitErrorRetry'));
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
            headerName: t('parentComplain.complaintNumber'),
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
            headerName: t('parentComplain.dateSubmitted'),
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
            field: 'title',
            headerName: t('parentComplain.complaintTitle'),
            width: 250,
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
            field: 'description',
            headerName: t('parentComplain.description'),
            width: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(params.row)}
                    sx={{ textTransform: 'none' }}
                >
                    {t('parentComplain.view')}
                </Button>
            ),
        },
        {
            field: 'status',
            headerName: t('parentComplain.status'),
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value || t('parentComplain.pending')}
                    size="small"
                    color={params.value === 'Actioned' ? 'success' : 'warning'}
                    variant="filled"
                />
            ),
        },
        {
            field: 'actions',
            headerName: t('parentComplain.actions'),
            width: 100,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    color="error"
                    onClick={() => handleDelete(params.row)}
                >
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];

    const rows = userComplaints.map((complain, index) => ({
        id: index + 1,
        date: complain.date || new Date().toISOString(),
        title: complain.title || complain.complaint || t('parentComplain.noTitle'),
        description: complain.description || complain.complaint || '',
        complaint: complain.complaint,
        status: complain.status || 'Pending',
        _id: complain._id,
        actionedDate: complain.actionedDate
    }));

    const handleView = (row) => {
        setViewing(row);
        setOpenViewDialog(true);
    };

    const handleDelete = async (row) => {
        if (window.confirm(t('parentComplain.confirmDelete'))) {
            try {
                await dispatch(deleteComplaint(row._id));
                setMessage(t('parentComplain.deleted'));
                setAlertSeverity('success');
                if (currentUser && currentUser.school) {
                    await dispatch(getAllComplains(currentUser.school._id, "Complain"));
                }
            } catch (error) {
                console.error('Error deleting complaint:', error);
                setMessage(t('parentComplain.deleteFailed'));
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
                        {t('parentComplain.title')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        {t('parentComplain.addComplaint')}
                    </Button>
                </Box>

                {complainLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ height: 400, width: '100%' }}>
                        {complainLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : complainError ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Error loading complaints: {complainError}
                            </Alert>
                        ) : (
                            <>
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
                                                <Typography>{t('parentComplain.noComplaints')}</Typography>
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
                            </>
                        )}
                    </Box>
                )}

                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {t('parentComplain.totalComplaints')}: {userComplaints.length} |
                        {t('parentComplain.pending')}: {userComplaints.filter(c => c.status !== 'Actioned').length} |
                        {t('parentComplain.resolved')}: {userComplaints.filter(c => c.status === 'Actioned').length}
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
                    {t('parentComplain.submitDialogTitle')}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t('parentComplain.date')}
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
                                    label={t('parentComplain.complaintTitleLabel')}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('parentComplain.titlePlaceholder')}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t('parentComplain.descriptionLabel')}
                                    multiline
                                    rows={4}
                                    value={complaint}
                                    onChange={(e) => setComplaint(e.target.value)}
                                    placeholder={t('parentComplain.descriptionPlaceholder')}
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
                            {t('parentComplain.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitLoading}
                        >
                            {submitLoading ? <CircularProgress size={24} color="inherit" /> : t('parentComplain.submitComplaint')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ReportProblemIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Complaint #{viewing?.id}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    {viewing && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary">{t('parentComplain.statusLabel')}</Typography>
                                    <Chip
                                        label={viewing.status || 'Pending'}
                                        size="small"
                                        color={viewing.status === 'Actioned' ? 'success' : 'warning'}
                                        variant="filled"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentComplain.dateSubmittedLabel')}</Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    {new Date(viewing.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentComplain.titleLabel')}</Typography>
                                <Typography variant="body1" sx={{ mt: 1, fontWeight: 500, color: '#1976d2' }}>
                                    {viewing.title}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">{t('parentComplain.description')}</Typography>
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
                                        {viewing.description || viewing.complaint}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {viewing.actionedDate && (
                                <Grid item xs={12}>
                                    <Box sx={{ 
                                        mt: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'success.main'
                                    }}>
                                        <CheckCircleIcon fontSize="small" />
                                        <Typography variant="body2">
                                            {t('parentComplain.resolvedOn', { date: new Date(viewing.actionedDate).toLocaleDateString() })}
                                        </Typography>
                                    </Box>
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
                        {t('parentComplain.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ParentComplaints;