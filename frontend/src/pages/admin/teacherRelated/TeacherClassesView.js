import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { 
    Box, Button, Typography, Paper, CircularProgress, 
    Table, TableBody, TableContainer, TableHead, Chip
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';

const TeacherClassesView = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { sclassesList, subjectsList, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);
    
    const [selectedClass, setSelectedClass] = useState(null);
    const [classSubjects, setClassSubjects] = useState([]);

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(getSubjectList(selectedClass._id, "ClassSubjects"));
        }
    }, [selectedClass, dispatch]);

    useEffect(() => {
        if (subjectsList && Array.isArray(subjectsList)) {
            setClassSubjects(subjectsList);
        }
    }, [subjectsList]);

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setClassSubjects([]);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show subjects view when class is selected
    if (selectedClass) {
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToClasses}
                        sx={{ mr: 2 }}
                    >
                        Back to Classes
                    </Button>
                    <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
                        {selectedClass.sclassName} - Subjects
                    </Typography>
                </Box>

                {classSubjects && classSubjects.length > 0 ? (
                    <TableContainer>
                        <Table aria-label="subjects table">
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>#</StyledTableCell>
                                    <StyledTableCell align="center">Subject Name</StyledTableCell>
                                    <StyledTableCell align="center">Subject Code</StyledTableCell>
                                    <StyledTableCell align="center">Periods Per Week</StyledTableCell>
                                    <StyledTableCell align="center">Assigned Teacher</StyledTableCell>
                                    <StyledTableCell align="center">Actions</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {classSubjects.map((subject, index) => (
                                    <StyledTableRow key={subject._id}>
                                        <StyledTableCell component="th" scope="row" style={{ color: "white" }}>
                                            {index + 1}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                {subject.subName}
                                            </Box>
                                        </StyledTableCell>
                                        <StyledTableCell align="center">{subject.subCode}</StyledTableCell>
                                        <StyledTableCell align="center">{subject.periodsPerWeek || 'N/A'}</StyledTableCell>
                                        <StyledTableCell align="center">
                                            {subject.teacher ? (
                                                <Chip 
                                                    label={subject.teacher.name} 
                                                    color="success" 
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip 
                                                    label="No Teacher" 
                                                    color="error" 
                                                    size="small"
                                                />
                                            )}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Button 
                                                    variant="contained" 
                                                    size="small"
                                                    onClick={() => navigate(`/Admin/class/subject/${selectedClass._id}/${subject._id}`)}
                                                >
                                                    View Details
                                                </Button>
                                                {!subject.teacher && (
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small"
                                                        color="success"
                                                        onClick={() => navigate(`/Admin/teachers/add`)}
                                                    >
                                                        Assign Teacher
                                                    </Button>
                                                )}
                                            </Box>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '40vh' 
                    }}>
                        <SubjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom color="text.secondary">
                            No subjects found for {selectedClass.sclassName}
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}
                        >
                            Add Subjects
                        </Button>
                    </Box>
                )}
            </Paper>
        );
    }

    // Show classes view
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
                Choose a Class to Add Teacher
            </Typography>
            
            {sclassesList && sclassesList.length > 0 ? (
                <TableContainer>
                    <Table aria-label="classes table">
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>#</StyledTableCell>
                                <StyledTableCell align="center">Class Name</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {sclassesList.map((classItem, index) => (
                                <StyledTableRow key={classItem._id}>
                                    <StyledTableCell component="th" scope="row" style={{ color: "white" }}>
                                        {index + 1}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            {classItem.sclassName}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            onClick={() => handleClassSelect(classItem)}
                                        >
                                            Choose
                                        </Button>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '40vh' 
                }}>
                    <ClassIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        No classes found
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate("/Admin/addclass")}
                    >
                        Add Class
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default TeacherClassesView;