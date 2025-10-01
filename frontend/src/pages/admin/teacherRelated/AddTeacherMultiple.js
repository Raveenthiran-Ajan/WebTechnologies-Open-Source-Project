import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import {
    Box,
    TextField,
    Typography,
    Container,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    CircularProgress,
    Grid,
    Button
} from '@mui/material';

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

const AddTeacherMultiple = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, response, error } = useSelector(state => state.user);
    const { sclassesList, subjectsList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [attendanceClass, setAttendanceClass] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        // When classes are selected, get all subjects from those classes
        if (selectedClasses.length > 0 && sclassesList) {
            const subjects = [];
            selectedClasses.forEach(classId => {
                const classData = sclassesList.find(cls => cls._id === classId);
                if (classData && classData.subjects) {
                    classData.subjects.forEach(subject => {
                        if (!subjects.find(sub => sub._id === subject._id)) {
                            subjects.push(subject);
                        }
                    });
                }
            });
            setAvailableSubjects(subjects);
        } else {
            setAvailableSubjects([]);
        }
    }, [selectedClasses, sclassesList]);

    const handleClassChange = (event) => {
        const value = event.target.value;
        setSelectedClasses(typeof value === 'string' ? value.split(',') : value);
        setSelectedSubjects([]); // Reset subjects when classes change
        setAttendanceClass(''); // Reset attendance class
    };

    const handleSubjectChange = (event) => {
        const value = event.target.value;
        setSelectedSubjects(typeof value === 'string' ? value.split(',') : value);
    };

    const handleAttendanceClassChange = (event) => {
        setAttendanceClass(event.target.value);
    };

    const submitHandler = (event) => {
        event.preventDefault();
        
        if (selectedClasses.length === 0) {
            setMessage("Please select at least one class");
            setShowPopup(true);
            return;
        }
        
        if (selectedSubjects.length === 0) {
            setMessage("Please select at least one subject");
            setShowPopup(true);
            return;
        }
        
        if (!attendanceClass) {
            setMessage("Please select an attendance class");
            setShowPopup(true);
            return;
        }

        setLoader(true);
        
        const fields = {
            name,
            email,
            password,
            role: "Teacher",
            school: currentUser._id,
            teachSclasses: selectedClasses,
            teachSubjects: selectedSubjects,
            attendanceClass: attendanceClass,
            // Backward compatibility
            teachSclass: attendanceClass,
            teachSubject: selectedSubjects[0]
        };

        dispatch(registerUser(fields, "Teacher"));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/teachers");
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Container maxWidth="md">
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Add New Teacher
                </Typography>
                
                <form onSubmit={submitHandler}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Teaching Classes</InputLabel>
                                <Select
                                    multiple
                                    value={selectedClasses}
                                    onChange={handleClassChange}
                                    input={<OutlinedInput label="Teaching Classes" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const className = sclassesList?.find(cls => cls._id === value)?.sclassName;
                                                return <Chip key={value} label={className} />;
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {sclassesList && sclassesList.map((sclass) => (
                                        <MenuItem key={sclass._id} value={sclass._id}>
                                            {sclass.sclassName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth disabled={availableSubjects.length === 0}>
                                <InputLabel>Teaching Subjects</InputLabel>
                                <Select
                                    multiple
                                    value={selectedSubjects}
                                    onChange={handleSubjectChange}
                                    input={<OutlinedInput label="Teaching Subjects" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const subjectName = availableSubjects?.find(sub => sub._id === value)?.subName;
                                                return <Chip key={value} label={subjectName} />;
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {availableSubjects.map((subject) => (
                                        <MenuItem key={subject._id} value={subject._id}>
                                            {subject.subName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth disabled={selectedClasses.length === 0}>
                                <InputLabel>Attendance Class (Single)</InputLabel>
                                <Select
                                    value={attendanceClass}
                                    onChange={handleAttendanceClassChange}
                                    input={<OutlinedInput label="Attendance Class (Single)" />}
                                >
                                    {selectedClasses.map((classId) => {
                                        const className = sclassesList?.find(cls => cls._id === classId)?.sclassName;
                                        return (
                                            <MenuItem key={classId} value={classId}>
                                                {className}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                {loader ? (
                                    <CircularProgress />
                                ) : (
                                    <Button
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        Add Teacher
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddTeacherMultiple;