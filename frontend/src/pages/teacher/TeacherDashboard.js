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
import TeacherSideBar from './TeacherSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';


import TeacherClassDetails from './TeacherClassDetails';
import TeacherClasses from './TeacherClasses';
import TeacherComplain from './TeacherComplain';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherViewStudent from './TeacherViewStudent';
import SimpleTermAttendance from './SimpleTermAttendance';
import TeacherUploadAssignment from './TeacherUploadAssignment';
import LeaveReviewPage from '../LeaveReviewPage';
const TeacherDashboard = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar open={open} position="absolute">
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
                        Teacher Dashboard
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
                    <TeacherSideBar />
                </List>
            </Drawer>

            <Box component="main" sx={styles.boxStyled}>
                <Toolbar />
                <Routes>
                    <Route path="/" element={<TeacherHomePage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="teacher/dashboard" element={<TeacherHomePage />} />
                    <Route path="teacher/profile" element={<TeacherProfile />} />
                    <Route path="teacher/classes" element={<TeacherClasses />} />
                    <Route path="teacher/complain" element={<TeacherComplain />} />
                    <Route path="teacher/class" element={<TeacherClassDetails />} />
                    <Route path="teacher/class/:classId" element={<TeacherClassDetails />} />
                    <Route path="teacher/class/:classId/attendance" element={<SimpleTermAttendance />} />
                    <Route path="teacher/class/:classId/simple-attendance" element={<SimpleTermAttendance />} />
                    <Route path="teacher/class/attendance/:classId" element={<TeacherViewStudent />} />
                    <Route path="teacher/class/student/:id" element={<TeacherViewStudent />} />
                    <Route path="teacher/upload-assignment" element={<TeacherUploadAssignment />} />
                    <Route path="logout" element={<Logout />} />
                    <Route path="teacher/leave-requests" element={<LeaveReviewPage reviewer={JSON.parse(localStorage.getItem('user'))} role="teacher" />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default TeacherDashboard;

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
        display: 'flex',
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
};
