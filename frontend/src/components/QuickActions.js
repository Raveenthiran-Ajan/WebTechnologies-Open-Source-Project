import React from 'react';
import { Card, CardContent, Box, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';

const QuickActions = ({ noticesList }) => {
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                textAlign: 'center'
            }}>
                <AssessmentIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Quick Actions
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage your parent portal efficiently
                </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            component={Link}
                            to="/Parent/children"
                            variant="contained"
                            fullWidth
                            startIcon={<FamilyRestroomIcon />}
                            sx={{ 
                                py: 2, 
                                borderRadius: 2,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                                }
                            }}
                        >
                            View All Children
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            component={Link}
                            to="/Parent/profile"
                            variant="outlined"
                            fullWidth
                            startIcon={<PersonIcon />}
                            sx={{ 
                                py: 2, 
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'primary.main',
                                    color: 'white'
                                }
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            component={Link}
                            to="/Parent/notices"
                            variant="outlined"
                            fullWidth
                            startIcon={<NotificationsIcon />}
                            sx={{ 
                                py: 2, 
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'info.main',
                                    color: 'white'
                                }
                            }}
                        >
                            View Notices ({noticesList ? noticesList.length : 0})
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            component={Link}
                            to="/Parent/complaints"
                            variant="outlined"
                            fullWidth
                            startIcon={<ReportProblemIcon />}
                            sx={{ 
                                py: 2, 
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'warning.main',
                                    color: 'white'
                                }
                            }}
                        >
                            Submit Complaint
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default QuickActions;