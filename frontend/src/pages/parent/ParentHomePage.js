import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Grid, CircularProgress, Card, CardContent, Avatar, Container, Pagination, Chip, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import { useTranslation } from 'react-i18next';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import DashboardStats from '../../components/DashboardStats';
import QuickActions from '../../components/QuickActions';
import RecentActivity from '../../components/RecentActivity';

const ParentHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { noticesList } = useSelector((state) => state.notice);
    const [page, setPage] = useState(1);
    const childrenPerPage = 4; // Show fewer children on dashboard
    const { t } = useTranslation();
    useEffect(() => {
        if (currentUser && currentUser.school) {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, currentUser]);

    // Helper function to get class name
    const getClassName = (sclassName) => {
        if (!sclassName) return null;
        
        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (typeof sclassName === 'string' && sclassName.length === 24 && /^[0-9a-fA-F]{24}$/.test(sclassName)) {
            return null; // Hide ObjectId, show nothing instead
        }
        
        if (typeof sclassName === 'string') return sclassName;
        if (typeof sclassName === 'object' && sclassName.sclassName) return sclassName.sclassName;
        if (typeof sclassName === 'object' && sclassName.name) return sclassName.name;
        return null; // Hide unknown formats
    };



    if (!currentUser) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        {t('parentHomePage.loading')}
                    </Typography>
                </Box>
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
                    {currentUser.name?.charAt(0).toUpperCase()}
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
                    {t('parentHomePage.welcome')} {currentUser.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<GradeIcon />}
                        label={t('parentHomePage.parentPortal')}
                        color="primary" 
                        size="large"
                    />
                    <Chip 
                        icon={<SchoolIcon />}
                        label={`${children.length} ${t(children.length === 1 ? 'parentHomePage.child' : 'parentHomePage.children')}`}
                        color="secondary" 
                        size="large"
                    />
                </Box>
            </Box>



            {/* Dashboard Statistics */}
            <DashboardStats children={children} noticesList={noticesList} />

            {/* Quick Actions */}
            <QuickActions noticesList={noticesList} />

            {/* Recent Activity */}
            <RecentActivity noticesList={noticesList} />

            {/* Recent Children Section */}
            <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 'bold', 
                mb: 3,
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                {t('parentHomePage.recentChildren')}
            </Typography>

            <Grid container spacing={4}>
                {currentChildren.length > 0 ? currentChildren.map((child, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card 
                            component={Link} 
                            to={`/Parent/child/${child._id}`} 
                            sx={{ 
                                textDecoration: 'none', 
                                display: 'block',
                                borderRadius: 3,
                                '&:hover': { 
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                                },
                                transition: 'all 0.3s ease-in-out'
                            }}
                        >
                            <Box sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                p: 2,
                                textAlign: 'center'
                            }}>
                                <Avatar sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    mx: 'auto',
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    {child.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </Box>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {child.name}
                                </Typography>
                                <Chip 
                                    label={`${t('parentHomePage.roll')}: ${child.rollNum}`}
                                    size="small" 
                                    color="primary" 
                                    sx={{ mb: 1 }}
                                />
                                {getClassName(child.sclassName) && (
                                    <Typography variant="body2" color="text.secondary">
                                        {t('parentHomePage.class')}: {getClassName(child.sclassName)}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6">{t('parentHomePage.noChildDetails')}</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* View All Children Link */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                    component={Link}
                    to="/Parent/children"
                    variant="outlined"
                    size="large"
                    sx={{ 
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    {t('parentHomePage.viewAllChildren')} ({children.length})
                </Button>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary"
                    />
                </Box>
            )}
        </Container>
    );
};

export default ParentHomePage;
