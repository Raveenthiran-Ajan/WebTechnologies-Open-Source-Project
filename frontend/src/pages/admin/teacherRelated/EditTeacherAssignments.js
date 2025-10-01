import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacherDetails, assignMultipleSubjects } from '../../../redux/teacherRelated/teacherHandle';
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
    CircularProgress
} from '@mui/material';
import Popup from '../../../components/Popup';

const EditTeacherAssignments = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const { teacherDetails, loading } = useSelector((state) => state.teacher);
    const { sclassesList, subjectsList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [attendanceClass, setAttendanceClass] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getTeacherDetails(id));
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [dispatch, id, currentUser._id]);

    useEffect(() => {
        if (teacherDetails) {
            // Initialize with current assignments
            const currentClasses = teacherDetails.teachSclasses || [teacherDetails.teachSclass].filter(Boolean);
            const currentSubjects = teacherDetails.teachSubjects || [teacherDetails.teachSubject].filter(Boolean);
            const currentAttendanceClass = teacherDetails.attendanceClass || teacherDetails.teachSclass;
            
            setSelectedClasses(currentClasses.map(c => c._id));
            setSelectedSubjects(currentSubjects.map(s => s._id));
            setAttendanceClass(currentAttendanceClass?._id || '');
        }
    }, [teacherDetails]);

    useEffect(() => {
        console.log('Subjects from Redux:', subjectsList);
        console.log('Selected classes:', selectedClasses);
        
        if (selectedClasses.length > 0 && subjectsList && subjectsList.length > 0) {
            // Get subjects that belong to selected classes
            const subjects = subjectsList.filter(subject => {
                const belongsToClass = selectedClasses.includes(subject.sclassName?._id);
                console.log(`Subject ${subject.subName} belongs to selected class:`, belongsToClass);
                return belongsToClass;
            });
            console.log('Filtered subjects:', subjects);
            setAvailableSubjects(subjects);
        } else if (subjectsList && subjectsList.length > 0) {
            // If no classes selected, show all subjects
            console.log('Using all subjects:', subjectsList);
            setAvailableSubjects(subjectsList);
        }
    }, [selectedClasses, subjectsList]);

    const handleClassChange = (event) => {
        const value = event.target.value;
        setSelectedClasses(typeof value === 'string' ? value.split(',') : value);
        // Reset subjects when classes change
        setSelectedSubjects([]);
    };

    const handleSubjectChange = (event) => {
        const value = event.target.value;
        setSelectedSubjects(typeof value === 'string' ? value.split(',') : value);
    };

    const handleAttendanceClassChange = (event) => {
        setAttendanceClass(event.target.value);
    };

    const handleSaveAssignments = async () => {
        if (selectedClasses.length === 0) {
            setMessage("Please select at least one class");
            setShowPopup(true);
            return;
        }

        if (selectedSubjects.length === 0) {
            setMessage("Please select at least one subject");
            setShowPopup(true);
            return;
        }

        if (!attendanceClass) {
            setMessage("Please select an attendance class");
            setShowPopup(true);
            return;
        }

        setLoader(true);
        try {
            await dispatch(assignMultipleSubjects(id, selectedSubjects, attendanceClass));
            setMessage("Teacher assignments updated successfully!");
            setShowPopup(true);
            
            setTimeout(() => {
                navigate(-1); // Go back to previous page
            }, 2000);
        } catch (error) {
            setMessage("Error updating assignments. Please try again.");
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
                                Attendance Class:
                            </Typography>
                            <Chip 
                                label={(teacherDetails?.attendanceClass || teacherDetails?.teachSclass)?.sclassName || 'Not assigned'} 
                                size="small" 
                                color="success" 
                                variant="filled" 
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    {/* Edit Form */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Edit Assignments
                        </Typography>
                        
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Teaching Classes</InputLabel>
                            <Select
                                multiple
                                value={selectedClasses}
                                onChange={handleClassChange}
                                label="Teaching Classes"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const sclass = sclassesList.find(c => c._id === value);
                                            return (
                                                <Chip key={value} label={sclass?.sclassName || value} size="small" />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {sclassesList.map((sclass) => (
                                    <MenuItem key={sclass._id} value={sclass._id}>
                                        {sclass.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                                        {subject.subName} ({subject.sclassName?.sclassName || 'Unknown Class'})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Attendance Class</InputLabel>
                            <Select
                                value={attendanceClass}
                                onChange={handleAttendanceClassChange}
                                label="Attendance Class"
                            >
                                {selectedClasses.map((classId) => {
                                    const sclass = sclassesList.find(c => c._id === classId);
                                    return (
                                        <MenuItem key={classId} value={classId}>
                                            {sclass?.sclassName}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
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