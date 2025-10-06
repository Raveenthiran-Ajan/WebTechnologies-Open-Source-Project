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
    FormControlLabel, FormGroup, Divider, OutlinedInput
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
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSections, setSelectedSections] = useState([]);
    const [additionalClasses, setAdditionalClasses] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [attendanceSections, setAttendanceSections] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loader, setLoader] = useState(false);
    const [isClassAttendanceResponsible, setIsClassAttendanceResponsible] = useState(false);
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
    
    const [steps, setSteps] = useState(['Select Class', 'Choose Sections', 'Select Subjects', 'Add Teacher Details']);

    // Get route parameters
    const classId = searchParams.get('classId');
    const subjectId = params.subjectId;
    const sectionsList = params.sections ? params.sections.split(',') : [];

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(getSubjectList(selectedClass._id, "ClassSubjects"));
        }
    }, [selectedClass, dispatch]);
    
    // Auto-select class if classId is provided
    useEffect(() => {
        if (classId && sclassesList && sclassesList.length > 0) {
            const foundClass = sclassesList.find(cls => cls._id === classId);
            if (foundClass) {
                setSelectedClass(foundClass);
                setActiveStep(1); // Move to section selection step
            }
        }
    }, [classId, sclassesList]);
    
    // Ensure attendance sections are always a subset of teaching sections
    useEffect(() => {
        if (selectedSections.length === 0) {
            setAttendanceSections([]);
        }
    }, [selectedSections]);
    
    // Handle subject selection if subjectId is provided
    useEffect(() => {
        if (subjectId && subjectsList && subjectsList.length > 0) {
            const subject = subjectsList.find(sub => sub._id === subjectId);
            if (subject && !subject.hasTeacher) {
                setSelectedSubjects([subjectId]);
                
                // If sections are provided in the URL, automatically select them
                if (sectionsList.length > 0 && selectedClass) {
                    setSelectedSections(sectionsList);
                    setActiveStep(3); // Skip to teacher details
                } else {
                    setActiveStep(2); // Move to subject selection step
                }
            }
        }
    }, [subjectId, subjectsList, sectionsList, selectedClass]);
    
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
        setSelectedClass(classItem);
        setSelectedSections([]);
        setSelectedSubjects([]);
        setIsClassAttendanceResponsible(false);
        setAutoGeneratePassword(true);
        setPassword('');
        
        // Update steps based on whether class has sections
        if (classItem.sections && classItem.sections.length > 0) {
            setSteps(['Select Class', 'Choose Sections', 'Select Subjects', 'Add Teacher Details']);
            setActiveStep(1);
        } else {
            setSteps(['Select Class', 'Select Subjects', 'Add Teacher Details']);
            setActiveStep(1); // This will be the "Select Subjects" step
        }
    };

    const handleSectionSelect = (event) => {
        const {
            target: { value },
        } = event;
        const newSelectedSections = typeof value === 'string' ? value.split(',') : value;
        
        setSelectedSections(newSelectedSections);
        
        // Remove any attendance sections that are no longer in the selected teaching sections
        setAttendanceSections(prev => 
            prev.filter(section => newSelectedSections.includes(section))
        );
    };

    const handleAttendanceSectionsSelect = (event) => {
        const {
            target: { value },
        } = event;
        setAttendanceSections(
            typeof value === 'string' ? value.split(',') : value,
        );
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
        
        // Validate that all attendance sections are included in teaching sections
        const validAttendanceSections = attendanceSections.filter(
            section => selectedSections.includes(section)
        );
        
        console.log('Selected class sections:', selectedClass.sections);
        
        // Based on the backend controller code, the teachSections and attendanceSections 
        // should be just the section names, not objects
        const teacherData = {
            name,
            email,
            role: 'Teacher',
            school: currentUser._id,
            teachSubjects: selectedSubjects,
            teachSclass: selectedClass._id,
            // include additional classes for multi-class teaching
            ...(additionalClasses.length > 0 ? { teachSclasses: Array.from(new Set([selectedClass._id, ...additionalClasses])) } : {}),
            teachSections: selectedSections,
            attendanceSections: validAttendanceSections,
            ...(selectedSections.length === 0 && isClassAttendanceResponsible && { attendanceClass: selectedClass._id }),
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
                                                        Click to select this class
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

                {/* Step 1: Choose Sections (only shown if class has sections) */}
                {activeStep === 1 && selectedClass && selectedClass.sections && selectedClass.sections.length > 0 && (
                    <Fade in timeout={500}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Select Sections for {selectedClass.sclassName}
                            </Typography>
                            
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                First select teaching sections, then optionally choose from those sections for attendance duty.
                            </Typography>
                            
                            <Box sx={{ mb: 4 }}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel id="sections-checkbox-label">Teaching Sections</InputLabel>
                                    <Select
                                        labelId="sections-checkbox-label"
                                        id="sections-checkbox"
                                        multiple
                                        value={selectedSections}
                                        onChange={handleSectionSelect}
                                        input={<OutlinedInput label="Teaching Sections" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        MenuProps={MenuProps}
                                    >
                                        {selectedClass.sections.map((section) => (
                                            <MenuItem key={section.sectionName} value={section.sectionName}>
                                                <Checkbox checked={selectedSections.indexOf(section.sectionName) > -1} />
                                                <ListItemText primary={section.sectionName} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Select all sections this teacher will teach. This will determine 
                                        which sections can be chosen for attendance duty in the next field.
                                    </Typography>
                                </FormControl>
                                
                                <FormControl fullWidth disabled={selectedSections.length === 0}>
                                    <InputLabel id="attendance-sections-label">Attendance Sections</InputLabel>
                                    <Select
                                        labelId="attendance-sections-label"
                                        id="attendance-sections"
                                        multiple
                                        value={attendanceSections}
                                        onChange={handleAttendanceSectionsSelect}
                                        input={<OutlinedInput label="Attendance Sections" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        MenuProps={MenuProps}
                                    >
                                        {selectedSections.map((sectionName) => (
                                            <MenuItem key={sectionName} value={sectionName}>
                                                <Checkbox checked={attendanceSections.indexOf(sectionName) > -1} />
                                                <ListItemText primary={sectionName} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        (Optional) Select sections for which this teacher will take attendance. 
                                        You can only choose from the teaching sections selected above. Leave empty if this teacher won't take attendance.
                                    </Typography>
                                </FormControl>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={selectedSections.length === 0}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                )}                {/* Step 2: Select Subjects (when sections exist) or Step 1: Select Subjects (when no sections) */}
                {((activeStep === 2 && selectedClass && selectedClass.sections && selectedClass.sections.length > 0) || 
                  (activeStep === 1 && selectedClass && (!selectedClass.sections || selectedClass.sections.length === 0))) && (
                    <Fade in timeout={500}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Select Subjects for {selectedClass.sclassName}
                            </Typography>
                            
                            {subjectsList && subjectsList.length > 0 ? (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Available Subjects
                                    </Typography>
                                    
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        {subjectsList.map((subject) => (
                                            <Grid item xs={12} sm={6} md={4} key={subject._id}>
                                                <Card sx={{ 
                                                    border: selectedSubjects.includes(subject._id) ? '2px solid #2196f3' : '1px solid #e0e0e0',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: '#2196f3',
                                                        boxShadow: 3
                                                    },
                                                    opacity: subject.hasTeacher ? 0.7 : 1,
                                                    position: 'relative'
                                                }}>
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                            <Typography variant="h6" component="h2">
                                                                {subject.subName}
                                                            </Typography>
                                                            <Chip 
                                                                label={subject.subCode} 
                                                                size="small" 
                                                                color="primary" 
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                        
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            Sessions: {subject.sessions || 'N/A'}
                                                        </Typography>
                                                        
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                Status: 
                                                            </Typography>
                                                            {subject.hasTeacher ? (
                                                                <Chip 
                                                                    icon={<CheckCircleIcon />}
                                                                    label={`Teacher: ${subject.teacher ? subject.teacher.name : 'Assigned'}`}
                                                                    size="small" 
                                                                    color="success" 
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            ) : (
                                                                <Chip 
                                                                    icon={<CancelIcon />}
                                                                    label="No Teacher Assigned"
                                                                    size="small" 
                                                                    color="warning"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            )}
                                                        </Box>
                                                        
                                                        {!subject.hasTeacher && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <FormControlLabel 
                                                                    control={
                                                                        <Checkbox 
                                                                            checked={selectedSubjects.includes(subject._id)}
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) {
                                                                                    setSelectedSubjects([...selectedSubjects, subject._id]);
                                                                                } else {
                                                                                    setSelectedSubjects(selectedSubjects.filter(id => id !== subject._id));
                                                                                }
                                                                            }}
                                                                        />
                                                                    } 
                                                                    label="Assign this subject to this teacher"
                                                                />
                                                            </Box>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                        >
                                            {selectedSubjects.length > 0 ? 'Next' : 'Continue without subjects'}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <SubjectIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No subjects available for this class
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}
                                        sx={{ mr: 2 }}
                                    >
                                        Add Subjects First
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

                {/* Step 3: Add Teacher Details (when sections exist) or Step 2: Add Teacher Details (when no sections) */}
                {((activeStep === 3 && selectedClass && selectedClass.sections && selectedClass.sections.length > 0) || 
                  (activeStep === 2 && selectedClass && (!selectedClass.sections || selectedClass.sections.length === 0))) && (
                    <Fade in timeout={500}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Enter Teacher Information
                            </Typography>
                            
                            <Grid container spacing={3}>
                                {/* Multi-class selection */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Additional Teaching Classes (Optional)
                                    </Typography>
                                    <FormControl fullWidth>
                                        <InputLabel id="additional-classes-label">Select Additional Classes</InputLabel>
                                        <Select
                                            labelId="additional-classes-label"
                                            multiple
                                            value={additionalClasses}
                                            onChange={(e) => setAdditionalClasses(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                            input={<OutlinedInput label="Select Additional Classes" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const cls = (sclassesList || []).find(c => c._id === value);
                                                        return <Chip key={value} label={cls ? cls.sclassName : value} size="small" />;
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {(sclassesList || []).filter(c => c._id !== selectedClass._id).map((cls) => (
                                                <MenuItem key={cls._id} value={cls._id}>
                                                    <Checkbox checked={additionalClasses.indexOf(cls._id) > -1} />
                                                    <ListItemText primary={cls.sclassName} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
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
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle1">Class:</Typography>
                                    <Typography variant="body1">{selectedClass?.sclassName || 'Not selected'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle1">Teaching Sections:</Typography>
                                    <Typography variant="body1">
                                        {selectedSections.length > 0 ? selectedSections.join(', ') : 'None selected'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle1">Attendance Responsibility:</Typography>
                                    <Typography variant="body1">
                                        {selectedSections.length > 0 
                                            ? (attendanceSections.length > 0 ? attendanceSections.join(', ') : 'None selected')
                                            : (isClassAttendanceResponsible ? 'Responsible for class attendance' : 'Not responsible for attendance')
                                        }
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
                                                        color="primary"
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
                            
                            {/* Attendance Responsibility for classes without sections */}
                            {selectedSections.length === 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isClassAttendanceResponsible}
                                                onChange={(e) => setIsClassAttendanceResponsible(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="This teacher is responsible for taking attendance for this class"
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                        Check this if the teacher will be responsible for attendance in this class (when no specific sections exist).
                                    </Typography>
                                </Box>
                            )}
                            
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