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
    const sclassName = currentUser?.teachSclass;

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
                <ListItemButton component={Link} to="/teacher/class">
                    <ListItemIcon>
                        <ClassOutlinedIcon
                            color={location.pathname.startsWith("/teacher/class") ? "primary" : "inherit"}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('menu_class_label', { name: sclassName.sclassName })} />
                </ListItemButton>
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
