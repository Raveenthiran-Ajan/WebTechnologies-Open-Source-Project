import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getChildDetails } from '../../redux/parentRelated/parentHandle';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const ViewChildDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { loading, currentChild, error } = useSelector((state) => state.parent);

    useEffect(() => {
        dispatch(getChildDetails(id));
    }, [dispatch, id]);

    const calculateAttendancePercentage = (attendance) => {
        if (!attendance || attendance.length === 0) {
            return "0.00";
        }
        const totalPresent = attendance.filter(att => att.status === 'Present').length;
        const totalSessions = attendance.length;
        return ((totalPresent / totalSessions) * 100).toFixed(2);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography>Error: {error.message}</Typography>;
    }

    if (!currentChild) {
        return <Typography>No child details found.</Typography>;
    }

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>{currentChild.name}'s Details</Typography>
                <Typography variant="h6">Roll Number: {currentChild.rollNum}</Typography>
                <Typography variant="h6" gutterBottom>Class: {currentChild.sclassName.sclassName}</Typography>

                <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Attendance</Typography>
                <Typography variant="h6" gutterBottom>
                    Overall Attendance: {calculateAttendancePercentage(currentChild.attendance)}%
                </Typography>

                <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Exam Results</Typography>
                {currentChild.examResult && currentChild.examResult.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f2f2f2' }}>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell align="right">Marks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentChild.examResult.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.subName.subName}</TableCell>
                                        <TableCell align="right">{result.marksObtained}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography>No exam results available.</Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ViewChildDetails;
