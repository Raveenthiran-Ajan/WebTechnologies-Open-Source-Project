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
    CardActions,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    IconButton,
    Badge
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
    const [selectedClass, setSelectedClass] = useState(null); // For card view class selection
    const [attendanceStatus, setAttendanceStatus] = useState({}); // Track attendance status per section
    
    // Use teacherDetails if available, otherwise fall back to currentUser
    const teacherData = teacherDetails || currentUser;
    
    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewMode(newView);
            setSelectedClass(null); // Reset selected class when switching views
        }
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
    };

    // Check attendance status for sections with attendance responsibility
    const checkAttendanceStatus = async () => {
        if (!teacherData?.attendanceSections?.length && !teacherData?.attendanceClass) return;

        const statusUpdates = {};

        // Check section-level attendance
        for (const section of teacherData.attendanceSections || []) {
            const sclassId = typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName;
            try {
                const response = await fetch(`${API_BASE_URL}/CheckSectionAttendance/${sclassId}/${section.sectionName}`);
                const data = await response.json();
                
                if (response.ok) {
                    statusUpdates[`${sclassId}-${section.sectionId}`] = data.attendanceTaken;
                } else {
                    console.error('Error checking attendance status:', data.message);
                    statusUpdates[`${sclassId}-${section.sectionId}`] = false;
                }
            } catch (error) {
                console.error('Error checking attendance status:', error);
                statusUpdates[`${sclassId}-${section.sectionId}`] = false;
            }
        }

        // Check class-level attendance (for classes without sections)
        if (teacherData?.attendanceClass) {
            const attendanceClassId = typeof teacherData.attendanceClass === 'object' ? teacherData.attendanceClass._id : teacherData.attendanceClass;
            try {
                const resp = await fetch(`${API_BASE_URL}/CheckClassAttendance/${attendanceClassId}`);
                const data = await resp.json();
                statusUpdates[`${attendanceClassId}-whole-class`] = Boolean(data.attendanceTaken);
            } catch (error) {
                console.error('Error checking class attendance status:', error);
                statusUpdates[`${attendanceClassId}-whole-class`] = false;
            }
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

    // Refresh attendance status when selectedClass changes
    useEffect(() => {
        if (selectedClass) {
            checkAttendanceStatus();
        }
    }, [selectedClass]);

    // Refresh attendance status when window regains focus (user returns from attendance page)
    useEffect(() => {
        const handleFocus = () => {
            checkAttendanceStatus();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);
    
    // Teaching sections (multiple) - get from teachSections array
    const teachingSections = teacherData?.teachSections || [];
    
    // Attendance sections (multiple) - get from attendanceSections array
    const attendanceSections = teacherData?.attendanceSections || [];
    
    // Classes assigned directly (for classes without sections)
    const assignedClasses = teacherData?.teachSclasses || [];

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
            field: 'sectionName',
            headerName: 'Section',
            width: 150,
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2">
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
                            const sectionParam = params.row.sectionName === 'Whole Class' ? '' : `?section=${encodeURIComponent(params.row.sectionName)}`;
                            navigate(`/teacher/class/${params.row.sclassId}${sectionParam}`);
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
                                const sectionParam = params.row.sectionName === 'Whole Class' ? '' : `?section=${encodeURIComponent(params.row.sectionName)}`;
                                navigate(`/teacher/class/${params.row.sclassId}/attendance${sectionParam}`);
                            }}
                            sx={{ textTransform: 'none', minWidth: '100px' }}
                        >
                            Attendance
                        </Button>
                    )}
                </Box>
            )
        }
    ];    // Process sections to determine combined roles
    const sectionMap = new Map();
    
    // First, add all teaching sections
    teachingSections.forEach(section => {
        const sclassId = typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName;
        const sectionId = section.sectionId;
        const key = `${sclassId}-${sectionId}`;
        sectionMap.set(key, { 
            ...section, 
            hasTeaching: true, 
            hasAttendance: false,
            role: 'teaching'
        });
    });
    
    // Then, update sections that also have attendance responsibility
    attendanceSections.forEach(section => {
        const sclassId = typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName;
        const sectionId = section.sectionId;
        const key = `${sclassId}-${sectionId}`;
        if (sectionMap.has(key)) {
            // Section exists in teaching, now also has attendance
            sectionMap.set(key, { 
                ...sectionMap.get(key), 
                hasAttendance: true,
                role: 'teaching+attendance'
            });
        }
        // Note: No attendance-only sections since system doesn't support attendance-only teachers
    });
    
    // Add 'Whole Class' entries for classes where the teacher is assigned to the class
    // but has no specific section assignments for that class (regardless of whether the class defines sections)
    assignedClasses.forEach(classItem => {
        const sclassId = typeof classItem === 'object' ? classItem._id : classItem;
        const classInfo = sclassesList?.find(c => c._id === sclassId);
        
        // Only add if this class has no sections assigned to this teacher
        const hasSectionsForThisClass = teachingSections.some(section => {
            const sectionClassId = typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName;
            return sectionClassId === sclassId;
        });
        
        if (!hasSectionsForThisClass && classInfo) {
            const attendanceClassId = teacherData?.attendanceClass && (typeof teacherData.attendanceClass === 'object' ? teacherData.attendanceClass._id : teacherData.attendanceClass);
            // Create a virtual section entry for the whole class
            const key = `${sclassId}-whole-class`;
            sectionMap.set(key, {
                sectionId: 'whole-class',
                sectionName: 'Whole Class',
                sclassName: classInfo,
                hasTeaching: true,
                hasAttendance: attendanceClassId === sclassId,
                role: attendanceClassId === sclassId ? 'teaching+attendance' : 'teaching',
                studentCount: typeof classInfo.students === 'number' ? classInfo.students : 0
            });
        }
    });
    
    const processedSections = Array.from(sectionMap.values());

    // Group sections by class for card view
    const sectionsByClass = processedSections.reduce((acc, section) => {
        const sclassId = typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName;
        const className = section.sclassName && typeof section.sclassName === 'object' && section.sclassName.sclassName 
            ? section.sclassName.sclassName 
            : (sclassesList?.find(c => c._id === sclassId)?.sclassName || 'Unknown Class');
        
        if (!acc[sclassId]) {
            acc[sclassId] = {
                sclassId,
                className,
                sections: []
            };
        }
        acc[sclassId].sections.push(section);
        return acc;
    }, {});

    const classesList = Object.values(sectionsByClass);

    const rows = processedSections.map((section) => {
        // Get the class name from the section's sclassName reference
        // Handle both populated object and ID cases
        let className = 'Unknown Class';
        if (section.sclassName) {
            if (typeof section.sclassName === 'object' && section.sclassName.sclassName) {
                // Already populated
                className = section.sclassName.sclassName;
            } else if (typeof section.sclassName === 'string') {
                // ID reference, find in sclassesList
                const classInfo = sclassesList?.find(c => c._id === section.sclassName);
                if (classInfo) {
                    className = classInfo.sclassName;
                }
            }
        }
        
        // Show subjects in a cleaner format - limit to 2 subjects with "more" indicator
        const allSubjects = teacherData?.teachSubjects || [];
        const subjectDisplay = allSubjects.length > 0 
            ? allSubjects.length <= 2 
                ? allSubjects.map(s => s.subName).join(', ')
                : `${allSubjects.slice(0, 2).map(s => s.subName).join(', ')} +${allSubjects.length - 2} more`
            : 'N/A';
        
        return {
            id: `${typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName}-${section.sectionId}`,
            sectionName: section.sectionName,
            className: className,
            subject: subjectDisplay,
            role: section.role || 'teaching', // Ensure role is always defined
            sclassId: typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName,
            sectionId: section.sectionId,
            hasTeaching: section.hasTeaching,
            hasAttendance: section.hasAttendance,
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
                        {selectedClass && viewMode === 'card' && (
                            <IconButton onClick={handleBackToClasses} sx={{ mr: 2 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Typography variant="h4" component="h1" color="primary">
                            {selectedClass && viewMode === 'card' 
                                ? `${selectedClass.className} - Sections` 
                                : 'My Classes'
                            }
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
                                noRowsLabel: 'No sections assigned yet.',
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        {!selectedClass ? (
                            // Show class cards
                            <Grid container spacing={3}>
                                {classesList.map((classItem) => (
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
                                            onClick={() => handleClassSelect(classItem)}
                                        >
                                            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                                <ClassIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                                <Typography variant="h6" component="h2" color="primary" gutterBottom>
                                                    {classItem.className}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {classItem.sections.length} section{classItem.sections.length !== 1 ? 's' : ''}
                                                </Typography>
                                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <Chip 
                                                        label={`${classItem.sections.filter(s => s.hasAttendance).length} Attendance`}
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
                        ) : (
                            // Show sections for selected class
                            <Grid container spacing={3}>
                                {selectedClass.sections.map((section) => (
                                    <Grid item xs={12} md={6} lg={4} key={`${selectedClass.sclassId}-${section.sectionId}`}>
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
                                            onClick={() => {
                                                const isWholeClass = section.sectionId === 'whole-class' || section.sectionName === 'Whole Class';
                                                const sectionQuery = isWholeClass ? '' : `?section=${encodeURIComponent(section.sectionName)}`;
                                                navigate(`/teacher/class/${selectedClass.sclassId}${sectionQuery}`);
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                                    <Badge 
                                                        badgeContent={
                                                            section.hasAttendance && (
                                                                section.sectionId === 'whole-class'
                                                                    ? !attendanceStatus[`${typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName}-whole-class`]
                                                                    : !attendanceStatus[`${typeof section.sclassName === 'object' ? section.sclassName._id : section.sclassName}-${section.sectionId}`]
                                                            ) ? "!" : 0
                                                        } 
                                                        color="error"
                                                        sx={{
                                                            '& .MuiBadge-badge': {
                                                                backgroundColor: '#f44336',
                                                                color: 'white',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                minWidth: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%'
                                                            }
                                                        }}
                                                    >
                                                        <ClassIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                                                    </Badge>
                                                </Box>
                                                <Typography variant="h6" component="h2" color="primary" gutterBottom>
                                                    {section.sectionName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {section.hasAttendance ? 'Teaching + Attendance' : 'Teaching Only'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {section.studentCount || 0} students
                                                </Typography>
                                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    {section.hasAttendance && (
                                                        <IconButton
                                                            size="medium"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const isWholeClass = section.sectionId === 'whole-class' || section.sectionName === 'Whole Class';
                                                                const sectionQuery = isWholeClass ? '' : `?section=${encodeURIComponent(section.sectionName)}`;
                                                                navigate(`/teacher/class/${selectedClass.sclassId}/attendance${sectionQuery}`);
                                                            }}
                                                            sx={{ 
                                                                color: 'secondary.main',
                                                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                                '&:hover': { 
                                                                    backgroundColor: 'secondary.main', 
                                                                    color: 'white',
                                                                    transform: 'scale(1.1)'
                                                                },
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                            title="Take Attendance"
                                                        >
                                                            <EventAvailableIcon />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                        {classesList.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No classes assigned yet.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Summary Information */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Total Sections: {processedSections.length} | 
                        Teaching + Attendance: {processedSections.filter(s => s.role === 'teaching+attendance').length} | 
                        Teaching Only: {processedSections.filter(s => s.role === 'teaching').length}
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default TeacherClasses;