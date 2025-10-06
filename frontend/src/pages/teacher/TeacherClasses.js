import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getTeacherDetails } from '../../redux/teacherRelated/teacherHandle';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { API_BASE_URL } from '../../config';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    Chip,
    Card,
    CardContent,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    Badge
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';

const TeacherClasses = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { teacherDetails, loading, error } = useSelector((state) => state.teacher);
    const { sclassesList } = useSelector((state) => state.sclass);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [attendanceStatus, setAttendanceStatus] = useState({}); // Track attendance status
    
    // Use teacherDetails if available, otherwise fall back to currentUser
    const teacherData = teacherDetails || currentUser;
    
    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    // Check attendance status for classes with attendance responsibility
    const checkAttendanceStatus = async () => {
        if (!teacherData?.attendanceClass) return;

        const statusUpdates = {};

        // Check class-level attendance
        const attendanceClassId = typeof teacherData.attendanceClass === 'object' ? teacherData.attendanceClass._id : teacherData.attendanceClass;
        try {
            const resp = await fetch(`${API_BASE_URL}/CheckClassAttendance/${attendanceClassId}`);
            const data = await resp.json();
            statusUpdates[`${attendanceClassId}-whole-class`] = Boolean(data.attendanceTaken);
        } catch (error) {
            console.error('Error checking class attendance status:', error);
            statusUpdates[`${attendanceClassId}-whole-class`] = false;
        }

        setAttendanceStatus(statusUpdates);
    };
    
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getTeacherDetails(currentUser._id));
        }
    }, [dispatch, currentUser?._id]);

    // Load classes for the teacher's school (needed to build "Whole Class" entries)
    useEffect(() => {
        const schoolId = teacherData?.school && (typeof teacherData.school === 'object' ? teacherData.school._id : teacherData.school);
        if (schoolId) {
            dispatch(getAllSclasses(schoolId, "Sclass"));
        }
    }, [dispatch, teacherData?.school]);

    useEffect(() => {
        if (teacherData) {
            checkAttendanceStatus();
        }
    }, [teacherData]);

    // Refresh attendance status when window regains focus or page becomes visible (user returns from attendance page)
    useEffect(() => {
        const handleFocus = () => {
            checkAttendanceStatus();
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkAttendanceStatus();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Refresh attendance status when window regains focus (user returns from attendance page)
    useEffect(() => {
        const handleFocus = () => {
            checkAttendanceStatus();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);
    
    // Classes assigned to the teacher
    const assignedClasses = teacherData?.teachSclasses || [];
    const attendanceClassId = teacherData?.attendanceClass && (typeof teacherData.attendanceClass === 'object' ? teacherData.attendanceClass._id : teacherData.attendanceClass);

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

    const columns = [
        {
            field: 'className',
            headerName: 'Class',
            width: 150,
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'subject',
            headerName: 'Subjects',
            width: 200,
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 220,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const role = params.value || 'teaching'; // Fallback to 'teaching' if role is undefined
                const getRoleLabel = (role) => {
                    switch (role) {
                        case 'teaching+attendance':
                            return 'Teaching + Attendance';
                        case 'teaching':
                            return 'Teaching Only';
                        default:
                            return 'Unknown';
                    }
                };

                const getRoleColor = (role) => {
                    switch (role) {
                        case 'teaching+attendance':
                            return 'success';
                        case 'teaching':
                            return 'primary';
                        default:
                            return 'default';
                    }
                };

                return (
                    <Chip
                        label={getRoleLabel(role)}
                        color={getRoleColor(role)}
                        variant="outlined"
                        size="small"
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                            navigate(`/teacher/class/${params.row.sclassId}`);
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        View
                    </Button>
                    {params.row.hasAttendance && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<EventAvailableIcon />}
                            onClick={() => {
                                navigate(`/teacher/class/${params.row.sclassId}/attendance`);
                            }}
                            sx={{ textTransform: 'none', minWidth: '100px' }}
                        >
                            Attendance
                        </Button>
                    )}
                </Box>
            )
        }
    ];    // Process classes assigned to the teacher

    const rows = assignedClasses.map((classItem) => {
        const sclassId = typeof classItem === 'object' ? classItem._id : classItem;
        const classInfo = sclassesList?.find(c => c._id === sclassId);
        const className = classInfo?.sclassName || 'Unknown Class';
        
        // Show subjects in a cleaner format - limit to 2 subjects with "more" indicator
        const allSubjects = teacherData?.teachSubjects || [];
        const subjectDisplay = allSubjects.length > 0 
            ? allSubjects.length <= 2 
                ? allSubjects.map(s => s.subName).join(', ')
                : `${allSubjects.slice(0, 2).map(s => s.subName).join(', ')} +${allSubjects.length - 2} more`
            : 'N/A';
        
        const hasAttendance = attendanceClassId === sclassId;
        
        return {
            id: sclassId,
            className: className,
            subject: subjectDisplay,
            role: hasAttendance ? 'teaching+attendance' : 'teaching',
            sclassId: sclassId,
            hasTeaching: true,
            hasAttendance: hasAttendance,
        };
    });

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
                    <Typography>Loading teacher data...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h4" component="h1" color="primary">
                            My Classes
                        </Typography>
                    </Box>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewChange}
                        aria-label="view mode"
                        size="small"
                    >
                        <ToggleButton value="table" aria-label="table view">
                            <ViewListIcon />
                        </ToggleButton>
                        <ToggleButton value="card" aria-label="card view">
                            <ViewModuleIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {viewMode === 'table' ? (
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
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
                                noRowsLabel: 'No classes assigned yet.',
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <Grid container spacing={3}>
                            {rows.map((classItem) => (
                                <Grid item xs={12} md={6} lg={4} key={classItem.sclassId}>
                                    <Card 
                                        sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                boxShadow: 6,
                                                transform: 'translateY(-2px)',
                                                transition: 'all 0.2s ease-in-out'
                                            }
                                        }}
                                        onClick={() => navigate(`/teacher/class/${classItem.sclassId}`)}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <ClassIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                            <Typography variant="h6" component="h2" color="primary" gutterBottom>
                                                {classItem.className}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {classItem.subject}
                                            </Typography>
                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Chip 
                                                    label={classItem.role === 'teaching+attendance' ? 'Teaching + Attendance' : 'Teaching Only'}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {rows.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No classes assigned yet.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}                {/* Summary Information */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Total Classes: {rows.length} |
                        Teaching + Attendance: {rows.filter(r => r.role === 'teaching+attendance').length} |
                        Teaching Only: {rows.filter(r => r.role === 'teaching').length}
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default TeacherClasses;