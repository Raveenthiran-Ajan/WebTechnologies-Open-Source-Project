import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { clearStudentsList } from '../../../redux/studentRelated/studentSlice';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
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

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);
    const userState = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        console.log('Fetching students list for admin:', currentUser._id, 'Refresh trigger:', refreshTrigger);
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch, refreshTrigger]);

    useEffect(() => {
        if (error) {
            setMessage(error);
            setShowPopup(true);
        }
    }, [error]);

    const deleteHandler = async (id, address) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this student? This action cannot be undone.');
        
        if (confirmDelete) {
            try {
                console.log('Deleting student with ID:', id, 'Address:', address);
                await dispatch(deleteUser(id, address));
                console.log('Student deleted successfully, clearing and refreshing list...');
                
                // Clear the current list and refresh
                dispatch(clearStudentsList());
                
                setMessage('✅ Student has been successfully removed from the system');
                setShowPopup(true);
                
                // Trigger a refresh of the student list
                setRefreshTrigger(prev => prev + 1);
                
            } catch (error) {
                console.error('Delete error:', error);
                setMessage('❌ Unable to delete student: ' + (error.message || 'Please try again or contact support'));
                setShowPopup(true);
            }
        }
    }

    const columns = [
        { field: 'name', headerName: 'Student Name', width: 200 },
        { field: 'rollNum', headerName: 'Roll Number', width: 150 },
        { field: 'sclassName', headerName: 'Class', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton
                            variant="outlined"
                            onClick={() => deleteHandler(params.row.id, "Student")}
                        >
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="contained" sx={{ ml: 1 }}
                            onClick={() => navigate("/Admin/students/student/" + params.row.id)}>
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const rows = studentsList && studentsList.map((student) => ({
        id: student._id,
        name: student.name,
        rollNum: student.rollNum,
        sclassName: student.sclassName ? student.sclassName.sclassName : 'No Class',
    }));

    console.log('Current studentsList:', studentsList);
    console.log('Mapped rows:', rows);

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
                    onClick={() => navigate('/Admin/addstudents')}
                >
                    Add Student
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
                All Students
            </Typography>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(studentsList) && studentsList.length > 0 ?
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid 
                        key={`students-${refreshTrigger}`}
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
                        No students found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddAlt1Icon />}
                        onClick={() => navigate('/Admin/addstudents')}
                    >
                        Add a Student
                    </Button>
                </Box>
                )
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowStudents;