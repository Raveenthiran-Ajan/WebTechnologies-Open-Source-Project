import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid, Card, CardContent, Chip, Paper, Stepper, Step, StepLabel, Fade, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddTeacher = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { sclassesList } = useSelector((state) => state.sclass);
  const { currentUser, status, response, error } = useSelector(state => state.user);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  const steps = ['Select Classes', 'Select Subjects', 'Add Teacher Details'];

  useEffect(() => {
    dispatch(getAllSclasses(currentUser._id, "Sclass"));
  }, [dispatch, currentUser._id]);

  useEffect(() => {
    if (selectedClasses.length > 0) {
      fetchSubjectsForClasses();
    } else {
      setSubjectsByClass({});
    }
  }, [selectedClasses]);

  const fetchSubjectsForClasses = async () => {
    try {
      const subjectsMap = {};
      for (const classItem of selectedClasses) {
        const response = await axios.get(`${API_BASE_URL}/ClassSubjects/${classItem._id}`);
        if (response.data && !response.data.message) {
          subjectsMap[classItem._id] = response.data.map(subject => ({
            ...subject,
            hasTeacher: subject.teacher ? true : false
          }));
        }
      }
      setSubjectsByClass(subjectsMap);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setMessage("Failed to load subjects");
      setShowPopup(true);
    }
  };

  const handleClassSelect = (classItem) => {
    setSelectedClasses(prev => {
      const isSelected = prev.some(cls => cls._id === classItem._id);
      if (isSelected) {
        return prev.filter(cls => cls._id !== classItem._id);
      } else {
        return [...prev, classItem];
      }
    });
  };

  const handleSubjectSelect = (subjectId, classId) => {
    const subjectKey = `${classId}-${subjectId}`;
    setSelectedSubjects(prev => {
      if (prev.includes(subjectKey)) {
        return prev.filter(id => id !== subjectKey);
      } else {
        return [...prev, subjectKey];
      }
    });
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/Admin/teachers');
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const submitHandler = (event) => {
    event.preventDefault()
    setLoader(true)

    const teachAssignments = selectedSubjects.map(key => {
      const [classId, subjectId] = key.split('-');
      return { subject: subjectId, sclass: classId };
    });

    const fields = {
      name,
      email,
      role: "Teacher",
      school: currentUser._id,
      teachAssignments,
      attendanceClass: attendanceClass || null,
      autoGeneratePassword,
      ...(autoGeneratePassword ? {} : { password })
    }

    dispatch(registerUser(fields, "Teacher"))
  }

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl())
      navigate("/Admin/teachers")
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main' }}>
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
                    Select one or more classes this teacher will teach.
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

              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                For each selected class, choose the subjects this teacher will teach.
              </Typography>

              <Grid container spacing={3}>
                {selectedClasses.map((classItem) => (
                  <Grid item xs={12} md={6} key={classItem._id}>
                    <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                          {classItem.sclassName}
                        </Typography>
                        {subjectsByClass[classItem._id] && subjectsByClass[classItem._id].length > 0 ? (
                          <Box>
                            {subjectsByClass[classItem._id].map((subject) => {
                              const subjectKey = `${classItem._id}-${subject._id}`;
                              const isSelected = selectedSubjects.includes(subjectKey);
                              return (
                                <Box key={subject._id} sx={{ mb: 1 }}>
                                  <Tooltip title={subject.hasTeacher ? "Already assigned to another teacher" : ""}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={() => handleSubjectSelect(subject._id, classItem._id)}
                                          disabled={subject.hasTeacher}
                                        />
                                      }
                                      label={`${subject.subName} (${subject.subCode})`}
                                    />
                                  </Tooltip>
                                </Box>
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No subjects available for this class.
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Class Teacher Assignment Section */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Class Teacher Assignment (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select one class where this teacher will serve as the class teacher. Only one class can have a class teacher assigned.
              </Typography>
              <Box sx={{ mb: 4 }}>
                {selectedClasses.map((classItem) => (
                  <FormControlLabel
                    key={classItem._id}
                    control={
                      <Checkbox
                        checked={attendanceClass === classItem._id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAttendanceClass(classItem._id);
                          } else {
                            setAttendanceClass('');
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={classItem.sclassName}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedSubjects.length === 0}
                >
                  Next ({selectedSubjects.length} selected)
                </Button>
              </Box>
            </Box>
          </Fade>
        )}

        {/* Step 3: Add Teacher Details */}
        {activeStep === 2 && (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} />
                Teacher Details
              </Typography>

              <form onSubmit={submitHandler}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teacher's Name"
                      variant="outlined"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teacher's Email"
                      type="email"
                      variant="outlined"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={autoGeneratePassword}
                          onChange={(event) => setAutoGeneratePassword(event.target.checked)}
                          color="primary"
                        />
                      }
                      label="Auto-generate password and send login details via email"
                    />
                  </Grid>
                  {!autoGeneratePassword && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required={!autoGeneratePassword}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" type="submit" disabled={loader}>
                      {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Teacher'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Fade>
        )}
      </Paper>
    </Container>
  )
}

export default AddTeacher