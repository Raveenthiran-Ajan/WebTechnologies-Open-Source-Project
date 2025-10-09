import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { Paper, Box, Typography, Button, IconButton, CircularProgress, Chip, Container, Grid, Card, CardContent, CardActions, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
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
    const [view, setView] = useState('list');

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (id, address) => {
        dispatch(deleteUser(id, address)).then(() => {
            dispatch(getAllTeachers(currentUser._id));
        });
    };

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };



    const columns = [
        { field: 'name', headerName: 'Teacher Name', flex: 0.8 },
        {
            field: 'teachSubjects',
            headerName: 'Teaching Subjects',
            flex: 1,
            renderCell: (params) => {
                const subjects = params.row.teachSubjects;
                return (
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5, 
                        width: '100%',
                        py: 1 
                    }}>
                        {subjects && subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                <Chip 
                                    key={subject._id || index} 
                                    label={subject.subName} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            ))
                        ) : params.row.teachSubject ? (
                            <Chip 
                                label={params.row.teachSubject} 
                                size="small" 
                                color="secondary" 
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
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
            flex: 0.8,
            renderCell: (params) => {
                const classes = params.row.teachSclasses;
                return (
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5, 
                        width: '100%',
                        py: 1 
                    }}>
                        {classes && classes.length > 0 ? (
                            classes.slice(0, 3).map((sclass, index) => (
                                <Chip 
                                    key={sclass._id || index} 
                                    label={sclass.sclassName || 'Unknown'} 
                                    size="small" 
                                    color="info" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No classes
                            </Typography>
                        )}
                        {classes && classes.length > 3 && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                +{classes.length - 3} more
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            field: 'attendanceClass',
            headerName: 'Class Teacher',
            flex: 0.8,
            renderCell: (params) => {
                const attendanceClass = params.row.attendanceClass;
                return (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        width: '100%',
                        py: 1
                    }}>
                        {attendanceClass ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip
                                    label={attendanceClass.sclassName || 'Unknown'}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    ✓
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'success.main' }}>
                                    Class Teacher
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                Not assigned
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1.2, headerAlign: 'center', align: 'center',
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton
                            onClick={() => deleteHandler(params.row.id, "Teacher")}
                            title="Delete Teacher"
                        >
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/Admin/teachers/teacher/${params.row.id}`)}
                            sx={{ mx: 1 }}
                        >
                            View
                        </Button>
                        <IconButton
                            onClick={() => navigate(`/Admin/teachers/edit-assignments/${params.row.id}`)}
                            title="Edit Assignments"
                        >
                            <Edit color="primary" />
                        </IconButton>
                    </Box>
                );
            },
        },
    ];

    const rows = teachersList && teachersList.map((teacher) => {
        console.log('Teacher data:', teacher.name, 'teachSclasses:', teacher.teachSclasses, 'attendanceClass:', teacher.attendanceClass);
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
        
        const row = {
            id: teacher._id,
            name: teacher.name,
            teachSubjects: teachingSubjects,
            teachSclasses: teachingClasses,
            attendanceClass: teacher.attendanceClass || null,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass ? teacher.teachSclass.sclassName : 'No Class',
        };
        
        return row;
    });

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{
                display: 'flex',
                gap: 1,
                mb: 1,
                p: 1,
                borderBottom: '1px solid #ccc'
            }}>
                <GridToolbarColumnsButton sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.lighter' }
                }} />
                <GridToolbarFilterButton sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.lighter' }
                }} />
                <GridToolbarDensitySelector sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.lighter' }
                }} />
                <GridToolbarExport sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.lighter' }
                }} />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate('/Admin/teachers/chooseclass')}
                    sx={{
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    Add Teacher
                </Button>
            </GridToolbarContainer>
        );
    }

    const TeacherBoxes = () => (
        <Grid container spacing={3} sx={{ p: 2 }}>
            {teachersList.map((teacher) => {
                const row = rows.find(r => r.id === teacher._id);
                return (
                    <Grid item xs={12} sm={6} md={4} key={teacher._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="div" gutterBottom>
                                    {teacher.name}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
                                    {row?.teachSubjects && row.teachSubjects.length > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>Subjects:</Typography>
                                            {row.teachSubjects.slice(0, 3).map((subject, index) => (
                                                <Chip
                                                    key={subject._id || index}
                                                    label={subject.subName}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem', height: '20px' }}
                                                />
                                            ))}
                                            {row.teachSubjects.length > 3 && (
                                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                    +{row.teachSubjects.length - 3} more
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                    {row?.attendanceClass && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>Attendance:</Typography>
                                            <Chip
                                                label={row.attendanceClass.sclassName || 'Unknown'}
                                                size="small"
                                                color="success"
                                                variant="filled"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #eee' }}>
                                <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/Admin/teachers/teacher/${teacher._id}`)}>View</Button>
                                <IconButton size="small" onClick={() => navigate(`/Admin/teachers/edit-assignments/${teacher._id}`)} title="Edit Assignments">
                                    <Edit />
                                </IconButton>
                                <IconButton size="small" onClick={() => deleteHandler(teacher._id, "Teacher")} color="error" title="Delete Teacher">
                                    <Delete />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );

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
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid #ccc'
            }}>
                <Typography variant="h6" component="div">
                    All Teachers
                </Typography>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="view mode"
                >
                    <ToggleButton value="list" aria-label="list view">
                        <ViewListIcon />
                    </ToggleButton>
                    <ToggleButton value="box" aria-label="box view">
                        <ViewModuleIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {loading ?
                <CircularProgress />
                :
                (Array.isArray(teachersList) && teachersList.length > 0 ?
                    (view === 'list' ?
                        <Box sx={{ height: 400, width: '100%', overflow: 'auto', mx: 1, mb: 1 }}>
                            <DataGrid 
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
                                getRowHeight={() => 'auto'}
                                columnVisibilityModel={{
                                    name: true,
                                    teachSubjects: true,
                                    teachSclasses: true,
                                    attendanceClass: true,
                                    actions: true
                                }}
                                slotProps={{
                                    toolbar: {
                                        showQuickFilter: true,
                                        quickFilterProps: { debounceMs: 500 }
                                    }
                                }}
                                getRowId={(row) => row.id}
                                sx={{
                                    '& .MuiDataGrid-cell': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        lineHeight: 'unset !important',
                                        maxHeight: 'none !important',
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                        padding: '8px 16px',
                                    },
                                    '& .MuiDataGrid-row': {
                                        maxHeight: 'none !important',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
                                    },
                                    '& .MuiDataGrid-columnHeader': {
                                        backgroundColor: 'white',
                                        color: 'text.primary',
                                        fontWeight: 'bold',
                                        padding: '16px',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        borderBottom: '2px solid',
                                        borderColor: 'divider',
                                    },
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                }}
                            />
                        </Box>
                        :
                        <TeacherBoxes />
                    )
                    :
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                        <SupervisorAccountOutlinedIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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