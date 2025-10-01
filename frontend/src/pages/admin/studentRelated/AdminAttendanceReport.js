import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Paper,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Chip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import axios from 'axios';
import { calculateOverallAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';

const AdminAttendanceReport = () => {
    const dispatch = useDispatch();
    const { sclassesList, sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [studentsData, setStudentsData] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(getClassStudents(selectedClass));
        }
    }, [dispatch, selectedClass]);

    useEffect(() => {
        if (sclassStudents && sclassStudents.length > 0 && selectedClass) {
            generateReport();
        }
    }, [sclassStudents, selectedMonth, selectedYear, selectedClass]);

    const generateReport = async () => {
        setReportLoading(true);
        try {
            const studentsWithAttendance = await Promise.all(
                sclassStudents.map(async (student) => {
                    try {
                        const response = await axios.get(`http://localhost:5000/Student/${student._id}`);
                        const studentData = response.data;
                        
                        // Filter attendance for selected month/year
                        const filteredAttendance = (studentData.attendance || []).filter(record => {
                            const recordDate = new Date(record.date);
                            return recordDate.getMonth() === selectedMonth && 
                                   recordDate.getFullYear() === selectedYear;
                        });

                        const overallPercentage = calculateOverallAttendancePercentage(filteredAttendance);
                        const attendanceBySubject = groupAttendanceBySubject(filteredAttendance);
                        
                        return {
                            ...student,
                            attendance: filteredAttendance,
                            overallPercentage,
                            attendanceBySubject,
                            totalClasses: filteredAttendance.length,
                            presentClasses: filteredAttendance.filter(a => a.status === 'Present').length
                        };
                    } catch (error) {
                        console.error(`Error fetching data for student ${student._id}:`, error);
                        return {
                            ...student,
                            attendance: [],
                            overallPercentage: 0,
                            attendanceBySubject: {},
                            totalClasses: 0,
                            presentClasses: 0
                        };
                    }
                })
            );

            setStudentsData(studentsWithAttendance);
            
            // Calculate class statistics
            const totalStudents = studentsWithAttendance.length;
            const classAverage = studentsWithAttendance.reduce((sum, student) => 
                sum + student.overallPercentage, 0) / totalStudents || 0;
            
            const attendanceRanges = {
                excellent: studentsWithAttendance.filter(s => s.overallPercentage >= 90).length,
                good: studentsWithAttendance.filter(s => s.overallPercentage >= 75 && s.overallPercentage < 90).length,
                average: studentsWithAttendance.filter(s => s.overallPercentage >= 60 && s.overallPercentage < 75).length,
                poor: studentsWithAttendance.filter(s => s.overallPercentage < 60).length
            };

            setReportData({
                totalStudents,
                classAverage: classAverage.toFixed(1),
                attendanceRanges
            });

        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setReportLoading(false);
        }
    };

    const getMonthName = (monthIndex) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    };

    const getSelectedClassName = () => {
        const selectedClassObj = sclassesList.find(cls => cls._id === selectedClass);
        return selectedClassObj ? selectedClassObj.sclassName : '';
    };

    // Chart data
    const pieData = reportData ? [
        { name: 'Excellent (90%+)', value: reportData.attendanceRanges.excellent, fill: '#4caf50' },
        { name: 'Good (75-89%)', value: reportData.attendanceRanges.good, fill: '#2196f3' },
        { name: 'Average (60-74%)', value: reportData.attendanceRanges.average, fill: '#ff9800' },
        { name: 'Poor (<60%)', value: reportData.attendanceRanges.poor, fill: '#f44336' }
    ] : [];

    const barData = studentsData.map(student => ({
        name: student.name.length > 10 ? student.name.substring(0, 10) + '...' : student.name,
        rollNum: student.rollNum,
        attendance: parseFloat(student.overallPercentage.toFixed(1))
    }));

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
                Monthly Attendance Report - Admin View
            </Typography>

            {/* Controls */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Class</InputLabel>
                            <Select
                                value={selectedClass}
                                label="Class"
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {sclassesList && sclassesList.map((cls) => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
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
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
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
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={generateReport}
                            disabled={!selectedClass || reportLoading}
                            sx={{ height: '56px' }}
                        >
                            {reportLoading ? <CircularProgress size={24} /> : 'Generate Report'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Generating report...</Typography>
                </Box>
            )}

            {reportData && !reportLoading && (
                <>
                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Class Average
                                    </Typography>
                                    <Typography variant="h4" color={reportData.classAverage >= 75 ? 'success.main' : 'error.main'}>
                                        {reportData.classAverage}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {getSelectedClassName()} - {getMonthName(selectedMonth)} {selectedYear}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Total Students
                                    </Typography>
                                    <Typography variant="h4">
                                        {reportData.totalStudents}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        In selected class
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Good Attendance (75%+)
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {reportData.attendanceRanges.excellent + reportData.attendanceRanges.good}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Students with good attendance
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        Need Attention
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {reportData.attendanceRanges.poor}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Students with poor attendance
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
                                    Student-wise Attendance
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value, name, props) => [
                                                `${value}%`, 
                                                `Roll: ${props.payload.rollNum}`
                                            ]}
                                        />
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
                            Detailed Student Report
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Roll No.</strong></TableCell>
                                        <TableCell><strong>Student Name</strong></TableCell>
                                        <TableCell align="center"><strong>Present</strong></TableCell>
                                        <TableCell align="center"><strong>Total Classes</strong></TableCell>
                                        <TableCell align="center"><strong>Attendance %</strong></TableCell>
                                        <TableCell align="center"><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentsData.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell>{student.rollNum}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell align="center">{student.presentClasses}</TableCell>
                                            <TableCell align="center">{student.totalClasses}</TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    color={student.overallPercentage >= 75 ? 'success.main' : 'error.main'}
                                                    fontWeight="bold"
                                                >
                                                    {student.overallPercentage.toFixed(1)}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={
                                                        student.overallPercentage >= 90 ? 'Excellent' :
                                                        student.overallPercentage >= 75 ? 'Good' :
                                                        student.overallPercentage >= 60 ? 'Average' : 'Poor'
                                                    }
                                                    color={
                                                        student.overallPercentage >= 90 ? 'success' :
                                                        student.overallPercentage >= 75 ? 'primary' :
                                                        student.overallPercentage >= 60 ? 'warning' : 'error'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {studentsData.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No attendance data found for the selected period
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </>
            )}

            {!selectedClass && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Please select a class to generate attendance report
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default AdminAttendanceReport;