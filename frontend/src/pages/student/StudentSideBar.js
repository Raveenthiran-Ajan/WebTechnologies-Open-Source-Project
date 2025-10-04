
import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';



const StudentSideBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);



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
                    <ListItemText primary={t('menu_home')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/subjects"
                    selected={location.pathname.startsWith("/Student/subjects")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_subjects')} />
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
                    <ListItemText primary={t('menu_timetable') || 'Timetable'} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/attendance"
                    selected={location.pathname.startsWith("/Student/attendance")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_attendance')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/grades"
                    selected={location.pathname.startsWith("/Student/grades")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_grades') || 'Grades'} />
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
                    <ListItemText primary="Notices" />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Student/complain"
                    selected={location.pathname.startsWith("/Student/complain")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_complain') || 'Complain'} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/assignments"
                    selected={location.pathname === "/assignments"}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_assignment_submission')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('menu_user')}
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
                    <ListItemText primary={t('menu_profile')} />
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
                    <ListItemText primary={t('menu_logout')} />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default StudentSideBar