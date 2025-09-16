import React, { useEffect, useState } from 'react'
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, Button, Box, Chip } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import Subject from "../../assets/subjects.svg";
import Assignment from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import axios from 'axios';
import AssignmentSubmission from '../../components/AssignmentSubmission';
import { API_BASE_URL } from '../../config';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [showSubmissionForm, setShowSubmissionForm] = useState(null);

    const classID = currentUser.sclassName._id

    const fetchAssignments = async () => {
        if (!currentUser._id) return;
        setAssignmentsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/assignments/student/${currentUser._id}`);
            setAssignments(res.data.assignments || []);
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setAssignments([]);
        } finally {
            setAssignmentsLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        if (!currentUser._id) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/submissions/student/${currentUser._id}`);
            setSubmissions(res.data || []);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setSubmissions([]);
        }
    };

    const calculateTimeLeft = (dueDate) => {
        if (!dueDate) return 'No due date';
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;
        if (diff <= 0) return 'Overdue';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}d ${hours}h ${minutes}m left`;
    };

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
        fetchAssignments();
        fetchSubmissions();
    }, [dispatch, currentUser._id, classID]);

    const numberOfSubjects = subjectsList && subjectsList.length;

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Subject} alt="Subjects" />
                            <Title>
                                Total Subjects
                            </Title>
                            <Data start={0} end={numberOfSubjects} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Assignment} alt="Assignments" />
                            <Title>
                                Total Assignments
                            </Title>
                            <Data start={0} end={assignments.length} duration={4} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                        <ChartContainer>
                            {
                                response ?
                                    <Typography variant="h6">No Attendance Found</Typography>
                                    :
                                    <>
                                        {loading
                                            ? (
                                                <Typography variant="h6">Loading...</Typography>
                                            )
                                            :
                                            <>
                                                {
                                                    subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                                                        <>
                                                            <CustomPieChart data={chartData} />
                                                        </>
                                                    )
                                                        :
                                                        <Typography variant="h6">No Attendance Found</Typography>
                                                }
                                            </>
                                        }
                                    </>
                            }
                        </ChartContainer>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Assignments
                            </Typography>
                            {assignmentsLoading ? (
                                <Typography>Loading assignments...</Typography>
                            ) : assignments.length > 0 ? (
                                <List>
                                    {assignments.map((assignment) => {
                                        const submission = submissions.find(
                                            (sub) => sub.assignmentId._id === assignment._id
                                        );
                                        const isSubmitted = !!submission;
                                        const timeLeft = calculateTimeLeft(assignment.dueDate);
                                        const isOverdue = timeLeft === 'Overdue';

                                        return (
                                            <ListItem key={assignment._id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <ListItemText
                                                        primary={assignment.title}
                                                        secondary={`Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}`}
                                                    />
                                                    <Chip label={timeLeft} color={isOverdue ? 'error' : 'primary'} />
                                                </Box>
                                                <Box sx={{ mt: 1, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {assignment.fileUrl && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            href={`${API_BASE_URL}${assignment.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Download
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        disabled={isSubmitted || isOverdue}
                                                        onClick={() => setShowSubmissionForm(assignment._id)}
                                                    >
                                                        {isSubmitted ? 'Submitted' : 'Submit'}
                                                    </Button>
                                                </Box>
                                                {showSubmissionForm === assignment._id && (
                                                    <Box sx={{ mt: 2, width: '100%' }}>
                                                        <AssignmentSubmission
                                                            assignmentId={assignment._id}
                                                            studentId={currentUser._id}
                                                            onClose={() => setShowSubmissionForm(null)}
                                                            onSubmitted={() => {
                                                                setShowSubmissionForm(null);
                                                                fetchSubmissions();
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            ) : (
                                <Typography>No assignments found.</Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

const ChartContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-direction: column;
  height: 240px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

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

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;



export default StudentHomePage