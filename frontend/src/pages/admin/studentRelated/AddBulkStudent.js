import React, { useState, useEffect } from "react";
import { Button, TextField, Box, Typography, CircularProgress, Paper, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Container } from "@mui/material";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Popup from '../../../components/Popup';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

const AddBulkStudent = () => {
    const { id } = useParams(); // Get class ID from URL params
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sclassesList, loading: classLoading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    const [className, setClassName] = useState("");
    const [students, setStudents] = useState([
        { name: "", rollNumber: "", email: "", password: "" }
    ]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // Ensure classes are loaded using the logged-in admin ID
    useEffect(() => {
        const adminID = currentUser?._id;
        if ((!sclassesList || sclassesList.length === 0) && adminID) {
            dispatch(getAllSclasses(adminID, "Sclass"));
        }
    }, [dispatch, sclassesList, currentUser]);

    useEffect(() => {
        if (id && sclassesList) {
            const classItem = sclassesList.find(sclass => sclass._id === id);
            if (classItem) {
                setClassName(classItem.sclassName);
            } else {
                // Class not found, redirect
                navigate('/Admin/students');
            }
        } else if (!id) {
            // No class ID provided, redirect
            navigate('/Admin/students');
        }
    }, [id, sclassesList, navigate]);

    const handleStudentChange = (index, field) => (event) => {
        const newStudents = [...students];
        newStudents[index][field] = event.target.value;
        setStudents(newStudents);
    };

    const isRollNumberDuplicate = (rollNumber, currentIndex) => {
        if (!rollNumber.trim()) return false;
        return students.some((student, index) => 
            index !== currentIndex && student.rollNumber.trim() === rollNumber.trim()
        );
    };

    const isEmailDuplicate = (email, currentIndex) => {
        if (!email.trim()) return false;
        return students.some((student, index) => 
            index !== currentIndex && student.email.trim().toLowerCase() === email.trim().toLowerCase()
        );
    };

    const handleAddStudent = () => {
        setStudents([...students, { name: "", rollNumber: "", email: "", password: "" }]);
    };

    const handleRemoveStudent = (index) => () => {
        const newStudents = [...students];
        newStudents.splice(index, 1);
        setStudents(newStudents);
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        
        // Check for roll number duplicates in the form
        const rollNumbers = students.map(s => s.rollNumber).filter(r => r.trim() !== '');
        const duplicateRolls = rollNumbers.filter((roll, index) => rollNumbers.indexOf(roll) !== index);
        if (duplicateRolls.length > 0) {
            const uniqueDuplicates = [...new Set(duplicateRolls)];
            setMessage(`Duplicate roll numbers in the form: ${uniqueDuplicates.join(', ')}. Please fix before submitting.`);
            setShowPopup(true);
            return;
        }

        // Check for email duplicates in the form
        const emails = students.map(s => s.email).filter(e => e.trim() !== '');
        const duplicateEmails = emails.filter((email, index) => 
            emails.findIndex(e => e.toLowerCase() === email.toLowerCase()) !== index
        );
        if (duplicateEmails.length > 0) {
            const uniqueDuplicateEmails = [...new Set(duplicateEmails.map(e => e.toLowerCase()))];
            setMessage(`Duplicate email addresses in the form: ${uniqueDuplicateEmails.join(', ')}. Please fix before submitting.`);
            setShowPopup(true);
            return;
        }
        
        // Additional check for empty required fields
        const invalidStudents = students.filter(s => 
            !s.name.trim() || !s.rollNumber.trim() || !s.email.trim() || !s.password.trim()
        );
        if (invalidStudents.length > 0) {
            setMessage("Please fill in all required fields for all students.");
            setShowPopup(true);
            return;
        }
        
        setLoader(true);
        const submissionData = {
            students: students.filter(s => s.name.trim() !== '' && s.rollNumber.trim() !== '' && s.email.trim() !== '' && s.password.trim() !== ''), // Filter out empty rows
            classId: id,
            adminID: currentUser._id
        };
        
        if (submissionData.students.length === 0) {
            setMessage("Please add at least one student with complete information.");
            setShowPopup(true);
            setLoader(false);
            return;
        }
        
        try {
            const result = await axios.post(`${API_BASE_URL}/StudentBulkReg`, submissionData, {
                headers: { 'Content-Type': 'application/json' },
            });
            setMessage(result.data.message);
            setShowPopup(true);
            // Reset form on success
            setStudents([{ name: "", rollNumber: "", email: "", password: "" }]);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.message);
            } else {
                setMessage(error.response ? error.response.data.message : "An error occurred");
            }
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    if (classLoading || !className) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <Box mb={3}>
                    <Typography variant="h6">Add Students to {className}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add multiple students to {className}. Each row represents a student.
                    </Typography>
                </Box>

                <Paper sx={{ overflow: 'auto', mb: 3 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Roll Number</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Email Address</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Password</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '5%', textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student, index) => (
                                    <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.25' } }}>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                placeholder="Enter student name"
                                                variant="outlined"
                                                size="small"
                                                value={student.name}
                                                onChange={handleStudentChange(index, "name")}
                                                required
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                placeholder="Enter roll number"
                                                variant="outlined"
                                                size="small"
                                                value={student.rollNumber}
                                                onChange={handleStudentChange(index, "rollNumber")}
                                                error={isRollNumberDuplicate(student.rollNumber, index)}
                                                helperText={isRollNumberDuplicate(student.rollNumber, index) ? "Duplicate roll number" : ""}
                                                required
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                placeholder="Enter email address"
                                                variant="outlined"
                                                size="small"
                                                type="email"
                                                value={student.email}
                                                onChange={handleStudentChange(index, "email")}
                                                error={isEmailDuplicate(student.email, index)}
                                                helperText={isEmailDuplicate(student.email, index) ? "Duplicate email address" : ""}
                                                required
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                placeholder="Enter password"
                                                variant="outlined"
                                                size="small"
                                                value={student.password}
                                                onChange={handleStudentChange(index, "password")}
                                                required
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={handleRemoveStudent(index)}
                                                disabled={students.length === 1}
                                                title="Remove student"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddStudent}
                    >
                        Add Row
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        {students.length} student{students.length !== 1 ? 's' : ''} to be added to {className}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/Admin/students')}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={submitHandler}
                        disabled={loader || students.some(s => !s.name.trim() || !s.rollNumber.trim() || !s.email.trim() || !s.password.trim())}
                    >
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            `Save ${students.length} Student${students.length !== 1 ? 's' : ''}`
                        )}
                    </Button>
                </Box>

                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Box>
        </Container>
    );
};

export default AddBulkStudent;
