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
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    IconButton,
    Tooltip,
    Collapse,
    TextField
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download as DownloadIcon, Group as GroupIcon, TrendingUp as TrendingUpIcon, Warning as WarningIcon, KeyboardArrowDown, KeyboardArrowUp, Event as EventIcon, HolidayVillage as HolidayIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import axios from 'axios';
import { calculateOverallAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';
import { getCurrentTerm, getTermName, getTermMonths, getAllTerms, isDateInTerm } from '../../../utils/termUtils';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const AdminAttendanceReport = () => {
    const dispatch = useDispatch();
    const { sclassesList, sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    const [selectedClass, setSelectedClass] = useState('');
    const [reportType, setReportType] = useState('monthly'); // 'monthly' or 'term'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedTerm, setSelectedTerm] = useState(getCurrentTerm());
    const [studentsData, setStudentsData] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [openStates, setOpenStates] = useState({});
    const [chartView, setChartView] = useState('bar');
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpen = (studentId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [studentId]: !prevState[studentId],
        }));
    };

    const handleRefresh = () => {
        // Reset form and clear data
        setSelectedClass('');
        setReportData(null);
        setStudentsData([]);
        setOpenStates({});
    };

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(getClassStudents(getSelectedClassId()));
        }
    }, [dispatch, selectedClass]);

    useEffect(() => {
        if (sclassStudents && sclassStudents.length > 0 && getSelectedClassId()) {
            generateReport();
        }
    }, [sclassStudents, selectedMonth, selectedYear, selectedTerm, reportType, selectedClass]);

    const generateReport = async () => {
        setReportLoading(true);
        try {
            const studentsWithAttendance = await Promise.all(
                sclassStudents.map(async (student) => {
                    try {
                        const response = await axios.get(`http://localhost:5000/Student/${student._id}`);
                        const studentData = response.data;
                        
                        // Filter attendance based on report type
                        let filteredAttendance = [];
                        if (reportType === 'monthly') {
                            filteredAttendance = (studentData.attendance || []).filter(record => {
                                const recordDate = new Date(record.date);
                                return recordDate.getMonth() === selectedMonth && 
                                       recordDate.getFullYear() === selectedYear;
                            });
                        } else {
                            // Term-based
                            filteredAttendance = (studentData.attendance || []).filter(record => {
                                const recordDate = new Date(record.date);
                                return recordDate.getFullYear() === selectedYear && 
                                       isDateInTerm(recordDate, selectedTerm);
                            });
                        }

                        const overallPercentage = calculateOverallAttendancePercentage(filteredAttendance);
                        const attendanceBySubject = groupAttendanceBySubject(filteredAttendance);
                        
                        // Calculate per-student academic days (unique dates where attendance was marked as Present or Absent)
                        const attendanceByDateForStudent = {};
                        (filteredAttendance || []).forEach(att => {
                            const dateKey = new Date(att.date).toDateString();
                            if (!attendanceByDateForStudent[dateKey]) {
                                attendanceByDateForStudent[dateKey] = {
                                    hasPresent: false,
                                    hasAbsent: false,
                                    hasHoliday: false
                                };
                            }
                            if (att.status === 'Present') attendanceByDateForStudent[dateKey].hasPresent = true;
                            else if (att.status === 'Absent') attendanceByDateForStudent[dateKey].hasAbsent = true;
                            else if (att.status === 'Holiday') attendanceByDateForStudent[dateKey].hasHoliday = true;
                        });

                        const studentAcademicDays = Object.values(attendanceByDateForStudent).filter(d => !d.hasHoliday && (d.hasPresent || d.hasAbsent)).length;
                        const studentPresentDays = Object.values(attendanceByDateForStudent).filter(d => d.hasPresent).length;

                        return {
                            ...student,
                            attendance: filteredAttendance,
                            overallPercentage,
                            attendanceBySubject,
                            totalClasses: studentAcademicDays,
                            presentClasses: studentPresentDays
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

            // Calculate overall attendance statistics
            // Calculate class-level statistics based on unique dates
            const allAttendanceRecords = studentsWithAttendance.flatMap(student => student.attendance || []);
            const attendanceByDateClass = {};
            allAttendanceRecords.forEach(record => {
                const dateKey = new Date(record.date).toDateString();
                if (!attendanceByDateClass[dateKey]) {
                    attendanceByDateClass[dateKey] = {
                        hasPresent: false,
                        hasAbsent: false,
                        hasHoliday: false
                    };
                }
                if (record.status === 'Present') attendanceByDateClass[dateKey].hasPresent = true;
                else if (record.status === 'Absent') attendanceByDateClass[dateKey].hasAbsent = true;
                else if (record.status === 'Holiday') attendanceByDateClass[dateKey].hasHoliday = true;
            });

            const academicDays = Object.values(attendanceByDateClass).filter(d => !d.hasHoliday && (d.hasPresent || d.hasAbsent)).length;
            const holidayCount = Object.values(attendanceByDateClass).filter(d => d.hasHoliday).length;

            // presentCount/absentCount remain the total occurrences across students (optional: could be converted to per-day counts)
            const presentCount = allAttendanceRecords.filter(record => record.status === 'Present').length;
            const absentCount = allAttendanceRecords.filter(record => record.status === 'Absent').length;

            setReportData({
                totalStudents,
                classAverage: classAverage.toFixed(1),
                attendanceRanges,
                academicDays,
                holidayCount,
                presentCount,
                absentCount
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

    const getSelectedClassId = () => {
        const selectedClassObj = sclassesList.find(cls => cls.sclassName === selectedClass);
        return selectedClassObj ? selectedClassObj._id : '';
    };

    const getSelectedClassName = () => {
        if (selectedClass) {
            const cls = sclassesList.find(c => c.sclassName === selectedClass || c._id === selectedClass);
            return cls ? cls.sclassName : selectedClass;
        }
        return '';
    };

    const exportToPDF = () => {
        if (!studentsData.length) return;

        const doc = new jsPDF();
        let yPosition = 10;

        // Add class details at the top
        doc.setFontSize(16);
        doc.text('Attendance Report', 10, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.text(`Class: ${getSelectedClassName()}`, 10, yPosition);
        yPosition += 10;

        doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 10, yPosition);
        yPosition += 10;

        if (reportType === 'monthly') {
            doc.text(`Month: ${getMonthName(selectedMonth)} ${selectedYear}`, 10, yPosition);
        } else {
            doc.text(`Term: ${getTermName(selectedTerm)} ${selectedYear}`, 10, yPosition);
        }
        yPosition += 20; // Space before table

    const tableColumn = ['Roll No', 'Student Name', 'Academic Days', 'Present Days', 'Attendance %', 'Status'];
        const tableRows = studentsData.map(student => [
            student.rollNum,
            student.name,
            student.totalClasses,
            student.presentClasses,
            student.overallPercentage.toFixed(1),
            student.overallPercentage >= 90 ? 'Excellent' :
            student.overallPercentage >= 75 ? 'Good' :
            student.overallPercentage >= 60 ? 'Average' : 'Poor'
        ]);

        autoTable(doc, { 
            head: [tableColumn], 
            body: tableRows,
            startY: yPosition
        });
        doc.save(`attendance_report_${getSelectedClassName()}_${reportType}_${selectedYear}.pdf`);
    };

    const renderTableSection = () => {
        const filteredStudents = studentsData.filter(student =>
            student.rollNum.toString().includes(searchQuery) ||
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Student Attendance Details
                    </Typography>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search by Roll No or Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: '300px' }}
                    />
                </Box>

                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={filteredStudents.map((student, index) => ({
                            id: index,
                            rollNum: student.rollNum,
                            name: student.name,
                            presentClasses: student.presentClasses,
                            attendancePercentage: student.overallPercentage.toFixed(1),
                        }))}
                        columns={[
                            { field: 'rollNum', headerName: 'Roll No.', flex: 1 },
                            { field: 'name', headerName: 'Student Name', flex: 2 },
                            { field: 'presentClasses', headerName: 'Present Days', flex: 1 },
                            { field: 'attendancePercentage', headerName: 'Attendance %', flex: 1 },
                        ]}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        disableSelectionOnClick
                    />
                </div>
            </Paper>
        )
    };

    const renderChartSection = () => {
        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Student Attendance Percentage
                    </Typography>
                </Box>

                <Box sx={{ height: 400, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip 
                                formatter={(value, name, props) => [
                                    `${value}%`, 
                                    `${props.payload.fullName} (Roll: ${props.payload.rollNum})`
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="attendance" fill="#2196f3" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        )
    };

    // Chart data
    const barData = studentsData.map(student => ({
        name: student.name.length > 10 ? student.name.substring(0, 10) + '...' : student.name,
        fullName: student.name,
        rollNum: student.rollNum,
        attendance: parseFloat(student.overallPercentage.toFixed(1))
    }));

    // Redesigned Statistics Cards
    const renderStatisticsCards = () => (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <EventIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="#4caf50">
                            {reportData.academicDays}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Academic Days
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #ffc107', height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <HolidayIcon sx={{ fontSize: 40, color: '#ffc107', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="#ffc107">
                            {reportData.holidayCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Holidays
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', border: '1px solid #9c27b0', height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <GroupIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                            {reportData.totalStudents}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Students
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    // Redesigned Filters Section
    const renderFilters = () => (
        <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 0, zIndex: 100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Class Attendance Report
                </Typography>
                <IconButton onClick={handleRefresh} color="primary">
                    <RefreshIcon />
                </IconButton>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        label="Class"
                        placeholder="Search class"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        size="small"
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Report Type
                        </Typography>
                        <ToggleButtonGroup
                            value={reportType}
                            exclusive
                            onChange={(e, newType) => newType && setReportType(newType)}
                            size="small"
                        >
                            <ToggleButton value="monthly">Monthly</ToggleButton>
                            <ToggleButton value="term">Term</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Grid>

                {reportType === 'monthly' ? (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
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
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
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
                    </>
                ) : (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Term</InputLabel>
                                <Select
                                    value={selectedTerm}
                                    label="Term"
                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                >
                                    {getAllTerms().map((term) => (
                                        <MenuItem key={term.key} value={term.key}>
                                            {term.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
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
                    </>
                )}

                <Grid item xs={12} md={3}>
                    <Tooltip title="Export to PDF">
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={exportToPDF}
                            disabled={!studentsData.length}
                            sx={{ height: '56px' }}
                            startIcon={<DownloadIcon />}
                        >
                            Export PDF
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        </Paper>
    );

    // Render the redesigned components
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {renderFilters()}
            {reportData && renderStatisticsCards()}
            {reportData && renderTableSection()}
            {reportData && renderChartSection()}
        </Container>
    );
};

export default AdminAttendanceReport;