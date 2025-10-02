import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Button, CircularProgress, Paper, IconButton } from '@mui/material'
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { clearSubjects } from '../../../redux/sclassRelated/sclassSlice';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false)

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            setClassID(params.id);
            const classID = params.id
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
        else if (situation === "Teacher") {
            const { classID, teacherID } = params
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
    }, [situation, dispatch, params]);

    // Debug: Log the subjects data to see what we're receiving
    useEffect(() => {
        if (subjectsList && subjectsList.length > 0) {
            console.log("\n=== FRONTEND DEBUG: Subjects data received ===");
            console.log("Raw subjectsList:", subjectsList);
            subjectsList.forEach((subject, index) => {
                console.log(`\nSubject ${index + 1}: ${subject.subName}`);
                console.log(`  - Subject ID: ${subject._id}`);
                console.log(`  - Subject Code: ${subject.subCode}`);
                console.log(`  - Teacher object:`, subject.teacher);
                console.log(`  - Has Teacher field:`, subject.hasTeacher);
                console.log(`  - Teacher ID:`, subject.teacher?._id);
                console.log(`  - Teacher Name:`, subject.teacher?.name);
                console.log(`  - Status should be:`, subject.hasTeacher || subject.teacher ? 'Already Assigned' : 'Available');
            });
            console.log("=== END FRONTEND DEBUG ===\n");
        } else if (subjectsList) {
            console.log("Subjects list is empty:", subjectsList);
        }
    }, [subjectsList]);



    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true)
        dispatch(updateTeachSubject(teacherId, teachSubject))
        navigate("/Admin/teachers")
    }

    // Clear subjects and force refresh when classID changes to ensure fresh data
    useEffect(() => {
        if (classID) {
            console.log("Clearing and refreshing subjects for class:", classID);
            // Clear existing subjects first
            dispatch(clearSubjects());
            // Then fetch fresh data
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
    }, [classID, dispatch]);

    const columns = [
        { field: 'subName', headerName: 'Subject Name', width: 250 },
        { field: 'subCode', headerName: 'Subject Code', width: 150 },
        { field: 'sessions', headerName: 'Sessions', width: 120 },
        { 
            field: 'teacher', 
            headerName: 'Assigned Teacher', 
            width: 200,
            renderCell: (params) => {
                const hasTeacher = params.row.hasTeacher;
                return hasTeacher ? (
                    <CheckCircleIcon color="success" />
                ) : (
                    <Typography variant="body2" color="success.main">
                        Available
                    </Typography>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                const hasTeacher = params.row.hasTeacher;
                return (
                    <Box>
                        <Button 
                            variant="contained"
                            color={hasTeacher ? "success" : "success"}
                            startIcon={<PersonAddIcon />}
                            disabled={hasTeacher}
                            onClick={() => navigate(`/Admin/teachers/addteacher/${params.row.id}`)}
                            sx={{
                                borderColor: "#4CAF50",
                                color: "#FFFFFF",
                                backgroundColor: "#4CAF50",
                                borderRadius: "50px",
                                padding: "8px 16px",
                                fontSize: "0.875rem",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                textTransform: "capitalize",
                                '&:hover': {
                                    backgroundColor: "#45A049",
                                    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.15)",
                                },
                            }}
                        >
                            Choose
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const rows = Array.isArray(subjectsList) && subjectsList.length > 0 ? subjectsList.map((subject) => ({
        id: subject._id,
        subName: subject.subName,
        subCode: subject.subCode,
        sessions: subject.sessions || 'N/A',
        hasTeacher: subject.hasTeacher,
    })) : [];

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    if (response) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 3, p: 4, textAlign: 'center' }}>
                    <PersonAddIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom color="text.secondary">
                        Sorry, all subjects have teachers assigned already
                    </Typography>
                    <Button 
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                        sx={{ mt: 2 }}
                    >
                        Add Subjects
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h4" component="h1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        Choose a Subject
                    </Typography>
                </Box>
                
                {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid 
                            rows={rows || []} 
                            columns={columns} 
                            slots={{ toolbar: CustomToolbar }}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '2px solid #e0e0e0',
                                },
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '40vh',
                        p: 4
                    }}>
                        <PersonAddIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom color="text.secondary">
                            No subjects available for teacher assignment
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                            All subjects already have teachers assigned or no subjects exist
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Add Subjects
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default ChooseSubject;