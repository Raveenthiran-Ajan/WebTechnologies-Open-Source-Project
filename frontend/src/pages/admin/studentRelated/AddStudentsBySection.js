import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const AddStudentsBySection = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const { sclassesList, loading } = useSelector((state) => state.sclass);
    const { studentsList } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser._id;
    const classId = params.id; // Get classId from URL params

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllStudents(adminID));
    }, [adminID, dispatch]);

    const handleAddStudent = (sclassId, sectionName = '') => {
        navigate(`/Admin/addstudents?sclass=${sclassId}&section=${encodeURIComponent(sectionName)}`);
    };

    // Calculate students per section
    const studentsBySection = (studentsList || []).reduce((acc, student) => {
        if (student.sclassName && student.sectionName) {
            const key = `${student.sclassName._id}-${student.sectionName}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(student);
        } else if (student.sclassName && !student.sectionName) {
            // For classes without sections
            const key = student.sclassName._id;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(student);
        }
        return acc;
    }, {});

    // Create section cards
    const sectionCards = [];
    sclassesList && sclassesList.forEach((sclass) => {
        // If classId is provided, only show sections for that class
        if (classId && sclass._id !== classId) return;
        
        if (sclass.sections && sclass.sections.length > 0) {
            // Class has sections - create a card for each section
            sclass.sections.forEach((section, index) => {
                const sectionKey = `${sclass._id}-${section.sectionName}`;
                const studentCount = (studentsBySection[sectionKey] || []).length;
                sectionCards.push({
                    id: `${sclass._id}-${index}`,
                    className: sclass.sclassName,
                    sectionName: section.sectionName,
                    sclassId: sclass._id,
                    hasSections: true,
                    studentCount: studentCount
                });
            });
        } else {
            // Class has no sections - create one card for the whole class
            const studentCount = (studentsBySection[sclass._id] || []).length;
            sectionCards.push({
                id: sclass._id,
                className: sclass.sclassName,
                sectionName: '',
                sclassId: sclass._id,
                hasSections: false,
                studentCount: studentCount
            });
        }
    });

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                {classId ? 'Add Students to Class' : 'Add Students by Section'}
            </Typography>
            <Typography variant="body1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
                {classId ? 'Select a section to add students' : 'Select a class section to add students'}
            </Typography>

            <Grid container spacing={3}>
                {sectionCards.map((card) => (
                    <Grid item xs={12} sm={6} md={4} key={card.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                <Box sx={{ mb: 2 }}>
                                    <GroupIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                </Box>
                                <Typography variant="h6" component="div" gutterBottom>
                                    {card.className}
                                </Typography>
                                {card.hasSections && (
                                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                                        Section: {card.sectionName}
                                    </Typography>
                                )}
                                {!card.hasSections && (
                                    <Typography variant="body2" color="text.secondary">
                                        No sections
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {card.studentCount} {card.studentCount === 1 ? 'Student' : 'Students'}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => navigate(`/Admin/students?class=${card.sclassId}&section=${encodeURIComponent(card.sectionName)}`)}
                                    sx={{ mr: 1 }}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => handleAddStudent(card.sclassId, card.sectionName)}
                                    sx={{ minWidth: 'auto', px: 2 }}
                                    title="Add Student"
                                >
                                    <PersonAddAlt1Icon />
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {sectionCards.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No classes available
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default AddStudentsBySection;