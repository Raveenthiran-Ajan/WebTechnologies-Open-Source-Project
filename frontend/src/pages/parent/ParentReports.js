import React from 'react';
import { useSelector } from 'react-redux';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Box, 
    Avatar, 
    Chip, 
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const ParentReports = () => {
    const { currentUser } = useSelector((state) => state.user);
    const children = currentUser?.children || [];

    // Helper function to calculate attendance percentage
    const calculateAttendancePercentage = (attendance) => {
        if (!attendance || attendance.length === 0) {
            return 0;
        }
        const totalPresent = attendance.filter(att => att.status === 'Present').length;
        const totalSessions = attendance.length;
        return Math.round((totalPresent / totalSessions) * 100);
    };

    // Helper function to get class name
    const getClassName = (sclassName) => {
        if (!sclassName) return 'Not Assigned';
        
        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (typeof sclassName === 'string' && sclassName.length === 24 && /^[0-9a-fA-F]{24}$/.test(sclassName)) {
            return 'Not Assigned'; // Show "Not Assigned" instead of ObjectId
        }
        
        if (typeof sclassName === 'string') return sclassName;
        if (typeof sclassName === 'object' && sclassName.sclassName) return sclassName.sclassName;
        if (typeof sclassName === 'object' && sclassName.name) return sclassName.name;
        return 'Not Assigned';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                    sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}
                >
                    <AssessmentIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Academic Reports
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<GradeIcon />}
                        label={`${children.length} ${children.length === 1 ? 'Child' : 'Children'} Reports`} 
                        color="primary" 
                        size="large"
                    />
                </Box>
            </Box>

            {/* Reports Grid */}
            <Grid container spacing={3}>
                {children.length > 0 ? children.map((child, index) => {
                    const attendancePercentage = calculateAttendancePercentage(child.attendance);
                    
                    return (
                        <Grid item xs={12} key={index}>
                            <Card sx={{ 
                                borderRadius: 3,
                                '&:hover': { 
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                                },
                                transition: 'all 0.3s ease-in-out'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    p: 3
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ 
                                            width: 60, 
                                            height: 60,
                                            bgcolor: 'white',
                                            color: 'primary.main',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {child.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                {child.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Roll Number: {child.rollNum}
                                                {getClassName(child.sclassName) !== 'Not Assigned' && ` | Class: ${getClassName(child.sclassName)}`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {attendancePercentage}%
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Attendance
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        {/* Attendance Section */}
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <EventAvailableIcon color="primary" />
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        Attendance Details
                                                    </Typography>
                                                </Box>
                                                
                                                <Box sx={{ mt: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2">Attendance Rate</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {attendancePercentage}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={attendancePercentage} 
                                                        sx={{ 
                                                            height: 8, 
                                                            borderRadius: 5,
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: attendancePercentage >= 75 ? 'success.main' : 
                                                                               attendancePercentage >= 60 ? 'warning.main' : 'error.main'
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                        {child.attendance ? 
                                                            `${child.attendance.filter(att => att.status === 'Present').length}/${child.attendance.length} days present` :
                                                            'No attendance data available'
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Academic Performance Section */}
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <TrendingUpIcon color="primary" />
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        Academic Performance
                                                    </Typography>
                                                </Box>
                                                
                                                {child.examResult && child.examResult.length > 0 ? (
                                                    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 200 }}>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Subject</TableCell>
                                                                    <TableCell align="right">Marks</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {child.examResult.map((result, idx) => (
                                                                    <TableRow key={idx}>
                                                                        <TableCell>{result.subName}</TableCell>
                                                                        <TableCell align="right">{result.marksObtained}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                        No exam results available yet
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                }) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6">No children data available for reports.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default ParentReports;