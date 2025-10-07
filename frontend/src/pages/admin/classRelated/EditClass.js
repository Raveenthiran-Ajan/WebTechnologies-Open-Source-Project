import React, { useEffect, useState } from "react";
import { Button, Container, Box, Typography, Grid, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, CircularProgress } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { addStuff, updateStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const EditClass = () => {
    const [sclassName, setSclassName] = useState("");
    // selectedSubjects now stores merged subject details so the table can render immediately
    // item shape: { subjectId, sessions, subjectData: { _id, subName, subCode, periodsPerWeek } }
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;
    const { subjectsList, sclassDetails, loading } = useSelector((state) => state.sclass);

    const classID = params.id;
    const adminID = currentUser._id;
    const address = "Sclass";

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Load class details and subjects
    useEffect(() => {
        if (classID && currentUser._id) {
            dispatch(getClassDetails(classID, "Sclass"));
            dispatch(getSubjectList(currentUser._id, "allSubjects"));
        }
    }, [classID, currentUser._id, dispatch]);

    // Reset selected subjects when switching to a different class (entering edit mode)
    useEffect(() => {
        setSelectedSubjects([]);
    }, [classID]);

    // Initialize form data when class details are loaded
    useEffect(() => {
        // Initialize selectedSubjects from sclassDetails as soon as sclassDetails is available.
        // Do not overwrite user's in-progress edits; only populate when sclassDetails changes and selectedSubjects is empty.
        if (sclassDetails && sclassDetails._id && selectedSubjects.length === 0) {
            setSclassName(sclassDetails.sclassName || "");

            const merged = [];

            if (Array.isArray(sclassDetails.subjects)) {
                for (const s of sclassDetails.subjects) {
                    let subjObj = null;
                    if (s.subject && typeof s.subject === 'object' && s.subject._id) {
                        subjObj = s.subject;
                    } else if (s.subject && typeof s.subject === 'string') {
                        subjObj = Array.isArray(subjectsList) ? subjectsList.find(x => x._id === s.subject) : null;
                    } else if (s.subjectId) {
                        subjObj = Array.isArray(subjectsList) ? subjectsList.find(x => x._id === s.subjectId) : null;
                    }

                    const subjectId = (subjObj && subjObj._id) ? subjObj._id : (s.subject && typeof s.subject === 'string' ? s.subject : s.subjectId);
                    const sessions = s.sessions || s.sessionsPerWeek || (subjObj && subjObj.periodsPerWeek) || 1;

                    if (subjectId) {
                        merged.push({ subjectId, sessions, subjectData: subjObj });
                    }
                }
            }

            setSelectedSubjects(merged);
        }
    }, [sclassDetails, subjectsList]);

    // Update available subjects when subjectsList changes
    useEffect(() => {
        if (subjectsList && Array.isArray(subjectsList) && subjectsList.length > 0) {
            setAvailableSubjects(subjectsList);
        }
    }, [subjectsList]);

    const handleAddSubject = (subjectId) => {
        const isAlreadyAdded = selectedSubjects.some(item => item.subjectId === subjectId);
        if (isAlreadyAdded) {
            setMessage("This subject is already added to the class");
            setShowPopup(true);
            return;
        }

        const subject = subjectsList.find(s => s._id === subjectId);
        if (subject) {
            setSelectedSubjects(prev => [...prev, {
                subjectId: subject._id,
                sessions: subject.periodsPerWeek || 1,
                subjectData: subject
            }]);
        }
    };

    const handleRemoveSubject = (subjectId) => {
        setSelectedSubjects(prev => prev.filter(item => item.subjectId !== subjectId));
    };

    const fields = {
        id: classID,
        sclassName,
        subjects: selectedSubjects.map(item => ({ subject: item.subjectId, sessions: item.sessions })),
        adminID
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        setSubmitted(true);
        dispatch(updateStuff(fields, address));
    };

    useEffect(() => {
        // Only react to global status when this component initiated the update (submitted === true)
        if (!submitted) return;

        if (status === 'added') {
            navigate("/Admin/classes/class/" + classID);
            dispatch(underControl());
            setLoader(false);
            setSubmitted(false);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
            setSubmitted(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
            setSubmitted(false);
        }
    }, [status, navigate, error, response, dispatch, classID, submitted]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Edit Class
                </Typography>

                <form onSubmit={submitHandler}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Class Name"
                                variant="outlined"
                                value={sclassName}
                                onChange={(event) => setSclassName(event.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Manage Subjects
                            </Typography>

                            {/* Add Subject Section */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Add New Subjects to Class
                                </Typography>
                                {availableSubjects.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {availableSubjects.slice(0, 5).map((subject) => {
                                            const isAlreadyAdded = selectedSubjects.some(item => item.subjectId === subject._id);
                                            return (
                                                <Chip
                                                    key={subject._id}
                                                    label={`${subject.subName} (${subject.subCode})`}
                                                    onClick={() => handleAddSubject(subject._id)}
                                                    color={isAlreadyAdded ? "success" : "primary"}
                                                    variant={isAlreadyAdded ? "filled" : "outlined"}
                                                    size="small"
                                                    icon={isAlreadyAdded ? null : <AddIcon />}
                                                    disabled={isAlreadyAdded}
                                                />
                                            );
                                        })}
                                        {availableSubjects.length > 5 && (
                                            <Typography variant="body2" color="text.secondary">
                                                +{availableSubjects.length - 5} more available
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        No subjects available
                                    </Typography>
                                )}
                            </Box>

                            {/* Current Subjects Table */}
                            {(selectedSubjects.length > 0 || (sclassDetails && Array.isArray(sclassDetails.subjects) && sclassDetails.subjects.length > 0)) && (
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Subject Name</TableCell>
                                                <TableCell>Subject Code</TableCell>
                                                <TableCell>Periods Per Week</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedSubjects.length > 0 ? (
                                                selectedSubjects.map((item) => {
                                                    const subject = item.subjectData || subjectsList?.find(s => String(s._id) === String(item.subjectId));
                                                    return (
                                                        <TableRow
                                                            key={item.subjectId}
                                                            sx={{
                                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>{subject?.subName || 'Unknown'}</TableCell>
                                                            <TableCell>{subject?.subCode || 'Unknown'}</TableCell>
                                                            <TableCell>{item.sessions}</TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => handleRemoveSubject(item.subjectId)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                // Fallback: render rows from sclassDetails.subjects when selectedSubjects hasn't been populated yet
                                                sclassDetails.subjects.map((s, idx) => {
                                                    // s may be an object with .subject populated or an id/string; try to resolve
                                                    let subjObj = null;
                                                    if (s && typeof s === 'object' && s.subject && typeof s.subject === 'object') subjObj = s.subject;
                                                    else if (s && typeof s === 'object' && s.subject && typeof s.subject === 'string') subjObj = subjectsList?.find(x => String(x._id) === String(s.subject)) || null;
                                                    else if (typeof s === 'string') subjObj = subjectsList?.find(x => String(x._id) === String(s)) || null;

                                                    const subjectId = (subjObj && (subjObj._id || subjObj.id)) ? (subjObj._id || subjObj.id) : (s.subject && typeof s.subject === 'string' ? s.subject : s.subjectId || (s._id || null));
                                                    const sessions = (s && (s.sessions || s.sessionsPerWeek)) || (subjObj && subjObj.periodsPerWeek) || 'Unknown';

                                                    return (
                                                        <TableRow key={subjectId || idx} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                                                            <TableCell>{subjObj?.subName || 'Unknown'}</TableCell>
                                                            <TableCell>{subjObj?.subCode || 'Unknown'}</TableCell>
                                                            <TableCell>{sessions}</TableCell>
                                                            <TableCell>
                                                                {/* If selectedSubjects not yet populated, deletion should still work via remove handler using resolved id */}
                                                                <IconButton color="error" onClick={() => handleRemoveSubject(subjectId)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={loader || !sclassName.trim()}
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : 'Update Class'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default EditClass;