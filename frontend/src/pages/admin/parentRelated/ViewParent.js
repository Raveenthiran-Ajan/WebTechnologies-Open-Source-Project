import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getParentDetails, updateParent } from '../../../redux/parentRelated/parentHandle'; // This file was not in context, but I am assuming it's correct.
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
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
    const { sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [rollNum, setRollNum] = useState('');
    const [sclassName, setSclassName] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const parentID = params.id;
    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getParentDetails(parentID));
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [dispatch, parentID, adminID]);

    const handleAddChild = (e) => {
        e.preventDefault();
        const fields = { rollNum, sclassName };
        dispatch(updateParent(fields, parentID, "AddChild"))
            .then(() => {
                dispatch(getParentDetails(parentID));
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
                                    label="Child's Roll Number"
                                    variant="outlined"
                                    fullWidth
                                    value={rollNum}
                                    onChange={(e) => setRollNum(e.target.value)}
                                    required
                                />
                                <TextField
                                    select
                                    label="Class"
                                    variant="outlined"
                                    fullWidth
                                    value={sclassName}
                                    onChange={(e) => setSclassName(e.target.value)}
                                    required
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value=""></option>
                                    {sclassesList?.map((classItem) => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.sclassName}
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
