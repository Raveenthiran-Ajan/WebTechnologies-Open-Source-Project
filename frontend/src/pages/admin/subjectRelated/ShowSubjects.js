import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import Delete from '@mui/icons-material/Delete';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import Popup from '../../../components/Popup';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        id: null,
        address: null,
        itemName: ""
    });

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (id, address, itemName) => {
        setDeleteDialog({
            open: true,
            id,
            address,
            itemName
        });
    };

    const confirmDelete = () => {
        const { id, address } = deleteDialog;
        dispatch(deleteUser(id, address))
            .then(() => {
                dispatch(getSubjectList(currentUser._id, "AllSubjects"));
                setMessage("Subject deleted successfully");
                setShowPopup(true);
                setDeleteDialog({ open: false, id: null, address: null, itemName: "" });
            })
            .catch((error) => {
                setMessage("Failed to delete subject");
                setShowPopup(true);
            });
    };

    const cancelDelete = () => {
        setDeleteDialog({ open: false, id: null, address: null, itemName: "" });
    };

    const columns = [
        { field: 'subName', headerName: 'Subject Name', width: 200 },
        { field: 'subCode', headerName: 'Subject Code', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton
                            onClick={() => deleteHandler(params.row.id, "Subject", params.row.subName)}
                        >
                            <Delete color="error" />
                        </IconButton>
                    </Box>
                );
            },
        },
    ];

    const rows = Array.isArray(subjectsList) ? subjectsList.map((subject) => ({
        id: subject._id,
        subName: subject.subName,
        subCode: subject.subCode,
        periodsPerWeek: subject.periodsPerWeek,
    })) : [];

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<PostAddIcon />}
                    onClick={() => navigate('/Admin/addsubject')}
                >
                    Add Subject
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
                All Subjects
            </Typography>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(subjectsList) && subjectsList.length > 0 ?
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows || []} columns={columns} components={{ Toolbar: CustomToolbar }} />
                </Box>
                :
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                    <Typography variant="h5" gutterBottom>
                        No subjects found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<PostAddIcon />}
                        onClick={() => navigate('/Admin/addsubject')}
                    >
                        Add Subject
                    </Button>
                </Box>
                )
            }
            <DeleteConfirmDialog
                open={deleteDialog.open}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                itemName={deleteDialog.itemName}
                loading={false}
            />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowSubjects;