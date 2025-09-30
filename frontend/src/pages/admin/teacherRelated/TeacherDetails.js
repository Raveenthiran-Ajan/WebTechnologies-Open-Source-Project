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
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) {
        console.log(error);
    }

    // Support both new multi-assignment structure and old single assignment
    const teachingClasses = teacherDetails?.teachSclasses || [teacherDetails?.teachSclass].filter(Boolean);
    const teachingSubjects = teacherDetails?.teachSubjects || [teacherDetails?.teachSubject].filter(Boolean);
    const attendanceClass = teacherDetails?.attendanceClass || teacherDetails?.teachSclass;
    
    const hasMultipleAssignments = teachingClasses?.length > 0 || teachingSubjects?.length > 0;
    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName || teachingSubjects?.length > 0;

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    const handleEditAssignments = () => {
        // Navigate to dedicated edit assignments page
        navigate(`/Admin/teachers/edit-assignments/${teacherDetails._id}`);
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Container maxWidth="md" sx={{ mt: 2 }}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h4" align="center" gutterBottom>
                            Teacher Details
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Name:</strong> {teacherDetails?.name}
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Email:</strong> {teacherDetails?.email}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            
                            {/* Teaching Classes */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Teaching Classes:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
                            </Grid>
                            
                            {/* Teaching Subjects */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Teaching Subjects:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {teachingSubjects && teachingSubjects.length > 0 ? (
                                        teachingSubjects.map((subject, index) => (
                                            <Chip 
                                                key={subject._id || index} 
                                                label={`${subject.subName} (${subject.sessions} sessions)`} 
                                                color="secondary" 
                                                variant="outlined" 
                                            />
                                        ))
                                    ) : teacherDetails?.teachSubject ? (
                                        <Chip 
                                            label={`${teacherDetails.teachSubject.subName} (${teacherDetails.teachSubject.sessions} sessions)`} 
                                            color="secondary" 
                                            variant="outlined" 
                                        />
                                    ) : (
                                        <Typography color="text.secondary">No subjects assigned</Typography>
                                    )}
                                </Box>
                            </Grid>
                            
                            {/* Attendance Class */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Attendance Responsibility:</strong>
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    {attendanceClass ? (
                                        <Chip 
                                            label={attendanceClass.sclassName} 
                                            color="success" 
                                            variant="filled"
                                            sx={{ fontSize: '1.1em', p: 1 }}
                                        />
                                    ) : (
                                        <Typography color="text.secondary">No attendance class assigned</Typography>
                                    )}
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    {hasMultipleAssignments ? (
                                        <Button variant="contained" color="primary" onClick={handleEditAssignments}>
                                            Edit Assignments
                                        </Button>
                                    ) : !isSubjectNamePresent ? (
                                        <Button variant="contained" onClick={handleAddSubject}>
                                            Add Subject
                                        </Button>
                                    ) : null}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default TeacherDetails;