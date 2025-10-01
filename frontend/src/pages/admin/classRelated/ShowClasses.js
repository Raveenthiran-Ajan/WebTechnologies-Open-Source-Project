import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress, Menu, MenuItem, ListItemIcon } from '@mui/material';
import AddCardIcon from '@mui/icons-material/AddCard';
import Delete from '@mui/icons-material/Delete';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import Popup from '../../../components/Popup';

const ShowClasses = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [anchorEl, setAnchorEl] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch, refreshTrigger]);

    const deleteHandler = async (id, address) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this class? This will also delete all associated students, subjects, and data. This action cannot be undone.');
        
        if (confirmDelete) {
            try {
                console.log('Deleting class with ID:', id, 'Address:', address);
                await dispatch(deleteUser(id, address));
                console.log('Class deleted successfully, refreshing list...');
                
                setMessage('Class deleted successfully');
                setShowPopup(true);
                
                // Trigger a refresh of the classes list
                setRefreshTrigger(prev => prev + 1);
                
            } catch (error) {
                console.error('Delete error:', error);
                setMessage('Failed to delete class: ' + (error.message || 'Unknown error'));
                setShowPopup(true);
            }
        }
    }

    const handleMenuOpen = (event, id) => {
        setAnchorEl({ ...anchorEl, [id]: event.currentTarget });
    };

    const handleMenuClose = (id) => {
        setAnchorEl({ ...anchorEl, [id]: null });
    };

    const columns = [
        { field: 'name', headerName: 'Class Name', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 300,
            renderCell: (params) => {
                const isMenuOpen = Boolean(anchorEl[params.row.id]);
                return (
                    <Box>
                        <IconButton
                            onClick={() => deleteHandler(params.row.id, "Sclass")}
                        >
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="contained" sx={{ ml: 1, mr: 1 }}
                            onClick={() => navigate("/Admin/classes/class/" + params.row.id)}>
                            View
                        </Button>
                        <IconButton
                            onClick={(e) => handleMenuOpen(e, params.row.id)}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl[params.row.id]}
                            open={isMenuOpen}
                            onClose={() => handleMenuClose(params.row.id)}
                        >
                            <MenuItem onClick={() => {
                                navigate("/Admin/addsubject/" + params.row.id);
                                handleMenuClose(params.row.id);
                            }}>
                                <ListItemIcon><PostAddIcon /></ListItemIcon>
                                Add Subjects
                            </MenuItem>
                            <MenuItem onClick={() => {
                                navigate("/Admin/class/addstudents/" + params.row.id);
                                handleMenuClose(params.row.id);
                            }}>
                                <ListItemIcon><PersonAddAlt1Icon /></ListItemIcon>
                                Add Student
                            </MenuItem>
                        </Menu>
                    </Box>
                );
            },
        },
    ];

    // Sort classes by name
    const sortedClasses = sclassesList && Array.isArray(sclassesList)
        ? [...sclassesList].sort((a, b) => {
            const numA = parseInt(a.sclassName.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.sclassName.match(/\d+/)?.[0] || '0', 10);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.sclassName.localeCompare(b.sclassName);
        })
        : [];

    const rows = sortedClasses.map((sclass) => ({
        id: sclass._id,
        name: sclass.sclassName,
    }));

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<AddCardIcon />}
                    onClick={() => navigate('/Admin/addclass')}
                >
                    Add Class
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
                All Classes
            </Typography>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(sortedClasses) && sortedClasses.length > 0 ?
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows || []} columns={columns} components={{ Toolbar: CustomToolbar }} />
                </Box>
                :
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                    <Typography variant="h5" gutterBottom>
                        No classes found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCardIcon />}
                        onClick={() => navigate('/Admin/addclass')}
                    >
                        Add a Class
                    </Button>
                </Box>
                )
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowClasses;