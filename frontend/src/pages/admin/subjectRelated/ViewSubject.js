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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
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

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <>
        <Typography variant="h4" align="center" gutterBottom>
          Subject Details
        </Typography>
        <Typography variant="h6" gutterBottom>
          Subject Name : {subjectDetails && subjectDetails.subName}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Subject Code : {subjectDetails && subjectDetails.subCode}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Subject Sessions : {subjectDetails && subjectDetails.sessions}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Number of Students: {numberOfStudents}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Class Name : {subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName.sclassName}
        </Typography>
        {subjectDetails && subjectDetails.teacher ?
          <Box>
            <Typography variant="h6" gutterBottom>
              Teacher Name : {subjectDetails.teacher.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="outlined" size="small"
                onClick={() => navigate(`/Admin/subjects/select-teacher/${subjectDetails._id}`)}>
                Change Teacher
              </Button>
              <Button variant="outlined" size="small"
                onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails._id)}>
                Add New Teacher
              </Button>
            </Box>
          </Box>
          :
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained"
              onClick={() => navigate(`/Admin/subjects/select-teacher/${subjectDetails._id}`)}>
              Select Teacher
            </Button>
            <Typography variant="body2" color="text.secondary">or</Typography>
            <Button variant="outlined"
              onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails._id)}>
              Add New Teacher
            </Button>
          </Box>
        }
      </>
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