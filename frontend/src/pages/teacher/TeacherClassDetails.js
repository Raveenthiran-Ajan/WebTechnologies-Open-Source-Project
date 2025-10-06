import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, Container, Button, Grid, TextField, Alert, CircularProgress } from '@mui/material';
import { updateStudentTermMarks } from '../../redux/studentRelated/studentHandle';
import { underStudentControl } from '../../redux/studentRelated/studentSlice';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
const getGradeFromMarks = (marks) => {
    if (marks >= 85) return 'A+';
    if (marks >= 75) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C+';
    if (marks >= 40) return 'C';
    if (marks >= 30) return 'D';
    return 'F';
};

const TeacherClassDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sclassStudents, loading, error: classError, getresponse } = useSelector((state) => state.sclass);
    const { classId } = useParams();
    const { statestatus, response, error: studentError, loading: studentLoading } = useSelector((state) => state.student);

    const [marks, setMarks] = useState({});
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [marksMode, setMarksMode] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    // Use classId from params if available, otherwise fallback to current user's class
    const classID = classId || currentUser.teachSclass?._id

    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, classID]);

    useEffect(() => {
        if (sclassStudents && sclassStudents.length > 0) {
            // For teachers with multiple subjects, we can't pre-fill marks
            // Only pre-fill if teacher has a single subject
            const teacherSubject = currentUser.teachSubject || (currentUser.teachSubjects && currentUser.teachSubjects.length === 1 ? currentUser.teachSubjects[0] : null);
            
            if (teacherSubject) {
                const initialMarks = {};
                sclassStudents.forEach(student => {
                    const subjectId = typeof teacherSubject === 'object' ? teacherSubject._id : teacherSubject;
                    const getMarkForTerm = (term) => student.examResult?.find(res => res.subName?._id === subjectId && res.term === term);
                    initialMarks[student._id] = {
                        TERM_1: { grade: getMarkForTerm('TERM_1')?.grade || '', marksObtained: getMarkForTerm('TERM_1')?.marksObtained ?? '' },
                        TERM_2: { grade: getMarkForTerm('TERM_2')?.grade || '', marksObtained: getMarkForTerm('TERM_2')?.marksObtained ?? '' },
                        TERM_3: { grade: getMarkForTerm('TERM_3')?.grade || '', marksObtained: getMarkForTerm('TERM_3')?.marksObtained ?? '' },
                    };
                });
                setMarks(initialMarks);
            }
        }
    }, [sclassStudents, currentUser.teachSubject, currentUser.teachSubjects]);
    const handleMarksChange = (studentId, term, value) => {
        const newMarks = value;
        const newGrade = getGradeFromMarks(newMarks);
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [term]: { grade: newGrade, marksObtained: newMarks }
            }
        }));
    };
    const handleSave = (studentId) => {
        const studentMarks = marks[studentId];
        const terms = ['TERM_1', 'TERM_2', 'TERM_3'];
        
        // Determine which subject to use for saving marks
        const teacherSubject = currentUser.teachSubject || (currentUser.teachSubjects && currentUser.teachSubjects.length === 1 ? currentUser.teachSubjects[0] : null);
        const subjectId = typeof teacherSubject === 'object' ? teacherSubject._id : teacherSubject;
        
        if (!subjectId) {
            setMessage('Cannot save marks: No specific subject assigned to this teacher for this class');
            setAlertSeverity('error');
            return;
        }
        
        const fields = {
            subName: subjectId,
            marks: terms.map(term => ({
                term,
                grade: studentMarks[term].grade,
                marksObtained: studentMarks[term].marksObtained,
            }))
        };
        dispatch(updateStudentTermMarks(studentId, fields));
    };
    useEffect(() => {
        if (statestatus === 'added') {
            setMessage('Marks updated successfully!');
            setAlertSeverity('success');
            dispatch(underStudentControl());
        } else if (statestatus === 'failed') {
            setMessage(response);
            setAlertSeverity('error');
            dispatch(underStudentControl());
        }
    }, [statestatus, response, dispatch, classID]);
    if (classError || studentError) {
        console.log(classError || studentError);
    }
    const marksColumns = [
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
        ...['TERM_1', 'TERM_2', 'TERM_3'].map(term => ({
            field: term,
            headerName: term.replace('_', ' '),
            width: 200,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        type="number"
                        size="small"
                        value={marks[params.row.id]?.[term]?.marksObtained || ''}
                        onChange={(e) => handleMarksChange(params.row.id, term, e.target.value)}
                        sx={{ width: 80 }}
                        inputProps={{ min: 0, max: 100 }}
                    />
                    <Typography sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1, minWidth: 40, textAlign: 'center' }}>
                        {marks[params.row.id]?.[term]?.grade || '-'}
                    </Typography>
                </Box>
            )
        })),
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => ( 
                <Box sx={{ display: 'flex', gap:0.5 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSave(params.row.id)}
                        disabled={studentLoading}
                    >
                        {studentLoading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                    </Button>
                </Box>
            ),
        },
    ];
    const simpleColumns = [
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
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            headerAlign: 'center',
            align: 'right',
            sortable: false,
            renderCell: (params) => (
                <Button variant="contained" onClick={() => navigate(`/teacher/class/student/${params.row.id}`)}>View</Button>
            )
        }
    ];
    const filteredStudents = Array.isArray(sclassStudents) ? sclassStudents : [];

    const studentRows = Array.isArray(filteredStudents) ? filteredStudents.map((student) => {
        return {
            rollNum: student.rollNum,
            name: student.name,
            id: student._id,
        };
    }) : [];
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
                    {/* Class Header */}
                    <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                            Class Details
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}> 
                                <Typography variant="h6" color="text.secondary">Class Information</Typography>
                                <Typography variant="body1">Class ID: {classID}</Typography>
                                <Typography variant="body1">
                                    Subject: {(() => {
                                        const teacherSubject = currentUser.teachSubject || (currentUser.teachSubjects && currentUser.teachSubjects.length === 1 ? currentUser.teachSubjects[0] : null);
                                        return teacherSubject ? (typeof teacherSubject === 'object' ? teacherSubject.subName : 'Multiple subjects') : 'No specific subject';
                                    })()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" color="text.secondary">Teacher Information</Typography>
                                <Typography variant="body1">Name: {currentUser.name}</Typography>
                                <Typography variant="body1">Email: {currentUser.email}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Students List */}
                    {getresponse ? (
                        <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No Students Found
                            </Typography>
                        </Box>
                    ) : (
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                            {message && <Alert severity={alertSeverity} sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                {marksMode ? (
                                    <>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Manage Class Marks for {currentUser.teachSubject?.subName}
                                        </Typography>
                                        <Button variant="outlined" onClick={() => setMarksMode(false)}>Back to List</Button>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Students List
                                        </Typography>
                                        {(() => {
                                            const teacherSubject = currentUser.teachSubject || (currentUser.teachSubjects && currentUser.teachSubjects.length === 1 ? currentUser.teachSubjects[0] : null);
                                            return teacherSubject ? (
                                                <Button variant="contained" onClick={() => setMarksMode(true)}>Add Marks</Button>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Marks entry not available: No specific subject assigned to this teacher for this class
                                                </Typography>
                                            );
                                        })()}
                                    </>
                                )}
                            </Box>

                            <Box sx={{ height: 400, width: '100%' }}>
                                {studentRows.length === 0 ? (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        height: '100%',
                                        textAlign: 'center',
                                        p: 4
                                    }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No students found in this class
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            This class currently has no students assigned
                                        </Typography>
                                    </Box>
                                ) : (
                                    <DataGrid
                                        rows={studentRows}
                                        columns={marksMode ? marksColumns : simpleColumns}
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
                                )}
                            </Box>
                        </Paper>
                    )}
                </>
            )}
        </Container>
    );
};

export default TeacherClassDetails;