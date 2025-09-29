import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Box, 
    Avatar, 
    Chip, 
    Grid,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';

const ParentNotices = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);

    useEffect(() => {
        if (currentUser && currentUser.school) {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, currentUser]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Loading notices...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Error loading notices: {error}
                </Alert>
            </Container>
        );
    }

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
                    <NotificationsIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    School Notices
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<AnnouncementIcon />}
                        label={`${noticesList ? noticesList.length : 0} Total Notices`} 
                        color="primary" 
                        size="large"
                    />
                </Box>
            </Box>

            {/* Notices List */}
            {response ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">No notices available at this time.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {noticesList && noticesList.map((notice, index) => (
                        <Grid item xs={12} key={notice._id || index}>
                            <Card sx={{ 
                                borderRadius: 3,
                                '&:hover': { 
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                                },
                                transition: 'all 0.3s ease-in-out'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: 'white',
                                    p: 3
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <AnnouncementIcon sx={{ fontSize: 30 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                {notice.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    {new Date(notice.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip 
                                            label="New" 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.2)', 
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                        {notice.details}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ParentNotices;