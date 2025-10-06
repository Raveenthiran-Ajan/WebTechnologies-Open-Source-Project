import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid, Chip, Paper, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from '@mui/material';

const AddTeacher = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subjectID = params.subjectID || params.id
  const sectionNamesParam = params.sectionNames || params.sectionName
  const sectionNames = sectionNamesParam ? sectionNamesParam.split(',').filter(s => s.trim()) : []
  console.log('AddTeacher params:', params);
  console.log('Parsed sectionNames:', sectionNames);

  const { status, response, error } = useSelector(state => state.user);
  const { subjectDetails } = useSelector((state) => state.sclass);

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
  }, [dispatch, subjectID]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAttendanceSections, setSelectedAttendanceSections] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  const role = "Teacher"
  const school = subjectDetails && subjectDetails.school
  const teachSubject = subjectDetails && subjectDetails._id
  const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id;

  const fields = { name, email, password, role, school, teachSubject, teachSclass, teachSections: sectionNames, attendanceSections: selectedAttendanceSections }
  console.log('Submitting teacher data:', fields);

  const submitHandler = (event) => {
    event.preventDefault()
    setLoader(true)
    dispatch(registerUser(fields, role))
  }

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl())
      navigate("/Admin/teachers")
    }
    else if (status === 'failed') {
      setMessage(response)
      setShowPopup(true)
      setLoader(false)
    }
    else if (status === 'error') {
      setMessage("Network Error")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', border: '2px solid', borderColor: 'primary.main' }}>
        <Typography variant="h5" component="h1" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
          Add New Teacher
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Subject: ${subjectDetails?.subName || 'Loading...'}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Class: ${subjectDetails?.sclassName?.sclassName || 'Loading...'}`} 
            color="secondary" 
            variant="outlined" 
          />
          {sectionNames.length > 0 && (
            <Chip 
              label={`Sections: ${sectionNames.join(', ')}`} 
              color="info" 
              variant="outlined" 
            />
          )}
        </Box>
        <form onSubmit={submitHandler}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teacher's Name"
                variant="outlined"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teacher's Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Attendance Sections (Optional)</InputLabel>
                <Select
                  multiple
                  value={selectedAttendanceSections}
                  onChange={(event) => setSelectedAttendanceSections(event.target.value)}
                  input={<OutlinedInput label="Attendance Sections (Optional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {sectionNames.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Select which sections this teacher is responsible for taking attendance. 
                  Leave empty if not responsible for attendance.
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" disabled={loader}>
                {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Teacher'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  )
}

export default AddTeacher