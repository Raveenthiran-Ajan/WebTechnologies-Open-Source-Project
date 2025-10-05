import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
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
    Card,
    CardContent,
    Grid,
    FormControl,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    BeachAccess,
    NavigateNext,
    CalendarToday,
    People,
    AssignmentTurnedIn,
    School,
    Send,
    ArrowBack
} from '@mui/icons-material';
import Popup from '../../components/Popup';
import axios from 'axios';

const SimpleTermAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { classId } = useParams();
    
    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    
    // Simple state management
    const [attendanceData, setAttendanceData] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentTerm, setCurrentTerm] = useState('TERM_1');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
    const [checkingSubmission, setCheckingSubmission] = useState(false);
    const [bulkActionMode, setBulkActionMode] = useState('present'); // 'present', 'absent', 'holiday'
    
    // Determine current term based on month
    useEffect(() => {
        const month = new Date().getMonth() + 1; // 1-12
        if (month >= 1 && month <= 4) setCurrentTerm('TERM_1');
        else if (month >= 5 && month <= 8) setCurrentTerm('TERM_2');
        else setCurrentTerm('TERM_3');
    }, []);
    
    useEffect(() => {
        if (classId) {
            dispatch(getClassStudents(classId));
        }
    }, [dispatch, classId]);
    
    useEffect(() => {
        // Initialize all students as present
        if (sclassStudents && sclassStudents.length > 0) {
            const initialData = {};
            sclassStudents.forEach(student => {
                initialData[student._id] = 'Present';
            });
            setAttendanceData(initialData);
        }
    }, [sclassStudents]);
    
    // Check if attendance is already submitted for the selected date
    useEffect(() => {
        const checkAttendanceSubmission = async () => {
            if (!sclassStudents || sclassStudents.length === 0 || !attendanceDate) return;
            
            setCheckingSubmission(true);
            
            // Reset attendance data while checking
            const resetData = {};
            sclassStudents.forEach(student => {
                resetData[student._id] = 'Present';
            });
            setAttendanceData(resetData);
            
            try {
                // Check first student's attendance for the selected date
                const firstStudent = sclassStudents[0];
                const response = await axios.get(`http://localhost:5000/Student/${firstStudent._id}`);
                
                if (response.data && response.data.attendance) {
                    const selectedDate = new Date(attendanceDate);
                    const existingAttendance = response.data.attendance.find(record => {
                        const recordDate = new Date(record.date);
                        return recordDate.toDateString() === selectedDate.toDateString();
                    });
                    
                    if (existingAttendance) {
                        setIsAlreadySubmitted(true);
                        console.log('Attendance already submitted for', attendanceDate);
                        
                        // Load existing attendance data
                        const existingData = {};
                        for (let student of sclassStudents) {
                            try {
                                const studentResponse = await axios.get(`http://localhost:5000/Student/${student._id}`);
                                const studentRecord = studentResponse.data.attendance.find(record => {
                                    const recordDate = new Date(record.date);
                                    return recordDate.toDateString() === new Date(attendanceDate).toDateString();
                                });
                                existingData[student._id] = studentRecord ? studentRecord.status : 'Present';
                            } catch (error) {
                                existingData[student._id] = 'Present';
                            }
                        }
                        setAttendanceData(existingData);
                    } else {
                        setIsAlreadySubmitted(false);
                        // Reset to initial state (all present) for new date
                        const initialData = {};
                        sclassStudents.forEach(student => {
                            initialData[student._id] = 'Present';
                        });
                        setAttendanceData(initialData);
                    }
                } else {
                    setIsAlreadySubmitted(false);
                }
            } catch (error) {
                console.error('Error checking attendance submission:', error);
                setIsAlreadySubmitted(false);
            } finally {
                setCheckingSubmission(false);
            }
        };
        
        checkAttendanceSubmission();
    }, [attendanceDate, sclassStudents]);
    
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
        if (isSubmitting) return;
        
        // Check if already submitted
        if (isAlreadySubmitted) {
            setMessage("Attendance already submitted for this date! You cannot submit twice for the same day.");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
            return;
        }
        
        try {
            setIsSubmitting(true);
            setMessage("Submitting attendance...");
            setShowPopup(true);

            // Submit attendance for each student using the existing StudentAttendance endpoint
            const attendancePromises = Object.entries(attendanceData).map(([studentId, status]) => {
                return axios.put(`http://localhost:5000/StudentAttendance/${studentId}`, {
                    subName: null, // No subject for daily attendance - handled by backend
                    status: status,
                    date: attendanceDate,
                    isDailyAttendance: true // Flag to indicate this is daily attendance
                });
            });

            await Promise.all(attendancePromises);
            
            const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
            const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
            const holidayCount = Object.values(attendanceData).filter(status => status === 'Holiday').length;
            
            setMessage(`Attendance submitted successfully! Present: ${presentCount}, Absent: ${absentCount}, Holiday: ${holidayCount}`);
            setIsAlreadySubmitted(true); // Mark as submitted
            
            setTimeout(() => {
                setShowPopup(false);
                navigate(-1);
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting attendance:', error);
            setMessage(`Error: ${error.response?.data?.message || 'Failed to submit attendance'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return (
            <Container>
                <Typography variant="h6">Loading students...</Typography>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container>
                <Typography variant="h6" color="error">Error: {error}</Typography>
            </Container>
        );
    }
    
    const presentCount = isAlreadySubmitted ? Object.values(attendanceData).filter(status => status === 'Present').length : 0;
    const absentCount = isAlreadySubmitted ? Object.values(attendanceData).filter(status => status === 'Absent').length : 0;
    const holidayCount = isAlreadySubmitted ? Object.values(attendanceData).filter(status => status === 'Holiday').length : 0;
    
    return (
        <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Page Header */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                                    <School sx={{ mr: 2, verticalAlign: 'middle' }} />
                                    Daily Class Attendance
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Mark attendance for {sclassStudents?.length || 0} students • {currentTerm.replace('_', ' ')}
                                </Typography>
                            </Box>
                            <Chip
                                label="Active Session"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            {/* Statistics Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 1, border: '1px solid #e3f2fd' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <CheckCircle sx={{ fontSize: 32, color: '#4caf50', mr: 1 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                    {presentCount}
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
                                Present Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 1, border: '1px solid #ffebee' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <Cancel sx={{ fontSize: 32, color: '#f44336', mr: 1 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                                    {absentCount}
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
                                Absent Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 1, border: '1px solid #fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <BeachAccess sx={{ fontSize: 32, color: '#ff9800', mr: 1 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                                    {holidayCount}
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
                                Holiday Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 1, border: '1px solid #e8eaf6' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3', mb: 2 }}>
                                {sclassStudents?.length || 0}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
                                Total Students
                            </Typography>
                            {/* <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                                Class Capacity
                            </Typography> */}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* Controls Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%', backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ color: '#2196f3' }} />
                            Date Selection
                        </Typography>
                        <TextField
                            label="Attendance Date"
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{ mt: 2 }}
                            variant="outlined"
                        />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242', mb: 1 }}>
                                Current Term: {currentTerm.replace('_', ' ')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                • Term 1: Jan-Apr • Term 2: May-Aug • Term 3: Sep-Dec
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%', backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentTurnedIn sx={{ color: '#2196f3' }} />
                            Bulk Actions
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color={
                                    bulkActionMode === 'present' ? 'success' :
                                    bulkActionMode === 'absent' ? 'error' : 'warning'
                                }
                                onClick={handleBulkAction}
                                disabled={isAlreadySubmitted || checkingSubmission}
                                startIcon={
                                    bulkActionMode === 'present' ? <CheckCircle /> :
                                    bulkActionMode === 'absent' ? <Cancel /> : <BeachAccess />
                                }
                                sx={{ minWidth: 160, py: 1.5, fontWeight: 600, borderRadius: 2 }}
                            >
                                Mark All {bulkActionMode === 'present' ? 'Present' :
                                         bulkActionMode === 'absent' ? 'Absent' : 'Holiday'}
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={cycleBulkActionMode}
                                disabled={isAlreadySubmitted || checkingSubmission}
                                sx={{ minWidth: 50, height: 50, borderRadius: 2 }}
                            >
                                <NavigateNext />
                            </Button>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
                            Click arrow to cycle through options
                        </Typography>

                        {isAlreadySubmitted && (
                            <Chip
                                label="✓ Attendance already submitted for this date"
                                color="info"
                                variant="outlined"
                                sx={{ mt: 2, fontWeight: 500 }}
                            />
                        )}
                    </Paper>
                </Grid>
            </Grid>
            {/* Student List */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <People sx={{ color: '#2196f3' }} />
                            Student Attendance List
                        </Typography>

                        <TableContainer sx={{ mt: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#424242' }}>Roll No.</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#424242' }}>Student Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#424242' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sclassStudents && sclassStudents.map((student) => (
                                        <TableRow key={student._id} hover sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                                            <TableCell sx={{ fontSize: '0.95rem', color: '#424242' }}>{student.rollNum}</TableCell>
                                            <TableCell sx={{ fontSize: '0.95rem', color: '#424242' }}>{student.name}</TableCell>
                                            <TableCell>
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={attendanceData[student._id] || 'Present'}
                                                        onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                                        disabled={isAlreadySubmitted || checkingSubmission}
                                                        sx={{ borderRadius: 1 }}
                                                    >
                                                        <MenuItem value="Present">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <CheckCircle sx={{ color: '#4caf50', fontSize: 18 }} />
                                                                Present
                                                            </Box>
                                                        </MenuItem>
                                                        <MenuItem value="Absent">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Cancel sx={{ color: '#f44336', fontSize: 18 }} />
                                                                Absent
                                                            </Box>
                                                        </MenuItem>
                                                        <MenuItem value="Holiday">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <BeachAccess sx={{ color: '#ff9800', fontSize: 18 }} />
                                                                Holiday
                                                            </Box>
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
            {/* Submit Actions */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 1, border: '1px solid #e3f2fd' }}>
                        <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Send sx={{ color: '#2196f3' }} />
                            Submit Attendance
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                                startIcon={<ArrowBack />}
                                sx={{ minWidth: 120, py: 0.75, fontSize: '0.9rem', fontWeight: 600, borderRadius: 2 }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                color={isAlreadySubmitted ? "error" : "success"}
                                size="small"
                                onClick={handleSubmitAttendance}
                                disabled={!sclassStudents || sclassStudents.length === 0 || isSubmitting || checkingSubmission}
                                sx={{ minWidth: 120, py: 0.75, fontSize: '0.9rem', fontWeight: 600, borderRadius: 2 }}
                            >
                                {checkingSubmission ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Checking...
                                    </>
                                ) : isSubmitting ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Submitting...
                                    </>
                                ) : isAlreadySubmitted ? (
                                    <>
                                        <CheckCircle sx={{ mr: 1 }} />
                                        Already Submitted
                                    </>
                                ) : (
                                    <>
                                        <Send sx={{ mr: 1 }} />
                                        Submit Attendance
                                    </>
                                )}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </Container>
    );
};

export default SimpleTermAttendance;