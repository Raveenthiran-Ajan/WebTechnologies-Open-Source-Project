import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacherDetails, updateTeacherBulkAssignments, updateTeacherAttendance } from '../../../redux/teacherRelated/teacherHandle';
import { getAllSclasses, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import {
    Container,
    Paper,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Button,
    Grid,
    Divider,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    OutlinedInput,
    ListItemText
} from '@mui/material';
import Popup from '../../../components/Popup';

const EditTeacherAssignments = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const { teacherDetails, loading } = useSelector((state) => state.teacher);
    const { sclassesList, subjectsList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    const [selectedClassesMulti, setSelectedClassesMulti] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    // Attendance duty state
    const [attendanceMode, setAttendanceMode] = useState('none'); // 'none' | 'class'
    const [attendanceClassId, setAttendanceClassId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getTeacherDetails(id));
    }, [dispatch, id]);

    // Load classes and subjects using the teacher's school ID
    useEffect(() => {
        const schoolId = teacherDetails?.school && (typeof teacherDetails.school === 'object' ? teacherDetails.school._id : teacherDetails.school);
        if (schoolId) {
            dispatch(getAllSclasses(schoolId, "Sclass"));
            dispatch(getSubjectList(schoolId, "AllSubjects"));
        }
    }, [dispatch, teacherDetails?.school]);

    useEffect(() => {
        if (teacherDetails) {
            // Initialize with current assignments
            const currentClasses = teacherDetails.teachSclasses || [teacherDetails.teachSclass].filter(Boolean);
            const currentSubjects = teacherDetails.teachSubjects || [teacherDetails.teachSubject].filter(Boolean);

            setSelectedClassesMulti(currentClasses.map(c => c._id));
            setSelectedSubjects(currentSubjects.map(s => s._id));

            // Seed attendance duty
            if (teacherDetails.attendanceClass) {
                setAttendanceMode('class');
                setAttendanceClassId(teacherDetails.attendanceClass._id || teacherDetails.attendanceClass);
            } else {
                setAttendanceMode('none');
                setAttendanceClassId(null);
            }
        }
    }, [teacherDetails]);

    // Compute available subjects across selected classes
    useEffect(() => {
        if (Array.isArray(selectedClassesMulti) && selectedClassesMulti.length > 0 && Array.isArray(subjectsList)) {
            const subs = subjectsList.filter(sub => selectedClassesMulti.includes(sub.sclassName?._id));
            setAvailableSubjects(subs);
        } else {
            setAvailableSubjects([]);
        }
    }, [selectedClassesMulti, subjectsList]);

    // removed per-class subject filtering; now computed from all selected classes

    const handleMultiClassesChange = (event) => {
        const value = event.target.value;
        const newSelected = typeof value === 'string' ? value.split(',') : value;
        setSelectedClassesMulti(newSelected);
    };

    const handleSubjectChange = (event) => {
        const value = event.target.value;
        setSelectedSubjects(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSaveAssignments = async () => {
        if (!selectedClassesMulti || selectedClassesMulti.length === 0) {
            setMessage("Please select at least one class");
            setShowPopup(true);
            return;
        }

        if (selectedSubjects.length === 0) {
            setMessage("Please select at least one subject");
            setShowPopup(true);
            return;
        }

        setLoader(true);
        try {
            await dispatch(updateTeacherBulkAssignments(
                id,
                selectedClassesMulti,
                selectedSubjects
            ));
            
            setMessage("Teacher assignments updated successfully!");
            setShowPopup(true);
            // Refresh teacher details so the current assignments block reflects updates immediately
            await dispatch(getTeacherDetails(id));
            
            setTimeout(() => {
                navigate(-1); // Go back to previous page
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Error updating assignments. Please try again.");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Edit Teacher Assignments
                </Typography>
                
                {teacherDetails && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="h6">
                            <strong>Teacher:</strong> {teacherDetails.name}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Email:</strong> {teacherDetails.email}
                        </Typography>
                    </Box>
                )}

                <Grid container spacing={3}>
                    {/* Current Assignments Display */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Current Assignments
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Teaching Classes:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(teacherDetails?.teachSclasses || [teacherDetails?.teachSclass].filter(Boolean)).map((sclass, index) => (
                                    <Chip 
                                        key={sclass?._id || index} 
                                        label={sclass?.sclassName || 'Unknown'} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined" 
                                    />
                                ))}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Teaching Subjects:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(teacherDetails?.teachSubjects || [teacherDetails?.teachSubject].filter(Boolean)).map((subject, index) => (
                                    <Chip 
                                        key={subject?._id || index} 
                                        label={subject?.subName || 'Unknown'} 
                                        size="small" 
                                        color="secondary" 
                                        variant="outlined" 
                                    />
                                ))}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Attendance Duty:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {teacherDetails?.attendanceClass ? (
                                    <Chip 
                                        label={`Class-wide (${teacherDetails.attendanceClass?.sclassName || 'Unknown'})`} 
                                        size="small" 
                                        color="success" 
                                        variant="filled" 
                                    />
                                ) : (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        No attendance duty assigned
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    {/* Edit Form */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Edit Assignments
                        </Typography>
                        
                        {/* Step 0: Select Multiple Classes for Teacher */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Teaching Classes (Multiple Allowed)
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Classes</InputLabel>
                                <Select
                                    multiple
                                    value={selectedClassesMulti}
                                    onChange={handleMultiClassesChange}
                                    input={<OutlinedInput label="Classes" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const sclass = sclassesList.find(s => s._id === value);
                                                return (
                                                    <Chip key={value} label={sclass ? sclass.sclassName : value} size="small" />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {sclassesList.map((sclass) => (
                                        <MenuItem key={sclass._id} value={sclass._id}>
                                            <Checkbox checked={selectedClassesMulti.indexOf(sclass._id) > -1} />
                                            <ListItemText primary={sclass.sclassName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* No separate save; classes will be saved with the bulk Save Assignments button */}
                        </Box>

                        {/* Step 1: Select Subjects across selected classes */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Teaching Subjects</InputLabel>
                            <Select
                                multiple
                                value={selectedSubjects}
                                onChange={handleSubjectChange}
                                label="Teaching Subjects"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const subject = availableSubjects.find(s => s._id === value);
                                            return (
                                                <Chip key={value} label={subject?.subName || value} size="small" />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {availableSubjects.map((subject) => (
                                    <MenuItem key={subject._id} value={subject._id}>
                                        {subject.subName} ({subject.sclassName?.sclassName || 'Class'})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* Attendance Duty Editor */}
                        <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>Attendance Duty</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={attendanceMode === 'none'} onChange={() => { setAttendanceMode('none'); setAttendanceClassId(null); }} />}
                                    label="No attendance duty"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={attendanceMode === 'class'} onChange={() => { setAttendanceMode('class'); }} />}
                                    label="Whole class attendance"
                                />
                            </Box>

                            {attendanceMode === 'class' && (
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Attendance Class</InputLabel>
                                    <Select
                                        value={attendanceClassId || ''}
                                        onChange={(e) => setAttendanceClassId(e.target.value)}
                                        label="Attendance Class"
                                    >
                                        {(sclassesList || [])
                                            .filter(s => selectedClassesMulti.includes(s._id))
                                            .map((sclass) => (
                                                <MenuItem key={sclass._id} value={sclass._id}>
                                                    {sclass.sclassName}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={async () => {
                                        setLoader(true);
                                        try {
                                            const attClassId = attendanceMode === 'class' ? attendanceClassId : null;
                                            await dispatch(updateTeacherAttendance(id, attClassId));
                                            setMessage('Attendance duty updated');
                                            setShowPopup(true);
                                            await dispatch(getTeacherDetails(id));
                                        } catch (e) {
                                            setMessage('Failed to update attendance duty');
                                            setShowPopup(true);
                                        } finally {
                                            setLoader(false);
                                        }
                                    }}
                                >
                                    Save Attendance Duty
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            
                            {loader ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveAssignments}
                                >
                                    Save Assignments
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default EditTeacherAssignments;