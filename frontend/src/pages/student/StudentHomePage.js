import React, { useEffect, useState, useCallback } from 'react'
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Chip,
    // Removed table imports as no longer needed
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
import { API_BASE_URL } from '../../config';
import StudentSubmissions from './StudentSubmissions';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [assignments, setAssignments] = useState([]);
    // eslint-disable-next-line no-unused-vars
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
            alert('The deadline for this assignment has passed. You cannot edit or delete your submission.');
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
            const message = editingSubmission ? 'Assignment updated successfully.' : 'Assignment submitted successfully.';
            setSuccessMessage(message);
            setErrorMessage('');
            handleCloseSubmissionForm();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            setErrorMessage('Failed to submit assignment. Please try again.');
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
            setSuccessMessage('Submission deleted successfully.');
            setErrorMessage('');
            handleCloseSubmissionForm();
        } catch (error) {
            console.error('Error deleting submission:', error);
            setErrorMessage('Failed to delete submission. Please try again.');
            setSuccessMessage('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewSubmission = (assignmentId) => {
        const submission = submissions.find(sub => sub.assignmentId._id === assignmentId);
        if (submission && submission.fileUrl) {
            window.open(`${API_BASE_URL}${submission.fileUrl}`, '_blank');
        } else if (submission && submission.answerText) {
            alert(`Submission Text:\n\n${submission.answerText}`);
        } else {
            alert('No submission content available.');
        }
    };

    const handleEditSubmission = (assignmentId) => {
        handleOpenSubmissionForm(assignmentId);
    };

    const handleDeleteSubmission = async (assignmentId) => {
        const submission = submissions.find(sub => sub.assignmentId._id === assignmentId);
        if (submission) {
            await handleDelete(submission);
            // After deletion, refresh assignments and submissions to update status to Pending
            await fetchAssignments();
            await fetchSubmissions();
        }
    };

    const classID = currentUser.sclassName._id

    const fetchAssignments = useCallback(async () => {
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
    }, [currentUser._id]);

    const fetchSubmissions = useCallback(async () => {
        if (!currentUser._id) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/submissions/student/${currentUser._id}`);
            setSubmissions(res.data || []);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setSubmissions([]);
        }
    }, [currentUser._id]);



    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
        fetchAssignments();
        fetchSubmissions();
    }, [dispatch, currentUser._id, classID, fetchAssignments, fetchSubmissions]);

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


    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const { t } = useTranslation();
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Subject} alt="Subjects" />
                            <Title>
                                {t('student_total_subjects')}
                            </Title>
                            <Data><CountUp start={0} end={numberOfSubjects} duration={2.5} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Assignment} alt="Assignments" />
                            <Title>
                                {t('student_total_assignments')}
                            </Title>
                            <Data><CountUp start={0} end={assignments.length} duration={4} /></Data>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <Title>Overall Attendance</Title>
                            <Data>
                                <CountUp
                                    start={0}
                                    end={overallAttendancePercentage}
                                    duration={2.5}
                                    suffix="%"
                                />
                            </Data>
                            <Chip
                                label={overallAttendancePercentage >= 75 ? 'Good' : 'Low'}
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
                                School Notices
                            </Typography>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                <Grid item xs={12}>
                    <StudentSubmissions
                        assignments={assignments}
                        submissions={submissions}
                        onOpenSubmissionForm={handleOpenSubmissionForm}
                        onDownload={(assignment) => {
                            if (assignment.fileUrl) {
                                window.open(`${API_BASE_URL}${assignment.fileUrl}`, '_blank');
                            }
                        }}
                        onViewSubmission={handleViewSubmission}
                        onEditSubmission={handleEditSubmission}
                        onDeleteSubmission={handleDeleteSubmission}
                        onFeedback={(assignmentId) => {
                            alert(`Feedback feature for assignment ${assignmentId} coming soon!`);
                        }}
                    />
                </Grid>
                </Grid>

                {/* Submission Form Inline Below Assignments */}
                {showSubmissionForm && (
                    <Paper id="submissionForm" sx={{ p: 3, mt: 2, width: "100%", maxWidth: 1200, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>{editingSubmission ? 'Edit Submission' : 'Submit Assignment'}</Typography>
                        <textarea
                            placeholder="Answer Text (optional)"
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
                            {submissionFile ? submissionFile.name : 'Drag & drop a file here, or click to select file (Max 5MB)'}
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
                                Cancel
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
                                            Delete
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            Update
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        Submit
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