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
    Container
} from '@mui/material';
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
    const attendanceClass = currentUser?.attendanceClass;
    const hasAttendancePermission = attendanceClass && 
        (attendanceClass._id === classId || attendanceClass === classId);
    

    
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
            
            setMessage(`Daily attendance submitted successfully! Present: ${presentCount}, Absent: ${absentCount}`);
            
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
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" color="error" gutterBottom>
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
            </Container>
        );
    }
    
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    
    return (
        <Container maxWidth="lg">
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
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
            
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
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
                            {sclassStudents && sclassStudents.map((student) => (
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
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            
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
                        disabled={!sclassStudents || sclassStudents.length === 0}
                    >
                        Submit Daily Attendance
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

export default ClassAttendance;