import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Container, CircularProgress, Paper, Grid } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom';
import { getClassDetails } from '../../../redux/sclassRelated/sclassHandle';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';

const ChooseSection = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { sclassDetails, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    const classID = params.id;
    const [selectedSections, setSelectedSections] = useState([]);

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
    }, [dispatch, classID]);

    if (error) {
        console.log(error)
    }

    const navigateHandler = (sectionName) => {
        if (situation === "Teacher") {
            navigate(`/Admin/teachers/choosesubject/${classID}/${sectionName}`)
        }
        // Add other situations here if needed in the future
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                        Choose Sections
                    </Typography>
                </Box>

                {sclassDetails && (
                    <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
                        Class: <strong>{sclassDetails.sclassName}</strong>
                    </Typography>
                )}

                {sclassDetails?.sections && sclassDetails.sections.length > 0 ? (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Select Sections ({sclassDetails.sections.length} available)
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {sclassDetails.sections.map((section, index) => {
                                const isSelected = selectedSections.includes(section.sectionName);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                backgroundColor: isSelected ? 'primary.light' : 'white',
                                                border: '2px solid',
                                                borderColor: isSelected ? 'primary.main' : 'primary.main',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 4,
                                                    backgroundColor: isSelected ? 'primary.main' : 'primary.light',
                                                }
                                            }}
                                            onClick={() => {
                                                setSelectedSections(prev => 
                                                    prev.includes(section.sectionName)
                                                        ? prev.filter(s => s !== section.sectionName)
                                                        : [...prev, section.sectionName]
                                                );
                                            }}
                                        >
                                            <GroupIcon sx={{ fontSize: 40, mb: 1, color: isSelected ? 'white' : 'primary.main' }} />
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: isSelected ? 'white' : 'primary.main' }}>
                                                {section.sectionName}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1, color: isSelected ? 'white' : 'text.secondary' }}>
                                                {isSelected ? 'Selected' : 'Click to select'}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No sections found for this class
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please add sections to this class first before assigning teachers.
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/Admin/class/addsection/${classID}`)}
                        >
                            Add Section
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (selectedSections.length === 0) {
                                alert('Please select at least one section');
                                return;
                            }
                            navigate(`/Admin/teachers/choosesubject/${classID}/${selectedSections.join(',')}`)
                        }}
                        disabled={selectedSections.length === 0}
                    >
                        Continue ({selectedSections.length} selected)
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ChooseSection;