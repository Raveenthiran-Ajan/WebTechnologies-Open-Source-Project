import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacherDetails, updateTeacherAssignments } from '../../../redux/teacherRelated/teacherHandle';
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
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTeachingSections, setSelectedTeachingSections] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedAttendanceSections, setSelectedAttendanceSections] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
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
            
            // For editing, we take the first class (assuming single class assignment for simplicity)
            // If teacher has multiple classes, we'll show the first one and allow changing
            const primaryClass = currentClasses.length > 0 ? currentClasses[0]._id : '';
            
            setSelectedClass(primaryClass);
            setSelectedSubjects(currentSubjects.map(s => s._id));
            setSelectedTeachingSections(teacherDetails.teachSections ? teacherDetails.teachSections.map(s => s.sectionId) : []);
            setSelectedAttendanceSections(teacherDetails.attendanceSections ? teacherDetails.attendanceSections.map(s => s.sectionId) : []);
        }
    }, [teacherDetails]);

    useEffect(() => {
        // Get available sections for the selected class
        if (selectedClass && sclassesList && sclassesList.length > 0) {
            const sclass = sclassesList.find(c => c._id === selectedClass);
            if (sclass && sclass.sections) {
                const sections = sclass.sections.map(section => ({
                    _id: section._id,
                    sectionName: section.sectionName,
                    classId: selectedClass,
                    className: sclass.sclassName
                }));
                setAvailableSections(sections);
            } else {
                setAvailableSections([]);
            }
        } else {
            setAvailableSections([]);
        }
    }, [selectedClass, sclassesList]);

    useEffect(() => {
        // Get available subjects for the selected class
        if (selectedClass && subjectsList && subjectsList.length > 0) {
            const subjects = subjectsList.filter(subject => 
                subject.sclassName?._id === selectedClass
            );
            setAvailableSubjects(subjects);
        } else {
            setAvailableSubjects([]);
        }
    }, [selectedClass, subjectsList]);

    const handleClassChange = (event) => {
        const newClassId = event.target.value;
        setSelectedClass(newClassId);
        // Reset dependent selections when class changes
        setSelectedTeachingSections([]);
        setSelectedSubjects([]);
        setSelectedAttendanceSections([]);
    };

    const handleTeachingSectionsChange = (event) => {
        const value = event.target.value;
        setSelectedTeachingSections(typeof value === 'string' ? value.split(',') : value);
        // Reset attendance sections if they're not in the new teaching sections
        setSelectedAttendanceSections(prev => 
            prev.filter(sectionId => value.includes(sectionId))
        );
    };

    const handleSubjectChange = (event) => {
        const value = event.target.value;
        setSelectedSubjects(typeof value === 'string' ? value.split(',') : value);
    };

    const handleAttendanceSectionsChange = (event) => {
        const value = event.target.value;
        setSelectedAttendanceSections(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSaveAssignments = async () => {
        if (!selectedClass) {
            setMessage("Please select a class");
            setShowPopup(true);
            return;
        }

        if (selectedTeachingSections.length === 0) {
            setMessage("Please select at least one teaching section");
            setShowPopup(true);
            return;
        }

        if (selectedSubjects.length === 0) {
            setMessage("Please select at least one subject");
            setShowPopup(true);
            return;
        }

        // Validate that attendance sections are subset of teaching sections (only if attendance sections are selected)
        if (selectedAttendanceSections.length > 0) {
            const invalidAttendanceSections = selectedAttendanceSections.filter(sectionId => 
                !selectedTeachingSections.includes(sectionId)
            );
            if (invalidAttendanceSections.length > 0) {
                setMessage("Attendance sections must be a subset of teaching sections");
                setShowPopup(true);
                return;
            }
        }

        setLoader(true);
        try {
            const response = await dispatch(updateTeacherAssignments(
                id, 
                selectedSubjects, 
                selectedTeachingSections, 
                selectedAttendanceSections,
                selectedClass
            ));
            
            setMessage("Teacher assignments updated successfully!");
            setShowPopup(true);
            
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
                                Teaching Sections:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(teacherDetails?.teachSections || []).map((section, index) => (
                                    <Chip 
                                        key={section.sectionId || index} 
                                        label={`${section.sectionName} (${section.sclassName?.sclassName || 'Unknown'})`} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined" 
                                    />
                                ))}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Attendance Sections:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(teacherDetails?.attendanceSections || []).map((section, index) => (
                                    <Chip 
                                        key={section.sectionId || index} 
                                        label={`${section.sectionName} (${section.sclassName?.sclassName || 'Unknown'})`} 
                                        size="small" 
                                        color="success" 
                                        variant="filled" 
                                    />
                                ))}
                                {(teacherDetails?.attendanceSections || []).length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        No attendance sections assigned
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
                        
                        {/* Step 1: Select Class */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                value={selectedClass}
                                onChange={handleClassChange}
                                label="Select Class"
                            >
                                {sclassesList.map((sclass) => (
                                    <MenuItem key={sclass._id} value={sclass._id}>
                                        {sclass.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Step 2: Select Teaching Sections */}
                        {selectedClass && (
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Teaching Sections</InputLabel>
                                <Select
                                    multiple
                                    value={selectedTeachingSections}
                                    onChange={handleTeachingSectionsChange}
                                    label="Teaching Sections"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const section = availableSections.find(s => s._id === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={section ? section.sectionName : value} 
                                                        size="small" 
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {availableSections.map((section) => (
                                        <MenuItem key={section._id} value={section._id}>
                                            {section.sectionName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Step 3: Select Subjects */}
                        {selectedClass && (
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
                                            {subject.subName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Step 4: Attendance Sections (Optional) */}
                        {selectedClass && selectedTeachingSections.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Attendance Responsibility (Optional)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Select which sections this teacher should take attendance for. Leave empty if no attendance duty is required.
                                </Typography>

                                <FormControl fullWidth>
                                    <InputLabel>Attendance Sections</InputLabel>
                                    <Select
                                        multiple
                                        value={selectedAttendanceSections}
                                        onChange={handleAttendanceSectionsChange}
                                        label="Attendance Sections"
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.length === 0 ? (
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                        No attendance duty assigned
                                                    </Typography>
                                                ) : (
                                                    selected.map((value) => {
                                                        const section = availableSections.find(s => s._id === value);
                                                        return (
                                                            <Chip
                                                                key={value}
                                                                label={section ? section.sectionName : value}
                                                                size="small"
                                                                color="success"
                                                            />
                                                        );
                                                    })
                                                )}
                                            </Box>
                                        )}
                                    >
                                        {availableSections
                                            .filter(section => selectedTeachingSections.includes(section._id))
                                            .map((section) => (
                                                <MenuItem key={section._id} value={section._id}>
                                                    <Checkbox checked={selectedAttendanceSections.indexOf(section._id) > -1} />
                                                    <ListItemText primary={section.sectionName} />
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}
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