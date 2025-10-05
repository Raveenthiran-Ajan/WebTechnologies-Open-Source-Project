import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';

const SideBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const { complainsList } = useSelector((state) => state.complain);

    const selectedItemStyles = {
        '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)', // A more subtle background color
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
                    selected={(location.pathname === "/" || location.pathname === "/Admin/dashboard")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_home')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/classes"
                    selected={location.pathname.startsWith('/Admin/classes')}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_classes')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/subjects"
                    selected={location.pathname.startsWith("/Admin/subjects")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_subjects')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/teachers"
                    selected={location.pathname.startsWith("/Admin/teachers")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <SupervisorAccountOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_teachers')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/students"
                    selected={location.pathname.startsWith("/Admin/students") && !location.pathname.startsWith("/Admin/attendance-report")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <PersonOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_students')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/attendance-report"
                    selected={location.pathname.startsWith("/Admin/attendance-report")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssessmentOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Attendance Reports" />
                </ListItemButton>


                <ListItemButton 
                    component={Link} 
                    to="/Admin/notices"
                    selected={location.pathname.startsWith("/Admin/notices")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Notices" />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/complains"
                    selected={location.pathname.startsWith("/Admin/complains")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <Badge 
                          color="error" 
                          variant="dot" 
                          invisible={!complainsList || !complainsList.some(complain => complain.status === 'Pending')} 
                        >
                          <FeedbackOutlinedIcon />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary={t('menu_complains')} />
                </ListItemButton>
                {/* Parent menu item */}
                <ListItemButton 
                    component={Link} 
                    to="/Admin/parents"
                    selected={location.pathname.startsWith("/Admin/parents") || location.pathname.startsWith("/Admin/addparent")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <FamilyRestroomIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_parents')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('menu_user')}
                </ListSubheader>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/profile"
                    selected={location.pathname.startsWith("/Admin/profile")}
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

export default SideBar
