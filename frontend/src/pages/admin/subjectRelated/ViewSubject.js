import React, { useEffect, useState } from 'react'
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tab, Container, Typography, Button, CircularProgress } from '@mui/material';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';



const ViewSubject = () => {
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);

  const { classID, subjectID } = params

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) {
    console.log(error)
  }

  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };



  const studentColumns = [
    { field: 'rollNum', headerName: 'Roll No.', width: 150 },
    { field: 'name', headerName: 'Student Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/Admin/students/student/" + params.row.id)}
        >
          View
        </Button>
      ),
    },
  ];

  const studentRows = sclassStudents.map((student) => ({
    id: student._id,
    rollNum: student.rollNum,
    name: student.name,
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
          Add Students
        </Button>
      </GridToolbarContainer>
    );
  }

  const SubjectStudentsSection = () => {
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
              color="primary"
              onClick={() => navigate("/Admin/class/addstudents/" + classID)}
            >
              Add Students
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid 
                rows={studentRows || []} 
                columns={studentColumns} 
                components={{ Toolbar: StudentsToolbar }}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
              >
                Add More Students
              </Button>
            </Box>
          </>
        )}
      </Box>
    )
  }

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Subject Details
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Subject Information
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Subject Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {subjectDetails?.subName}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Subject Code
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {subjectDetails?.subCode}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Periods Per Week
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {subjectDetails?.periodsPerWeek}
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
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Class Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {subjectDetails?.sclassName?.sclassName}
              </Typography>
            </Box>
            
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Teacher Name
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {subjectDetails?.teacher?.name || 'Not Assigned'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Actions Section */}
                          <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom color="text.secondary">
                              Actions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                              {subjectDetails && subjectDetails.teacher ? (
                                <>
                                  <Button variant="outlined" 
                                    onClick={() => navigate(`/Admin/subjects/select-teacher/${subjectDetails._id}`)}>
                                    Change Teacher
                                  </Button>
                                  <Button variant="outlined" 
                                    onClick={() => navigate("/Admin/teachers/add")}>
                                    Add New Teacher
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="contained" color="primary"
                                    onClick={() => navigate(`/Admin/subjects/select-teacher/${subjectDetails._id}`)}>
                                    Select Teacher
                                  </Button>
                                  <Button variant="outlined"
                                    onClick={() => navigate("/Admin/teachers/add")}>
                                    Add New Teacher
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="contained" 
                                color="secondary"
                                onClick={() => navigate(`/Admin/subjects/edit/${subjectDetails?._id}`)}
                              >
                                Edit Subject
                              </Button>
                              <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    );
                  }

  return (
    <>
      {subloading ?
        <CircularProgress />
        :
        <>
          <Box sx={{ width: '100%', typography: 'body1', }} >
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                  <Tab label="Details" value="1" />
                  <Tab label="Students" value="2" />
                </TabList>
              </Box>
              <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                <TabPanel value="1">
                  <SubjectDetailsSection />
                </TabPanel>
                <TabPanel value="2">
                  <SubjectStudentsSection />
                </TabPanel>
              </Container>
            </TabContext>
          </Box>
        </>
      }
    </>
  )
}

export default ViewSubject