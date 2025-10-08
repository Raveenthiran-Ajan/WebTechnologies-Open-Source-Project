import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Paper, Card, CardContent, CardHeader, Typography, Grid, CircularProgress } from '@mui/material';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import { useTranslation } from 'react-i18next';

const SeeNotice = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { currentUser, currentRole } = useSelector(state => state.user);

    // Only use translations for parent role
    const isParent = currentRole === "Parent";
    const getText = (key) => isParent ? t(`seeNotice.${key}`) : {
        noNoticesToShow: "No Notices to Show Right Now",
        recentNotices: "Recent Notices",
        noNoticesAvailable: "No notices available."
    }[key];
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);

    useEffect(() => {
        if (currentRole === "Admin") {
            dispatch(getAllNotices(currentUser._id, "Notice"));
        }
        else {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, currentRole, currentUser]);

    if (error) {
        console.log(error);
    }

    return (
        <div style={{ marginTop: '50px', marginRight: '20px' }}>
            {loading ? (
                <CircularProgress color="primary" sx={{ display: 'block', margin: 'auto' }} />
            ) : response ? (
                <Typography variant="body1" sx={{ fontSize: '20px', textAlign: 'center' }}>
                    {getText('noNoticesToShow')}
                </Typography>
            ) : (
                <>
                    <Typography variant="h4" component="h3" sx={{ fontSize: '30px', marginBottom: '40px', color: 'purple', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnnouncementOutlinedIcon />
                        {getText('recentNotices')}
                    </Typography>
                    <Paper sx={{ width: '100%', p: 2, borderRadius: 2, border: '1px solid purple' }}>
                        <Grid container spacing={2}>
                            {Array.isArray(noticesList) && noticesList.length > 0 ? (
                                noticesList.map((notice) => {
                                    const date = new Date(notice.date);
                                    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                    const truncatedDetails = notice.details.length > 100 ? notice.details.substring(0, 100) + '...' : notice.details;
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={notice._id}>
                                            <Card sx={{ height: '100%', '&:hover': { boxShadow: 3, borderColor: 'purple' } }}>
                                                <CardHeader title={notice.title} sx={{ backgroundColor: 'purple', color: 'white' }} />
                                                <CardContent>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {truncatedDetails}
                                                    </Typography>
                                                </CardContent>
                                                <CardContent sx={{ pt: 0, pb: '8px !important' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {dateString}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })
                            ) : (
                                <Typography variant="body1" sx={{ width: '100%', textAlign: 'center' }}>
                                    {getText('noNoticesAvailable')}
                                </Typography>
                            )}
                        </Grid>
                    </Paper>
                </>
            )}
        </div>
    )
}

export default SeeNotice
