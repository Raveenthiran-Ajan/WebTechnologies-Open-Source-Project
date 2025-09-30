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
        <Container>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h5" gutterBottom>Parent Details</Typography>
                <Typography><strong>Name:</strong> {parentDetails?.name}</Typography>
                <Typography><strong>Email:</strong> {parentDetails?.email}</Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Linked Children</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Child Name</TableCell>
                                <TableCell>Roll No.</TableCell>
                                <TableCell>Class</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {parentDetails?.children?.map((child, index) => (
                                <TableRow key={index}>
                                    <TableCell>{child.name}</TableCell>
                                    <TableCell>{child.rollNum}</TableCell>
                                    <TableCell>{child.sclassName.sclassName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Add Another Child</Typography>
                <form onSubmit={handleAddChild}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                    <Button type="submit" variant="contained" color="primary">
                        Add Child
                    </Button>
                </form>
            </Paper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            <Box sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        </Container>
    );
};

export default ViewParent;
