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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Container,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import Popup from '../../components/Popup';
import { getCurrentTerm, getTermName, getAllTerms, isDateInTerm } from '../../utils/termUtils';
import axios from 'axios';

const TermAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { classId } = useParams();
    
    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    // Check if teacher is class teacher for this class
    const isClassTeacher = currentUser?.attendanceClass && 
        (currentUser.attendanceClass._id === classId || currentUser.attendanceClass === classId);
    
    const [attendanceData, setAttendanceData] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTerm, setSelectedTerm] = useState(getCurrentTerm());
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [termStats, setTermStats] = useState(null);
    
    useEffect(() => {
        if (classId) {
            dispatch(getClassStudents(classId));
        }
    }, [dispatch, classId]);
    
    useEffect(() => {
        // Initialize attendance data for all students as present by default
        if (sclassStudents && sclassStudents.length > 0) {
            const initialData = {};
            sclassStudents.forEach(student => {
                initialData[student._id] = 'Present';
            });
            setAttendanceData(initialData);
        }
    }, [sclassStudents]);

    useEffect(() => {
        // Update term when date changes
        const newTerm = getCurrentTerm(new Date(attendanceDate));
        if (newTerm !== selectedTerm) {
            setSelectedTerm(newTerm);
        }
    }, [attendanceDate]);

    useEffect(() => {
        // Fetch term statistics
        if (classId && selectedTerm) {
            fetchTermStats();
        }
    }, [classId, selectedTerm]);

    const fetchTermStats = async () => {
        try {
            // This would fetch term-specific statistics
            // For now, we'll calculate basic stats
            setTermStats({
                totalDays: 0,
                attendedDays: 0,
                term: getTermName(selectedTerm)
            });
        } catch (error) {
            console.error('Error fetching term stats:', error);
        }
    };
    
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
    
    const handleSubmitAttendance = async () => {
        try {
            // Validate date is in selected term
            if (!isDateInTerm(new Date(attendanceDate), selectedTerm)) {
                setMessage(`Error: Selected date is not in ${getTermName(selectedTerm)}`);
                setShowPopup(true);
                return;
            }

            setMessage("Submitting term attendance...");
            setShowPopup(true);

            // Submit term-based attendance for each student
            console.log('Submitting term attendance for:', selectedTerm);
            console.log('Date:', attendanceDate);
            
            const attendancePromises = Object.entries(attendanceData).map(([studentId, status]) => {
                const attendancePayload = {
                    status: status,
                    date: attendanceDate,
                    term: selectedTerm,
                    isTermAttendance: true // Flag to distinguish from subject attendance
                };
                console.log(`Submitting for student ${studentId}:`, attendancePayload);
                
                return axios.put(`http://localhost:5000/TermAttendance/${studentId}`, attendancePayload);
            });

            await Promise.all(attendancePromises);
            
            const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
            const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
            
            setMessage(`Term attendance submitted successfully! Present: ${presentCount}, Absent: ${absentCount} for ${getTermName(selectedTerm)}`);
            
            // Navigate back after a delay
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            console.error('Error submitting term attendance:', error);
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
    
    if (!isClassTeacher) {
        return (
            <Container maxWidth="md">
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" color="error" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Only class teachers can take term attendance.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You can only take attendance for your assigned class.
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </Box>
            </Container>
        );
    }
    
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    
    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                    Daily Term Attendance
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Chip 
                        label={`Current Term: ${getTermName(selectedTerm)}`}
                        color="primary"
                        variant="filled"
                        size="large"
                    />
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Academic System
                                </Typography>
                                <Typography variant="body2">
                                    • 1 Year = 3 Terms
                                </Typography>
                                <Typography variant="body2">
                                    • 1 Term = 4 Months
                                </Typography>
                                <Typography variant="body2">
                                    • Daily attendance by Class Teacher
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Term Schedule
                                </Typography>
                                <Typography variant="body2">
                                    Term 1: Jan-Apr • Term 2: May-Aug • Term 3: Sep-Dec
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Current: <strong>{getTermName(selectedTerm)}</strong>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                
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
                        <FormControl fullWidth>
                            <InputLabel>Term</InputLabel>
                            <Select
                                value={selectedTerm}
                                label="Term"
                                onChange={(e) => setSelectedTerm(e.target.value)}
                            >
                                {getAllTerms().map((term) => (
                                    <MenuItem key={term.key} value={term.key}>
                                        {term.name} (Months {term.months.join(', ')})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                        <Button variant="contained" color="success" onClick={markAllPresent}>
                            Mark All Present
                        </Button>
                        <Button variant="contained" color="error" onClick={markAllAbsent}>
                            Mark All Absent
                        </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                        <Chip 
                            label={`Present: ${presentCount}`} 
                            color="success" 
                            variant="filled" 
                        />
                        <Chip 
                            label={`Absent: ${absentCount}`} 
                            color="error" 
                            variant="filled" 
                        />
                        <Chip 
                            label={`Total: ${sclassStudents?.length || 0}`} 
                            color="info" 
                            variant="filled" 
                        />
                    </Box>
                </Box>
            </Box>
            
            {/* Student List */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Daily Attendance - {getTermName(selectedTerm)}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Roll Number</strong></TableCell>
                                <TableCell><strong>Student Name</strong></TableCell>
                                <TableCell><strong>Class</strong></TableCell>
                                <TableCell><strong>Attendance Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sclassStudents && sclassStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.sclassName?.sclassName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value={attendanceData[student._id] || 'Present'}
                                                onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                            >
                                                <MenuItem value="Present">Present</MenuItem>
                                                <MenuItem value="Absent">Absent</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            
            {/* Actions */}
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
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
                        disabled={!sclassStudents || sclassStudents.length === 0 || !selectedTerm}
                    >
                        Submit Term Attendance
                    </Button>
                </Box>
            </Box>
            
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </Container>
    );
};

export default TermAttendance;