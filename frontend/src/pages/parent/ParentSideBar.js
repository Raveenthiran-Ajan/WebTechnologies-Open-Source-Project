import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useSelector } from 'react-redux';

const ParentSideBar = () => {
    const location = useLocation();
    const { currentUser } = useSelector((state) => state.user);
    const { noticesList } = useSelector((state) => state.notice);
    const { t } = useTranslation();

    // Count unread notices
    const unreadNoticesCount = noticesList ? noticesList.filter(notice =>
        !notice.readBy || !notice.readBy.includes(currentUser?._id)
    ).length : 0;

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
                <ListSubheader component="div" inset>
                    {t('parentSideBar.mainMenu')}
                </ListSubheader>
                <ListItemButton
                    component={Link}
                    to="/Parent/dashboard"
                    selected={location.pathname === "/" || location.pathname === "/Parent/dashboard"}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.dashboard')} />
                </ListItemButton>
                <ListItemButton
                    component={Link}
                    to="/Parent/children"
                    selected={location.pathname.startsWith('/Parent/children')}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <FamilyRestroomIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.myChildren')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('parentSideBar.schoolServices')}
                </ListSubheader>
                <ListItemButton component={Link} to="/Parent/notices" selected={location.pathname.startsWith("/Parent/notices")} sx={selectedItemStyles}>
                    <ListItemIcon>
                        <NotificationsIcon color={location.pathname.startsWith("/Parent/notices") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <Badge badgeContent={unreadNoticesCount} color="error" max={99}>
                        <ListItemText primary={t('parentSideBar.notices')} />
                    </Badge>
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/reports" selected={location.pathname.startsWith("/Parent/reports")} sx={selectedItemStyles}>
                    <ListItemIcon>
                        <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.reports')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/timetable" selected={location.pathname.startsWith("/Parent/timetable")} sx={selectedItemStyles}>
                    <ListItemIcon>
                        <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.timetable')} />
                </ListItemButton>
                <ListItemButton
                    component={Link}
                    to="/Parent/term-report"
                    selected={location.pathname.startsWith("/Parent/term-report")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.termReport')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/complaints" selected={location.pathname.startsWith("/Parent/complaints")} sx={selectedItemStyles}>
                    <ListItemIcon>
                        <ReportProblemIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.complaints')} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    {t('parentSideBar.account')}
                </ListSubheader>
                <ListItemButton
                    component={Link}
                    to="/Parent/profile"
                    selected={location.pathname.startsWith("/Parent/profile")}
                    sx={selectedItemStyles}
                >
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.profile')} />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout" selected={location.pathname.startsWith("/logout")} sx={selectedItemStyles}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('parentSideBar.logout')} />
                </ListItemButton>
            </React.Fragment>
        </>
    );
};

export default ParentSideBar;