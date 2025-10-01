import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses, getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { 
    Container, Paper, Typography, Box, Button, Grid, Card, CardContent, 
    CircularProgress, Chip, Stepper, Step, StepLabel, Fade
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddTeacherModern = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { sclassesList, subjectsList, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);
    
    const [activeStep, setActiveStep] = useState(0);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    
    const steps = ['Select Class', 'Choose Subject', 'Add Teacher'];

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(getTeacherFreeClassSubjects(selectedClass._id));
        }
    }, [selectedClass, dispatch]);

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        setActiveStep(1);
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        navigate(`/Admin/teachers/addteacher/${subject._id}`);
    };

    const handleBack = () => {
        if (activeStep === 1) {
            setActiveStep(0);
            setSelectedClass(null);
        } else {
            navigate('/Admin/teachers');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                        Add New Teacher
                    </Typography>
                    
                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Step 1: Select Class */}
                {activeStep === 0 && (
                    <Fade in timeout={500}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Select a Class
                            </Typography>
                            
                            {sclassesList && sclassesList.length > 0 ? (
                                <Grid container spacing={3}>
                                    {sclassesList.map((classItem) => (
                                        <Grid item xs={12} sm={6} md={4} key={classItem._id}>
                                            <Card 
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: 6,
                                                        bgcolor: 'primary.light',
                                                        color: 'white'
                                                    },
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                                onClick={() => handleClassSelect(classItem)}
                                            >
                                                <CardContent sx={{ textAlign: 'center', flexGrow: 1, py: 4 }}>
                                                    <ClassIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                                                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                        {classItem.sclassName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Click to view available subjects
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <ClassIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No classes available
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        onClick={() => navigate('/Admin/addclass')}
                                        sx={{ mt: 2 }}
                                    >
                                        Add Class First
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* Step 2: Choose Subject */}
                {activeStep === 1 && selectedClass && (
                    <Fade in timeout={500}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Choose Subject for {selectedClass.sclassName}
                            </Typography>
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                Select a subject that needs a teacher assignment
                            </Typography>
                            
                            {subjectsList && subjectsList.length > 0 ? (
                                <Grid container spacing={3}>
                                    {subjectsList.map((subject) => (
                                        <Grid item xs={12} sm={6} md={4} key={subject._id}>
                                            <Card 
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 4,
                                                    },
                                                    height: '100%',
                                                    border: '2px solid transparent',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 4,
                                                    }
                                                }}
                                                onClick={() => handleSubjectSelect(subject)}
                                            >
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <SubjectIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                                        <Box>
                                                            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                                                {subject.subName}
                                                            </Typography>
                                                            <Chip 
                                                                label={subject.subCode} 
                                                                size="small" 
                                                                color="primary" 
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    </Box>
                                                    
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        Sessions: {subject.sessions || 'Not specified'}
                                                    </Typography>
                                                    
                                                    <Button 
                                                        variant="contained" 
                                                        fullWidth
                                                        startIcon={<PersonAddIcon />}
                                                        sx={{ mt: 2 }}
                                                    >
                                                        Add Teacher
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <SubjectIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No subjects available for teacher assignment
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        All subjects in {selectedClass.sclassName} already have teachers assigned
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}
                                        sx={{ mr: 2 }}
                                    >
                                        Add More Subjects
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => setActiveStep(0)}
                                    >
                                        Choose Different Class
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                )}
            </Paper>
        </Container>
    );
};

export default AddTeacherModern;