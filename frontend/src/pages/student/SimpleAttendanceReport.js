import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SimpleAttendanceReport = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState('ALL');
    const [loading, setLoading] = useState(true);
    
    // Fetch real attendance data from backend
    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                if (!currentUser || !currentUser._id) {
                    setLoading(false);
                    return;
                }

                // Fetch student's complete data including attendance
                const response = await fetch(`http://localhost:5000/Student/${currentUser._id}`);
                const studentData = await response.json();
                
                console.log('Raw student data from backend:', studentData);
                console.log('Student attendance array:', studentData?.attendance);
                
                if (studentData && studentData.attendance) {
                    // Process attendance data and determine terms based on dates
                    const processedData = studentData.attendance.map(record => {
                        const recordDate = new Date(record.date);
                        const month = recordDate.getMonth() + 1; // 1-12
                        
                        let term = 'TERM_1';
                        if (month >= 5 && month <= 8) term = 'TERM_2';
                        else if (month >= 9 && month <= 12) term = 'TERM_3';
                        
                        return {
                            date: record.date,
                            status: record.status,
                            term: term
                        };
                    });
                    
                    console.log('Fetched attendance data:', processedData);
                    setAttendanceData(processedData);
                } else {
                    console.log('No attendance data found for student');
                    setAttendanceData([]);
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                setAttendanceData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [currentUser]);
    
    // Filter data based on selected term
    const filteredData = selectedTerm === 'ALL' ? attendanceData : attendanceData.filter(record => record.term === selectedTerm);
    
    // Calculate statistics
    const totalDays = filteredData.length;
    const presentDays = filteredData.filter(record => record.status === 'Present').length;
    const absentDays = filteredData.filter(record => record.status === 'Absent').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    
    // Data for charts
    const termSummary = {
        TERM_1: { present: 0, absent: 0, total: 0 },
        TERM_2: { present: 0, absent: 0, total: 0 },
        TERM_3: { present: 0, absent: 0, total: 0 }
    };
    
    attendanceData.forEach(record => {
        if (termSummary[record.term]) {
            termSummary[record.term].total++;
            if (record.status === 'Present') {
                termSummary[record.term].present++;
            } else {
                termSummary[record.term].absent++;
            }
        }
    });
    
    const chartData = Object.keys(termSummary).map(term => ({
        term: term.replace('_', ' '),
        present: termSummary[term].present,
        absent: termSummary[term].absent,
        percentage: termSummary[term].total > 0 ? 
            ((termSummary[term].present / termSummary[term].total) * 100).toFixed(1) : 0
    }));
    
    const pieData = [
        { name: 'Present', value: presentDays, color: '#4caf50' },
        { name: 'Absent', value: absentDays, color: '#f44336' }
    ];
    
    if (loading) {
        return (
            <Container>
                <Typography variant="h6">Loading attendance data...</Typography>
                <LinearProgress sx={{ mt: 2 }} />
            </Container>
        );
    }
    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" align="center" color="primary" gutterBottom>
                    My Attendance Report
                </Typography>
                <Typography variant="h6" align="center" color="textSecondary">
                    Student: {currentUser?.name || 'Student Name'}
                </Typography>
                
                {/* Term Filter */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Select Term</InputLabel>
                        <Select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            label="Select Term"
                        >
                            <MenuItem value="ALL">All Terms</MenuItem>
                            <MenuItem value="TERM_1">Term 1 (Jan-Apr)</MenuItem>
                            <MenuItem value="TERM_2">Term 2 (May-Aug)</MenuItem>
                            <MenuItem value="TERM_3">Term 3 (Sep-Dec)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
            
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">Total Days</Typography>
                            <Typography variant="h4">{totalDays}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="success.main">Present Days</Typography>
                            <Typography variant="h4" color="success.main">{presentDays}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="error.main">Absent Days</Typography>
                            <Typography variant="h4" color="error.main">{absentDays}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="info.main">Attendance %</Typography>
                            <Typography variant="h4" color="info.main">{attendancePercentage}%</Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(attendancePercentage)} 
                                sx={{ mt: 1 }}
                                color={parseFloat(attendancePercentage) >= 75 ? 'success' : 'error'}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Term-wise Attendance</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="term" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="present" fill="#4caf50" name="Present" />
                                <Bar dataKey="absent" fill="#f44336" name="Absent" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Overall Distribution</Typography>
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
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Detailed Records */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Attendance Records</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Term</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.term.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={record.status}
                                            color={record.status === 'Present' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {filteredData.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                            No attendance records found for the selected term.
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default SimpleAttendanceReport;