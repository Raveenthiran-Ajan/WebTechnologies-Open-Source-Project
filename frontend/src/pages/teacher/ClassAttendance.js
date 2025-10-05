import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import axios from 'axios';
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
    Button,
    Chip,
    TextField,
    Container,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import { CheckCircle, Cancel, BeachAccess, NavigateNext } from '@mui/icons-material';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import Popup from '../../components/Popup';

const ClassAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { classId } = useParams();
    
    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    // Check if teacher has attendance permission for this class
    // TEMPORARILY DISABLED FOR TESTING - Allow all teachers to access attendance
    // const attendanceClass = currentUser?.attendanceClass;
    // const teachSclasses = currentUser?.teachSclasses || [];
    // const hasAttendancePermission = attendanceClass &&
    //     (attendanceClass._id === classId || attendanceClass === classId) ||
    //     teachSclasses.some(sclass => sclass._id === classId || sclass === classId);
    const hasAttendancePermission = true; // TEMP: Allow all access for testing
    

    
    const [attendanceData, setAttendanceData] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [bulkActionMode, setBulkActionMode] = useState('present'); // 'present', 'absent', 'holiday'
    
    useEffect(() => {
        if (classId) {
            dispatch(getClassStudents(classId));
        }
    }, [dispatch, classId]);
    
    useEffect(() => {
        // Initialize attendance data for all students as present by default
        if (sclassStudents && sclassStudents.length > 0) {
            const initialData = {};
            
            // Filter students by teacher's attendance responsibility sections
            const teacherAttendanceSections = currentUser?.attendanceSections || [];
            const filteredStudents = teacherAttendanceSections.length > 0 
                ? sclassStudents.filter(student => 
                    teacherAttendanceSections.includes(student.sectionName)
                  )
                : sclassStudents; // If no sections assigned, show all (for backward compatibility)
            
            filteredStudents.forEach(student => {
                initialData[student._id] = 'Present';
            });
            setAttendanceData(initialData);
        }
    }, [sclassStudents, currentUser]);
    
    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };
    
    const markAllPresent = () => {
        const allPresentData = {};
        sclassStudents.forEach(student => {
            allPresentData[student._id] = 'Present';
        });
        setAttendanceData(allPresentData);
    };
    
    const markAllAbsent = () => {
        const allAbsentData = {};
        sclassStudents.forEach(student => {
            allAbsentData[student._id] = 'Absent';
        });
        setAttendanceData(allAbsentData);
    };
    
    const markAllHoliday = () => {
        const allHolidayData = {};
        sclassStudents.forEach(student => {
            allHolidayData[student._id] = 'Holiday';
        });
        setAttendanceData(allHolidayData);
    };
    
    const handleBulkAction = () => {
        switch (bulkActionMode) {
            case 'present':
                markAllPresent();
                break;
            case 'absent':
                markAllAbsent();
                break;
            case 'holiday':
                markAllHoliday();
                break;
            default:
                markAllPresent();
        }
    };
    
    const cycleBulkActionMode = () => {
        setBulkActionMode(prev => {
            switch (prev) {
                case 'present':
                    return 'absent';
                case 'absent':
                    return 'holiday';
                case 'holiday':
                    return 'present';
                default:
                    return 'present';
            }
        });
    };
    
    const handleSubmitAttendance = async () => {
        try {
            setMessage("Submitting daily attendance...");
            setShowPopup(true);

            // Submit daily attendance for each student (not per subject)
            console.log('Submitting daily attendance for date:', attendanceDate);
            
            const attendancePromises = Object.entries(attendanceData).map(([studentId, status]) => {
                const attendancePayload = {
                    status: status,
                    date: attendanceDate,
                    isDailyAttendance: true // Mark as daily attendance
                };
                console.log(`Submitting daily attendance for student ${studentId}:`, attendancePayload);
                
                return axios.put(`http://localhost:5000/StudentAttendance/${studentId}`, attendancePayload);
            });

            await Promise.all(attendancePromises);
            
            const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
            const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
            const holidayCount = Object.values(attendanceData).filter(status => status === 'Holiday').length;
            
            setMessage(`Daily attendance submitted successfully! Present: ${presentCount}, Absent: ${absentCount}, Holiday: ${holidayCount}`);
            
            // Navigate back after a delay
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            console.error('Error submitting attendance:', error);
            setMessage(`Error submitting attendance: ${error.response?.data?.message || error.message}`);
            setShowPopup(true);
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div>Error loading students: {error}</div>;
    }
    
    if (!hasAttendancePermission) {
        return (
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main', mb: 3, textAlign: 'center' }}>
                    <Typography variant="h5" component="h1" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        You don't have permission to take attendance for this class.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You can only take attendance for your assigned sections.
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </Paper>
            </Container>
        );
    }
    
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    
    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                <Typography variant="h5" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                    Mark Daily Section Attendance
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Chip 
                        label="Daily Attendance"
                        color="primary"
                        variant="filled"
                        size="large"
                    />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        Attendance Settings
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                        <TextField
                            label="Date"
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                        <Button 
                            variant="contained" 
                            color={
                                bulkActionMode === 'present' ? 'success' :
                                bulkActionMode === 'absent' ? 'error' : 'warning'
                            }
                            onClick={handleBulkAction}
                            startIcon={
                                bulkActionMode === 'present' ? <CheckCircle /> :
                                bulkActionMode === 'absent' ? <Cancel /> : <BeachAccess />
                            }
                            sx={{ minWidth: 160 }}
                        >
                            Mark All {bulkActionMode === 'present' ? 'Present' : 
                                     bulkActionMode === 'absent' ? 'Absent' : 'Holiday'}
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={cycleBulkActionMode}
                            sx={{ minWidth: 40, px: 1 }}
                        >
                            <NavigateNext />
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                            Click cycle button to change action
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                        <Chip 
                            label={`Present: ${Object.values(attendanceData).filter(status => status === 'Present').length}`} 
                            color="success" 
                            variant="filled" 
                        />
                        <Chip 
                            label={`Absent: ${Object.values(attendanceData).filter(status => status === 'Absent').length}`} 
                            color="error" 
                            variant="filled" 
                        />
                        <Chip 
                            label={`Holiday: ${Object.values(attendanceData).filter(status => status === 'Holiday').length}`} 
                            color="warning" 
                            variant="filled" 
                        />
                        <Chip 
                            label={`Total: ${(() => {
                                const teacherAttendanceSections = currentUser?.attendanceSections || [];
                                const filteredStudents = teacherAttendanceSections.length > 0 
                                    ? sclassStudents.filter(student => 
                                        teacherAttendanceSections.includes(student.sectionName)
                                      )
                                    : sclassStudents;
                                return filteredStudents?.length || 0;
                            })()}`} 
                            color="info" 
                            variant="filled" 
                        />
                    </Box>
                </Box>
            </Paper>
            
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Student Attendance List
                </Typography>
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Roll Number</strong></TableCell>
                                <TableCell><strong>Student Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Attendance Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(() => {
                                // Filter students by teacher's attendance responsibility sections
                                const teacherAttendanceSections = currentUser?.attendanceSections || [];
                                const filteredStudents = teacherAttendanceSections.length > 0 
                                    ? sclassStudents.filter(student => 
                                        teacherAttendanceSections.includes(student.sectionName)
                                      )
                                    : sclassStudents; // If no sections assigned, show all (for backward compatibility)
                                
                                return filteredStudents && filteredStudents.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.rollNum}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={attendanceData[student._id] || 'Present'}
                                                    onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                                >
                                                    <MenuItem value="Present">Present</MenuItem>
                                                    <MenuItem value="Absent">Absent</MenuItem>
                                                    <MenuItem value="Holiday">Holiday</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                ));
                            })()}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleSubmitAttendance}
                        disabled={!sclassStudents || sclassStudents.length === 0}
                    >
                        Submit Daily Attendance
                    </Button>
                </Box>
            </Paper>
            
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </Container>
    );
};

export default ClassAttendance;