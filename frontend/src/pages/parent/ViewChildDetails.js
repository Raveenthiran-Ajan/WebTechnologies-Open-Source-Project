import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getChildDetails } from '../../redux/parentRelated/parentHandle';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Container, Card, CardContent, Avatar, Grid, Chip,LinearProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useTranslation } from 'react-i18next';

const ViewChildDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { loading, currentChild, error } = useSelector((state) => state.parent);

    useEffect(() => {
        dispatch(getChildDetails(id));
    }, [dispatch, id]);

    const calculateAttendancePercentage = (attendance) => {
        if (!attendance || attendance.length === 0) {
            return "0.00";
        }
        const totalPresent = attendance.filter(att => att.status === 'Present').length;
        const totalSessions = attendance.length;
        return ((totalPresent / totalSessions) * 100).toFixed(2);
    };

    // Helper function to get class name
    const getClassName = (sclassName) => {
        if (!sclassName) return t('viewChildDetails.notAssigned');

        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (typeof sclassName === 'string' && sclassName.length === 24 && /^[0-9a-fA-F]{24}$/.test(sclassName)) {
            return t('viewChildDetails.classNotAvailable'); // Show meaningful message for ObjectId
        }

        if (typeof sclassName === 'string') return sclassName;
        if (typeof sclassName === 'object' && sclassName.sclassName) return sclassName.sclassName;
        if (typeof sclassName === 'object' && sclassName.name) return sclassName.name;
        return t('viewChildDetails.classInfo');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        {t('viewChildDetails.loading')}
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h6">{t('viewChildDetails.error')}: {error.message}</Typography>
                </Paper>
            </Container>
        );
    }

    if (!currentChild) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">{t('viewChildDetails.noChildDetails')}</Typography>
                </Paper>
            </Container>
        );
    }

    const attendancePercentage = parseFloat(calculateAttendancePercentage(currentChild.attendance));

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                    sx={{ 
                        width: 100, 
                        height: 100, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}
                >
                    {currentChild.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {currentChild.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<GradeIcon />}
                        label={`${t('viewChildDetails.roll')}: ${currentChild.rollNum}`}
                        color="primary" 
                        size="large"
                    />
                    <Chip 
                        icon={<SchoolIcon />}
                        label={`${t('viewChildDetails.class')}: ${getClassName(currentChild.sclassName)}`}
                        color="secondary" 
                        size="large"
                    />
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Attendance Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            p: 3,
                            textAlign: 'center'
                        }}>
                            <EventAvailableIcon sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {t('viewChildDetails.attendance')}
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="h2" sx={{ 
                                    fontWeight: 'bold',
                                    color: attendancePercentage >= 75 ? 'success.main' : 
                                           attendancePercentage >= 60 ? 'warning.main' : 'error.main'
                                }}>
                                    {attendancePercentage}%
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {t('viewChildDetails.overallAttendance')}
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={attendancePercentage} 
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5,
                                    mb: 2,
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: attendancePercentage >= 75 ? '#4caf50' : 
                                                       attendancePercentage >= 60 ? '#ff9800' : '#f44336'
                                    }
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('viewChildDetails.present')}: {currentChild.attendance ? currentChild.attendance.filter(att => att.status === 'Present').length : 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('viewChildDetails.total')}: {currentChild.attendance ? currentChild.attendance.length : 0}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Exam Results Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            p: 3,
                            textAlign: 'center'
                        }}>
                            <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {t('viewChildDetails.examResults')}
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 0 }}>
                            {currentChild.examResult && currentChild.examResult.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                    {t('viewChildDetails.subject')}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                    {t('viewChildDetails.marks')}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentChild.examResult.map((result, index) => (
                                                <TableRow 
                                                    key={index}
                                                    sx={{ 
                                                        '&:hover': { bgcolor: 'grey.50' },
                                                        '&:nth-of-type(odd)': { bgcolor: 'grey.25' }
                                                    }}
                                                >
                                                    <TableCell sx={{ fontSize: '1rem' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                            {result.subName.subName}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip 
                                                            label={result.marksObtained}
                                                            color={result.marksObtained >= 80 ? 'success' : 
                                                                   result.marksObtained >= 60 ? 'warning' : 'error'}
                                                            size="large"
                                                            sx={{ fontWeight: 'bold', minWidth: 60 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <AssignmentIcon sx={{ 
                                        fontSize: 60, 
                                        color: 'text.secondary', 
                                        mb: 2, 
                                        opacity: 0.5 
                                    }} />
                                    <Typography variant="h6" color="text.secondary">
                                        {t('viewChildDetails.noExamResults')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('viewChildDetails.resultsAppear')}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ViewChildDetails;
