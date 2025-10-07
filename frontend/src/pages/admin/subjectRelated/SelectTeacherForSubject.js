import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllTeachers, updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import {
    Box,
    Typography,
    Container,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Grid
} from '@mui/material';
import Popup from '../../../components/Popup';

const SelectTeacherForSubject = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { subjectId } = useParams();
    
    const { teachersList, loading: teachersLoading } = useSelector((state) => state.teacher);
    const { subjectDetails, loading: subjectLoading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
        dispatch(getSubjectDetails(subjectId, "Subject"));
    }, [dispatch, currentUser._id, subjectId]);

    useEffect(() => {
        if (teachersList) {
            // Show all teachers (no class filtering)
            setAvailableTeachers(teachersList);
        }
    }, [teachersList]);

    const handleTeacherChange = (event) => {
        setSelectedTeacher(event.target.value);
    };

    const handleAssignTeacher = async () => {
        if (!selectedTeacher) {
            setMessage("Please select a teacher");
            setShowPopup(true);
            return;
        }

        setLoader(true);
        
        try {
            // Make API call to assign the teacher to the subject
            await dispatch(updateTeachSubject(selectedTeacher, subjectId));
            setMessage("Teacher assigned successfully!");
            setShowPopup(true);
            
            setTimeout(() => {
                navigate(-1); // Go back to previous page
            }, 2000);
        } catch (error) {
            setMessage("Error assigning teacher. Please try again.");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    const handleAddNewTeacher = () => {
        navigate(`/Admin/teachers/addteacher/${subjectId}`);
    };

    if (teachersLoading || subjectLoading) {
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
                    Assign Teacher to Subject
                </Typography>
                
                {subjectDetails && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            <strong>Subject:</strong> {subjectDetails.subName}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Class:</strong> {subjectDetails.sclassName?.sclassName}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Periods Per Week:</strong> {subjectDetails.periodsPerWeek}
                        </Typography>
                        {subjectDetails.teacher && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                This subject is currently assigned to: <strong>{subjectDetails.teacher.name}</strong>
                            </Alert>
                        )}
                    </Box>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Select Existing Teacher
                        </Typography>
                        
                        {availableTeachers.length > 0 ? (
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Available Teachers</InputLabel>
                                <Select
                                    value={selectedTeacher}
                                    onChange={handleTeacherChange}
                                    label="Available Teachers"
                                >
                                    {availableTeachers.map((teacher) => (
                                        <MenuItem key={teacher._id} value={teacher._id}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <Typography variant="body1">
                                                    {teacher.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                    {teacher.teachSubjects && teacher.teachSubjects.length > 0 ? (
                                                        teacher.teachSubjects.map((subject, index) => (
                                                            <Chip 
                                                                key={index} 
                                                                label={subject.subName} 
                                                                size="small" 
                                                                color="secondary" 
                                                                variant="outlined" 
                                                            />
                                                        ))
                                                    ) : teacher.teachSubject ? (
                                                        <Chip 
                                                            label={teacher.teachSubject.subName} 
                                                            size="small" 
                                                            color="secondary" 
                                                            variant="outlined" 
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            No subjects assigned
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                No teachers found. You can add a new teacher below.
                            </Alert>
                        )}
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            
                            {availableTeachers.length > 0 && (
                                <>
                                    {loader ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleAssignTeacher}
                                            disabled={!selectedTeacher}
                                            sx={{ mr: 2 }}
                                        >
                                            Assign Selected Teacher
                                        </Button>
                                    )}
                                </>
                            )}
                            
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleAddNewTeacher}
                            >
                                Add New Teacher
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default SelectTeacherForSubject;