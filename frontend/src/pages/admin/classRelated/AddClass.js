import React, { useEffect, useState } from "react";
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid, IconButton } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");
    const [sections, setSections] = useState([]);

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;

    const adminID = currentUser._id
    const address = "Sclass"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const addSection = () => {
        setSections([...sections, ""]);
    };

    const removeSection = (index) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const updateSection = (index, value) => {
        setSections(sections.map((s, i) => i === index ? value : s));
    };

    const fields = {
        sclassName,
        adminID,
        sections: sections.filter(s => s.trim()).map(s => ({ sectionName: s }))
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
                                Sections (Optional)
                            </Typography>
                            {sections.map((section, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={`Section ${index + 1}`}
                                        variant="outlined"
                                        value={section}
                                        onChange={(e) => updateSection(index, e.target.value)}
                                    />
                                    <IconButton onClick={() => removeSection(index)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={addSection}
                                sx={{ mt: 1 }}
                            >
                                Add Section
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" type="submit" disabled={loader} sx={{ mr: 2 }}>
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