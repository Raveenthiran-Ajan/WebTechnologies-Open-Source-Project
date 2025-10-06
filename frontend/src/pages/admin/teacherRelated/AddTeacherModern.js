import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAllSclasses, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { RESET_STATUS } from '../../../redux/userRelated/userSlice';
import { 
    Container, Paper, Typography, Box, Button, Grid, Card, CardContent, 
    CircularProgress, Chip, Stepper, Step, StepLabel, Fade, TextField,
    FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText,
    FormControlLabel, Divider, OutlinedInput
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const AddTeacherModern = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useParams();
    const [searchParams] = useSearchParams();
    
    const { sclassesList, subjectsList, loading, error } = useSelector((state) => state.sclass);
    const { currentUser, status, response, error: userError } = useSelector(state => state.user);
    
    const [activeStep, setActiveStep] = useState(0);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [attendanceClass, setAttendanceClass] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loader, setLoader] = useState(false);
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
    
    const [steps, setSteps] = useState(['Select Classes', 'Select Subjects', 'Add Teacher Details']);

    // Get route parameters
    const classId = searchParams.get('classId');
    const subjectId = params.subjectId;

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (selectedClasses.length > 0) {
            // Get subjects for all selected classes
            const classIds = selectedClasses.map(cls => cls._id || cls);
            dispatch(getSubjectList(classIds, "ClassSubjects"));
        }
    }, [selectedClasses, dispatch]);
    
    // Auto-select class if classId is provided
    useEffect(() => {
        if (classId && sclassesList && sclassesList.length > 0) {
            const foundClass = sclassesList.find(cls => cls._id === classId);
            if (foundClass) {
                setSelectedClasses([foundClass]);
                setActiveStep(1); // Move to subject selection step
            }
        }
    }, [classId, sclassesList]);
    
    // Handle subject selection if subjectId is provided
    useEffect(() => {
        if (subjectId && subjectsList && subjectsList.length > 0) {
            const subject = subjectsList.find(sub => sub._id === subjectId);
            if (subject && !subject.hasTeacher) {
                setSelectedSubjects([subjectId]);
                setActiveStep(2); // Move to teacher details step
            }
        }
    }, [subjectId, subjectsList]);

    // Handle response from registration
    useEffect(() => {
        if (status === 'added') {
            setLoader(false);
            navigate('/Admin/teachers');
            dispatch(RESET_STATUS());
        } else if (status === 'failed') {
            setLoader(false);
            alert(`Failed to create teacher account: ${response || 'Please check the data and try again.'}`);
            dispatch(RESET_STATUS());
        } else if (status === 'error') {
            setLoader(false);
            alert(`Error occurred: ${userError || 'Please try again.'}`);
            dispatch(RESET_STATUS());
        }
    }, [status, navigate, dispatch, response, userError]);

    const handleClassSelect = (classItem) => {
        const isSelected = selectedClasses.some(cls => cls._id === classItem._id);
        if (isSelected) {
            // Remove class
            setSelectedClasses(selectedClasses.filter(cls => cls._id !== classItem._id));
            // Remove attendance responsibility if this class was selected
            if (attendanceClass === classItem._id) {
                setAttendanceClass('');
            }
        } else {
            // Add class
            setSelectedClasses([...selectedClasses, classItem]);
        }
    };

    const handleSubjectSelect = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedSubjects(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        if (activeStep === 0) {
            navigate('/Admin/teachers');
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate password if not auto-generating
        if (!autoGeneratePassword && !password.trim()) {
            alert("Please enter a password for the teacher");
            return;
        }
        
        // Validate that at least one class is selected
        if (selectedClasses.length === 0) {
            alert("Please select at least one class for the teacher");
            return;
        }
        
        const teacherData = {
            name,
            email,
            role: 'Teacher',
            school: currentUser._id,
            teachSubjects: selectedSubjects,
            teachSclasses: selectedClasses.map(cls => cls._id || cls),
            attendanceClass: attendanceClass || null,
            autoGeneratePassword,
            ...(autoGeneratePassword ? {} : { password })
        };
        
        console.log('Submitting teacher data:', teacherData);
        
        // Dispatch the action to register the teacher
        dispatch(registerUser(teacherData, "teacher"));
        
        // Set loader state
        setLoader(true);
    };

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

                {/* Step 1: Select Classes */}
                {activeStep === 0 && (
                    <Fade in timeout={500}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Select Classes
                            </Typography>
                            
                            {sclassesList && sclassesList.length > 0 ? (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                        Select one or more classes this teacher will teach. You can select multiple classes.
                                    </Typography>
                                    <Grid container spacing={3}>
                                        {sclassesList.map((classItem) => {
                                            const isSelected = selectedClasses.some(cls => cls._id === classItem._id);
                                            return (
                                                <Grid item xs={12} sm={6} md={4} key={classItem._id}>
                                                    <Card 
                                                        sx={{ 
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
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
                                                            <ClassIcon sx={{ fontSize: 60, mb: 2, color: isSelected ? 'white' : 'primary.main' }} />
                                                            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                {classItem.sclassName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {isSelected ? 'Selected' : 'Click to select'}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            disabled={selectedClasses.length === 0}
                                        >
                                            Next ({selectedClasses.length} selected)
                                        </Button>
                                    </Box>
                                </Box>
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

                {/* Step 2: Select Subjects */}
                {activeStep === 1 && (
                    <Fade in timeout={500}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Select Subjects
                            </Typography>
                            
                            {subjectsList && subjectsList.length > 0 ? (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Available Subjects from Selected Classes
                                    </Typography>
                                    
                                    <FormControl fullWidth sx={{ mb: 4 }}>
                                        <InputLabel id="subjects-select-label">Select Subjects</InputLabel>
                                        <Select
                                            labelId="subjects-select-label"
                                            multiple
                                            value={selectedSubjects}
                                            onChange={handleSubjectSelect}
                                            input={<OutlinedInput label="Select Subjects" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((subjectId) => {
                                                        const subject = subjectsList.find(s => s._id === subjectId);
                                                        return (
                                                            <Chip 
                                                                key={subjectId} 
                                                                label={subject ? `${subject.subName} (${subject.subCode})` : subjectId} 
                                                                size="small" 
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        >
                                            {subjectsList.map((subject) => (
                                                <MenuItem key={subject._id} value={subject._id}>
                                                    <Checkbox checked={selectedSubjects.indexOf(subject._id) > -1} />
                                                    <ListItemText 
                                                        primary={`${subject.subName} (${subject.subCode})`}
                                                        secondary={subject.hasTeacher ? `Assigned to: ${subject.teacher?.name || 'Another teacher'}` : 'Available'}
                                                    />
                                                    {subject.hasTeacher && (
                                                        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                                                    )}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                        >
                                            Next ({selectedSubjects.length} selected)
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <SubjectIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No subjects available for selected classes
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        onClick={() => navigate('/Admin/addsubject')}
                                        sx={{ mr: 2 }}
                                    >
                                        Add Subjects First
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => setActiveStep(0)}
                                    >
                                        Choose Different Classes
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* Step 3: Add Teacher Details */}
                {activeStep === 2 && (
                    <Fade in timeout={500}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Enter Teacher Information
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="name"
                                        label="Teacher Name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="attendance-class-label">Attendance Responsibility (Optional)</InputLabel>
                                        <Select
                                            labelId="attendance-class-label"
                                            value={attendanceClass}
                                            onChange={(e) => setAttendanceClass(e.target.value)}
                                            input={<OutlinedInput label="Attendance Responsibility (Optional)" />}
                                        >
                                            <MenuItem value="">
                                                <em>No attendance responsibility</em>
                                            </MenuItem>
                                            {selectedClasses.map((classItem) => (
                                                <MenuItem key={classItem._id} value={classItem._id}>
                                                    {classItem.sclassName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            Select a class for which this teacher will be responsible for taking attendance.
                                            Leave empty if this teacher won't take attendance.
                                        </Typography>
                                    </FormControl>
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
                                        If checked, a random password will be generated and login details will be sent to the teacher's email.
                                        If unchecked, you must enter a password manually.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required={!autoGeneratePassword}
                                        disabled={autoGeneratePassword}
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        helperText={autoGeneratePassword ? "Password will be auto-generated" : "Enter a password for the teacher"}
                                    />
                                </Grid>
                            </Grid>
                            
                            <Divider sx={{ my: 4 }} />
                            
                            <Typography variant="h6" gutterBottom>Assignment Summary:</Typography>
                            
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Teaching Classes:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedClasses.map((classItem) => (
                                            <Chip 
                                                key={classItem._id}
                                                label={classItem.sclassName}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Attendance Responsibility:</Typography>
                                    <Typography variant="body1">
                                        {attendanceClass ? 
                                            selectedClasses.find(cls => cls._id === attendanceClass)?.sclassName || 'Unknown class' 
                                            : 'None selected'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">Selected Subjects:</Typography>
                                    {selectedSubjects.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                            {selectedSubjects.map(subjectId => {
                                                const subject = subjectsList.find(s => s._id === subjectId);
                                                return subject ? (
                                                    <Chip 
                                                        key={subject._id}
                                                        label={`${subject.subName} (${subject.subCode})`}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null;
                                            })}
                                        </Box>
                                    ) : (
                                        <Typography variant="body1">None selected</Typography>
                                    )}
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ px: 4 }}
                                    disabled={loader || !name.trim() || !email.trim() || (!autoGeneratePassword && !password.trim())}
                                >
                                    {loader ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Add Teacher'
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                )}
            </Paper>
        </Container>
    );
};

export default AddTeacherModern;