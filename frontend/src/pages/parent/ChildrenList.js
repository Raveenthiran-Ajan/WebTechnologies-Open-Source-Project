import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Avatar, Container, Pagination, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import GradeIcon from '@mui/icons-material/Grade';
import { useTranslation } from 'react-i18next';

const ChildrenList = () => {
    const { t } = useTranslation();
    const { currentUser, loading } = useSelector((state) => state.user);
    const [page, setPage] = useState(1);
    const childrenPerPage = 9; // Show 9 children per page for grid layout

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
            
            <Grid container spacing={4}>
                {currentChildren.length > 0 ? currentChildren.map((child, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
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
                                    label={`${t('childrenList.roll')}: ${child.rollNum}`}
                                    size="small" 
                                    color="primary" 
                                    sx={{ mb: 1 }}
                                />
                                {getClassName(child.sclassName) && (
                                    <Typography variant="body2" color="text.secondary">
                                        {t('childrenList.class')}: {getClassName(child.sclassName)}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6">{t('childrenList.noChildren')}</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

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
    );
};

export default ChildrenList;