import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';

const ParentSideBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    return (
        <>
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('sidebar_main_menu')}
                </ListSubheader>
                <ListItemButton component={Link} to="/Parent/dashboard">
                    <ListItemIcon>
                        <HomeIcon color={(location.pathname === "/" || location.pathname === "/Parent/dashboard") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_dashboard')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/children">
                    <ListItemIcon>
                        <FamilyRestroomIcon color={location.pathname.startsWith('/Parent/children') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_my_children')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Parent/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_profile')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('sidebar_school_services')}
                </ListSubheader>
                <ListItemButton component={Link} to="/Parent/notices">
                    <ListItemIcon>
                        <NotificationsIcon color={location.pathname.startsWith("/Parent/notices") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_notices')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/reports">
                    <ListItemIcon>
                        <AssessmentIcon color={location.pathname.startsWith("/Parent/reports") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_reports')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/complaints">
                    <ListItemIcon>
                        <ReportProblemIcon color={location.pathname.startsWith("/Parent/complaints") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_complaints')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('sidebar_account')}
                </ListSubheader>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={t('sidebar_logout')} />
                </ListItemButton>
            </React.Fragment>
        </>
    );
};

export default ParentSideBar;