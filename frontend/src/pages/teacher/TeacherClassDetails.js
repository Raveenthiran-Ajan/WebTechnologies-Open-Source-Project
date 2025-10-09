import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, Container, Button, TextField, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { updateStudentTermMarks } from '../../redux/studentRelated/studentHandle';
import { underStudentControl } from '../../redux/studentRelated/studentSlice';
import { getTeacherDetails } from '../../redux/teacherRelated/teacherHandle';
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
    const { teacherDetails } = useSelector((state) => state.teacher);

    const [marks, setMarks] = useState({});
    const [message, setMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [marksMode, setMarksMode] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    // Use classId from params if available, otherwise fallback to current user's class
    const classID = classId || currentUser.teachSclass?._id;

    // Ensure we have fresh teacher details (contains teachAssignments)
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getTeacherDetails(currentUser._id));
        }
    }, [dispatch, currentUser?._id]);

    // All subjects this teacher teaches for the current class (prefer teachAssignments)
    const subjectsForClass = useMemo(() => {
        if (!classID) return [];

        // Prefer new mapping pairs
        const assignments = teacherDetails?.teachAssignments || currentUser?.teachAssignments || [];
        const list = assignments
            .filter(a => {
                const sId = typeof a.sclass === 'object' ? a.sclass._id : a.sclass;
                return sId === classID;
            })
            .map(a => a.subject)
            .filter(Boolean);

        if (list.length) return list;

        // Backwards compatibility fallbacks
        if (currentUser.teachSubject) return [currentUser.teachSubject];

        if (currentUser.teachSubjects && Array.isArray(currentUser.teachSubjects)) {
            const found = currentUser.teachSubjects.filter(subject => {
                if (subject.sclass && Array.isArray(subject.sclass)) {
                    return subject.sclass.some(sclass => sclass._id === classID || sclass === classID);
                }
                return subject.sclass === classID || subject.sclass?._id === classID;
            });
            return found;
        }

        return [];
    }, [teacherDetails?.teachAssignments, currentUser?.teachAssignments, currentUser?.teachSubject, currentUser?.teachSubjects, classID]);

    // Currently selected subject for marks entry
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Keep selectedSubject in sync with available subjects
    useEffect(() => {
        if (!selectedSubject && subjectsForClass.length > 0) {
            setSelectedSubject(subjectsForClass[0]);
        } else if (selectedSubject) {
            const exists = subjectsForClass.some(s => (typeof s === 'object' ? s._id : s) === (typeof selectedSubject === 'object' ? selectedSubject._id : selectedSubject));
            if (!exists) setSelectedSubject(subjectsForClass[0] || null);
        }
    }, [subjectsForClass, selectedSubject]);

    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, classID]);

    useEffect(() => {
        if (sclassStudents && sclassStudents.length > 0 && selectedSubject) {
            const initialMarks = {};
            sclassStudents.forEach(student => {
                const subjectId = typeof selectedSubject === 'object' ? selectedSubject._id : selectedSubject;
                const getMarkForTerm = (term) => student.examResult?.find(res => res.subName?._id === subjectId && res.term === term);
                initialMarks[student._id] = {
                    TERM_1: { grade: getMarkForTerm('TERM_1')?.grade || '', marksObtained: getMarkForTerm('TERM_1')?.marksObtained ?? '' },
                    TERM_2: { grade: getMarkForTerm('TERM_2')?.grade || '', marksObtained: getMarkForTerm('TERM_2')?.marksObtained ?? '' },
                    TERM_3: { grade: getMarkForTerm('TERM_3')?.grade || '', marksObtained: getMarkForTerm('TERM_3')?.marksObtained ?? '' },
                };
            });
            setMarks(initialMarks);
        }
    }, [sclassStudents, selectedSubject]);
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
        const subjectId = selectedSubject ? (typeof selectedSubject === 'object' ? selectedSubject._id : selectedSubject) : null;
        
        if (!subjectId) {
            setMessage('Cannot save marks: No specific subject selected for this class');
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                                {marksMode ? (
                                    <>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Add Marks for {(typeof selectedSubject === 'object' ? selectedSubject?.subName : '') || 'Subject'}
                                        </Typography>
                                        {subjectsForClass.length > 1 && (
                                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                                <InputLabel id="subject-select-label">Subject</InputLabel>
                                                <Select
                                                    labelId="subject-select-label"
                                                    label="Subject"
                                                    value={selectedSubject ? (typeof selectedSubject === 'object' ? selectedSubject._id : selectedSubject) : ''}
                                                    onChange={(e) => {
                                                        const newSel = subjectsForClass.find(s => (typeof s === 'object' ? s._id : s) === e.target.value);
                                                        setSelectedSubject(newSel || null);
                                                    }}
                                                >
                                                    {subjectsForClass.map((s) => (
                                                        <MenuItem key={(typeof s === 'object' ? s._id : s)} value={(typeof s === 'object' ? s._id : s)}>
                                                            {typeof s === 'object' ? s.subName : s}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                        <Button variant="outlined" onClick={() => setMarksMode(false)}>Back to List</Button>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Students List
                                        </Typography>
                                        {subjectsForClass.length > 0 ? (
                                            <Button variant="contained" onClick={() => setMarksMode(true)}>
                                                Add Marks{subjectsForClass.length > 1 ? ' (select subject next)' : ''}
                                            </Button>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Marks entry not available: No subject assigned to this teacher for this class
                                            </Typography>
                                        )}
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