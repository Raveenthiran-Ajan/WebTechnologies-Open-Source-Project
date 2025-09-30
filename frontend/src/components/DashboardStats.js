import React from 'react';
import { Card, CardContent, Box, Typography, Grid } from '@mui/material';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTranslation } from 'react-i18next';

const DashboardStats = ({ children, noticesList }) => {
    const noticesCount = noticesList ? noticesList.length : 0;
    const { t } = useTranslation();

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Children Card */}
            <Grid item xs={12} sm={6}>
                <Card sx={{ 
                    borderRadius: 3,
                    '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease-in-out'
                }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 3,
                        textAlign: 'center'
                    }}>
                        <FamilyRestroomIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {t('dashboard_total_children')}
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ 
                            fontWeight: 'bold',
                            color: 'primary.main'
                        }}>
                            {children.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {children.length === 1 ? t('dashboard_child_registered') : t('dashboard_children_registered')}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* School Notices Card */}
            <Grid item xs={12} sm={6}>
                <Card sx={{ 
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
                        <NotificationsIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {t('dashboard_school_notices')}
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ 
                            fontWeight: 'bold',
                            color: 'info.main'
                        }}>
                            {noticesCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('dashboard_active_notifications')}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default DashboardStats;