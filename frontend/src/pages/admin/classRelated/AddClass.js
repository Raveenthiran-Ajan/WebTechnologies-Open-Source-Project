import React, { useState } from "react";
import { Button, Container, Box, Typography, Grid, TextField } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import Classroom from "../../../assets/classroom.png";

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const navigate = useNavigate();

    const handleSelectSubjects = () => {
        navigate('/Admin/select-subjects', { state: { className: sclassName } });
    };
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
                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleSelectSubjects}
                                    startIcon={<AddIcon />}
                                    fullWidth
                                    disabled={!sclassName.trim()}
                                >
                                    Select Subjects
                                </Button>
                                {!sclassName.trim() && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Please enter a class name first
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </Grid>
                    </Grid>
            </Box>
        </Container>
    )
}

export default AddClass