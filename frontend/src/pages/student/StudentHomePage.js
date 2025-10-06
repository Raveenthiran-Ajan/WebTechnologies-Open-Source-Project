import React, { useEffect, useState } from 'react'
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Chip,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@mui/material'
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
import { useTranslation } from 'react-i18next';
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
    const [editingSubmission, setEditingSubmission] = useState(null);
    const [submissionAnswer, setSubmissionAnswer] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleOpenSubmissionForm = (assignmentId) => {
        console.log('Opening submission form for assignmentId:', assignmentId);
        const existingSubmission = submissions.find(sub => sub.assignmentId._id === assignmentId);
        console.log('Existing submission found:', existingSubmission);
        const assignment = assignments.find(a => a._id === assignmentId);
        const now = new Date();
        const dueDate = assignment ? new Date(assignment.dueDate) : null;
        if (dueDate && dueDate < now) {
            // Deadline passed, do not allow editing or deleting
            alert(t('studentHomePage.deadlinePassed'));
            return;
        }
        if (existingSubmission) {
            setEditingSubmission(existingSubmission);
            setSubmissionAnswer(existingSubmission.answerText || '');
            setSubmissionFile(null); // File editing can be handled separately if needed
        } else {
            setEditingSubmission(null);
            setSubmissionAnswer('');
            setSubmissionFile(null);
        }
        setShowSubmissionForm(assignmentId);
        // Scroll to the submission form after setting it visible
        setTimeout(() => {
            const formElement = document.getElementById('submissionForm');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleCloseSubmissionForm = () => {
        setShowSubmissionForm(null);
        setEditingSubmission(null);
        setSubmissionAnswer('');
        setSubmissionFile(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSubmissionFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!showSubmissionForm) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('studentId', currentUser._id);
            formData.append('assignmentId', showSubmissionForm);
            formData.append('answerText', submissionAnswer);
            if (submissionFile) {
                formData.append('file', submissionFile);
            }
            if (editingSubmission) {
                // Update existing submission
                const response = await axios.put(`${API_BASE_URL}/submissions/${editingSubmission._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to update submission');
                }
            } else {
                // Create new submission
                const response = await axios.post(`${API_BASE_URL}/submissions`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.status !== 201) {
                    throw new Error('Failed to create submission');
                }
            }
            await fetchSubmissions();
            // After submission, show success message and close form
            const message = editingSubmission ? t('studentHomePage.assignmentUpdated') : t('studentHomePage.assignmentSubmitted');
            setSuccessMessage(message);
            setErrorMessage('');
            handleCloseSubmissionForm();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            setErrorMessage(t('studentHomePage.submitFailed'));
            setSuccessMessage('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (submission = editingSubmission) => {
        if (!submission) return;
        setSubmitting(true);
        try {
            await axios.delete(`${API_BASE_URL}/submissions/${submission._id}`);
            await fetchSubmissions();
            setSuccessMessage(t('studentHomePage.submissionDeleted'));
            setErrorMessage('');
            handleCloseSubmissionForm();
        } catch (error) {
            console.error('Error deleting submission:', error);
            setErrorMessage(t('studentHomePage.deleteFailed'));
            setSuccessMessage('');
        } finally {
            setSubmitting(false);
        }
    };

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
        if (!dueDate) return t('studentHomePage.noDueDate');
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;
        if (diff <= 0) return t('studentHomePage.overdue');
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

    const overallAttendancePercentage = subjectAttendance && subjectAttendance.length > 0
        ? calculateOverallAttendancePercentage(subjectAttendance)
        : 0;
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const { t } = useTranslation();
    const chartData = [
        { name: t('studentHomePage.present'), value: overallAttendancePercentage },
        { name: t('studentHomePage.absent'), value: overallAbsentPercentage }
    ];

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Subject} alt="Subjects" />
                            <Title>
                                {t('studentHomePage.totalSubjects')}
                            </Title>
                            <Data><CountUp start={0} end={numberOfSubjects} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Assignment} alt="Assignments" />
                            <Title>
                                {t('studentHomePage.totalAssignments')}
                            </Title>
                            <Data><CountUp start={0} end={assignments.length} duration={4} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <Title>{t('studentHomePage.overallAttendance')}</Title>
                            <Data>
                                <CountUp
                                    start={0}
                                    end={overallAttendancePercentage}
                                    duration={2.5}
                                    suffix="%"
                                />
                            </Data>
                            <Chip
                                label={overallAttendancePercentage >= 75 ? t('studentHomePage.good') : t('studentHomePage.low')}
                                color={overallAttendancePercentage >= 75 ? 'success' : 'error'}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <ChartContainer>
                            {
                                response ?
                                    <Typography variant="h6">{t('student_no_attendance')}</Typography>
                                    :
                                    <>
                                        {loading
                                            ? (
                                                <Typography variant="h6">{t('studentHomePage.loading')}</Typography>
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
                                                        <Typography variant="h6">{t('student_no_attendance')}</Typography>
                                                }
                                            </>
                                        }
                                    </>
                            }
                        </ChartContainer>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', maxHeight: 400, overflow: 'auto' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {t('studentHomePage.schoolNotices')}
                            </Typography>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, width: "100%", maxWidth: 1200, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>
                                {t('studentHomePage.recentAssignments')}
                            </Typography>
                            {assignmentsLoading ? (
                                <Typography>{t('studentHomePage.loadingAssignments')}</Typography>
                            ) : assignments.length > 0 ? (
                                <Box sx={{ width: "100%" }}>
                                    <Box sx={{ maxHeight: 600, overflowY: "auto", width: "100%" }}>
                                        <TableContainer> {/* Added TableContainer for better scrolling handling */}
                                            <Table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "25%", fontWeight: "bold" }}>{t('studentHomePage.title')}</TableCell>
                                                        <TableCell style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "20%", fontWeight: "bold" }}>{t('studentHomePage.dueDate')}</TableCell>
                                                        <TableCell style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "15%", fontWeight: "bold" }}>{t('studentHomePage.status')}</TableCell>
                                                        <TableCell style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "20%", fontWeight: "bold" }}>{t('studentHomePage.timeLeft')}</TableCell>
                                                        <TableCell style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left", width: "20%", fontWeight: "bold", verticalAlign: "middle" }}>{t('studentHomePage.actions')}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {assignments.map((assignment) => {
                                                        const submission = submissions.find(
                                                            (sub) => sub.assignmentId._id === assignment._id
                                                        );
                                                        const isSubmitted = !!submission;
                                                        const timeLeft = calculateTimeLeft(assignment.dueDate);
                                                        const isOverdue = timeLeft === 'Overdue';
                                                        // Define 'dueDate' and 'status' here to fix the error
                                                        const dueDateDisplay = new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        });
                                                        const status = isSubmitted ? t('studentHomePage.submitted') : (isOverdue ? t('studentHomePage.missing') : t('studentHomePage.pending'));

                                                        return (
                                                            <TableRow key={assignment._id} hover>
                                                                <TableCell sx={{ fontWeight: '500', wordBreak: 'break-word' }}>{assignment.title}</TableCell>
                                                                <TableCell sx={{ color: 'text.secondary' }}>{dueDateDisplay}</TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>
                                                                    <Chip
                                                                            label={status}
                                                                            color={isSubmitted ? 'success' : isOverdue ? 'error' : 'warning'}
                                                                            variant="filled"
                                                                            sx={{
                                                                                borderRadius: '16px',
                                                                                fontWeight: 'bold',
                                                                                minWidth: 90,
                                                                                justifyContent: 'center',
                                                                            }}
                                                                        />
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>
                                                                    <Chip
                                                                        label={isOverdue ? t('studentHomePage.overdue') : `${timeLeft}`}
                                                                        variant="filled"
                                                                        sx={{
                                                                            borderRadius: '16px',
                                                                            fontSize: '0.8rem',
                                                                            fontWeight: 'bold',
                                                                            minWidth: 110,
                                                                            justifyContent: 'center',
                                                                            backgroundColor: isOverdue ? '#d32f2f' : '#1976d2',
                                                                            color: 'white',
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                        {(() => {
                                                                            const submission = submissions.find(sub => sub.assignmentId._id === assignment._id);
                                                                            const now = new Date();
                                                                            const deadline = assignment.dueDate ? new Date(assignment.dueDate) : null;
                                                                            const isDeadlineOver = deadline ? now > deadline : false;
                                                                            if (!submission) {
                                                                                return (
                                                                                    <>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            href={`${API_BASE_URL}${assignment.fileUrl}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            disabled={!assignment.fileUrl}
                                                                                            sx={{ minWidth: 100, textTransform: 'uppercase' }}
                                                                                        >
                                                                                            {t('studentHomePage.download')}
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="contained"
                                                                                            disabled={isDeadlineOver}
                                                                                            onClick={() => handleOpenSubmissionForm(assignment._id)}
                                                                                            sx={{ minWidth: 100, textTransform: 'uppercase' }}
                                                                                        >
                                                                                            {t('studentHomePage.submit')}
                                                                                        </Button>
                                                                                    </>
                                                                                );
                                                                            } else if (submission && !isDeadlineOver) {
                                                                                return (
                                                                                    <>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            href={`${API_BASE_URL}${assignment.fileUrl}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            disabled={!assignment.fileUrl}
                                                                                            sx={{ minWidth: 100, textTransform: 'uppercase' }}
                                                                                        >
                                                                                            {t('studentHomePage.download')}
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            size="small"
                                                                                            onClick={() => handleOpenSubmissionForm(assignment._id)}
                                                                                            sx={{ minWidth: 100, textTransform: 'uppercase', ml: 1 }}
                                                                                        >
                                                                                            {t('studentHomePage.edit')}
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            color="error"
                                                                                            size="small"
                                                                                            onClick={() => handleDelete(submission)}
                                                                                            sx={{ minWidth: 100, textTransform: 'uppercase', ml: 1 }}
                                                                                        >
                                                                                            {t('studentHomePage.delete')}
                                                                                        </Button>
                                                                                    </>
                                                                                );
                                                                            } else if (submission && isDeadlineOver) {
                                                                                return (
                                                                                    <>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            href={`${API_BASE_URL}${assignment.fileUrl}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            disabled={!assignment.fileUrl}
                                                                                            sx={{ minWidth: 100, textTransform: 'uppercase' }}
                                                                                        >
                                                                                            {t('studentHomePage.download')}
                                                                                        </Button>
                                                                                    </>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography>{t('studentHomePage.noAssignments')}</Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Submission Form Inline Below Assignments */}
                {showSubmissionForm && (
                    <Paper id="submissionForm" sx={{ p: 3, mt: 2, width: "100%", maxWidth: 1200, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>{editingSubmission ? t('studentHomePage.editSubmission') : t('studentHomePage.submitAssignment')}</Typography>
                        <textarea
                            placeholder={t('studentHomePage.answerTextPlaceholder')}
                            value={submissionAnswer}
                            onChange={(e) => setSubmissionAnswer(e.target.value)}
                            rows={4}
                            style={{ width: '100%', marginBottom: 16, padding: 8, fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
                        />
                        <Box
                            {...{
                                onDragOver: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                },
                                onDrop: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        setSubmissionFile(e.dataTransfer.files[0]);
                                        e.dataTransfer.clearData();
                                    }
                                },
                            }}
                            sx={{
                                border: '2px dashed #1976d2',
                                borderRadius: 2,
                                padding: 2,
                                textAlign: 'center',
                                color: submissionFile ? 'black' : '#1976d2',
                                cursor: 'pointer',
                                marginBottom: 2,
                            }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            {submissionFile ? submissionFile.name : t('studentHomePage.fileUploadPrompt')}
                        </Box>
                        <input
                            id="fileInput"
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="*"
                        />
                        {errorMessage && <Typography color="error" sx={{ mb: 2 }}>{errorMessage}</Typography>}
                        {successMessage && <Typography color="success" sx={{ mb: 2 }}>{successMessage}</Typography>}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="outlined" onClick={handleCloseSubmissionForm} disabled={submitting}>
                                {t('studentHomePage.cancel')}
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {editingSubmission ? (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDelete()} // Pass no argument, will use editingSubmission state
                                            disabled={submitting}
                                        >
                                            {t('studentHomePage.delete')}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {t('studentHomePage.update')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {t('studentHomePage.submit')}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Container>
        </>
    )
}

// Styled components remain the same
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
    margin: 0;
`;

const Data = styled.span`
    font-size: calc(1.3rem + .6vw);
    color: green;
`;

export default StudentHomePage