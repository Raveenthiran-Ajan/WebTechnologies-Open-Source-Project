import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

const ParentHomePage = () => {
    const { currentParent } = useSelector((state) => state.parent);

    if (!currentParent) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const children = currentParent.children || [];

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                {currentParent.name}'s Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Your Children
            </Typography>
            <Grid container spacing={3}>
                {children.length > 0 ? children.map((child, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                        <Paper sx={{ p: 3, '&:hover': { backgroundColor: '#f0f0f0', cursor: 'pointer' } }}
                            component={Link} to={`/Parent/child/${child._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="h6">{child.name}</Typography>
                            <Typography variant="body1">
                                Roll Number: {child.rollNum}
                            </Typography>
                        </Paper>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Typography>No children are currently linked to this account.</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default ParentHomePage;
