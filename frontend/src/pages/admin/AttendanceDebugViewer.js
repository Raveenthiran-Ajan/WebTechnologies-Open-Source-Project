import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const AttendanceDebugViewer = () => {
    const [studentsData, setStudentsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStudentsAttendance();
    }, []);

    const fetchAllStudentsAttendance = async () => {
        try {
            // First get all classes to get students
            const classResponse = await axios.get('http://localhost:5000/Sclasses');
            console.log('Classes:', classResponse.data);
            
            if (classResponse.data && classResponse.data.length > 0) {
                // Get students from first class
                const classId = classResponse.data[0]._id;
                const studentsResponse = await axios.get(`http://localhost:5000/Sclass/Students/${classId}`);
                console.log('Students:', studentsResponse.data);
                
                if (studentsResponse.data && studentsResponse.data.length > 0) {
                    // Fetch detailed data for each student
                    const studentDetails = await Promise.all(
                        studentsResponse.data.map(async (student) => {
                            try {
                                const detailResponse = await axios.get(`http://localhost:5000/Student/${student._id}`);
                                return detailResponse.data;
                            } catch (error) {
                                console.error(`Error fetching student ${student._id}:`, error);
                                return null;
                            }
                        })
                    );
                    
                    setStudentsData(studentDetails.filter(student => student !== null));
                }
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <Container>
                <Typography variant="h6">Loading attendance data...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" align="center" color="primary" gutterBottom>
                    Database Attendance Viewer
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary">
                    Raw attendance data from MongoDB SMS database
                </Typography>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="outlined" onClick={fetchAllStudentsAttendance}>
                        Refresh Data
                    </Button>
                </Box>
            </Paper>

            {studentsData.map((student, index) => (
                <Accordion key={student._id || index} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6">
                                {student.name} (Roll: {student.rollNum})
                            </Typography>
                            <Chip 
                                label={`${student.attendance ? student.attendance.length : 0} Records`}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Student ID: {student._id}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Class: {student.sclassName?.sclassName || 'N/A'}
                            </Typography>
                        </Box>

                        {student.attendance && student.attendance.length > 0 ? (
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Date</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell><strong>Subject ID</strong></TableCell>
                                            <TableCell><strong>Subject Name</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {student.attendance.map((record, recordIndex) => (
                                            <TableRow key={recordIndex}>
                                                <TableCell>{formatDate(record.date)}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={record.status}
                                                        color={record.status === 'Present' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {record.subName?._id || record.subName || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {record.subName?.subName || 'Daily Attendance'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Typography variant="body1" color="textSecondary">
                                    No attendance records found for this student
                                </Typography>
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            {studentsData.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No students found or no attendance data available
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default AttendanceDebugViewer;