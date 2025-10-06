import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Grid, CircularProgress, Card, CardContent, Avatar, Container, Pagination, Chip, Paper, Button, Snackbar, Alert, Divider } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import { useTranslation } from 'react-i18next';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle'; 
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import Notices from "../../assets/assignment.svg";
import SeeNotice from '../../components/SeeNotice';

const ParentHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const [showPwdChanged, setShowPwdChanged] = useState(false);
    const { noticesList } = useSelector((state) => state.notice);
    const { t } = useTranslation();

    useEffect(() => {
        if (currentUser && currentUser.school) {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, currentUser]);

    // Count unread notices
    const unreadNoticesCount = noticesList ? noticesList.filter(notice =>
        !notice.readBy || !notice.readBy.includes(currentUser?._id)
    ).length : 0;


    // Show success message if redirected after password change
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('msg') === 'password-changed') {
            setShowPwdChanged(true);
            // Clean up the URL to avoid re-showing on refresh
            navigate('/Parent/dashboard', { replace: true });
        }
    }, [location.search, navigate]);

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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Snackbar
                open={showPwdChanged}
                autoHideDuration={4000}
                onClose={() => setShowPwdChanged(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowPwdChanged(false)} severity="success" sx={{ width: '100%' }}>
                    Password changed successfully!
                </Alert>
            </Snackbar>
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

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6} lg={6}>
                    <StyledPaper>
                        <img src={Students} alt="Children" />
                        <Title>
                            {t('parentHomePage.childrenCount')}
                        </Title>
                        <Data start={0} end={children.length} duration={2.5} />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                    <StyledPaper>
                        <img src={Notices} alt="Notices" />
                        <Title>
                            {t('parentHomePage.noticesCount')}
                        </Title>
                        <Data start={0} end={unreadNoticesCount} duration={2.5} />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>{t('parentHomePage.schoolNotices')}</Typography>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}><SeeNotice /></Box>
                    </Paper>
                </Grid>
            </Grid>

        </Container>
    );
};

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default ParentHomePage;
