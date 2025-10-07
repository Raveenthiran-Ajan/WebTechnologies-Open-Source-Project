import React, { useEffect, useState } from "react";
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Chip } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Will store [{subjectId, sessions}]
    const [availableSubjects, setAvailableSubjects] = useState([]); // Subjects not yet selected

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;
    const { subjectsList } = useSelector((state) => state.sclass);

    const adminID = currentUser._id
    const address = "Sclass"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Fetch all subjects when component mounts
    useEffect(() => {
        if (currentUser._id) {
            dispatch(getSubjectList(currentUser._id, "allSubjects"));
        }
    }, [currentUser._id, dispatch]);

    // Update available subjects when subjectsList changes
    useEffect(() => {
        if (subjectsList) {
            const available = subjectsList.filter(subject => 
                !selectedSubjects.some(selected => selected.subjectId === subject._id)
            );
            setAvailableSubjects(available);
        }
    }, [subjectsList, selectedSubjects]);

    const handleAddSubject = (subjectId) => {
        const subject = subjectsList.find(s => s._id === subjectId);
        if (subject) {
            setSelectedSubjects(prev => [...prev, { subjectId, sessions: 1 }]);
        }
    };

    const handleUpdateSessions = (subjectId, sessions) => {
        setSelectedSubjects(prev => 
            prev.map(item => 
                item.subjectId === subjectId 
                    ? { ...item, sessions: parseInt(sessions) || 1 } 
                    : item
            )
        );
    };

    const handleRemoveSubject = (subjectId) => {
        setSelectedSubjects(prev => prev.filter(item => item.subjectId !== subjectId));
    };

    const fields = {
        sclassName,
        subjects: selectedSubjects.map(item => ({ subject: item.subjectId, sessions: item.sessions })),
        adminID
    };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            navigate("/Admin/classes/class/" + tempDetails._id)
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch, tempDetails]);
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Add New Class
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <img
                        src={Classroom}
                        alt="classroom"
                        style={{ width: '200px', height: 'auto' }}
                    />
                </Box>
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
                                Add Subjects to Class
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="add-subject-select-label">Add Subject</InputLabel>
                                <Select
                                    labelId="add-subject-select-label"
                                    value=""
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            handleAddSubject(event.target.value);
                                        }
                                    }}
                                    input={<OutlinedInput label="Add Subject" />}
                                >
                                    {availableSubjects.length > 0 ? (
                                        availableSubjects.map((subject) => (
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.subName} ({subject.subCode})
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>
                                            <ListItemText primary="All subjects already added or no subjects available" />
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            
                            {selectedSubjects.length > 0 && (
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Subject Name</TableCell>
                                                <TableCell>Subject Code</TableCell>
                                                <TableCell>Sessions</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedSubjects.map((item) => {
                                                const subject = subjectsList.find(s => s._id === item.subjectId);
                                                return (
                                                    <TableRow key={item.subjectId}>
                                                        <TableCell>{subject?.subName || 'Unknown'}</TableCell>
                                                        <TableCell>{subject?.subCode || 'Unknown'}</TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={item.sessions}
                                                                onChange={(e) => handleUpdateSessions(item.subjectId, e.target.value)}
                                                                inputProps={{ min: 1 }}
                                                                sx={{ width: 80 }}
                                                            />
                                                        </TableCell>
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
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            
                            {subjectsList && subjectsList.length === 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No subjects available. Please add subjects first.
                                    </Typography>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        onClick={() => navigate('/Admin/addsubject')}
                                        sx={{ mt: 1 }}
                                    >
                                        Add Subjects
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                type="submit" 
                                disabled={loader || selectedSubjects.length === 0} 
                                sx={{ mr: 2 }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Create Class'}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    )
}

export default AddClass