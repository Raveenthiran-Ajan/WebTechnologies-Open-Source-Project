import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../../redux/sclassRelated/sclassHandle';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert
} from "@mui/material";
import { API_BASE_URL } from '../../../config';
import axios from 'axios';
import Popup from "../../../components/Popup";

const AddSection = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useParams();
    const { sclassDetails, loading } = useSelector((state) => state.sclass);

    const [sectionName, setSectionName] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const classID = params.id;

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
    }, [dispatch, classID]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!sectionName.trim()) {
            setMessage("Please enter a section name");
            setShowPopup(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/Sclass/${classID}/addSection`, {
                sectionName: sectionName.trim()
            });

            if (response.data.message) {
                setMessage(response.data.message);
            } else {
                setMessage(`✅ Successfully created section "${sectionName.trim()}" under ${sclassDetails?.sclassName || 'class'}`);
                setSectionName("");
                // Navigate back after successful creation
                setTimeout(() => {
                    navigate(-1);
                }, 2000); // Give user time to see success message
            }
            setShowPopup(true);
        } catch (error) {
            console.error('Error adding section:', error);
            setMessage(error.response?.data?.message || '❌ Failed to add section');
            setShowPopup(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main' }}>
                <Typography variant="h5" component="h1" gutterBottom align="center" color="primary">
                    Add New Section
                </Typography>

                {sclassDetails && (
                    <Alert severity="info" sx={{ mb: 3, color: 'primary.main', '& .MuiAlert-icon': { color: 'primary.main' } }}>
                        Adding section to: <strong>{sclassDetails.sclassName}</strong>
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Section Name"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        margin="normal"
                        required
                        autoFocus
                        placeholder="e.g., Section A, Section B"
                        disabled={isSubmitting}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isSubmitting || !sectionName.trim()}
                            sx={{ py: 1.5 }}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Add Section'}
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleGoBack}
                            disabled={isSubmitting}
                            sx={{ py: 1.5 }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddSection;