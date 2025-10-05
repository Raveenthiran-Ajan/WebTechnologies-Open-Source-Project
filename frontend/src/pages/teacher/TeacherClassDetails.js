import { useEffect } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, Container, Button, Grid } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';


const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { classId } = useParams();

    const { currentUser } = useSelector((state) => state.user);
    // Use classId from params if available, otherwise fallback to current user's class
    const classID = classId || currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id
    
    // Check if this class is the attendance-assigned class
    const attendanceClass = currentUser?.attendanceClass;
    const canTakeAttendance = attendanceClass && 
        (attendanceClass._id === classID || attendanceClass._id === classId ||
         attendanceClass === classID || attendanceClass === classId);
    


    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }    if (error) {
        console.log(error)
    }

    const dataGridColumns = [
        { 
            field: 'rollNum', 
            headerName: 'Roll Number', 
            width: 130,
            headerAlign: 'center',
            align: 'center'
        },
        { 
            field: 'name', 
            headerName: 'Student Name', 
            width: 200,
            flex: 1
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            width: 250,
            flex: 1
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/teacher/students/student/${params.row.id}`)}
                    sx={{ textTransform: 'none' }}
                >
                    VIEW
                </Button>
            ),
        },
    ];

    const studentRows = sclassStudents.map((student) => {
        return {
            rollNum: student.rollNum,
            name: student.name,
            email: student.email || 'N/A',
            id: student._id,
        };
    });

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



    return (
        <Container maxWidth="lg">
            {loading ? (
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
                    <Typography>Loading...</Typography>
                </Box>
            ) : (
                <>
                    {/* Students List */}
                    {getresponse ? (
                        <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No Students Found
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    All Students
                                </Typography>
                                {canTakeAttendance && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AccessTimeIcon />}
                                        onClick={() => navigate(`/teacher/class/${classID}/simple-attendance`)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Take Attendance
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={studentRows}
                                    columns={dataGridColumns}
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
                                    localeText={{
                                        noRowsLabel: 'No students enrolled in this class yet.',
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default TeacherClassDetails;