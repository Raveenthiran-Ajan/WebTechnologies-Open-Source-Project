import * as React from 'react';
import { 
    Divider, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    ListSubheader
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);

    const location = useLocation();
    const { t } = useTranslation();
    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon
                            color={
                                location.pathname === "/" || location.pathname === "/teacher/dashboard"
                                    ? "primary"
                                    : "inherit"
                            }
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_home')} />
                </ListItemButton>
                
                <Divider />
                
                <ListItemButton 
                    component={Link} 
                    to="/teacher/classes"
                    sx={{
                        backgroundColor: location.pathname.startsWith("/teacher/classes") ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                >
                    <ListItemIcon>
                        <ClassOutlinedIcon
                            color={location.pathname.startsWith("/teacher/classes") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary="Classes" />
                </ListItemButton>
                
                <Divider sx={{ my: 1 }} />
                <ListItemButton 
                    component={Link} 
                    to="/teacher/complain"
                    sx={{
                        backgroundColor: location.pathname.startsWith("/teacher/complain") ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                >
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon
                            color={location.pathname.startsWith("/teacher/complain") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_complain')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/teacher/upload-assignment"
                    sx={{
                        backgroundColor: location.pathname === "/teacher/upload-assignment" ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                >
                    <ListItemIcon>
                        <AssignmentIcon
                            color={location.pathname === "/teacher/upload-assignment" ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_upload_assignments')} />
                </ListItemButton>
            </React.Fragment>

            <Divider sx={{ my: 1 }} />

            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('menu_user')}
                </ListSubheader>
                <ListItemButton 
                    component={Link} 
                    to="/teacher/profile"
                    sx={{
                        backgroundColor: location.pathname.startsWith("/teacher/profile") ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                >
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon
                            color={location.pathname.startsWith("/teacher/profile") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_profile')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/logout"
                    sx={{
                        backgroundColor: location.pathname.startsWith("/logout") ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                >
                    <ListItemIcon>
                        <ExitToAppIcon
                            color={location.pathname.startsWith("/logout") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_logout')} />
                </ListItemButton>
            </React.Fragment>
        </>
    );
};

export default TeacherSideBar;
