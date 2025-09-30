import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

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
    
    // Teaching classes (multiple)
    const teachingClasses = currentUser?.teachSclasses || [currentUser?.teachSclass].filter(Boolean);
    
    // Attendance assigned class (single)
    const attendanceClass = currentUser?.attendanceClass || currentUser?.teachSclass;

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
                
                {/* Attendance Class Section */}
                {attendanceClass && (
                    <>
                        <ListSubheader component="div" inset>
                            Attendance Class
                        </ListSubheader>
                        <ListItemButton 
                            component={Link} 
                            to={`/teacher/class/${attendanceClass._id}`}
                            sx={{ pl: 4, bgcolor: 'action.hover' }}
                        >
                            <ListItemIcon>
                                <ClassOutlinedIcon
                                    color={location.pathname.includes(`/teacher/class/${attendanceClass._id}`) ? "primary" : "secondary"}
                                />
                            </ListItemIcon>
                            <ListItemText 
                                primary={attendanceClass.sclassName} 
                                secondary="(Attendance)" 
                            />
                        </ListItemButton>
                        <Divider />
                    </>
                )}
                
                {/* Teaching Classes Section */}
                <ListSubheader component="div" inset>
                    Teaching Classes
                </ListSubheader>
                
                {teachingClasses.map((sclass, index) => {
                    const isAttendanceClass = attendanceClass && sclass._id === attendanceClass._id;
                    return (
                        <ListItemButton 
                            key={sclass._id || index} 
                            component={Link} 
                            to={`/teacher/class/${sclass._id}`}
                            sx={{ pl: 4, opacity: isAttendanceClass ? 0.6 : 1 }}
                        >
                            <ListItemIcon>
                                <ClassOutlinedIcon
                                    color={location.pathname.includes(`/teacher/class/${sclass._id}`) ? "primary" : "inherit"}
                                />
                            </ListItemIcon>
                            <ListItemText 
                                primary={sclass.sclassName} 
                                secondary={isAttendanceClass ? "(Teaching + Attendance)" : "(Teaching Only)"}
                            />
                        </ListItemButton>
                    );
                })}
                <ListItemButton component={Link} to="/teacher/complain">
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon
                            color={location.pathname.startsWith("/teacher/complain") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_complain')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/teacher/upload-assignment">
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
                <ListItemButton component={Link} to="/teacher/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon
                            color={location.pathname.startsWith("/teacher/profile") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_profile')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout">
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
