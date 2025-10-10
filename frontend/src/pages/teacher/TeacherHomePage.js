import { Container, Grid, Paper, Typography,Box, Button } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";
import { getClassStudents, getSubjectDetails, getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getTeacherDetails } from '../../redux/teacherRelated/teacherHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import TeacherTimetable from './TeacherTimetable';

const TeacherHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents, sclassesList } = useSelector((state) => state.sclass);
    const { teacherDetails } = useSelector((state) => state.teacher);

    // Use teacherDetails if available, otherwise fall back to currentUser
    const teacherData = teacherDetails || currentUser;

    // Get teaching classes (multiple classes)
    const teachingClasses = teacherData?.teachSclasses || [];
    
    // Get attendance class (single class)
    const attendanceClass = teacherData?.attendanceClass;

    useEffect(() => {
        // Fetch teacher details to get class information
        if (currentUser?._id) {
            dispatch(getTeacherDetails(currentUser._id));
            // Fetch all classes to get proper class names
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [dispatch, currentUser?._id]);

    // Calculate totals from classes
    const totalTeachingClasses = teachingClasses.length;
    const totalSubjects = teacherData?.teachSubjects?.length || 0;

    return (
        <Container maxWidth="lg">
            {/* Teacher Information Section */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                    Teacher Dashboard
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        Welcome, {currentUser?.name}
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Teaching Classes
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                {teachingClasses.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {teachingClasses.slice(0, 3).map((sclass, index) => {
                                            // Handle both populated object and ID cases for class name
                                            let classDisplayName = 'Unknown';
                                            if (sclass) {
                                                if (typeof sclass === 'object' && sclass.sclassName) {
                                                    classDisplayName = sclass.sclassName;
                                                } else if (typeof sclass === 'string') {
                                                    const classInfo = sclassesList?.find(c => c._id === sclass);
                                                    if (classInfo) {
                                                        classDisplayName = classInfo.sclassName;
                                                    }
                                                }
                                            }
                                            return (
                                                <Typography key={index} variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    • {classDisplayName}
                                                </Typography>
                                            );
                                        })}
                                        {teachingClasses.length > 3 && (
                                            <Typography variant="body2" color="text.secondary">
                                                +{teachingClasses.length - 3} more classes
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No classes assigned
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Teaching Subjects
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                {teacherData?.teachSubjects?.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {teacherData.teachSubjects.slice(0, 3).map((subject, index) => (
                                            <Typography key={index} variant="body2" sx={{ fontWeight: 'medium' }}>
                                                • {subject.subName}
                                            </Typography>
                                        ))}
                                        {teacherData.teachSubjects.length > 3 && (
                                            <Typography variant="body2" color="text.secondary">
                                                +{teacherData.teachSubjects.length - 3} more subjects
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No subjects assigned
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                School
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {currentUser?.school?.schoolName || 'SMS'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Attendance Class
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                {attendanceClass ? (
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {typeof attendanceClass === 'object' && attendanceClass.sclassName
                                            ? attendanceClass.sclassName
                                            : (typeof attendanceClass === 'string'
                                                ? (sclassesList?.find(c => c._id === attendanceClass)?.sclassName || 'Unknown')
                                                : 'Unknown')}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No attendance class assigned
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Section */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Teaching Statistics
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Students} alt="Classes" />
                            <Title>
                                Teaching Classes
                            </Title>
                            <Data><CountUp key={totalTeachingClasses} start={0} end={totalTeachingClasses} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Lessons} alt="Attendance" />
                            <Title>
                                Attendance Class
                            </Title>
                            <Data><CountUp key={attendanceClass ? 1 : 0} start={0} end={attendanceClass ? 1 : 0} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Tests} alt="Subjects" />
                            <Title>
                                Total Subjects
                            </Title>
                            <Data><CountUp key={totalSubjects} start={0} end={totalSubjects} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Time} alt="Classes" />
                            <Title>
                                Total Classes
                            </Title>
                            <Data><CountUp key={totalTeachingClasses} start={0} end={totalTeachingClasses} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                </Grid>
            </Box>

            {/* Quick Actions Section */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => attendanceClass ? window.location.href = `/Teacher/class/${typeof attendanceClass === 'object' ? attendanceClass._id : attendanceClass}/attendance` : null}
                        disabled={!attendanceClass}
                    >
                        Take Attendance
                    </Button>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => window.location.href = '/Teacher/upload-assignment'}
                    >
                        Upload Assignment
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => window.location.href = '/Teacher/complain'}
                    >
                        Submit Complaint
                    </Button>
                </Box>
            </Box>

            {/* School Notices Section */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    School Notices
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
                    <SeeNotice />
                </Box>
            </Box>
        </Container>
    )
}

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled.span`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default TeacherHomePage
