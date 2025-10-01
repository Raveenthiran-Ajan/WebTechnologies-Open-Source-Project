import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { Paper, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Delete from '@mui/icons-material/Delete';
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
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

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (id, address) => {
        dispatch(deleteUser(id, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            })
    }

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
                        onClick={() => deleteHandler(params.row.id, "Notice")}
                    >
                        <Delete color="error" />
                    </IconButton>
                );
            },
        },
    ];

    const rows = noticesList && noticesList.map((notice) => {
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
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
                All Notices
            </Typography>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(noticesList) && noticesList.length > 0 ?
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows || []} columns={columns} components={{ Toolbar: CustomToolbar }} />
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
    );
};

export default ShowNotices;