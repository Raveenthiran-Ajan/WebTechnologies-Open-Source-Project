import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { getCurrentTerm, getTermName, getTermMonths } from '../../utils/termUtils';
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
    Checkbox,
    FormControlLabel
} from '@mui/material';
// Removed unused icon and DataGrid imports
import Popup from '../../components/Popup';

const ClassAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { classId } = useParams();
    
    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    // Attendance permissions - class-wide only
    const attendanceClass = currentUser?.attendanceClass;
    const assignedAttendanceClassId = attendanceClass && (attendanceClass._id || attendanceClass);
    const hasAttendancePermission = String(assignedAttendanceClassId || '') === String(classId);
    

    
    const [attendanceData, setAttendanceData] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    // Bulk toggles via checkboxes
    const [allPresentChecked, setAllPresentChecked] = useState(false);
    const [allHolidayChecked, setAllHolidayChecked] = useState(false);
    // const [bulkActionMode, setBulkActionMode] = useState('present'); // removed toggle button flow
    const [searchTerm, setSearchTerm] = useState('');
    const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
    const [checkingSubmission, setCheckingSubmission] = useState(false);
    
    useEffect(() => {
        if (classId) {
            dispatch(getClassStudents(classId));
        }
    }, [dispatch, classId]);
    
    useEffect(() => {
        // Initialize attendance data for all students
        const initializeAttendanceData = async () => {
            if (sclassStudents && sclassStudents.length > 0) {
                const initialData = {};
                
                // First, set default to Present for all students
                sclassStudents.forEach(student => {
                    initialData[student._id] = 'Present';
                });
                
                // If attendance is already submitted for this date, load the existing data
                if (isAlreadySubmitted) {
                    try {
                        // Load attendance data for all students for this date
                        const attendancePromises = sclassStudents.map(student => 
                            axios.get(`${API_BASE_URL}/Student/${student._id}`)
                        );
                        
                        const responses = await Promise.all(attendancePromises);
                        
                        responses.forEach((resp, index) => {
                            const student = sclassStudents[index];
                            const attendance = resp.data?.attendance || [];
                            
                            // Find attendance record for the selected date
                            const record = attendance.find(a => {
                                const sameDay = new Date(a.date).toDateString() === new Date(attendanceDate).toDateString();
                                const isDaily = a.isTermAttendance === false || a.isTermAttendance === undefined;
                                return sameDay && isDaily && (!a.subName || a.subName === null);
                            });
                            
                            if (record) {
                                initialData[student._id] = record.status;
                            }
                        });
                    } catch (error) {
                        console.error('Error loading existing attendance data:', error);
                        // Keep default values if loading fails
                    }
                }
                
                setAttendanceData(initialData);
            }
        };
        
        initializeAttendanceData();
    }, [sclassStudents, isAlreadySubmitted, attendanceDate]);

    // Check if attendance already submitted for the selected date (class-wide daily attendance)
    useEffect(() => {
        const checkSubmitted = async () => {
            if (!classId || !attendanceDate || !sclassStudents || sclassStudents.length === 0) {
                setIsAlreadySubmitted(false);
                return;
            }
            try {
                setCheckingSubmission(true);
                // Query first student for the selected date; if has a daily record, assume class submitted
                const firstStudent = sclassStudents[0];
                const resp = await axios.get(`${API_BASE_URL}/Student/${firstStudent._id}`);
                const att = resp.data?.attendance || [];
                const exists = att.some(a => {
                    const sameDay = new Date(a.date).toDateString() === new Date(attendanceDate).toDateString();
                    const isDaily = a.isTermAttendance === false || a.isTermAttendance === undefined;
                    return sameDay && isDaily && (!a.subName || a.subName === null);
                });
                setIsAlreadySubmitted(Boolean(exists));
            } catch (e) {
                setIsAlreadySubmitted(false);
            } finally {
                setCheckingSubmission(false);
            }
        };
        checkSubmitted();
    }, [classId, attendanceDate, sclassStudents]);
    
    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };
    
    const markAllPresent = () => {
        const newData = { ...attendanceData };
        sclassStudents.forEach(student => {
            newData[student._id] = 'Present';
        });
        setAttendanceData(newData);
    };
    
    const markAllAbsent = () => {
        const newData = { ...attendanceData };
        sclassStudents.forEach(student => {
            newData[student._id] = 'Absent';
        });
        setAttendanceData(newData);
    };

    const markAllHoliday = () => {
        const newData = { ...attendanceData };
        sclassStudents.forEach(student => {
            newData[student._id] = 'Holiday';
        });
        setAttendanceData(newData);
    };
    
    // Handlers for top-level checkboxes
    const handleAllPresentToggle = (e) => {
        const checked = e.target.checked;
        setAllPresentChecked(checked);
        if (checked) {
            setAllHolidayChecked(false);
            markAllPresent();
        } else {
            // Unchecking All Present sets everyone to Absent
            markAllAbsent();
        }
    };

    const handleAllHolidayToggle = (e) => {
        const checked = e.target.checked;
        setAllHolidayChecked(checked);
        if (checked) {
            setAllPresentChecked(false);
            markAllHoliday();
        } else {
            // Unchecking Holiday (All) sets everyone to Absent
            markAllAbsent();
        }
    };

    // Keep master checkboxes in sync with row-level changes
    useEffect(() => {
        if (!sclassStudents || sclassStudents.length === 0) {
            setAllPresentChecked(false);
            setAllHolidayChecked(false);
            return;
        }
        const statuses = sclassStudents.map(s => attendanceData[s._id]);
        const allArePresent = statuses.length > 0 && statuses.every(st => st === 'Present');
        const allAreHoliday = statuses.length > 0 && statuses.every(st => st === 'Holiday');
        setAllPresentChecked(allArePresent);
        setAllHolidayChecked(allAreHoliday);
    }, [attendanceData, sclassStudents]);
    
    const handleSubmitAttendance = async () => {
        if (isAlreadySubmitted) {
            setMessage('Attendance already submitted for this date!');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
            return;
        }
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
            setIsAlreadySubmitted(true);
            
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
                        You can only take attendance for your assigned class.
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
    
    const filteredStudents = sclassStudents ? sclassStudents.filter(student =>
        student.rollNum.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
    
    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                <Typography variant="h5" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                    Mark Daily Class Attendance
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
                    
                    {/* Term Details */}
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            Term Details
                        </Typography>
                        {(() => {
                            const currentTermKey = getCurrentTerm(new Date(attendanceDate));
                            const termName = getTermName(currentTermKey);
                            const termMonths = getTermMonths(currentTermKey);
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            const termMonthNames = termMonths.map(m => monthNames[m - 1]).join(', ');
                            return (
                                <>
                                    <Typography variant="body1">
                                        Current Term: {termName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Months: {termMonthNames}
                                    </Typography>
                                </>
                            );
                        })()}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="success"
                                    checked={allPresentChecked}
                                    onChange={handleAllPresentToggle}
                                />
                            }
                            label="All Present"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="warning"
                                    checked={allHolidayChecked}
                                    onChange={handleAllHolidayToggle}
                                />
                            }
                            label="Holiday (All Students)"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                            Tip: Unchecked student rows are counted as Absent
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
                            label={`Total: ${sclassStudents?.length || 0}`} 
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
                
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Search by Roll Number or Name"
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Roll Number</strong></TableCell>
                                <TableCell><strong>Student Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Present</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents && filteredStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={attendanceData[student._id] === 'Present'}
                                            onChange={(e) => handleAttendanceChange(student._id, e.target.checked ? 'Present' : 'Absent')}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
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
                        color={isAlreadySubmitted ? 'error' : 'primary'}
                        onClick={handleSubmitAttendance}
                        disabled={!sclassStudents || sclassStudents.length === 0 || checkingSubmission}
                    >
                        {isAlreadySubmitted ? 'Already Submitted' : 'Submit Daily Attendance'}
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