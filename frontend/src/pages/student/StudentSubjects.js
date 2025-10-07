import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { Link } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Container, Paper, Table, TableBody, TableHead, Typography, Box, CircularProgress } from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import CustomBarChart from '../../components/CustomBarChart'

import axios from 'axios';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const StudentSubjects = () => {

    const dispatch = useDispatch();
    const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedSection, setSelectedSection] = useState('subjects');

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id])

    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
 
            if (userDetails.sclassName && userDetails.sclassName._id) {
                dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
 
                // Fetch assignments for the student's class
                axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/assignments/class/${userDetails.sclassName._id}`)
                    .then(res => {
                        setAssignments(res.data || []);
                    })
                    .catch(err => {
                        console.error("Failed to fetch assignments", err);
                    });
            }
 
            // Fetch submissions for the student
            axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/submissions/student/${currentUser._id}`)
                .then(res => {
                    setSubmissions(res.data || []);
                })
                .catch(err => {
                    console.error("Failed to fetch submissions", err);
                });
        }
    }, [dispatch, currentUser._id, userDetails]);

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderTableSection = () => {
        return (
            <>
                <Typography variant="h4" align="center" gutterBottom>
                    Subject Marks
                </Typography>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject</StyledTableCell>
                            <StyledTableCell>Marks</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {subjectMarks.map((result, index) => {
                            if (!result.subName || !result.marksObtained) {
                                return null;
                            }
                            return (
                                <StyledTableRow key={index}>
                                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                    <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </>
        );
    };

    const renderSubmissionsSection = () => {
        return (
            <>
                <Typography variant="h4" align="center" gutterBottom>
                    Assignment Submissions
                </Typography>
                {submissions.length === 0 ? (
                    <Typography>No submissions found.</Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Assignment Title</StyledTableCell>
                                <StyledTableCell>Submitted At</StyledTableCell>
                                <StyledTableCell>Grade</StyledTableCell>
                                <StyledTableCell>Feedback</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.map((submission) => (
                                <StyledTableRow key={submission._id}>
                                    <StyledTableCell>{submission.assignmentId?.title || "Unknown"}</StyledTableCell>
                                    <StyledTableCell>{new Date(submission.submittedAt).toLocaleString()}</StyledTableCell>
                                    <StyledTableCell>{submission.grade || "-"}</StyledTableCell>
                                    <StyledTableCell>{submission.feedback || "-"}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </>
        );
    };

    const renderChartSection = () => {
        return <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />;
    };

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    };

    const renderClassDetailsSection = () => {
        const subjectColumns = [
            { field: 'subName', headerName: 'Subject Name', width: 250 },
            { field: 'subCode', headerName: 'Subject Code', width: 150 },
            { field: 'teacher', headerName: 'Teacher', width: 250 },
            {
                field: 'pendingAssignments',
                headerName: 'Pending Assignments',
                width: 200,
                renderCell: (params) => (
                    <Link to="/assignments" style={{ textDecoration: 'none' }}>
                        <Typography
                            color={params.value > 0 ? "error" : "success.main"}
                            sx={{ '&:hover': { textDecoration: 'underline' } }}
                        >
                            {params.value > 0 ? `${params.value} Pending` : 'View All'}
                        </Typography>
                    </Link>
                )
            },
        ];

        const subjectRows = Array.isArray(subjectsList) ? subjectsList.map((subject) => {
            const pendingCount = assignments.filter(
                (assignment) =>
                    assignment.subject === subject._id &&
                    !submissions.some((submission) => submission.assignmentId === assignment._id)
            ).length;
            return {
                id: subject._id,
                subName: subject.subName,
                subCode: subject.subCode,
                teacher: subject.teacher?.name || 'No Teacher Assigned',
                pendingAssignments: pendingCount,
            };
        }) : [];

        return (
            <Container maxWidth="lg">
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1" color="primary">
                            My Subjects
                        </Typography>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={subjectRows}
                                columns={subjectColumns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                pageSizeOptions={[5, 10, 25]}
                                checkboxSelection={false}
                                disableRowSelectionOnClick
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                sx={{
                                    '& .MuiDataGrid-root': {
                                        border: 'none',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #f0f0f0',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '1px solid #e0e0e0',
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        backgroundColor: '#fafafa',
                                    },
                                    '& .MuiDataGrid-overlay': {
                                        backgroundColor: '#ffffff',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Container>
        );
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {selectedSection === 'subjects' && renderClassDetailsSection()}
                    {selectedSection === 'table' && renderTableSection()}
                    {selectedSection === 'submissions' && renderSubmissionsSection()}
                    {selectedSection === 'chart' && renderChartSection()}

                    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                        <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                            <BottomNavigationAction
                                label="Subjects"
                                value="subjects"
                                icon={selectedSection === 'subjects' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                            />
                            {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 &&
                                <BottomNavigationAction
                                    label="Marks"
                                    value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                            }
                            {submissions && Array.isArray(submissions) && submissions.length > 0 &&
                                <BottomNavigationAction
                                    label="Submissions"
                                    value="submissions"
                                    icon={selectedSection === 'submissions' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                            }
                            {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 &&
                                <BottomNavigationAction
                                    label="Chart"
                                    value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            }
                        </BottomNavigation>
                    </Paper>
                </>
            )}
        </>
    );
};

export default StudentSubjects;
