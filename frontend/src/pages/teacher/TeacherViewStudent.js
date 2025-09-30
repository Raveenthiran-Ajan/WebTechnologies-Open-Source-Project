import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import { useParams } from 'react-router-dom'
import axios from 'axios';
import { BottomNavigation, BottomNavigationAction, Box, Button, Collapse, Paper, Table, TableBody, TableHead, Typography } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomBarChart from '../../components/CustomBarChart'
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const TeacherViewStudent = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { sclassStudents, loading: classLoading } = useSelector((state) => state.sclass);

    const classId = params.classId;
    const subjectId = currentUser.teachSubject?._id;
    const subjectName = currentUser.teachSubject?.subName;

    const [studentAttendances, setStudentAttendances] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');
    const [loading, setLoading] = useState(false);
    const [openStates, setOpenStates] = useState({});

    const handleOpen = (studentId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [studentId]: !prevState[studentId],
        }));
    };

    const refreshAttendanceData = () => {
        fetchStudentAttendances();
    };

    const fetchStudentAttendances = useCallback(async () => {
        if (sclassStudents && sclassStudents.length > 0) {
            setLoading(true);
            try {
                const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
                const promises = sclassStudents.map(async (student) => {
                    try {
                        const response = await axios.get(`${baseURL}/user/student/${student._id}`);
                        const userDetails = response.data;
                            const attendance = userDetails.attendance || [];
                            // Filter attendance for teacher's subject
                            const subjectAttendance = attendance.filter(a => a.subName && a.subName._id === subjectId);
                            const grouped = groupAttendanceBySubject(subjectAttendance);
                            const subEntry = Object.values(grouped)[0]; // Since filtered, only one subject
                            if (subEntry) {
                                const { present, allData, sessions } = subEntry;
                                const percentage = calculateSubjectAttendancePercentage(present, sessions);
                                return {
                                    ...student,
                                    present,
                                    sessions,
                                    percentage,
                                    allData,
                                    subId: subEntry.subId // for expand key
                                };
                            } else {
                                return {
                                    ...student,
                                    present: 0,
                                    sessions: 0,
                                    percentage: 0,
                                    allData: [],
                                    subId: student._id
                                };
                            }
                    } catch (err) {
                        console.error(`Error fetching data for student ${student._id}:`, err);
                        return {
                            ...student,
                            present: 0,
                            sessions: 0,
                            percentage: 0,
                            allData: [],
                            subId: student._id
                        };
                    }
                });

                const results = await Promise.all(promises);
                setStudentAttendances(results);
            } catch (err) {
                console.error('Error fetching student attendances:', err);
            } finally {
                setLoading(false);
            }
        }
    }, [sclassStudents, subjectId]);

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    useEffect(() => {
        if (classId) {
            dispatch(getClassStudents(classId));
        }
    }, [dispatch, classId]);

    useEffect(() => {
        fetchStudentAttendances();
    }, [sclassStudents, subjectId, fetchStudentAttendances]);

    useEffect(() => {
        const handleFocus = () => {
            refreshAttendanceData();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const chartData = studentAttendances.map(s => ({
        name: s.name,
        attendancePercentage: s.percentage
    }));

    const classAverage = studentAttendances.length > 0 ? (studentAttendances.reduce((sum, s) => sum + s.percentage, 0) / studentAttendances.length) : 0;

    const renderTableSection = () => {
        if (studentAttendances.length === 0) {
            return <Typography>No attendance data available.</Typography>;
        }

        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Attendance - {subjectName}
                    </Typography>
                    <Button variant="outlined" onClick={refreshAttendanceData}>
                        Refresh
                    </Button>
                </Box>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Roll Number</StyledTableCell>
                            <StyledTableCell>Present</StyledTableCell>
                            <StyledTableCell>Total Sessions</StyledTableCell>
                            <StyledTableCell>Attendance Percentage</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {studentAttendances.map((student, index) => (
                            <>
                                <StyledTableRow key={index}>
                                    <StyledTableCell>{student.name}</StyledTableCell>
                                    <StyledTableCell>{student.rollNum}</StyledTableCell>
                                    <StyledTableCell>{student.present}</StyledTableCell>
                                    <StyledTableCell>{student.sessions}</StyledTableCell>
                                    <StyledTableCell>{student.percentage.toFixed(2)}%</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Button variant="contained" onClick={() => handleOpen(student.subId)}>
                                            {openStates[student.subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />} Details
                                        </Button>
                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow>
                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                        <Collapse in={openStates[student.subId]} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Attendance Details for {student.name}
                                                </Typography>
                                                <Table size="small" aria-label="purchases">
                                                    <TableHead>
                                                        <StyledTableRow>
                                                            <StyledTableCell>Date</StyledTableCell>
                                                            <StyledTableCell align="right">Status</StyledTableCell>
                                                        </StyledTableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {student.allData.map((data, dataIndex) => {
                                                            const date = new Date(data.date);
                                                            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                            return (
                                                                <StyledTableRow key={dataIndex}>
                                                                    <StyledTableCell component="th" scope="row">
                                                                        {dateString}
                                                                    </StyledTableCell>
                                                                    <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                </StyledTableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </StyledTableCell>
                                </StyledTableRow>
                            </>
                        ))}
                    </TableBody>
                </Table>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">
                        Overall Class Average Attendance: {classAverage.toFixed(2)}%
                    </Typography>
                </Box>
            </>
        );
    };

    const renderChartSection = () => {
        return (
            <>
                <Typography variant="h4" align="center" gutterBottom>
                    Attendance Chart - {subjectName}
                </Typography>
                <CustomBarChart chartData={chartData} dataKey="attendancePercentage" />
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">
                        Overall Class Average Attendance: {classAverage.toFixed(2)}%
                    </Typography>
                </Box>
            </>
        );
    };

    if (classLoading || loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {studentAttendances && studentAttendances.length > 0 ? (
                <>
                    {selectedSection === 'table' && renderTableSection()}
                    {selectedSection === 'chart' && renderChartSection()}

                    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                        <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                            <BottomNavigationAction
                                label="Table"
                                value="table"
                                icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                            />
                            <BottomNavigationAction
                                label="Chart"
                                value="chart"
                                icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                            />
                        </BottomNavigation>
                    </Paper>
                </>
            ) : (
                <Typography variant="h6" gutterBottom component="div">
                    No attendance data available for the class.
                </Typography>
            )}
        </div>
    );
};

export default TeacherViewStudent;
