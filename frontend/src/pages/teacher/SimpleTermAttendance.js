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
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { CheckCircle, Cancel, BeachAccess, NavigateNext } from '@mui/icons-material';
import Popup from '../../components/Popup';
import axios from 'axios';

const SimpleTermAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { classId } = useParams();
    
    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
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
            try {
                // Check first student's attendance for the selected date
                const firstStudent = sclassStudents[0];
                const response = await axios.get(`http://localhost:5000/Student/${firstStudent._id}`);
                
                if (response.data && response.data.attendance) {
                    const selectedDate = new Date(attendanceDate).toDateString();
                    const existingAttendance = response.data.attendance.find(record => 
                        new Date(record.date).toDateString() === selectedDate
                    );
                    
                    if (existingAttendance) {
                        setIsAlreadySubmitted(true);
                        console.log('Attendance already submitted for', attendanceDate);
                        
                        // Load existing attendance data
                        const existingData = {};
                        for (let student of sclassStudents) {
                            try {
                                const studentResponse = await axios.get(`http://localhost:5000/Student/${student._id}`);
                                const studentRecord = studentResponse.data.attendance.find(record => 
                                    new Date(record.date).toDateString() === selectedDate
                                );
                                existingData[student._id] = studentRecord ? studentRecord.status : 'Present';
                            } catch (error) {
                                existingData[student._id] = 'Present';
                            }
                        }
                        setAttendanceData(existingData);
                    } else {
                        setIsAlreadySubmitted(false);
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
    
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    const holidayCount = Object.values(attendanceData).filter(status => status === 'Holiday').length;
    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" align="center" color="primary" gutterBottom>
                    Daily Class Attendance
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Current Term: {currentTerm.replace('_', ' ')}
                                </Typography>
                                <Typography variant="body2">
                                    • Term 1: Jan-Apr • Term 2: May-Aug • Term 3: Sep-Dec
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Today's Summary
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip label={`Present: ${presentCount}`} color="success" size="small" />
                                    <Chip label={`Absent: ${absentCount}`} color="error" size="small" />
                                    <Chip label={`Holiday: ${holidayCount}`} color="warning" size="small" />
                                    <Chip label={`Total: ${sclassStudents?.length || 0}`} color="info" size="small" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color={isAlreadySubmitted ? "error" : "success"}>
                                    Submission Status
                                </Typography>
                                {checkingSubmission ? (
                                    <Typography variant="body2">Checking...</Typography>
                                ) : (
                                    <Chip 
                                        label={isAlreadySubmitted ? "Already Submitted" : "Not Submitted"} 
                                        color={isAlreadySubmitted ? "error" : "warning"} 
                                        size="small" 
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                
                {/* Date Selection */}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Attendance Date"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                    />
                </Box>
                
                {/* Bulk Actions */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
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
                        sx={{ minWidth: 160 }}
                    >
                        Mark All {bulkActionMode === 'present' ? 'Present' : 
                                 bulkActionMode === 'absent' ? 'Absent' : 'Holiday'}
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small"
                        onClick={cycleBulkActionMode}
                        disabled={isAlreadySubmitted || checkingSubmission}
                        sx={{ minWidth: 40, px: 1 }}
                    >
                        <NavigateNext />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        Click arrow button to change action
                    </Typography>
                    {isAlreadySubmitted && (
                        <Chip 
                            label="✓ Attendance already taken for this date" 
                            color="info" 
                            variant="outlined"
                        />
                    )}
                </Box>
            </Paper>
            
            {/* Student List */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Student Attendance List
                </Typography>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Roll No.</strong></TableCell>
                                <TableCell><strong>Student Name</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sclassStudents && sclassStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value={attendanceData[student._id] || 'Present'}
                                                onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                                disabled={isAlreadySubmitted || checkingSubmission}
                                            >
                                                <MenuItem value="Present">Present</MenuItem>
                                                <MenuItem value="Absent">Absent</MenuItem>
                                                <MenuItem value="Holiday">Holiday</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            
            {/* Submit Actions */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color={isAlreadySubmitted ? "error" : "primary"}
                        onClick={handleSubmitAttendance}
                        disabled={!sclassStudents || sclassStudents.length === 0 || isSubmitting || checkingSubmission}
                    >
                        {checkingSubmission ? 'Checking...' : 
                         isSubmitting ? 'Submitting...' : 
                         isAlreadySubmitted ? 'Already Submitted' : 
                         'Submit Attendance'}
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

export default SimpleTermAttendance;