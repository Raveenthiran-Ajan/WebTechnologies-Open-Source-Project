import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getClassTeachers, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { resetSubjects } from '../../../redux/sclassRelated/sclassSlice';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Box, Container, Typography, Tab, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress
} from '@mui/material';
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
import PostAddIcon from '@mui/icons-material/PostAdd';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import Timetable from './Timetable';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassTeachers, sclassDetails, loading, error, response, getresponse, getTeachersResponse } = useSelector((state) => state.sclass);

    const classID = params.id

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
        dispatch(getClassTeachers(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = async (deleteID, address) => {
        let confirmMessage = '';
        let successMessage = '';
        
        if (address === 'Subject') {
            confirmMessage = 'Are you sure you want to delete this subject? This will remove all associated data including assignments, grades, and attendance records. This action cannot be undone.';
            successMessage = '📚 Subject has been successfully removed from the class';
        } else if (address === 'Student') {
            confirmMessage = 'Are you sure you want to remove this student from the class? This will remove their attendance, grades, and assignments for this class. This action cannot be undone.';
            successMessage = '👨‍🎓 Student has been successfully removed from the class';
        }
        
        const confirmDelete = window.confirm(confirmMessage);
        
        if (confirmDelete) {
            try {
                console.log('Deleting', address, 'with ID:', deleteID);
                await dispatch(deleteUser(deleteID, address));
                console.log(address, 'deleted successfully, refreshing data...');
                
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
                setMessage('❌ Unable to delete ' + address.toLowerCase() + ': ' + (error.message || 'Please try again or contact support'));
                setShowPopup(true);
            }
        }
    }

    const subjectColumns = [
        { field: 'name', headerName: 'Subject Name', width: 200 },
        { field: 'code', headerName: 'Subject Code', width: 150 },
        { field: 'sessions', headerName: 'Sessions', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton onClick={() => deleteHandler(params.row.id, "Subject")}>
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="contained" sx={{ ml: 1 }}
                            size="small"
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
        sessions: subject.sessions || 'N/A',
    })) : [];

    function SubjectsToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<PostAddIcon />}
                    onClick={() => navigate("/Admin/addsubject/" + classID)}
                >
                    Add Subject
                </Button>
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
                        <Button
                            variant="contained"
                            startIcon={<PostAddIcon />}
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Add Subjects
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid 
                            rows={subjectRows || []} 
                            columns={subjectColumns} 
                            components={{ Toolbar: SubjectsToolbar }}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 25]}
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
                            variant="contained" sx={{ ml: 1 }}
                            size="small"
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
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid 
                            rows={studentRows || []} 
                            columns={studentColumns} 
                            components={{ Toolbar: StudentsToolbar }}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </Box>
                )}
            </Box>
        )
    }

    const teacherColumns = [
        { field: 'name', headerName: 'Teacher Name', width: 180 },
        { field: 'subject', headerName: 'Subject', width: 150 },
        { field: 'email', headerName: 'Email', width: 180 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton onClick={() => deleteHandler(params.row.id, "Teacher")}>
                            <Delete color="error" />
                        </IconButton>
                        <Button
                            variant="contained" sx={{ ml: 1 }}
                            size="small"
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
        subject: teacher.teachSubject?.subName || 'N/A',
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
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid 
                            rows={teacherRows || []} 
                            columns={teacherColumns} 
                            components={{ Toolbar: TeachersToolbar }}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 25]}
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
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                        Class Details
                    </Typography>
                    
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
                            <Typography variant="h6" gutterBottom color="text.secondary">
                                Actions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                                {getresponse &&
                                    <Button
                                        variant="contained"
                                        color="success"
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
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => navigate(`/Admin/class/timetable/${classID}`)}
                                >
                                    View Timetable
                                </Button>
                                <Button variant="outlined" onClick={() => navigate(-1)}>
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
                            <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
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
        </>
    );
};

export default ClassDetails;