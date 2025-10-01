import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getParentDetails, updateParent } from '../../../redux/parentRelated/parentHandle'; // This file was not in context, but I am assuming it's correct.
import { getAllSclasses, getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import {
    Box, Button, Container, Paper, TextField, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import Popup from '../../../components/Popup';

const ViewParent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, parentDetails } = useSelector((state) => state.parent);
    const { sclassesList, sclassStudents } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [rollNum, setRollNum] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const parentID = params.id;
    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getParentDetails(parentID));
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [dispatch, parentID, adminID]);

    // Fetch students when class is selected
    useEffect(() => {
        if (sclassName) {
            dispatch(getClassStudents(sclassName));
        } else {
            setFilteredStudents([]);
        }
        // Reset roll number when class changes
        setRollNum('');
    }, [sclassName, dispatch]);

    // Update filtered students when sclassStudents changes
    useEffect(() => {
        if (sclassStudents && Array.isArray(sclassStudents)) {
            setFilteredStudents(sclassStudents);
        }
    }, [sclassStudents]);

    const handleClassChange = (e) => {
        const selectedClassId = e.target.value;
        setSclassName(selectedClassId);
    };

    const handleAddChild = (e) => {
        e.preventDefault();
        if (!rollNum || !sclassName) {
            setMessage("Please select both class and student roll number.");
            setShowPopup(true);
            return;
        }
        const fields = { rollNum, sclassName };
        dispatch(updateParent(fields, parentID, "AddChild"))
            .then(() => {
                dispatch(getParentDetails(parentID));
                // Reset form after successful addition
                setRollNum('');
                setSclassName('');
                setMessage("Child added successfully!");
                setShowPopup(true);
            })
            .catch((err) => {
                setMessage("Failed to add child. Please check details.");
                setShowPopup(true);
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                    Parent Details
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        Personal Information
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {parentDetails?.name}
                            </Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {parentDetails?.email}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {parentDetails?.children && parentDetails.children.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom color="text.secondary">
                                Linked Children
                            </Typography>
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Child Name</strong></TableCell>
                                            <TableCell><strong>Roll No.</strong></TableCell>
                                            <TableCell><strong>Class</strong></TableCell>
                                            <TableCell><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {parentDetails.children.map((child, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{child.name}</TableCell>
                                                <TableCell>{child.rollNum}</TableCell>
                                                <TableCell>{child.sclassName?.sclassName}</TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        onClick={() => navigate(`/Admin/students/student/${child._id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    
                    {/* Add Another Child Section */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom color="text.secondary">
                            Add Another Child
                        </Typography>
                        <Box component="form" onSubmit={handleAddChild} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                                <TextField
                                    select
                                    label="Class"
                                    variant="outlined"
                                    fullWidth
                                    value={sclassName}
                                    onChange={handleClassChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="">Select Class First</option>
                                    {sclassesList?.map((classItem) => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.sclassName}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Child's Roll Number"
                                    variant="outlined"
                                    fullWidth
                                    value={rollNum}
                                    onChange={(e) => setRollNum(e.target.value)}
                                    required
                                    disabled={!sclassName || filteredStudents.length === 0}
                                    InputLabelProps={{ shrink: true }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="">
                                        {!sclassName ? "Select Class First" : 
                                         filteredStudents.length === 0 ? "No students available" : 
                                         "Select Student"}
                                    </option>
                                    {filteredStudents?.map((student) => (
                                        <option key={student._id} value={student.rollNum}>
                                            {student.rollNum} - {student.name}
                                        </option>
                                    ))}
                                </TextField>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button type="submit" variant="contained" color="primary">
                                    Add Child
                                </Button>
                                <Button variant="outlined" onClick={() => navigate(-1)}>
                                    Go Back
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ViewParent;
