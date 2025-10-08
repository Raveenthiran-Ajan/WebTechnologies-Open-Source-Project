import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { clearStudentsList } from '../../../redux/studentRelated/studentSlice';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress, Tooltip, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Delete from '@mui/icons-material/Delete';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import SchoolIcon from '@mui/icons-material/School';
import Popup from '../../../components/Popup';

const ShowStudents = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedClass, setSelectedClass] = useState(() => {
        return location.state?.sclass || null;
    });
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('studentClassViewMode') || 'box';
    });

    useEffect(() => {
        // Check for class parameter in URL
        const urlParams = new URLSearchParams(location.search);
        const classParam = urlParams.get('class');
        if (classParam && sclassesList) {
            const classObj = sclassesList.find(sclass => sclass._id === classParam);
            if (classObj) {
                setSelectedClass(classObj);
            }
        }
    }, [location.search, sclassesList]);

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch, refreshTrigger]);

    const adminID = currentUser._id;

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
                await dispatch(deleteUser(id, address));
                
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

    const classColumns = [
        { field: 'sclassName', headerName: 'Class Name', flex: 1 },
        { field: 'studentCount', headerName: 'Number of Students', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setSelectedClass(params.row)}
                    >
                        View
                    </Button>
                    <Tooltip title="Add Student">
                        <IconButton
                            color="primary"
                            onClick={() => navigate(`/Admin/class/addstudents/${params.row.id}`)}
                        >
                            <PersonAddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const studentsByClass = (studentsList || []).reduce((acc, student) => {
        if (student.sclassName) {
            const classId = student.sclassName._id;
            if (!acc[classId]) {
                acc[classId] = [];
            }
            acc[classId].push(student);
        }
        return acc;
    }, {});

    const classRows = (sclassesList || [])
        .map((sclass) => ({
            ...sclass,
            id: sclass._id,
            studentCount: (studentsByClass[sclass._id] || []).length,
        }))
        .sort((a, b) => {
            const numA = parseInt(a.sclassName.match(/\d+/) || 0, 10);
            const numB = parseInt(b.sclassName.match(/\d+/) || 0, 10);
            return numA - numB;
        });

    const columns = [
        { field: 'name', headerName: 'Student Name', width: 200 },
        { field: 'rollNum', headerName: 'Roll Number', width: 150 },
        { field: 'email', headerName: 'Email Address', width: 200 },
        { field: 'sclassName', headerName: 'Class', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            onClick={() => deleteHandler(params.row.id, "Student")}
                        >
                            <Tooltip title="Delete">
                                <Delete color="error" />
                            </Tooltip>
                        </IconButton>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ 
                                borderRadius: '8px', 
                                fontWeight: 'bold',
                                minWidth: 'auto',
                                px: 2
                            }}
                            onClick={() => navigate("/Admin/students/student/" + params.row.id)}>
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const filteredStudents = selectedClass ? studentsList.filter(student => {
        const matchesClass = student.sclassName?._id === selectedClass._id;
        return matchesClass;
    }) : [];

    const rows = filteredStudents.map((student) => ({
        id: student._id,
        name: student.name,
        rollNum: student.rollNum,
        email: student.email,
        sclassName: student.sclassName ? student.sclassName.sclassName : 'No Class',
    }));

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{ justifyContent: 'space-between', p: 1 }}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />

                <Button
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate(`/Admin/class/addstudents/${selectedClass._id}`)}
                    disabled={!selectedClass}
                >
                    Add Student
                </Button>
            </GridToolbarContainer>
        );
    }

    if (loading) {
        return <CircularProgress />;
    }

    if (selectedClass) {
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden', p: { xs: 1, md: 2 }, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => setSelectedClass(null)}>
                        <Tooltip title="Back to Classes">
                            <ArrowBackIcon color="primary" />
                        </Tooltip>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                        Students in {selectedClass.sclassName}
                    </Typography>
                </Box>
                {loading ?
                    <CircularProgress />
                    :
                    (Array.isArray(rows) && rows.length > 0 ?
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                slots={{
                                    toolbar: CustomToolbar
                                }}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                }}
                                pageSizeOptions={[5, 10, 25]}
                                disableRowSelectionOnClick
                            />
                        </Box>
                        :
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', p: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                <PeopleOutlineIcon sx={{ fontSize: 40, mb: 1 }} /> <br />
                                No students found in this class
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<PersonAddAlt1Icon />}
                                onClick={() => navigate(`/Admin/class/addstudents/${selectedClass._id}`)}
                            >
                                Add a Student
                            </Button>
                        </Box>
                    )
                }
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Paper>
        );
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: 'white', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="h6" component="div">
                    All Classes
                </Typography>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(event, newView) => {
                        if (newView !== null) {
                            setViewMode(newView);
                            localStorage.setItem('studentClassViewMode', newView);
                        }
                    }}
                    aria-label="view mode"
                >
                    <ToggleButton value="box" aria-label="box view">
                        <Tooltip title="Box View">
                            <ViewModuleIcon />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                        <Tooltip title="List View">
                            <ViewListIcon />
                        </Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(sclassesList) && sclassesList.length > 0 ?
                    (viewMode === 'box' ?
                        <Grid container spacing={3} sx={{ p: 2 }}>
                            {classRows.map((item) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: 'white',
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                                                borderColor: 'primary.main',
                                            },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            height: '100%',
                                        }}
                                    >
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, color: 'primary.main' }}>
                                                <SchoolIcon sx={{ fontSize: 40, mr: 1 }} />
                                                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                                                    {item.sclassName}
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" color="text.secondary">
                                                {item.studentCount} {item.studentCount === 1 ? 'Student' : 'Students'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setSelectedClass(item)}
                                                sx={{ 
                                                    borderRadius: '8px', 
                                                    fontWeight: 'bold',
                                                    minWidth: 'auto',
                                                    px: 2
                                                }}
                                            >
                                                View
                                            </Button>
                                            <Tooltip title="Add Student">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => navigate(`/Admin/class/addstudents/${item.id}`)}
                                                    sx={{ 
                                                        border: '1px solid',
                                                        borderColor: 'primary.main',
                                                        borderRadius: '8px',
                                                        '&:hover': { 
                                                            backgroundColor: 'primary.main', 
                                                            color: 'white' 
                                                        }
                                                    }}
                                                >
                                                    <PersonAddAlt1Icon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        :
                        <Box sx={{ height: 400, width: '100%', p: 2 }}>
                            <DataGrid rows={classRows} columns={classColumns} />
                        </Box>
                    )
                    :
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                        <Typography variant="h5" gutterBottom>
                            No classes found
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/Admin/addclass')}>Add a Class</Button>
                    </Box>
                )
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowStudents;