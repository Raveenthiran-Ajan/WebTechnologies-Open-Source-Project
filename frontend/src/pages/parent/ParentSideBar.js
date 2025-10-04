import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useSelector } from 'react-redux';

const ParentSideBar = () => {
    const location = useLocation();
    const { currentUser } = useSelector((state) => state.user);
    const { noticesList } = useSelector((state) => state.notice);

    // Count unread notices
    const unreadNoticesCount = noticesList ? noticesList.filter(notice => 
        !notice.readBy || !notice.readBy.includes(currentUser?._id)
    ).length : 0;
    return (
        <>
            <React.Fragment>
                <ListSubheader component="div" inset>
                    Main Menu
                </ListSubheader>
                <ListItemButton component={Link} to="/Parent/dashboard">
                    <ListItemIcon>
                        <HomeIcon color={(location.pathname === "/" || location.pathname === "/Parent/dashboard") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/children">
                    <ListItemIcon>
                        <FamilyRestroomIcon color={location.pathname.startsWith('/Parent/children') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="My Children" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Parent/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    School Services
                </ListSubheader>
                <ListItemButton component={Link} to="/Parent/notices">
                    <ListItemIcon>
                        <NotificationsIcon color={location.pathname.startsWith("/Parent/notices") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <Badge badgeContent={unreadNoticesCount} color="error" max={99}>
                        <ListItemText primary="Notices" />
                    </Badge>
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/reports">
                    <ListItemIcon>
                        <AssessmentIcon color={location.pathname.startsWith("/Parent/reports") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Parent/complaints">
                    <ListItemIcon>
                        <ReportProblemIcon color={location.pathname.startsWith("/Parent/complaints") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complaints" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    Account
                </ListSubheader>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    );
};

export default ParentSideBar;