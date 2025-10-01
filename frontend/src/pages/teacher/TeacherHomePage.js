import { Container, Grid, Paper, Typography,Box, Button } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";
import { getClassStudents, getSubjectDetails, getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TeacherHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents, sclassesList } = useSelector((state) => state.sclass);

    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
        dispatch(getClassStudents(classID));
        // Fetch all classes to get proper class names
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, subjectID, classID, currentUser._id]);

    const numberOfStudents = sclassStudents ? sclassStudents.length : 0;
    const numberOfSessions = subjectDetails ? (subjectDetails.sessions || 0) : 0;

    const { t } = useTranslation();
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
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {(() => {
                                    const teachingClasses = currentUser?.teachSclasses || 
                                        (currentUser?.teachSclass ? [currentUser.teachSclass] : []);
                                    
                                    if (teachingClasses.length === 0) return 'Not Assigned';
                                    
                                    return teachingClasses.map(cls => {
                                        // Handle different data structures
                                        if (typeof cls === 'object' && cls.sclassName) {
                                            return cls.sclassName;
                                        } else if (typeof cls === 'string') {
                                            // If it's a string (ID), find the corresponding class name
                                            const classInfo = sclassesList?.find(c => c._id === cls);
                                            if (classInfo) {
                                                return classInfo.sclassName;
                                            }
                                            // If we can't find it in the list, try to extract a readable name from ID
                                            // This is a fallback - you might want to show just the last few characters
                                            return cls.length > 10 ? `Class (${cls.slice(-4)})` : cls;
                                        }
                                        return cls;
                                    }).join(', ');
                                })()}
                            </Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Teaching Subject
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {currentUser?.teachSubject?.subName || currentUser?.teachSubjects?.[0]?.subName || 'Not Assigned'}
                            </Typography>
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
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {(() => {
                                    const attendanceClass = currentUser?.attendanceClass;
                                    if (!attendanceClass) return 'Not Assigned';
                                    
                                    // If it's an object with sclassName, use it
                                    if (typeof attendanceClass === 'object' && attendanceClass.sclassName) {
                                        return attendanceClass.sclassName;
                                    }
                                    
                                    // If it's a string (ID), find the corresponding class name
                                    if (typeof attendanceClass === 'string') {
                                        const classInfo = sclassesList?.find(c => c._id === attendanceClass);
                                        if (classInfo) {
                                            return classInfo.sclassName;
                                        }
                                        // If we can't find it, show a readable fallback
                                        return attendanceClass.length > 10 ? `Class (${attendanceClass.slice(-4)})` : attendanceClass;
                                    }
                                    
                                    return attendanceClass._id ? (
                                        sclassesList?.find(c => c._id === attendanceClass._id)?.sclassName || 
                                        `Class (${attendanceClass._id.slice(-4)})`
                                    ) : 'Not Assigned';
                                })()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Section */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Class Statistics
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Students} alt="Students" />
                            <Title>
                                {t('class_students')}
                            </Title>
                            <Data><CountUp key={numberOfStudents} start={0} end={numberOfStudents} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Lessons} alt="Lessons" />
                            <Title>
                                {t('total_lessons')}
                            </Title>
                            <Data><CountUp key={numberOfSessions} start={0} end={numberOfSessions} duration={5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Tests} alt="Tests" />
                            <Title>
                                {t('tests_taken')}
                            </Title>
                            <Data><CountUp key="tests" start={0} end={24} duration={4} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledPaper>
                            <img src={Time} alt="Time" />
                            <Title>
                                {t('total_hours')}
                            </Title>
                            <Data><CountUp key="hours" start={0} end={30} duration={4} suffix={t('hours_suffix')} /></Data>
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
                        onClick={() => window.location.href = `/Teacher/class/${classID}/attendance`}
                        disabled={!classID}
                    >
                        Take Attendance
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => window.location.href = `/Teacher/class/${classID}`}
                        disabled={!classID}
                    >
                        View Class Details
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