import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllParents, deleteParent } from '../../../redux/parentRelated/parentHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress, Select, MenuItem } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Delete from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';

const ShowParents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { parentsList, loading } = useSelector((state) => state.parent);
    const { currentUser } = useSelector(state => state.user);
    const [selectedChild, setSelectedChild] = useState({});

    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getAllParents(adminID));
    }, [adminID, dispatch]);

    const handleChildChange = (parentId, childIndex) => {
        setSelectedChild(prev => ({
            ...prev,
            [parentId]: childIndex,
        }));
    };

    const deleteHandler = (id, address) => {
        dispatch(deleteParent(id, address))
            .then(() => {
                dispatch(getAllParents(adminID));
            })
    }

    const columns = [
        { field: 'name', headerName: 'Parent Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        {
            field: 'childName',
            headerName: 'Child Name',
            width: 250,
            renderCell: (params) => {
                const parentId = params.row.id;
                const children = params.row.children;
                const selectedChildIndex = selectedChild[parentId] || 0;

                if (children.length > 1) {
                    return (
                        <Select
                            value={selectedChildIndex}
                            onChange={(e) => handleChildChange(parentId, e.target.value)}
                            variant="standard"
                            sx={{ width: '100%' }}
                        >
                            {children.map((child, index) => (
                                <MenuItem key={child._id} value={index}>
                                    {child.name}
                                </MenuItem>
                            ))}
                        </Select>
                    );
                }
                return children[0]?.name || 'N/A';
            },
        },
        {
            field: 'childRollNum',
            headerName: 'Roll No.',
            width: 150,
            valueGetter: (params) => params.row.children[selectedChild[params.row.id] || 0]?.rollNum || 'N/A',
        },
        {
            field: 'childClass',
            headerName: 'Class',
            width: 150,
            valueGetter: (params) => params.row.children[selectedChild[params.row.id] || 0]?.sclassName?.sclassName || 'N/A',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton
                            variant="outlined"
                            onClick={() => deleteHandler(params.row.id, "Parent")}
                        >
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate("/Admin/parents/view/" + params.row.id)}>
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const rows = parentsList && parentsList.map((parent) => ({
        id: parent._id,
        name: parent.name,
        email: parent.email,
        children: parent.children || [],
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
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate('/Admin/addparent')}
                >
                    Add Parent
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
                All Parents
            </Typography>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(parentsList) && parentsList.length > 0 ?
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows || []} columns={columns} components={{ Toolbar: CustomToolbar }} />
                </Box>
                :
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                    <Typography variant="h5" gutterBottom>
                        No parents found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddAlt1Icon />}
                        onClick={() => navigate('/Admin/addparent')}
                    >
                        Add a Parent
                    </Button>
                </Box>
                )
            }
        </Paper>
    );
};

export default ShowParents;