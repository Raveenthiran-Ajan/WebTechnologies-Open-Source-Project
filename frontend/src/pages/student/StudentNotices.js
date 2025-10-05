import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Box,
    Button,
    IconButton,
    CircularProgress,
    Grid,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Card,
    CardContent,
    CardActions,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { API_BASE_URL } from '../../config';
import { getAllNotices, markNoticeAsRead } from '../../redux/noticeRelated/noticeHandle';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';

const StudentNotices = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const [viewing, setViewing] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [cardFilter, setCardFilter] = useState('all'); // 'all', 'unread', 'read'

    useEffect(() => {
        if (currentUser && currentUser.school) {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, currentUser]);

    const columns = [
        {
            field: 'id',
            headerName: 'Notice #',
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
        { field: 'title', headerName: 'Title', width: 250 },
        { field: 'date', headerName: 'Date', width: 150 },
        { 
            field: 'details', 
            headerName: 'Details', 
            width: 350,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={async () => {
                        // Mark notice as read
                        if (!params.row.readBy || !params.row.readBy.includes(currentUser?._id)) {
                            try {
                                await dispatch(markNoticeAsRead(params.row._id, currentUser._id));
                            } catch (error) {
                                console.error('Failed to mark notice as read:', error);
                            }
                        }
                        // Open the view dialog
                        setViewing(params.row);
                    }}
                    sx={{ textTransform: 'none' }}
                >
                    View
                </Button>
            ),
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                // Find the current notice from Redux store to get latest readBy status
                const currentNotice = noticesList?.find(n => n._id === params.row._id);
                const isRead = currentNotice?.readBy && currentNotice.readBy.includes(currentUser?._id);
                return (
                    <Chip
                        label={isRead ? "Read" : "Unread"}
                        size="small"
                        color={isRead ? "success" : "warning"}
                        variant={isRead ? "outlined" : "filled"}
                    />
                );
            },
        },
    ];

    const rows = useMemo(() => {
        return noticesList && noticesList.map((notice, index) => {
            const date = new Date(notice.date);
            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
            return {
                id: index + 1,
                _id: notice._id, // Add the notice ID for lookup
                title: notice.title,
                details: notice.details,
                date: dateString,
                fileType: notice.fileType || [],
                filePath: notice.filePath || [],
                readBy: notice.readBy || [],
            };
        });
    }, [noticesList]);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
            </GridToolbarContainer>
        );
    }

    const renderCardView = () => {
        // Filter notices based on read status
        const filteredNotices = noticesList && noticesList.filter(notice => {
            if (cardFilter === 'all') return true;
            if (cardFilter === 'unread') return !notice.readBy || !notice.readBy.includes(currentUser?._id);
            if (cardFilter === 'read') return notice.readBy && notice.readBy.includes(currentUser?._id);
            return true;
        });

        return (
            <Box sx={{ p: 2 }}>
                {/* Filter Toggle Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <ToggleButtonGroup
                        value={cardFilter}
                        exclusive
                        onChange={(event, newFilter) => {
                            if (newFilter !== null) {
                                setCardFilter(newFilter);
                            }
                        }}
                        aria-label="notice filter"
                    >
                        <ToggleButton value="all" aria-label="all notices">
                            All
                        </ToggleButton>
                        <ToggleButton value="unread" aria-label="unread notices">
                            Unread
                        </ToggleButton>
                        <ToggleButton value="read" aria-label="read notices">
                            Read
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Grid container spacing={3}>
                    {filteredNotices && filteredNotices.map((notice, index) => {
                    const date = new Date(notice.date);
                    const dateString = date.toString() !== "Invalid Date" ? date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : "Invalid Date";
                    
                    return (
                        <Grid item xs={12} sm={6} md={4} key={notice._id}>
                            <Card sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                }
                            }}>
                                <Box sx={{
                                    background: '#2196f3',
                                    color: 'white',
                                    p: 3
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <NotificationsIcon sx={{ fontSize: 30 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                {notice.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    {dateString}
                                                </Typography>
                                                {(!notice.readBy || !notice.readBy.includes(currentUser?._id)) && (
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: 'error.main',
                                                            ml: 1
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                        {(!notice.readBy || !notice.readBy.includes(currentUser?._id)) && (
                                            <Chip 
                                                label="New" 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: 'error.main', 
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
                                        {notice.details.length > 150 
                                            ? `${notice.details.substring(0, 150)}...` 
                                            : notice.details
                                        }
                                    </Typography>
                                    
                                    {notice.filePath && notice.filePath.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="textSecondary">
                                                {notice.filePath.length} attachment{notice.filePath.length > 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                                
                                <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<VisibilityIcon />}
                                        onClick={async () => {
                                            // Mark notice as read
                                            if (!notice.readBy || !notice.readBy.includes(currentUser?._id)) {
                                                try {
                                                    await dispatch(markNoticeAsRead(notice._id, currentUser._id));
                                                } catch (error) {
                                                    console.error('Failed to mark notice as read:', error);
                                                }
                                            }
                                            // Open the view dialog
                                            setViewing({
                                                ...notice,
                                                date: dateString
                                            });
                                        }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Loading notices...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        School Notices
                    </Typography>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(event, newView) => {
                            if (newView !== null) {
                                setViewMode(newView);
                            }
                        }}
                        aria-label="view mode"
                        size="small"
                    >
                        <ToggleButton value="table" aria-label="table view">
                            <ViewListIcon />
                        </ToggleButton>
                        <ToggleButton value="card" aria-label="card view">
                            <ViewModuleIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                
                {Array.isArray(noticesList) && noticesList.length > 0 ? (
                    viewMode === 'table' ? (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid 
                                    rows={rows || []} 
                                    columns={columns} 
                                    slots={{ 
                                        toolbar: CustomToolbar 
                                    }}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25]}
                                    disableRowSelectionOnClick
                                />
                            </Box>
                        </Paper>
                    ) : (
                        renderCardView()
                    )
                ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6">No notices available at this time.</Typography>
                    </Paper>
                )}
            </Container>

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
                        Notice Details
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    {viewing && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    {viewing.date}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Title</Typography>
                                <Typography variant="body1" sx={{ mt: 1, fontWeight: 500, color: '#1976d2' }}>
                                    {viewing.title}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Details</Typography>
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
                                    <div 
                                        style={{ 
                                            color: '#2c3e50',
                                            lineHeight: 1.6,
                                            whiteSpace: 'pre-wrap'
                                        }}
                                        dangerouslySetInnerHTML={{ 
                                          __html: viewing.details
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                            .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
                                            .replace(/^- (.*)$/gm, '• $1')
                                            .replace(/^(\d+)\. (.*)$/gm, '$1. $2')
                                            .replace(/\n/g, '<br>')
                                        }}
                                    />
                                </Paper>
                            </Grid>

                            {viewing.filePath && viewing.filePath.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Attachments</Typography>
                                    {viewing.filePath.map((path, index) => (
                                        <Paper 
                                            key={index}
                                            elevation={0}
                                            sx={{
                                                mt: 1,
                                                p: 2,
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 1
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {viewing.fileType[index] ? viewing.fileType[index].toUpperCase() : 'FILE'}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary">
                                                        {path.split(/[/\\]/).pop()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Preview">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => window.open(`${API_BASE_URL}/${path}`, '_blank')}
                                                        >
                                                            <OpenInNewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            size="small"
                                                            component="a"
                                                            href={`${API_BASE_URL}/download/notice/${path.split(/[/\\]/).pop()}`}
                                                            download
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
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
        </>
    );
};
export default StudentNotices;