import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress, Chip } from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
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

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (id, address) => {
        dispatch(deleteUser(id, address)).then(() => {
            dispatch(getAllTeachers(currentUser._id));
        });
    };



    const columns = [
        { field: 'name', headerName: 'Teacher Name', width: 200 },
        {
            field: 'teachSubjects',
            headerName: 'Teaching Subjects',
            width: 250,
            renderCell: (params) => {
                const subjects = params.row.teachSubjects;
                return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 240 }}>
                        {subjects && subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                <Chip 
                                    key={subject._id || index} 
                                    label={subject.subName} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined" 
                                />
                            ))
                        ) : params.row.teachSubject ? (
                            <Chip 
                                label={params.row.teachSubject} 
                                size="small" 
                                color="secondary" 
                                variant="outlined" 
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No subjects
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            field: 'teachSclasses',
            headerName: 'Teaching Classes',
            width: 200,
            renderCell: (params) => {
                const classes = params.row.teachSclasses;
                return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 190 }}>
                        {classes && classes.length > 0 ? (
                            classes.map((sclass, index) => (
                                <Chip 
                                    key={sclass._id || index} 
                                    label={sclass.sclassName} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                />
                            ))
                        ) : params.row.teachSclass !== 'No Class' ? (
                            <Chip 
                                label={params.row.teachSclass} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No classes
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            field: 'attendanceClass',
            headerName: 'Attendance Class',
            width: 180,
            renderCell: (params) => {
                const attendanceClass = params.row.attendanceClass;
                return attendanceClass ? (
                    <Chip 
                        label={attendanceClass.sclassName} 
                        size="small" 
                        color="success" 
                        variant="filled" 
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Not assigned
                    </Typography>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton
                            onClick={() => deleteHandler(params.row.id, "Teacher")}
                        >
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="contained" sx={{ ml: 1 }}
                            onClick={() => navigate("/Admin/teachers/teacher/" + params.row.id)}>
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const rows = teachersList && teachersList.map((teacher) => {
        let teachingSubjects = [];
        let teachingClasses = [];
        
        if (teacher.teachSubjects && teacher.teachSubjects.length > 0) {
            teachingSubjects = teacher.teachSubjects;
        } else if (teacher.teachSubject) {
            teachingSubjects = [teacher.teachSubject];
        }
        
        if (teacher.teachSclasses && teacher.teachSclasses.length > 0) {
            teachingClasses = teacher.teachSclasses;
        } else if (teacher.teachSclass) {
            teachingClasses = [teacher.teachSclass];
        }
        
        let attendanceClass = teacher.attendanceClass || teacher.teachSclass;
        if (!attendanceClass && teachingClasses.length > 0) {
            attendanceClass = teachingClasses[0];
        }
        
        return {
            id: teacher._id,
            name: teacher.name,
            teachSubjects: teachingSubjects,
            teachSclasses: teachingClasses,
            attendanceClass: attendanceClass,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass ? teacher.teachSclass.sclassName : 'No Class',
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
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate('/Admin/teachers/chooseclass')}
                >
                    Add Teacher
                </Button>
            </GridToolbarContainer>
        );
    }

    if (loading) {
        return <CircularProgress />;
    }

    if (response) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <Typography variant="h5" gutterBottom>
                    No teachers found
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate('/Admin/teachers/chooseclass')}
                >
                    Add a Teacher
                </Button>
            </Box>
        );
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
                All Teachers
            </Typography>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(teachersList) && teachersList.length > 0 ?
                <Box sx={{ height: 500, width: '100%' }}>
                    <DataGrid rows={rows || []} columns={columns} components={{ Toolbar: CustomToolbar }} />
                </Box>
                :
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                    <Typography variant="h5" gutterBottom>
                        No teachers found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddAlt1Icon />}
                        onClick={() => navigate('/Admin/teachers/chooseclass')}
                    >
                        Add a Teacher
                    </Button>
                </Box>
                )
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowTeachers