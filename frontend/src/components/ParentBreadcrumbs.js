import React from 'react';
import { Breadcrumbs, Typography, Link, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const ParentBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbNameMap = {
        '/Parent': 'Parent Portal',
        '/Parent/dashboard': 'Dashboard',
        '/Parent/children': 'My Children',
        '/Parent/profile': 'Profile',
        '/Parent/child': 'Child Details',
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ 
                    '& .MuiBreadcrumbs-separator': {
                        color: 'primary.main'
                    }
                }}
            >
                <Link
                    component={RouterLink}
                    to="/Parent/dashboard"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    Home
                </Link>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const breadcrumbName = breadcrumbNameMap[to] || value;

                    return last ? (
                        <Typography 
                            key={to} 
                            color="text.primary" 
                            sx={{ 
                                fontWeight: 'bold',
                                textTransform: 'capitalize'
                            }}
                        >
                            {breadcrumbName}
                        </Typography>
                    ) : (
                        <Link
                            key={to}
                            component={RouterLink}
                            to={to}
                            sx={{
                                textDecoration: 'none',
                                color: 'primary.main',
                                textTransform: 'capitalize',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {breadcrumbName}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
};

export default ParentBreadcrumbs;