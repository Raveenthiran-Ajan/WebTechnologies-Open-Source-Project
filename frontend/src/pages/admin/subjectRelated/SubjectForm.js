import React, { useEffect, useState } from "react";
import { Button, TextField, Box, Typography, CircularProgress, Paper, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Container } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", periodsPerWeek: "" }]);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const adminID = currentUser._id
    const address = "Subject"

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value;
        setSubjects(newSubjects);
    };

    const handlePeriodsPerWeekChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].periodsPerWeek = event.target.value;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", periodsPerWeek: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            periodsPerWeek: subject.periodsPerWeek,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        if (event) event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
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
    }, [status, navigate, error, response, dispatch]);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <Box mb={3}>
                    <Typography variant="h6">Add Subjects</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add multiple subjects at once using the table below. Click "Add Row" to add more subjects.
                    </Typography>
                </Box>

            <Paper sx={{ overflow: 'auto', mb: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Subject Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Subject Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Periods Per Week</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subjects.map((subject, index) => (
                                <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.25' } }}>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            placeholder="Enter subject name"
                                            variant="outlined"
                                            size="small"
                                            value={subject.subName}
                                            onChange={handleSubjectNameChange(index)}
                                            required
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            placeholder="Enter subject code"
                                            variant="outlined"
                                            size="small"
                                            value={subject.subCode}
                                            onChange={handleSubjectCodeChange(index)}
                                            required
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            placeholder="Enter periods per week"
                                            variant="outlined"
                                            size="small"
                                            type="number"
                                            value={subject.periodsPerWeek}
                                            onChange={handlePeriodsPerWeekChange(index)}
                                            required
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={handleRemoveSubject(index)}
                                            disabled={subjects.length === 1}
                                            title="Remove subject"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddSubject}
                >
                    Add Row
                </Button>
                <Typography variant="body2" color="text.secondary">
                    {subjects.length} subject{subjects.length !== 1 ? 's' : ''} to be added
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/Admin/subjects')}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={submitHandler}
                    disabled={loader || subjects.some(s => !s.subName.trim() || !s.subCode.trim() || !s.periodsPerWeek.trim())}
                >
                    {loader ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        `Save ${subjects.length} Subject${subjects.length !== 1 ? 's' : ''}`
                    )}
                </Button>
            </Box>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Box>
        </Container>
    );
}

export default SubjectForm