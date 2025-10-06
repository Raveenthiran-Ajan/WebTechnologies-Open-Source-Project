import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addParent } from '../../../redux/parentRelated/parentHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid, FormControlLabel, Checkbox } from '@mui/material';

const AddParent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, response, error } = useSelector(state => state.parent);
    const { studentsList } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
    const [password, setPassword] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const adminID = currentUser?._id;
    const school = currentUser?._id;

    useEffect(() => {
        if (adminID) {
            dispatch(getAllStudents(adminID));
        }
    }, [adminID, dispatch]);

    const fields = { name, email, studentId, school, autoGeneratePassword, ...(autoGeneratePassword ? {} : { password }) };

    const submitHandler = (event) => {
        event.preventDefault();
        if (studentId === "") {
            setMessage("Please select a child");
            setShowPopup(true);
        } else if (!autoGeneratePassword && !password.trim()) {
            setMessage("Please enter a password");
            setShowPopup(true);
        } else {
            setLoader(true);
            dispatch(addParent(fields, "Parent"));
        }
    };

    useEffect(() => {
        if (status === 'success' && response) {
            setLoader(false);
            navigate('/Admin/parents');
            dispatch(underControl());
        } else if (status === 'error') {
            setLoader(false);
            setMessage(response || "Network Error");
            setShowPopup(true);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Add New Parent
                </Typography>
                <form onSubmit={submitHandler}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Parent's Name"
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Parent's Email"
                                type="email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={autoGeneratePassword}
                                        onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Auto-generate password and send login details via email"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                If checked, a random password will be generated and login details will be sent to the parent's email.
                                If unchecked, you must enter a password manually.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required={!autoGeneratePassword}
                                disabled={autoGeneratePassword}
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                helperText={autoGeneratePassword ? "Password will be auto-generated" : "Enter a password for the parent"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Select Child"
                                variant="outlined"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                required
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value=""></option>
                                {studentsList && studentsList.length > 0 && studentsList.map((student, index) => (
                                    <option key={index} value={student._id}>
                                        {student.name} (Roll No: {student.rollNum})
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" type="submit" disabled={loader || !name.trim() || !email.trim() || (!autoGeneratePassword && !password.trim())}>
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Parent'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddParent;