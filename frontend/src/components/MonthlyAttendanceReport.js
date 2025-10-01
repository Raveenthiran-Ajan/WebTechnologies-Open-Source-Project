import React, { useState, useEffect } from 'react';
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
    LinearProgress
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyAttendanceReport = ({ attendanceData, userRole = 'student' }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        if (attendanceData && attendanceData.length > 0) {
            processMonthlyData();
        }
    }, [attendanceData, selectedMonth, selectedYear]);

    const processMonthlyData = () => {
        const filteredData = attendanceData.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
        });

        // Group by subject
        const subjectGroups = {};
        filteredData.forEach(record => {
            const subjectName = record.subName?.subName || 'Unknown Subject';
            if (!subjectGroups[subjectName]) {
                subjectGroups[subjectName] = {
                    present: 0,
                    absent: 0,
                    total: 0,
                    sessions: record.subName?.sessions || 0
                };
            }
            
            if (record.status === 'Present') {
                subjectGroups[subjectName].present++;
            } else {
                subjectGroups[subjectName].absent++;
            }
            subjectGroups[subjectName].total++;
        });

        const processedData = Object.entries(subjectGroups).map(([subject, data]) => ({
            subject,
            present: data.present,
            absent: data.absent,
            total: data.total,
            percentage: data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : 0,
            totalSessions: data.sessions
        }));

        setMonthlyData(processedData);
    };

    const getMonthName = (monthIndex) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    };

    const calculateOverallAttendance = () => {
        if (monthlyData.length === 0) return { percentage: 0, present: 0, total: 0 };
        
        const totalPresent = monthlyData.reduce((sum, item) => sum + item.present, 0);
        const totalClasses = monthlyData.reduce((sum, item) => sum + item.total, 0);
        const percentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;
        
        return { percentage, present: totalPresent, total: totalClasses };
    };

    const overall = calculateOverallAttendance();

    // Chart data
    const pieData = [
        { name: 'Present', value: parseInt(overall.present), fill: '#4caf50' },
        { name: 'Absent', value: overall.total - overall.present, fill: '#f44336' }
    ];

    const barData = monthlyData.map(item => ({
        subject: item.subject.length > 10 ? item.subject.substring(0, 10) + '...' : item.subject,
        attendance: parseFloat(item.percentage)
    }));

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
                Monthly Attendance Report
            </Typography>

            {/* Month/Year Selection */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={selectedMonth}
                        label="Month"
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i} value={i}>
                                {getMonthName(i)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={selectedYear}
                        label="Year"
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {Array.from({ length: 5 }, (_, i) => (
                            <MenuItem key={i} value={new Date().getFullYear() - i}>
                                {new Date().getFullYear() - i}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Overall Statistics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                Overall Attendance
                            </Typography>
                            <Typography variant="h4" color={overall.percentage >= 75 ? 'success.main' : 'error.main'}>
                                {overall.percentage}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={overall.percentage}
                                color={overall.percentage >= 75 ? 'success' : 'error'}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                Classes Attended
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {overall.present}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                out of {overall.total} classes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                Period
                            </Typography>
                            <Typography variant="h6">
                                {getMonthName(selectedMonth)} {selectedYear}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {monthlyData.length} subjects
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
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
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Subject-wise Attendance
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attendance" fill="#2196f3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Detailed Table */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Subject-wise Details
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Subject</strong></TableCell>
                                <TableCell align="center"><strong>Present</strong></TableCell>
                                <TableCell align="center"><strong>Absent</strong></TableCell>
                                <TableCell align="center"><strong>Total Classes</strong></TableCell>
                                <TableCell align="center"><strong>Attendance %</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {monthlyData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.subject}</TableCell>
                                    <TableCell align="center">{row.present}</TableCell>
                                    <TableCell align="center">{row.absent}</TableCell>
                                    <TableCell align="center">{row.total}</TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            color={row.percentage >= 75 ? 'success.main' : 'error.main'}
                                            fontWeight="bold"
                                        >
                                            {row.percentage}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={row.percentage >= 75 ? 'Good' : 'Low'}
                                            color={row.percentage >= 75 ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {monthlyData.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                            No attendance data found for {getMonthName(selectedMonth)} {selectedYear}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default MonthlyAttendanceReport;