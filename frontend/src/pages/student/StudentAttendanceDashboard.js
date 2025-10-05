import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TablePagination,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    Container
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as PresentIcon,
    Cancel as AbsentIcon,
    BeachAccess as HolidayIcon,
    Assessment as AttendanceIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StudentAttendanceDashboard = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    // Filter states
    const [academicYear, setAcademicYear] = useState('2025');
    const [term, setTerm] = useState('TERM_1');
    const [month, setMonth] = useState('all');

    // Chart view toggle
    const [chartView, setChartView] = useState('monthly');

    // Table pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Attendance data
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (userDetails) {
            setAttendanceData(userDetails.attendance || []);
        }
    }, [userDetails]);

    // Filter attendance data based on selected filters
    const filteredAttendance = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear().toString();
        const recordMonth = recordDate.getMonth() + 1;

        // Academic year filter
        if (academicYear !== 'all' && recordYear !== academicYear) return false;

        // Month filter
        if (month !== 'all' && recordMonth !== parseInt(month)) return false;

        // Term filter (simplified - you can enhance this logic)
        if (term !== 'all') {
            const termMonths = {
                'TERM_1': [1, 2, 3, 4],    // Jan-Apr
                'TERM_2': [5, 6, 7, 8],    // May-Aug
                'TERM_3': [9, 10, 11, 12]  // Sep-Dec
            };
            if (!termMonths[term]?.includes(recordMonth)) return false;
        }

        return true;
    });

    // Calculate summary statistics
    const calculateSummary = () => {
        // Group attendance by unique dates to match the overall calculation
        const attendanceByDate = {};

        filteredAttendance.forEach((record) => {
            const dateKey = new Date(record.date).toDateString();

            if (!attendanceByDate[dateKey]) {
                attendanceByDate[dateKey] = {
                    statuses: [],
                    hasPresent: false,
                    hasAbsent: false,
                    hasHoliday: false
                };
            }

            attendanceByDate[dateKey].statuses.push(record.status);

            if (record.status === "Present") {
                attendanceByDate[dateKey].hasPresent = true;
            } else if (record.status === "Absent") {
                attendanceByDate[dateKey].hasAbsent = true;
            } else if (record.status === "Holiday") {
                attendanceByDate[dateKey].hasHoliday = true;
            }
        });

        // Count unique days for each status
        let presentDays = 0;
        let absentDays = 0;
        let holidayDays = 0;
        const totalDays = Object.keys(attendanceByDate).length;

        Object.values(attendanceByDate).forEach((dayData) => {
            if (dayData.hasPresent) {
                presentDays++;
            }
            if (dayData.hasAbsent) {
                absentDays++;
            }
            if (dayData.hasHoliday) {
                holidayDays++;
            }
        });

        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

        return { present: presentDays, absent: absentDays, holidays: holidayDays, attendancePercentage };
    };

    const summary = calculateSummary();

    // Prepare chart data
    const prepareMonthlyChartData = () => {
        const monthlyData = {};

        // Group by unique dates first
        const attendanceByDate = {};
        filteredAttendance.forEach(record => {
            const dateKey = new Date(record.date).toDateString();
            if (!attendanceByDate[dateKey]) {
                attendanceByDate[dateKey] = {
                    date: new Date(record.date),
                    statuses: [],
                    hasPresent: false,
                    hasAbsent: false,
                    hasHoliday: false
                };
            }

            attendanceByDate[dateKey].statuses.push(record.status);

            if (record.status === "Present") {
                attendanceByDate[dateKey].hasPresent = true;
            } else if (record.status === "Absent") {
                attendanceByDate[dateKey].hasAbsent = true;
            } else if (record.status === "Holiday") {
                attendanceByDate[dateKey].hasHoliday = true;
            }
        });

        // Now group by month
        Object.values(attendanceByDate).forEach((dayData) => {
            const monthKey = dayData.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, present: 0, absent: 0, holiday: 0 };
            }

            if (dayData.hasPresent) monthlyData[monthKey].present++;
            if (dayData.hasAbsent) monthlyData[monthKey].absent++;
            if (dayData.hasHoliday) monthlyData[monthKey].holiday++;
        });

        return Object.values(monthlyData);
    };

    const prepareTermChartData = () => {
        const termData = { 'Term 1': 0, 'Term 2': 0, 'Term 3': 0 };
        const termCounts = { 'Term 1': 0, 'Term 2': 0, 'Term 3': 0 };

        // Group by unique dates first
        const attendanceByDate = {};
        filteredAttendance.forEach(record => {
            const dateKey = new Date(record.date).toDateString();
            if (!attendanceByDate[dateKey]) {
                attendanceByDate[dateKey] = {
                    date: new Date(record.date),
                    statuses: [],
                    hasPresent: false
                };
            }

            attendanceByDate[dateKey].statuses.push(record.status);

            if (record.status === "Present") {
                attendanceByDate[dateKey].hasPresent = true;
            }
        });

        // Now group by term
        Object.values(attendanceByDate).forEach((dayData) => {
            const month = dayData.date.getMonth() + 1;
            let termKey;

            if (month >= 1 && month <= 4) termKey = 'Term 1';
            else if (month >= 5 && month <= 8) termKey = 'Term 2';
            else termKey = 'Term 3';

            termCounts[termKey]++;
            if (dayData.hasPresent) {
                termData[termKey]++;
            }
        });

        return Object.entries(termData).map(([term, present]) => ({
            term,
            attendance: termCounts[term] > 0 ? ((present / termCounts[term]) * 100).toFixed(1) : 0
        }));
    };

    const monthlyChartData = prepareMonthlyChartData();
    const termChartData = prepareTermChartData();

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle refresh
    const handleRefresh = () => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    };

    // Get available months based on selected term
    const getAvailableMonths = (selectedTerm = term) => {
        if (selectedTerm === 'all') {
            return [
                { value: 'all', label: 'All Months' },
                { value: '1', label: 'January' },
                { value: '2', label: 'February' },
                { value: '3', label: 'March' },
                { value: '4', label: 'April' },
                { value: '5', label: 'May' },
                { value: '6', label: 'June' },
                { value: '7', label: 'July' },
                { value: '8', label: 'August' },
                { value: '9', label: 'September' },
                { value: '10', label: 'October' },
                { value: '11', label: 'November' },
                { value: '12', label: 'December' }
            ];
        }

        const termMonths = {
            'TERM_1': [
                { value: 'all', label: 'All Term 1 Months' },
                { value: '1', label: 'January' },
                { value: '2', label: 'February' },
                { value: '3', label: 'March' },
                { value: '4', label: 'April' }
            ],
            'TERM_2': [
                { value: 'all', label: 'All Term 2 Months' },
                { value: '5', label: 'May' },
                { value: '6', label: 'June' },
                { value: '7', label: 'July' },
                { value: '8', label: 'August' }
            ],
            'TERM_3': [
                { value: 'all', label: 'All Term 3 Months' },
                { value: '9', label: 'September' },
                { value: '10', label: 'October' },
                { value: '11', label: 'November' },
                { value: '12', label: 'December' }
            ]
        };

        return termMonths[selectedTerm] || [{ value: 'all', label: 'All Months' }];
    };

    // Handle term change - reset month if it's not valid for the new term
    const handleTermChange = (event) => {
        const newTerm = event.target.value;
        setTerm(newTerm);

        // Reset month to 'all' if current month is not valid for the new term
        if (month !== 'all') {
            const availableMonths = getAvailableMonths(newTerm);
            const isMonthValid = availableMonths.some(m => m.value === month);
            if (!isMonthValid) {
                setMonth('all');
            }
        }
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Typography>Loading attendance data...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Typography color="error">Error loading attendance data</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Page Header + Filters */}
            <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 0, zIndex: 100 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        My Attendance
                    </Typography>
                    <IconButton onClick={handleRefresh} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Academic Year</InputLabel>
                            <Select
                                value={academicYear}
                                label="Academic Year"
                                onChange={(e) => setAcademicYear(e.target.value)}
                            >
                                <MenuItem value="2024">2024</MenuItem>
                                <MenuItem value="2025">2025</MenuItem>
                                <MenuItem value="all">All Years</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Term</InputLabel>
                            <Select
                                value={term}
                                label="Term"
                                onChange={handleTermChange}
                            >
                                <MenuItem value="TERM_1">Term 1</MenuItem>
                                <MenuItem value="TERM_2">Term 2</MenuItem>
                                <MenuItem value="TERM_3">Term 3</MenuItem>
                                <MenuItem value="all">All Terms</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={month}
                                label="Month"
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                {getAvailableMonths().map((monthOption) => (
                                    <MenuItem key={monthOption.value} value={monthOption.value}>
                                        {monthOption.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Summary Cards Section */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PresentIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="#4caf50">
                                {summary.present}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Present Days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AbsentIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="#f44336">
                                {summary.absent}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Absent Days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #ffc107' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <HolidayIcon sx={{ fontSize: 40, color: '#ffc107', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="#ffc107">
                                {summary.holidays}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Holidays
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AttendanceIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="#2196f3">
                                {summary.attendancePercentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Attendance %
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Chart Section with Toggle */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Attendance Analytics
                    </Typography>
                    <ToggleButtonGroup
                        value={chartView}
                        exclusive
                        onChange={(event, newView) => newView && setChartView(newView)}
                        size="small"
                    >
                        <ToggleButton value="monthly">Monthly View</ToggleButton>
                        <ToggleButton value="term">Term View</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{ height: 400 }}>
                    {chartView === 'monthly' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlyChartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#66bb6a" stopOpacity={0.3}/>
                                    </linearGradient>
                                    <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef5350" stopOpacity={0.3}/>
                                    </linearGradient>
                                    <linearGradient id="holidayGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffc107" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ffca28" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    axisLine={{ stroke: '#e0e0e0' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    axisLine={{ stroke: '#e0e0e0' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="present"
                                    stackId="a"
                                    fill="url(#presentGradient)"
                                    name="Present"
                                    radius={[2, 2, 0, 0]}
                                    animationDuration={1000}
                                />
                                <Bar
                                    dataKey="absent"
                                    stackId="a"
                                    fill="url(#absentGradient)"
                                    name="Absent"
                                    radius={[2, 2, 0, 0]}
                                    animationDuration={1000}
                                />
                                <Bar
                                    dataKey="holiday"
                                    stackId="a"
                                    fill="url(#holidayGradient)"
                                    name="Holiday"
                                    radius={[2, 2, 0, 0]}
                                    animationDuration={1000}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={termChartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="termGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#42a5f5" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="term"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    axisLine={{ stroke: '#e0e0e0' }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    axisLine={{ stroke: '#e0e0e0' }}
                                    label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Attendance']}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="attendance"
                                    fill="url(#termGradient)"
                                    radius={[4, 4, 0, 0]}
                                    name="Attendance %"
                                    animationDuration={1000}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </Paper>

            {/* Daily Attendance Table */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Daily Attendance Records
                </Typography>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Day</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAttendance
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((record, index) => {
                                const date = new Date(record.date);
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

                                return (
                                    <TableRow key={index} hover>
                                        <TableCell>{date.toLocaleDateString()}</TableCell>
                                        <TableCell>{dayName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.status}
                                                color={
                                                    record.status === 'Present' ? 'success' :
                                                    record.status === 'Absent' ? 'error' :
                                                    record.status === 'Holiday' ? 'warning' : 'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={filteredAttendance.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Paper>

            {/* Term Summary Table */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Term Summary
                </Typography>

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Term</strong></TableCell>
                            <TableCell align="center"><strong>Working Days</strong></TableCell>
                            <TableCell align="center"><strong>Present</strong></TableCell>
                            <TableCell align="center"><strong>Absent</strong></TableCell>
                            <TableCell align="center"><strong>Attendance %</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {['Term 1', 'Term 2', 'Term 3'].map((termName) => {
                            const termAttendance = filteredAttendance.filter(record => {
                                const date = new Date(record.date);
                                const month = date.getMonth() + 1;
                                const termMonths = {
                                    'Term 1': [1, 2, 3, 4],
                                    'Term 2': [5, 6, 7, 8],
                                    'Term 3': [9, 10, 11, 12]
                                };
                                return termMonths[termName]?.includes(month);
                            });

                            const workingDays = termAttendance.length;
                            const present = termAttendance.filter(r => r.status === 'Present').length;
                            const absent = termAttendance.filter(r => r.status === 'Absent').length;
                            const percentage = workingDays > 0 ? ((present / workingDays) * 100).toFixed(1) : '0.0';

                            return (
                                <TableRow key={termName}>
                                    <TableCell>{termName}</TableCell>
                                    <TableCell align="center">{workingDays}</TableCell>
                                    <TableCell align="center">{present}</TableCell>
                                    <TableCell align="center">{absent}</TableCell>
                                    <TableCell align="center">{percentage}%</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
};

export default StudentAttendanceDashboard;