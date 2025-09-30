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
    TextField
} from '@mui/material';
import { PurpleButton, GreenButton } from '../../components/buttonStyles';
import Popup from '../../components/Popup';

const ClassAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { classId } = useParams();
    
    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    // Check if teacher has attendance permission for this class
    const attendanceClass = currentUser?.attendanceClass || currentUser?.teachSclass;
    const hasAttendancePermission = attendanceClass && (attendanceClass._id === classId);
    
    const [attendanceData, setAttendanceData] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    
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
            // Here you would make an API call to save attendance
            // For now, just show success message
            const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
            const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
            
            setMessage(`Attendance marked successfully! Present: ${presentCount}, Absent: ${absentCount}`);
            setShowPopup(true);
            
            // Navigate back after a delay
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            setMessage("Error marking attendance. Please try again.");
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
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Access Denied
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    You don't have permission to take attendance for this class.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You can only take attendance for your assigned attendance class.
                </Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }
    
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Mark Class Attendance
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <TextField
                        label="Date"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <Button variant="outlined" onClick={markAllPresent}>
                        Mark All Present
                    </Button>
                    <Button variant="outlined" onClick={markAllAbsent}>
                        Mark All Absent
                    </Button>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip 
                        label={`Present: ${presentCount}`} 
                        color="success" 
                        variant="outlined" 
                    />
                    <Chip 
                        label={`Absent: ${absentCount}`} 
                        color="error" 
                        variant="outlined" 
                    />
                    <Chip 
                        label={`Total: ${sclassStudents?.length || 0}`} 
                        color="info" 
                        variant="outlined" 
                    />
                </Box>
            </Paper>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Roll Number</TableCell>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Attendance Status</TableCell>
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
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </Button>
                <PurpleButton 
                    variant="contained" 
                    onClick={handleSubmitAttendance}
                    disabled={!sclassStudents || sclassStudents.length === 0}
                >
                    Submit Attendance
                </PurpleButton>
            </Box>
            
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </Box>
    );
};

export default ClassAttendance;