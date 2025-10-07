import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Typography, Paper, Box, Chip, Divider, Grid } from '@mui/material';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        console.log("TeacherDetails component mounted with ID:", teacherID);
        if (teacherID) {
            dispatch(getTeacherDetails(teacherID));
        } else {
            console.error("No teacher ID provided in params");
        }
    }, [dispatch, teacherID]);

    useEffect(() => {
        console.log("Teacher details state updated:", { loading, teacherDetails, error });
    }, [loading, teacherDetails, error]);

    if (error) {
        console.error("Error loading teacher details:", error);
        return (
            <Container maxWidth="md">
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                    <Typography variant="h6" color="error" align="center">
                        Error loading teacher details: {error.message || 'Unknown error'}
                    </Typography>
                    <Button onClick={() => navigate('/Admin/teachers')} sx={{ mt: 2 }}>
                        Back to Teachers
                    </Button>
                </Box>
            </Container>
        );
    }

    // Support both new multi-assignment structure and old single assignment
    const teachingClasses = teacherDetails?.teachSclasses || [teacherDetails?.teachSclass].filter(Boolean);
    const teachingSubjects = teacherDetails?.teachSubjects || [teacherDetails?.teachSubject].filter(Boolean);
    const attendanceClass = teacherDetails?.attendanceClass || null;
    
    const hasMultipleAssignments = teachingClasses?.length > 0 || teachingSubjects?.length > 0;
    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName || teachingSubjects?.length > 0;

    const handleAddSubject = () => {
        // Navigate to the edit assignments page
        navigate(`/Admin/teachers/edit-assignments/${teacherDetails._id}`);
    };

    const handleEditAssignments = () => {
        // Navigate to dedicated edit assignments page
        navigate(`/Admin/teachers/edit-assignments/${teacherDetails._id}`);
    };

    return (
        <>
            {loading ? (
                <Container maxWidth="md">
                    <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Loading teacher details...</Typography>
                    </Box>
                </Container>
            ) : !teacherDetails ? (
                <Container maxWidth="md">
                    <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                        <Typography variant="h6" color="warning.main" align="center">
                            No teacher details found
                        </Typography>
                        <Button onClick={() => navigate('/Admin/teachers')} sx={{ mt: 2 }}>
                            Back to Teachers
                        </Button>
                    </Box>
                </Container>
            ) : (
                <Container maxWidth="md">
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                        <Typography variant="h5" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                            Teacher Details
                        </Typography>
                        
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom color="text.secondary">
                                Personal Information
                            </Typography>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {teacherDetails?.name}
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {teacherDetails?.email}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            {/* Teaching Information */}
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    Teaching Information
                                </Typography>
                                
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Teaching Classes
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                        {teachingClasses && teachingClasses.length > 0 ? (
                                            teachingClasses.map((sclass, index) => (
                                                <Chip 
                                                    key={sclass._id || index} 
                                                    label={sclass.sclassName} 
                                                    color="primary" 
                                                    variant="outlined" 
                                                />
                                            ))
                                        ) : teacherDetails?.teachSclass ? (
                                            <Chip 
                                                label={teacherDetails.teachSclass.sclassName} 
                                                color="primary" 
                                                variant="outlined" 
                                            />
                                        ) : (
                                            <Typography color="text.secondary">No classes assigned</Typography>
                                        )}
                                    </Box>
                                    
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Teaching Subjects
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                        {teachingSubjects && teachingSubjects.length > 0 ? (
                                            teachingSubjects.map((subject, index) => (
                                                <Chip 
                                                    key={subject._id || index} 
                                                    label={`${subject.subName} (${subject.periodsPerWeek} periods per week)`} 
                                                    color="secondary" 
                                                    variant="outlined" 
                                                />
                                            ))
                                        ) : teacherDetails?.teachSubject ? (
                                            <Chip 
                                                label={`${teacherDetails.teachSubject.subName} (${teacherDetails.teachSubject.periodsPerWeek} periods per week)`} 
                                                color="secondary" 
                                                variant="outlined" 
                                            />
                                        ) : (
                                            <Typography color="text.secondary">No subjects assigned</Typography>
                                        )}
                                    </Box>
                                    
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Teaching Classes
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                        {teacherDetails?.teachSclasses && teacherDetails.teachSclasses.length > 0 ? (
                                            teacherDetails.teachSclasses.map((sclass, index) => (
                                                <Chip 
                                                    key={sclass._id || index} 
                                                    label={sclass.sclassName || 'Unknown'} 
                                                    color="info" 
                                                    variant="outlined" 
                                                />
                                            ))
                                        ) : (
                                            <Typography color="text.secondary">No classes assigned</Typography>
                                        )}
                                    </Box>
                                    
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Attendance Class
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                        {teacherDetails?.attendanceClass ? (
                                            <Chip 
                                                label={teacherDetails.attendanceClass.sclassName || 'Unknown'} 
                                                color="success" 
                                                variant="filled" 
                                            />
                                        ) : (
                                            <Typography color="text.secondary">No attendance class assigned</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                            
                            {/* Actions Section */}
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    Actions
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                                    {hasMultipleAssignments ? (
                                        <Button variant="contained" color="primary" onClick={handleEditAssignments}>
                                            Edit Assignments
                                        </Button>
                                    ) : !isSubjectNamePresent ? (
                                        <Button variant="contained" color="primary" onClick={handleAddSubject}>
                                            Add Subject
                                        </Button>
                                    ) : null}
                                    
                                    <Button 
                                        variant="contained" 
                                        color="secondary"
                                        onClick={() => navigate(`/Admin/teachers/teacher/timetable/${teacherDetails?._id}`)}
                                    >
                                        View Timetable
                                    </Button>
                                    <Button variant="outlined" onClick={() => navigate(-1)}>
                                        Go Back
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default TeacherDetails;