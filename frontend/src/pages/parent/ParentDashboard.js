import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import ParentHomePage from './ParentHomePage';
import ViewChildDetails from './ViewChildDetails';
import ChildrenList from './ChildrenList';
import ParentProfile from './ParentProfile';
import ParentNotices from './ParentNotices';
import ParentReports from './ParentReports';
import ParentComplaints from './ParentComplain';
import ParentSideBar from './ParentSideBar';
import AccountMenu from '../../components/AccountMenu';
import Logout from '../Logout';

const ParentDashboard = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
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
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <ParentSideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<ParentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Parent/dashboard" element={<ParentHomePage />} />
                        <Route path="/Parent/children" element={<ChildrenList />} />
                        <Route path="/Parent/child/:id" element={<ViewChildDetails />} />
                        <Route path="/Parent/profile" element={<ParentProfile />} />
                        <Route path="/Parent/notices" element={<ParentNotices />} />
                        <Route path="/Parent/reports" element={<ParentReports />} />
                        <Route path="/Parent/complaints" element={<ParentComplaints />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default ParentDashboard;

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}