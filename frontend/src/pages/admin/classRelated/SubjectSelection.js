import React, { useEffect, useState } from "react";
import { Button, Container, Box, Typography, Grid, Card, CardContent, Checkbox, CircularProgress, FormControlLabel, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectSelection = () => {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [periods, setPeriods] = useState({});

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
        setSelectedSubjects(prev => {
            const isSelected = prev.includes(subjectId);
            const newSelected = isSelected
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId];
            setPeriods(prevPeriods => {
                const newPeriods = { ...prevPeriods };
                if (!isSelected) {
                    newPeriods[subjectId] = 1; // default
                } else {
                    delete newPeriods[subjectId];
                }
                return newPeriods;
            });
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedSubjects.length === (subjectsList?.length || 0)) {
            setSelectedSubjects([]);
            setPeriods({});
        } else {
            const allIds = subjectsList?.map(subject => subject._id) || [];
            setSelectedSubjects(allIds);
            const newPeriods = {};
            allIds.forEach(id => newPeriods[id] = 1);
            setPeriods(newPeriods);
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
                    sessions: periods[subjectId] || 1
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

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Available Subjects
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                        {subjectsList && subjectsList.map((subject) => (
                            <FormControlLabel
                                key={subject._id}
                                control={
                                    <Checkbox
                                        checked={selectedSubjects.includes(subject._id)}
                                        onChange={() => handleSubjectToggle(subject._id)}
                                        color="primary"
                                    />
                                }
                                label={subject.subName}
                                sx={{ display: 'block', mb: 1 }}
                            />
                        ))}
                    </Box>
                </Box>

                {selectedSubjects.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Selected Subjects
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Subject Code</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Periods Per Week</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedSubjects.map((subjectId) => {
                                        const subject = subjectsList?.find(s => s._id === subjectId);
                                        return (
                                            <TableRow key={subjectId}>
                                                <TableCell>{subject?.subName}</TableCell>
                                                <TableCell>{subject?.subCode}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={periods[subjectId] || 1}
                                                        onChange={(e) => setPeriods(prev => ({ ...prev, [subjectId]: parseInt(e.target.value) || 1 }))}
                                                        inputProps={{ min: 1 }}
                                                        sx={{ width: 80 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

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