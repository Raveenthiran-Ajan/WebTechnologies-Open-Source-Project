import React, { useEffect, useState } from "react";
import { Button, Container, Box, Typography, Grid, Card, CardContent, Checkbox, CircularProgress, FormControlLabel } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectSelection = () => {
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const userState = useSelector(state => state.user);
    const { currentUser, status, response, tempDetails } = userState;
    const { subjectsList, loading } = useSelector((state) => state.sclass);

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const className = location.state?.className || '';
    const adminID = currentUser._id;
    const address = "Sclass";

    // Fetch all subjects when component mounts
    useEffect(() => {
        if (currentUser._id) {
            dispatch(getSubjectList(currentUser._id, "allSubjects"));
        }
    }, [currentUser._id, dispatch]);

    const handleSubjectToggle = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleSelectAll = () => {
        if (selectedSubjects.length === (subjectsList?.length || 0)) {
            setSelectedSubjects([]);
        } else {
            setSelectedSubjects(subjectsList?.map(subject => subject._id) || []);
        }
    };

    const handleConfirmSelection = () => {
        if (!className.trim()) {
            setMessage("Class name is required");
            setShowPopup(true);
            return;
        }

        if (selectedSubjects.length === 0) {
            setMessage("Please select at least one subject");
            setShowPopup(true);
            return;
        }

        setLoader(true);

        const fields = {
            sclassName: className,
            subjects: selectedSubjects.map(subjectId => {
                const subject = subjectsList?.find(s => s._id === subjectId);
                return {
                    subject: subjectId,
                    sessions: subject?.periodsPerWeek || 1
                };
            }),
            adminID
        };

        dispatch(addStuff(fields, address));
    };

    const handleCancel = () => {
        navigate('/Admin/addclass');
    };

    // Handle class creation response
    useEffect(() => {
        if (status === 'added' && tempDetails) {
            navigate("/Admin/classes/class/" + tempDetails._id);
            dispatch(underControl());
            setLoader(false);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, tempDetails, dispatch]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
                    Select Subjects for Class: "{className}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select the subjects you want to add to this class
                </Typography>

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Select the subjects you want to add to this class
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedSubjects.length === (subjectsList?.length || 0) && subjectsList?.length > 0}
                                onChange={handleSelectAll}
                                color="primary"
                            />
                        }
                        label={selectedSubjects.length === (subjectsList?.length || 0) ? 'Deselect All' : 'Select All'}
                    />
                </Box>

                <Grid container spacing={2}>
                    {subjectsList && subjectsList.map((subject) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={subject._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    border: selectedSubjects.includes(subject._id)
                                        ? '3px solid #1976d2'
                                        : '2px solid #2196f3',
                                    backgroundColor: 'white',
                                    boxShadow: selectedSubjects.includes(subject._id)
                                        ? '0 4px 12px rgba(25, 118, 210, 0.3)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        boxShadow: selectedSubjects.includes(subject._id)
                                            ? '0 6px 16px rgba(25, 118, 210, 0.4)'
                                            : '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        borderColor: '#1976d2',
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out'
                                    }
                                }}
                                onClick={() => handleSubjectToggle(subject._id)}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                            {subject.subName}
                                        </Typography>
                                        <Checkbox
                                            checked={selectedSubjects.includes(subject._id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSubjectToggle(subject._id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            color="primary"
                                            sx={{ p: 0 }}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        <strong>Subject Code:</strong> {subject.subCode}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Periods per week:</strong> {subject.periodsPerWeek}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {subjectsList && subjectsList.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No subjects available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please add subjects first before creating a class
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleConfirmSelection}
                            disabled={selectedSubjects.length === 0 || loader}
                        >
                            {loader ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                `Create Class with ${selectedSubjects.length} Subject${selectedSubjects.length !== 1 ? 's' : ''}`
                            )}
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default SubjectSelection;