import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material'
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate } from 'react-router-dom';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';

const ChooseClass = ({ situation }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error)
    }

    const navigateHandler = (classID) => {
        if (situation === "Teacher") {
            navigate("/Admin/teachers/choosesubject/" + classID)
        }
        else if (situation === "Subject") {
            navigate("/Admin/addsubject/" + classID)
        }
    }

    const sclassColumns = [
        { field: 'name', headerName: 'Class Name', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Button variant="contained" color="primary"
                    onClick={() => navigateHandler(params.row.id)}>
                    Choose
                </Button>
            ),
        },
    ];

    const sclassRows = sclassesList && sclassesList.length > 0 ? sclassesList.map((sclass) => ({
        id: sclass._id,
        name: sclass.sclassName,
    })) : [];

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
                Choose a Class
            </Typography>
            {getresponse ?
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
                    <Typography variant="h6" gutterBottom>
                        No classes found
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/Admin/addclass")}>
                        Add Class
                    </Button>
                </Box>
                :
                (Array.isArray(sclassesList) && sclassesList.length > 0 ?
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid 
                        rows={sclassRows || []} 
                        columns={sclassColumns} 
                        components={{ Toolbar: CustomToolbar }}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Box>
                :
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
                    <Typography variant="h6" gutterBottom>
                        No classes found
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/Admin/addclass")}>
                        Add Class
                    </Button>
                </Box>
                )
            }
        </Paper>
    )
}

export default ChooseClass