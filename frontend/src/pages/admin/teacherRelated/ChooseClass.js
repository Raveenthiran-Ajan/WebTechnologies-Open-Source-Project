import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Container, CircularProgress } from '@mui/material'
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate } from 'react-router-dom';
import ClassIcon from '@mui/icons-material/Class';
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
            navigate("/Admin/teachers/chooseclass?classId=" + classID)
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
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h4" component="h1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        Choose a Class
                    </Typography>
                </Box>
                
                {getresponse || (Array.isArray(sclassesList) && sclassesList.length === 0) ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '40vh',
                        p: 4
                    }}>
                        <ClassIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom color="text.secondary">
                            No classes found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                            Create your first class to start adding teachers
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate("/Admin/addclass")}
                        >
                            Add Class
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid 
                            rows={sclassRows || []} 
                            columns={sclassColumns} 
                            slots={{ toolbar: CustomToolbar }}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '2px solid #e0e0e0',
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Container>
    )
}

export default ChooseClass