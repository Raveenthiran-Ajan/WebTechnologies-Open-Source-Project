
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AssignmentIcon from '@mui/icons-material/Assignment'; 
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';



const StudentSideBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const { currentUser } = useSelector((state) => state.user);
    const { noticesList } = useSelector((state) => state.notice);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    // Count unread notices
    const unreadNoticesCount = noticesList ? noticesList.filter(notice => 
        !notice.readBy || !notice.readBy.includes(currentUser?._id)
    ).length : 0;

    useEffect(() => {
        if (currentUser && currentUser._id) {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/assignments/student/${currentUser._id}`).then(response => setAssignments(response.data.assignments || []));
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/submissions/student/${currentUser._id}`).then(response => setSubmissions(response.data || []));
        }
    }, [currentUser]);

    const unsubmittedAssignmentsCount = assignments.filter(assignment => !submissions.some(submission => submission.assignmentId?._id === assignment._id)).length;



    const selectedItemStyles = {
        '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            borderLeft: '4px solid #1976d2',
            '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
            },
            '& .MuiListItemIcon-root': {
                color: 'primary.main',
            },
            '& .MuiListItemText-primary': {
                fontWeight: '600',
            },
        },
    };

    return (
        <>
            <React.Fragment>
                <ListItemButton 
                    component={Link} 
                    to="/"
                    selected={location.pathname === "/" || location.pathname === "/Student/dashboard"}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.home')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/subjects"
                    selected={location.pathname.startsWith("/Student/subjects")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <MenuBookIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.subjects')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/timetable"
                    selected={location.pathname.startsWith("/Student/timetable")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.timetable')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/attendance"
                    selected={location.pathname.startsWith("/Student/attendance")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <HowToRegIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.attendance')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/term-report"
                    selected={location.pathname.startsWith("/Student/term-report")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.termReport')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/notices"
                    selected={location.pathname.startsWith("/Student/notices")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <NotificationsIcon />
                    </ListItemIcon>
                    <Badge badgeContent={unreadNoticesCount} color="error" max={99}>
                        <ListItemText primary={t('studentSideBar.notices')} />
                    </Badge>
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/complain"
                    selected={location.pathname.startsWith("/Student/complain")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <FeedbackOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.complain')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/assignments"
                    selected={location.pathname === "/assignments"}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <Badge badgeContent={unsubmittedAssignmentsCount} color="error" max={99}>
                            <AssignmentIcon />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary={t('Assignments')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('studentSideBar.user')}
                </ListSubheader>
                <ListItemButton 
                    component={Link} 
                    to="/Student/profile"
                    selected={location.pathname.startsWith("/Student/profile")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.profile')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/logout"
                    selected={location.pathname.startsWith("/logout")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('studentSideBar.logout')} />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default StudentSideBar