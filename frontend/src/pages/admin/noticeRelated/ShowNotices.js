import React, { useEffect, useState } from 'react';
import Popup from '../../../components/Popup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { Paper, Box, Typography, Button, IconButton, CircularProgress, Grid, Chip, Tooltip } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Delete from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { API_BASE_URL } from '../../../config';
import { getAllNotices, deleteNotice } from '../../../redux/noticeRelated/noticeHandle';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';

const ShowNotices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    const [localNoticesList, setNoticesList] = useState(noticesList);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [viewing, setViewing] = useState(null);

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        setNoticesList(noticesList);
    }, [noticesList]);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        setConfirmOpen(false);
        if (deleteId) {
            setNoticesList((prevNotices) => prevNotices.filter((notice) => notice._id !== deleteId)); // update instantly
            dispatch(deleteNotice(deleteId, currentUser._id));
            setPopupMessage("Notice deleted successfully");
            setShowPopup(true);
            setDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setDeleteId(null);
    };

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
                    onClick={() => setViewing(params.row)}
                    sx={{ textTransform: 'none' }}
                >
                    View
                </Button>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => {
                return (
                    <IconButton
                        onClick={() => handleDeleteClick(params.row.originalId)}
                    >
                        <Delete color="error" />
                    </IconButton>
                );
            },
        },
    ];

    const rows = localNoticesList && localNoticesList.map((notice, index) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            id: index + 1,
            title: notice.title,
            details: notice.details,
            date: dateString,
            originalId: notice._id,
            fileType: notice.fileType || [],
            filePath: notice.filePath || [],
        };
    });

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<NoteAddIcon />}
                    onClick={() => navigate('/Admin/addnotice')}
                >
                    Add Notice
                </Button>
            </GridToolbarContainer>
        );
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
                    All Notices
                </Typography>
                {loading ?
                    <CircularProgress />
                    :
                    (Array.isArray(noticesList) && noticesList.length > 0 ?
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
                    :
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                        <Typography variant="h5" gutterBottom>
                            No notices found
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<NoteAddIcon />}
                            onClick={() => navigate('/Admin/addnotice')}
                        >
                            Add a Notice
                        </Button>
                    </Box>
                    )
                }
            </Paper>
            <Dialog
                open={confirmOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Delete Notice</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this notice?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
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
            <Popup message={popupMessage} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowNotices;