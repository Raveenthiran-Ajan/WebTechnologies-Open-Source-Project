import React from 'react';
import { Card, CardContent, Box, Typography, Alert, Chip } from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const RecentActivity = ({ noticesList }) => {
    // Get recent notices (last 3)
    const getRecentNotices = () => {
        if (!noticesList || !Array.isArray(noticesList)) return [];
        return [...noticesList]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
    };

    const recentNotices = getRecentNotices();

    if (recentNotices.length === 0) {
        return null;
    }

    return (
        <Card sx={{ 
            borderRadius: 3,
            mb: 4,
            '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            },
            transition: 'all 0.3s ease-in-out'
        }}>
            <Box sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                p: 3,
                textAlign: 'center'
            }}>
                <NotificationsActiveIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Recent School Notices
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Stay updated with the latest announcements
                </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
                {recentNotices.map((notice, index) => (
                    <Alert 
                        key={notice._id || index} 
                        severity="info" 
                        sx={{ 
                            mb: 2, 
                            borderRadius: 2,
                            '&:last-child': { mb: 0 },
                            border: '1px solid',
                            borderColor: 'info.light'
                        }}
                        icon={<CalendarTodayIcon />}
                    >
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {notice.title}
                                </Typography>
                                <Chip 
                                    label="New" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {notice.details}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AnnouncementIcon sx={{ fontSize: 14, color: 'info.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notice.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </Box>
                        </Box>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
};

export default RecentActivity;