import React, { useEffect, useState } from 'react';
import Popup from '../../../components/Popup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { Paper, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Delete from '@mui/icons-material/Delete';
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
        { field: 'title', headerName: 'Notice Title', width: 250 },
        { field: 'details', headerName: 'Details', width: 350 },
        { field: 'date', headerName: 'Date', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => {
                return (
                    <IconButton
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        <Delete color="error" />
                    </IconButton>
                );
            },
        },
    ];

    const rows = localNoticesList && localNoticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            id: notice._id,
            title: notice.title,
            details: notice.details,
            date: dateString,
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
            <Popup message={popupMessage} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowNotices;