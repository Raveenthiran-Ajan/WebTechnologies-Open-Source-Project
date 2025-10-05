import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getTeacherDetails } from '../../redux/teacherRelated/teacherHandle';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    Chip
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
    
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getTeacherDetails(currentUser._id));
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [dispatch, currentUser?._id]);
    
    // Use teacherDetails if available, otherwise fall back to currentUser
    const teacherData = teacherDetails || currentUser;
    
    // Teaching sections (multiple) - get from teachSections array
    const teachingSections = teacherData?.teachSections || [];
    
    // Attendance sections (multiple) - get from attendanceSections array
    const attendanceSections = teacherData?.attendanceSections || [];

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
                        onClick={() => navigate(`/Teacher/class/${params.row.sclassId}`)}
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
                            onClick={() => navigate(`/Teacher/class/${params.row.sclassId}/attendance`)}
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
    
    const processedSections = Array.from(sectionMap.values());

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
                    <Typography variant="h4" component="h1" color="primary">
                        My Classes
                    </Typography>
                </Box>

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