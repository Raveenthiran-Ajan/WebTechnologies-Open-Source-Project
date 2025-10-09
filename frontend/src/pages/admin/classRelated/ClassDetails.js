import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getClassDetails, getClassStudents, getClassTeachers, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { resetSubjects } from '../../../redux/sclassRelated/sclassSlice';
import { deleteUser, updateStuff } from '../../../redux/userRelated/userHandle';
import {
    Box, Container, Typography, Tab, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Popup from "../../../components/Popup";
import Delete from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import Timetable from './Timetable';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const location = useLocation();
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassTeachers, sclassDetails, loading, error, response, getresponse, getTeachersResponse } = useSelector((state) => state.sclass);

    const classID = params.id

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
        dispatch(getClassTeachers(classID));

        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        if (tab) {
            setValue(tab);
        }
    }, [dispatch, classID, location.search])

    // Lock page scrolling when Class Details is open and restore on unmount
    useEffect(() => {
        const mainEl = document.querySelector('main');
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
        const prevMainOverflow = mainEl ? mainEl.style.overflow : undefined;
        const prevMainHeight = mainEl ? mainEl.style.height : undefined;

        // Prevent scrolling on body and the admin dashboard main container
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
        if (mainEl) {
            mainEl.style.overflow = 'hidden';
            // Ensure it occupies full viewport height to avoid extra scroll space
            if (!mainEl.style.height) mainEl.style.height = '100vh';
        }

        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
            if (mainEl) {
                if (prevMainOverflow !== undefined) mainEl.style.overflow = prevMainOverflow;
                if (prevMainHeight !== undefined) mainEl.style.height = prevMainHeight;
            }
        };
    }, []);

    if (error) {
        console.log(error)
    }

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editSessions, setEditSessions] = useState(1);

    const deleteHandler = async (deleteID, address) => {
        let confirmMessage = '';
        let successMessage = '';
        
        if (address === 'Subject') {
            confirmMessage = 'Are you sure you want to remove this subject from the class? This will remove all associated data for this class including assignments, grades, and attendance records. This action cannot be undone.';
            successMessage = '📚 Subject has been successfully removed from the class';
        } else if (address === 'Student') {
            confirmMessage = 'Are you sure you want to remove this student from the class? This will remove their attendance, grades, and assignments for this class. This action cannot be undone.';
            successMessage = '👨‍🎓 Student has been successfully removed from the class';
        }
        
        const confirmDelete = window.confirm(confirmMessage);
        
        if (confirmDelete) {
            try {
                if (address === 'Subject') {
                    // Remove subject from class
                    const updatedSubjects = subjectsList
                        .filter(sub => sub._id !== deleteID)
                        .map(sub => ({ subject: sub._id, sessions: sub.sessions }));
                    await dispatch(updateStuff({ id: classID, subjects: updatedSubjects }, "Sclass"));
                } else {
                    // Handle student deletion
                    await dispatch(deleteUser(deleteID, address));
                }
                
                // Refresh appropriate data based on what was deleted
                if (address === 'Subject') {
                    dispatch(resetSubjects());
                    dispatch(getSubjectList(classID, "ClassSubjects"));
                } else if (address === 'Student') {
                    dispatch(getClassStudents(classID));
                }
                
                setMessage(successMessage);
                setShowPopup(true);
                
            } catch (error) {
                console.error('Delete error:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Please try again or contact support';
                setMessage('❌ Unable to delete ' + address.toLowerCase() + ': ' + errorMessage);
                setShowPopup(true);
            }
        }
    }

    const subjectColumns = [
        { field: 'name', headerName: 'Subject Name', width: 200 },
        { field: 'code', headerName: 'Subject Code', width: 150 },
        { field: 'periodsPerWeek', headerName: 'Periods Per Week', width: 140 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton onClick={() => {
                            setEditingSubject(params.row);
                            setEditSessions(params.row.periodsPerWeek);
                            setEditDialogOpen(true);
                        }}>
                            <EditIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => deleteHandler(params.row.id, "Subject")}>
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="outlined" 
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/Admin/class/subject/${classID}/${params.row.id}`)}
                        >
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const subjectRows = subjectsList && subjectsList.length > 0 ? subjectsList.map((subject) => ({
        id: subject._id,
        name: subject.subName,
        code: subject.subCode,
        periodsPerWeek: subject.sessions || 'N/A',
    })) : [];

    function SubjectsToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const ClassSubjectsSection = () => {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Subjects List
                </Typography>
                {response ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
                        <Typography variant="h6" gutterBottom>
                            No subjects found
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid 
                            rows={subjectRows || []} 
                            columns={subjectColumns} 
                            components={{ Toolbar: SubjectsToolbar }}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                )}
            </Box>
        )
    }

    const studentColumns = [
        { field: 'name', headerName: 'Student Name', width: 180 },
        { field: 'rollNum', headerName: 'Roll Number', width: 120 },
        { field: 'email', headerName: 'Email', width: 180 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton onClick={() => deleteHandler(params.row.id, "Student")}>
                            <PersonRemoveIcon color="error" />
                        </IconButton>
                        <Button
                            variant="outlined" 
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate("/Admin/students/student/" + params.row.id)}
                        >
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const studentRows = sclassStudents.map((student) => ({
        id: student._id,
        name: student.name,
        rollNum: student.rollNum,
        email: student.email || 'N/A',
    }));

    function StudentsToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                >
                    Add Student
                </Button>
            </GridToolbarContainer>
        );
    }

    const ClassStudentsSection = () => {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Students List
                </Typography>
                {getresponse ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
                        <Typography variant="h6" gutterBottom>
                            No students found
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                        >
                            Add Students
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid 
                            rows={studentRows || []} 
                            columns={studentColumns} 
                            components={{ Toolbar: StudentsToolbar }}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                )}
            </Box>
        )
    }

    const teacherColumns = [
        { field: 'name', headerName: 'Teacher Name', flex: 1 },
        { field: 'subject', headerName: 'Subject', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton onClick={() => deleteHandler(params.row.id, "Teacher")}>
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="outlined" 
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/Admin/teachers/teacher/${params.row.id}`)}
                        >
                            View
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const teacherRows = sclassTeachers && sclassTeachers.length > 0 ? sclassTeachers.map((teacher) => ({
        id: teacher._id,
        name: teacher.name,
        subject: teacher.assignedSubjects && teacher.assignedSubjects.length > 0 ? teacher.assignedSubjects.join(', ') : (teacher.teachSubject?.subName || 'N/A'),
        email: teacher.email || 'N/A',
    })) : [];

    function TeachersToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => navigate("/Admin/teachers/add?classId=" + classID)}
                >
                    Add Teacher
                </Button>
            </GridToolbarContainer>
        );
    }

    const ClassTeachersSection = () => {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Teachers List
                </Typography>
                {getTeachersResponse ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
                        <Typography variant="h6" gutterBottom>
                            No teachers found
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/teachers/add?classId=" + classID)}
                        >
                            Add Teachers
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid 
                            rows={teacherRows || []} 
                            columns={teacherColumns} 
                            components={{ Toolbar: TeachersToolbar }}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                )}
            </Box>
        )
    }

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList.length;
        const numberOfStudents = sclassDetails?.students?.length || sclassStudents.length;

        return (
            <Container maxWidth="md">
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="h1" gutterBottom color="primary">
                            Class Details
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/Admin/classes/edit/${classID}`)}
                        >
                            Edit Class
                        </Button>
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom color="text.secondary">
                            Class Information
                        </Typography>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Class Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {sclassDetails?.sclassName}
                                </Typography>
                            </Box>
                            
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    School Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {sclassDetails?.school?.schoolName || 'N/A'}
                                </Typography>
                            </Box>
                            
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Number of Subjects
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {numberOfSubjects}
                                </Typography>
                            </Box>
                            
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Number of Students
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {numberOfStudents}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Actions Section */}
                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {getresponse &&
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<PersonAddAlt1Icon />}
                                        onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                                    >
                                        Add Students
                                    </Button>
                                }
                                {response &&
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                                    >
                                        Add Subjects
                                    </Button>
                                }
                                <Button variant="outlined" onClick={() => navigate('/Admin/classes')}>
                                    Go Back
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        );
    }

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Box sx={{ width: '100%', typography: 'body1', }} >
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                                    <Tab label="Details" value="1" />
                                    <Tab label="Subjects" value="2" />
                                    <Tab label="Students" value="3" />
                                    <Tab label="Teachers" value="4" />
                                    <Tab label="Timetable" value="5" />
                                </TabList>
                            </Box>
                            {/* Scroll inside the tab content area only */}
                            <Container sx={{ marginTop: "3rem", marginBottom: 0, height: 'calc(100vh - 6rem)', overflowY: 'auto', overflowX: 'hidden' }}>
                                <TabPanel value="1">
                                    <ClassDetailsSection />
                                </TabPanel>
                                <TabPanel value="2">
                                    <ClassSubjectsSection />
                                </TabPanel>
                                <TabPanel value="3">
                                    <ClassStudentsSection />
                                </TabPanel>
                                <TabPanel value="4">
                                    <ClassTeachersSection />
                                </TabPanel>
                                <TabPanel value="5">
                                    <Timetable classID={classID} />
                                </TabPanel>
                            </Container>
                        </TabContext>
                    </Box>
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit Periods Per Week</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Periods Per Week"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={editSessions}
                        onChange={(e) => setEditSessions(parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={async () => {
                        try {
                            await axios.put(`${API_BASE_URL}/Sclass/SubjectSessions/${classID}`, {
                                subjectId: editingSubject.id,
                                sessions: editSessions
                            });
                            setMessage("Periods updated successfully");
                            setShowPopup(true);
                            setEditDialogOpen(false);
                            // Refresh subjects
                            dispatch(getSubjectList(classID, "ClassSubjects"));
                        } catch (error) {
                            setMessage("Error updating periods");
                            setShowPopup(true);
                        }
                    }}>Update</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ClassDetails;