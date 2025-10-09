import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Avatar, Container, Pagination, Chip, Dialog, DialogContent, LinearProgress, IconButton, Table, TableBody, TableHead, TableRow, TableCell, TableContainer, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import GradeIcon from '@mui/icons-material/Grade';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const ChildrenList = () => {
    const { t } = useTranslation();
    const { currentUser, loading } = useSelector((state) => state.user);
    const [page, setPage] = useState(1);
    const [selectedChild, setSelectedChild] = useState(null);
    const [open, setOpen] = useState(false);
    const [academicYear, setAcademicYear] = useState('2025');
    const [term, setTerm] = useState('all');
    const [month, setMonth] = useState('all');
    const childrenPerPage = 9; // Show 9 children per page for grid layout

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        {t('childrenList.loading')}
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!currentUser) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">{t('childrenList.noParentInfo')}</Typography>
                </Paper>
            </Container>
        );
    }

    const children = currentUser.children || [];
    const totalPages = Math.ceil(children.length / childrenPerPage);
    const startIndex = (page - 1) * childrenPerPage;
    const currentChildren = children.slice(startIndex, startIndex + childrenPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const calculateAttendancePercentage = (attendance) => {
        if (!attendance || attendance.length === 0) {
            return "0.00";
        }
        const totalPresent = attendance.filter(att => att.status === 'Present').length;
        const totalSessions = attendance.length;
        return ((totalPresent / totalSessions) * 100).toFixed(2);
    };

    const filterAttendance = (attendance) => {
        if (!attendance) return [];
        
        return attendance.filter(record => {
            const recordDate = new Date(record.date);
            const recordYear = recordDate.getFullYear().toString();
            const recordMonth = recordDate.getMonth() + 1;

            // Academic year filter
            if (academicYear !== 'all' && recordYear !== academicYear) return false;

            // Month filter
            if (month !== 'all' && recordMonth !== parseInt(month)) return false;

            // Term filter
            if (term !== 'all') {
                const termMonths = {
                    'TERM_1': [1, 2, 3, 4],    // Jan-Apr
                    'TERM_2': [5, 6, 7, 8],    // May-Aug
                    'TERM_3': [9, 10, 11, 12]  // Sep-Dec
                };
                if (!termMonths[term]?.includes(recordMonth)) return false;
            }

            return true;
        });
    };

    const handleCardClick = (child) => {
        setSelectedChild(child);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedChild(null);
        // Reset filters when closing
        setAcademicYear('2025');
        setTerm('all');
        setMonth('all');
    };

    // Helper function to get class name
    const getClassName = (sclassName) => {
        if (!sclassName) return t('childrenList.notAssigned');

        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (typeof sclassName === 'string' && sclassName.length === 24 && /^[0-9a-fA-F]{24}$/.test(sclassName)) {
            return t('childrenList.classInfoPending'); // Show pending instead of ObjectId
        }

        if (typeof sclassName === 'string') return sclassName;
        if (typeof sclassName === 'object' && sclassName.sclassName) return sclassName.sclassName;
        if (typeof sclassName === 'object' && sclassName.name) return sclassName.name;
        return t('childrenList.unknownClass'); // Show something for unknown formats
    };

    const CustomCard = ({ row }) => (
        <Card 
            onClick={() => handleCardClick(row)}
            sx={{ 
                textDecoration: 'none', 
                display: 'block',
                borderRadius: 3,
                minHeight: 250,
                cursor: 'pointer',
                '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease-in-out'
            }}
        >
            <Box sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                p: 3,
                textAlign: 'center'
            }}>
                <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {row.name}
                </Typography>
                {getClassName(row.sclassName) && (
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {getClassName(row.sclassName)}
                    </Typography>
                )}
            </Box>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('childrenList.roll')}: {row.rollNum}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <>
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
                    <FamilyRestroomIcon sx={{ fontSize: 40 }} />
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
                    {t('childrenList.title')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<GradeIcon />}
                        label={t(children.length === 1 ? 'childrenList.childTotal' : 'childrenList.childrenTotal', { count: children.length })}
                        color="primary" 
                        size="large"
                    />
                    {totalPages > 1 && (
                        <Chip 
                            label={t('childrenList.pageOf', { page, total: totalPages })}
                            color="secondary" 
                            size="large"
                        />
                    )}
                </Box>
            </Box>
            
            {currentChildren.length > 0 ? (
                <Grid container spacing={4}>
                    {currentChildren.map((child, index) => (
                        <Grid item xs={12} sm={6} md={4} key={child._id || index}>
                            <CustomCard row={child} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">{t('childrenList.noChildren')}</Typography>
                </Paper>
            )}


            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary"
                    />
                </Box>
            )}
        </Container>

        {/* Attendance Modal */}
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogContent sx={{ p: 0, position: 'relative', maxHeight: '90vh', overflow: 'auto' }}>
                <IconButton
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                >
                    <CloseIcon />
                </IconButton>
                {selectedChild && (
                    <>
                        {/* Header */}
                        <Box sx={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            p: 3,
                            textAlign: 'center'
                        }}>
                            <EventAvailableIcon sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {t('childrenList.attendanceDashboard', { name: selectedChild.name })}
                            </Typography>
                        </Box>

                        {/* Filters */}
                        <Paper sx={{ p: 2, mx: 3, mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>{t('childrenList.academicYear')}</InputLabel>
                                        <Select
                                            value={academicYear}
                                            label={t('childrenList.academicYear')}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                        >
                                            <MenuItem value="2024">2024</MenuItem>
                                            <MenuItem value="2025">2025</MenuItem>
                                            <MenuItem value="all">{t('childrenList.allYears')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>{t('childrenList.term')}</InputLabel>
                                        <Select
                                            value={term}
                                            label={t('childrenList.term')}
                                            onChange={(e) => setTerm(e.target.value)}
                                        >
                                            <MenuItem value="TERM_1">{t('parentTermReport.term1')}</MenuItem>
                                            <MenuItem value="TERM_2">{t('parentTermReport.term2')}</MenuItem>
                                            <MenuItem value="TERM_3">{t('parentTermReport.term3')}</MenuItem>
                                            <MenuItem value="all">{t('childrenList.allTerms')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>{t('childrenList.month')}</InputLabel>
                                        <Select
                                            value={month}
                                            label={t('childrenList.month')}
                                            onChange={(e) => setMonth(e.target.value)}
                                        >
                                            <MenuItem value="all">{t('childrenList.allMonths')}</MenuItem>
                                            <MenuItem value="1">{t('childrenList.january')}</MenuItem>
                                            <MenuItem value="2">{t('childrenList.february')}</MenuItem>
                                            <MenuItem value="3">{t('childrenList.march')}</MenuItem>
                                            <MenuItem value="4">{t('childrenList.april')}</MenuItem>
                                            <MenuItem value="5">{t('childrenList.may')}</MenuItem>
                                            <MenuItem value="6">{t('childrenList.june')}</MenuItem>
                                            <MenuItem value="7">{t('childrenList.july')}</MenuItem>
                                            <MenuItem value="8">{t('childrenList.august')}</MenuItem>
                                            <MenuItem value="9">{t('childrenList.september')}</MenuItem>
                                            <MenuItem value="10">{t('childrenList.october')}</MenuItem>
                                            <MenuItem value="11">{t('childrenList.november')}</MenuItem>
                                            <MenuItem value="12">{t('childrenList.december')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Summary Cards */}
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#4caf50">
                                                {filterAttendance(selectedChild.attendance).filter(att => att.status === 'Present').length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('childrenList.presentDays')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336' }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <CancelIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#f44336">
                                                {filterAttendance(selectedChild.attendance).filter(att => att.status === 'Absent').length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('childrenList.absentDays')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3' }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <AssessmentIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#2196f3">
                                                {calculateAttendancePercentage(filterAttendance(selectedChild.attendance))}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('childrenList.attendancePercentage')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Recent Attendance Table */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        {t('childrenList.attendanceRecords')}
                                    </Typography>
                                    {filterAttendance(selectedChild.attendance).length > 0 ? (
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('childrenList.date')}</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('childrenList.status')}</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('childrenList.subject')}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filterAttendance(selectedChild.attendance).slice(-10).reverse().map((record, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {new Date(record.date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={record.status}
                                                                    color={
                                                                        record.status === 'Present' ? 'success' :
                                                                        record.status === 'Absent' ? 'error' : 'warning'
                                                                    }
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {record.subName?.subName || 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                            {t('childrenList.noAttendanceRecords')}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
        </>
    );
};

export default ChildrenList;