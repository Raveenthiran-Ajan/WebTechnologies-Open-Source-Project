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
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
    

    
    // Teaching classes (multiple) - get from teachSclasses array or fallback to single teachSclass
    const teachingClasses = teacherData?.teachSclasses || 
        (teacherData?.teachSclass ? [teacherData.teachSclass] : []);
    
    // Attendance assigned class (single) - only use attendanceClass, no fallback
    const attendanceClass = teacherData?.attendanceClass;

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
            headerName: 'Class Name',
            width: 200,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClassOutlinedIcon color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'subject',
            headerName: 'Subject',
            width: 180,
            flex: 1,
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const isAttendanceClass = params.row.canTakeAttendance;
                return (
                    <Chip
                        label={isAttendanceClass ? 'Teaching + Attendance' : 'Teaching Only'}
                        color={isAttendanceClass ? 'primary' : 'default'}
                        variant={isAttendanceClass ? 'filled' : 'outlined'}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/teacher/class/${params.row.id}`)}
                        sx={{ textTransform: 'none' }}
                    >
                        VIEW
                    </Button>
                    {params.row.canTakeAttendance && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<AccessTimeIcon />}
                            onClick={() => navigate(`/teacher/class/${params.row.id}/attendance`)}
                            sx={{ textTransform: 'none' }}
                        >
                            Attendance
                        </Button>
                    )}
                </Box>
            ),
        },
    ];

    const rows = teachingClasses.map((sclass, index) => {
        // Check if this specific class ID matches the attendance class ID
        const classId = sclass._id || sclass;
        const isAttendanceClass = attendanceClass && 
            (attendanceClass._id === classId || attendanceClass === classId);
        
        // Handle different data structures for class name
        let className;
        if (typeof sclass === 'object' && sclass.sclassName) {
            className = sclass.sclassName;
        } else if (typeof sclass === 'string') {
            // If it's a string (ID), find the corresponding class name
            const classInfo = sclassesList?.find(c => c._id === sclass);
            if (classInfo) {
                className = classInfo.sclassName;
            } else {
                // Fallback for when we can't find the class name
                className = sclass.length > 10 ? `Class (${sclass.slice(-4)})` : sclass;
            }
        } else {
            className = sclass?.name || sclass || `Class ${index + 1}`;
        }
        
        // Handle different data structures for subject
        const subject = teacherData?.teachSubject?.subName || 
                       teacherData?.teachSubjects?.[0]?.subName || 
                       'N/A';
        

        
        return {
            id: sclass._id || `class-${index}`,
            className: className,
            subject: subject,
            canTakeAttendance: isAttendanceClass,
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
                            noRowsLabel: 'No classes assigned yet.',
                        }}
                    />
                </Box>

                {/* Summary Information */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Total Classes: {teachingClasses.length} | 
                        Attendance Responsibility: {teachingClasses.filter(c => attendanceClass && c._id === attendanceClass._id).length} | 
                        Teaching Only: {teachingClasses.filter(c => !attendanceClass || c._id !== attendanceClass._id).length}
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default TeacherClasses;