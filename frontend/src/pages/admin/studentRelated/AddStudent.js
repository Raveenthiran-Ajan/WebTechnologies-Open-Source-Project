import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid } from '@mui/material';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('')
    const [sclassName, setSclassName] = useState('')
    const [sectionName, setSectionName] = useState('')

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id || '');
        }

        // Check for query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sclassParam = urlParams.get('sclass');
        const sectionParam = urlParams.get('section');

        if (sclassParam) {
            setSclassName(sclassParam);
        }
        if (sectionParam) {
            setSectionName(sectionParam);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === '' || event.target.value === 'Select Class') {
            setSclassName('');
            setSectionName('');
        } else {
            setSclassName(event.target.value);
            setSectionName('');
        }
    }

    const fields = { name, rollNum, password, sclassName, sectionName, adminID, role, attendance }

    const submitHandler = (event) => {
        event.preventDefault()
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
        }
        else {
            const selectedClass = sclassesList.find(sclass => sclass._id === sclassName);
            if (selectedClass && selectedClass.sections && selectedClass.sections.length > 0 && sectionName === "") {
                setMessage("Please select a section")
                setShowPopup(true)
            }
            else {
                setLoader(true)
                dispatch(registerUser(fields, role))
            }
        }
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            const sclass = sclassesList.find(c => c._id === sclassName);
            if (sclass) {
                navigate('/Admin/students', { state: { sclass } });
            } else {
                navigate(-1);
            }
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
                <Typography variant="h4" gutterBottom>
                    Add New Student
                </Typography>
                <form onSubmit={submitHandler}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Student's Name"
                                variant="outlined"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete="name"
                                required
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter student's full name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Select Class"
                                variant="outlined"
                                value={sclassName}
                                onChange={changeHandler}
                                required
                                InputLabelProps={{ shrink: true }}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="">Select Class</option>
                                {sclassesList && sclassesList.map((sclass) => (
                                    <option key={sclass._id} value={sclass._id}>
                                        {sclass.sclassName}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        {sclassName && sclassesList && (() => {
                            const selectedClass = sclassesList.find(sclass => sclass._id === sclassName);
                            return selectedClass && selectedClass.sections && selectedClass.sections.length > 0 ? (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Section"
                                        variant="outlined"
                                        value={sectionName}
                                        onChange={(event) => setSectionName(event.target.value)}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="">Select Section</option>
                                        {selectedClass.sections.map((section, index) => (
                                            <option key={index} value={section.sectionName}>
                                                {section.sectionName}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                            ) : null;
                        })()}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Roll Number"
                                type="number"
                                variant="outlined"
                                value={rollNum}
                                onChange={(event) => setRollNum(event.target.value)}
                                required
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter roll number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter password"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" type="submit" disabled={loader}>
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Student'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    )
}

export default AddStudent