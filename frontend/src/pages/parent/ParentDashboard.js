import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, CssBaseline } from '@mui/material';
import ParentHomePage from './ParentHomePage';
import ViewChildDetails from './ViewChildDetails';
import AccountMenu from '../../components/AccountMenu';

const ParentDashboard = () => {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute">
          <Toolbar>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Parent Dashboard
            </Typography>
            <AccountMenu />
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<ParentHomePage />} />
            <Route path="/child/:id" element={<ViewChildDetails />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
};

export default ParentDashboard;