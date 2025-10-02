import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTranslation } from 'react-i18next';

const SideBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    return (
        <>
            <React.Fragment>
                <ListItemButton 
                    component={Link} 
                    to="/"
                    selected={(location.pathname === "/" || location.pathname === "/Admin/dashboard")}
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Attendance Reports" />
                </ListItemButton>

                <ListItemButton 
                    component={Link} 
                    to="/Admin/notices"
                    selected={location.pathname.startsWith("/Admin/notices")}
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_notices')} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Admin/complains"
                    selected={location.pathname.startsWith("/Admin/complains")}
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <MonitorHeartIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_complains')} />
                </ListItemButton>
                {/* Parent menu item */}
                <ListItemButton 
                    component={Link} 
                    to="/Admin/parents"
                    selected={location.pathname.startsWith("/Admin/parents") || location.pathname.startsWith("/Admin/addparent")}
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
                    sx={{
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            },
                        },
                    }}
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
