import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    Container
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getCurrentTerm, getTermName, getAllTerms, isDateInTerm } from '../../utils/termUtils';

const TermAttendanceReport = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails } = useSelector((state) => state.user);
    
    const [selectedTerm, setSelectedTerm] = useState(getCurrentTerm());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [termAttendanceData, setTermAttendanceData] = useState([]);
    const [termStats, setTermStats] = useState(null);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (userDetails && userDetails.attendance) {
            processTermData();
        }
    }, [userDetails, selectedTerm, selectedYear]);

    const processTermData = () => {
        // Filter for term-based attendance only
        const termAttendance = userDetails.attendance.filter(record => 
            record.isTermAttendance === true &&
            record.term === selectedTerm &&
            new Date(record.date).getFullYear() === selectedYear
        );

        // Sort by date
        const sortedData = termAttendance.sort((a, b) => new Date(a.date) - new Date(b.date));
        setTermAttendanceData(sortedData);

        // Calculate statistics
        if (sortedData.length > 0) {
            const presentDays = sortedData.filter(record => record.status === 'Present').length;
            const totalDays = sortedData.length;
            const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

            setTermStats({
                presentDays,
                absentDays: totalDays - presentDays,
                totalDays,
                attendancePercentage,
                term: getTermName(selectedTerm),
                year: selectedYear
            });
        } else {
            setTermStats({
                presentDays: 0,
                absentDays: 0,
                totalDays: 0,
                attendancePercentage: 0,
                term: getTermName(selectedTerm),
                year: selectedYear
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Chart data
    const pieData = termStats ? [
        { name: 'Present', value: termStats.presentDays, fill: '#4caf50' },
        { name: 'Absent', value: termStats.absentDays, fill: '#f44336' }
    ] : [];

    // Monthly breakdown for bar chart
    const monthlyData = termAttendanceData.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short' });
        if (!acc[month]) {
            acc[month] = { month, present: 0, absent: 0, total: 0 };
        }
        acc[month].total++;
        if (record.status === 'Present') {
            acc[month].present++;
        } else {
            acc[month].absent++;
        }
        acc[month].percentage = ((acc[month].present / acc[month].total) * 100).toFixed(1);
        return acc;
    }, {});

    const barData = Object.values(monthlyData);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
                Term-Based Attendance Report
            </Typography>

            {/* Controls */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Academic Term</InputLabel>
                            <Select
                                value={selectedTerm}
                                label="Academic Term"
                                onChange={(e) => setSelectedTerm(e.target.value)}
                            >
                                {getAllTerms().map((term) => (
                                    <MenuItem key={term.key} value={term.key}>
                                        {term.name} (Months {term.months.join(', ')})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={selectedYear}
                                label="Year"
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {Array.from({ length: 3 }, (_, i) => (
                                    <MenuItem key={i} value={new Date().getFullYear() - i}>
                                        {new Date().getFullYear() - i}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Academic System
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    3 Terms × 4 Months Each
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {termStats && (
                <>
                    {/* Overall Statistics */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Overall Attendance
                                    </Typography>
                                    <Typography variant="h4" color={termStats.attendancePercentage >= 75 ? 'success.main' : 'error.main'}>
                                        {termStats.attendancePercentage}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={termStats.attendancePercentage}
                                        color={termStats.attendancePercentage >= 75 ? 'success' : 'error'}
                                        sx={{ mt: 1 }}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {termStats.term} {termStats.year}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Days Present
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {termStats.presentDays}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        out of {termStats.totalDays} days
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Days Absent
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {termStats.absentDays}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        missed days
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={
                                            termStats.attendancePercentage >= 90 ? 'Excellent' :
                                            termStats.attendancePercentage >= 75 ? 'Good' :
                                            termStats.attendancePercentage >= 60 ? 'Satisfactory' : 'Needs Improvement'
                                        }
                                        color={
                                            termStats.attendancePercentage >= 90 ? 'success' :
                                            termStats.attendancePercentage >= 75 ? 'primary' :
                                            termStats.attendancePercentage >= 60 ? 'warning' : 'error'
                                        }
                                        sx={{ fontSize: '1rem', p: 2 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Attendance Distribution
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Attendance Trend
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value, name) => [
                                                name === 'percentage' ? `${value}%` : value,
                                                name === 'percentage' ? 'Attendance %' : name
                                            ]}
                                        />
                                        <Legend />
                                        <Bar dataKey="percentage" fill="#2196f3" name="Attendance %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Detailed Daily Record */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Daily Attendance Record - {termStats.term} {termStats.year}
                        </Typography>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Day</strong></TableCell>
                                        <TableCell align="center"><strong>Status</strong></TableCell>
                                        <TableCell align="center"><strong>Month</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {termAttendanceData.map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(record.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={record.status}
                                                    color={record.status === 'Present' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {termAttendanceData.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No attendance records found for {termStats.term} {termStats.year}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Attendance is taken daily by your class teacher
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </>
            )}

            {!termStats && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Loading attendance data...
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default TermAttendanceReport;