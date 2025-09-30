import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getTimetable, updateTimetable } from "../../../redux/sclassRelated/sclassHandle";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];
const timeSlots = [
  '7:50 - 8:30',
  '8:30 - 9:10',
  '9:10 - 9:50',
  '9:50 - 10:30',
  '10:45 - 11:25',
  '11:25 - 12:05',
  '12:05 - 12:45',
  '12:45 - 1:25'
];

const Timetable = ({ classID }) => {
  const dispatch = useDispatch();

  const [timetable, setTimetable] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedTeachers, setSelectedTeachers] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState({});

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${classID}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          if (data.length === 0) {
            // Initialize with default empty timetable
            const defaultTimetable = {};
            daysOfWeek.forEach(day => {
              defaultTimetable[day] = {};
              periods.forEach(period => {
                defaultTimetable[day][period] = { subjectId: '', teacherId: '', subjectName: '', teacherName: '' };
              });
            });
            setTimetable(defaultTimetable);
          } else {
            // Convert array to object
            const timetableObj = {};
            const newSelectedSubjects = {};
            const newSelectedTeachers = {};
            data.forEach(entry => {
              if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
              timetableObj[entry.day][entry.period] = {
                subjectId: entry.subjectId || '',
                teacherId: entry.teacher || '',
                subjectName: entry.subject || '',
                teacherName: '' // Will populate if needed
              };
              if (entry.subjectId) {
                newSelectedSubjects[`${entry.day}-${entry.period}`] = entry.subjectId;
              }
              if (entry.teacher) {
                newSelectedTeachers[`${entry.day}-${entry.period}`] = entry.teacher;
              }
            });
            setTimetable(timetableObj);
            setSelectedSubjects(newSelectedSubjects);
            setSelectedTeachers(newSelectedTeachers);
          }
        }
      } catch (error) {
        console.error("Failed to fetch timetable", error);
      }
    }
    if (classID) {
      fetchTimetable();
    }
  }, [classID]);

  const fetchAvailableSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await fetch(`http://localhost:5000/Sclass/AvailableSubjects/${classID}`);
      const data = await response.json();
      setAvailableSubjects(data);
    } catch (error) {
      console.error("Failed to fetch available subjects", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchAvailableTeachers = async (subjectId, day, period) => {
    const key = `${day}-${period}`;
    setLoadingTeachers(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`http://localhost:5000/Sclass/AvailableTeachers/${classID}/${subjectId}/${day}/${period}`);
      const data = await response.json();
      setAvailableTeachers(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      console.error("Failed to fetch available teachers", error);
    } finally {
      setLoadingTeachers(prev => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    if (editMode && classID) {
      fetchAvailableSubjects();
    }
  }, [editMode, classID]);

  const handleSubjectChange = (day, period, subjectId) => {
    const key = `${day}-${period}`;
    setSelectedSubjects(prev => ({ ...prev, [key]: subjectId }));
    setSelectedTeachers(prev => ({ ...prev, [key]: '' })); // Clear teacher
    setAvailableTeachers(prev => ({ ...prev, [key]: [] })); // Clear teachers

    if (subjectId) {
      fetchAvailableTeachers(subjectId, day, period);
    }

    // Update timetable with subjectId and name
    const selectedSubject = availableSubjects.find(s => s._id === subjectId);
    setTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day][period],
          subjectId,
          subjectName: selectedSubject ? selectedSubject.subName : '',
          teacherId: '',
          teacherName: ''
        }
      }
    }));
  };

  const handleTeacherChange = (day, period, teacherId) => {
    const key = `${day}-${period}`;
    setSelectedTeachers(prev => ({ ...prev, [key]: teacherId }));

    // Update timetable with teacherId and name
    const teachersForSlot = availableTeachers[key] || [];
    const selectedTeacher = teachersForSlot.find(t => t._id === teacherId);
    setTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day][period],
          teacherId,
          teacherName: selectedTeacher ? selectedTeacher.name : ''
        }
      }
    }));
  };

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    try {
      // Convert object to array
      const timetableArray = [];
      Object.entries(timetable).forEach(([day, periodsObj]) => {
        Object.entries(periodsObj).forEach(([period, slot]) => {
          if (slot.subjectId && slot.teacherId) {
            timetableArray.push({
              day,
              period: parseInt(period),
              subject: slot.subjectName,
              subjectId: slot.subjectId,
              teacher: slot.teacherId
            });
          }
        });
      });
      console.log('Saving timetable:', timetableArray);
      const response = await fetch(`http://localhost:5000/Sclass/Timetable/${classID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetable: timetableArray }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Save response data:', data);
      // Convert back to object
      const timetableObj = {};
      data.forEach(entry => {
        if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
        timetableObj[entry.day][entry.period] = {
          subjectId: entry.subjectId || '',
          teacherId: entry.teacher || '',
          subjectName: entry.subject || '',
          teacherName: '' // Will populate if needed
        };
      });
      setTimetable(timetableObj);
      setEditMode(false);
      setAlert({ open: true, message: 'Timetable saved successfully', severity: 'success' });
    } catch (error) {
      console.error("Failed to update timetable", error);
      setAlert({ open: true, message: 'Failed to save timetable', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Class Timetable
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="timetable table">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {daysOfWeek.map(day => (
                <TableCell key={day}>{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.map(period => (
              <React.Fragment key={period}>
                <TableRow>
                  <TableCell>{timeSlots[period - 1]}</TableCell>
                  {daysOfWeek.map(day => (
                    <TableCell key={`${day}-${period}`}>
                      {editMode ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Subject</InputLabel>
                            <Select
                              value={selectedSubjects[`${day}-${period}`] || ''}
                              onChange={(e) => handleSubjectChange(day, period, e.target.value)}
                              label="Subject"
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {availableSubjects.map((subject) => (
                                <MenuItem key={subject._id} value={subject._id}>
                                  {subject.subName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Teacher</InputLabel>
                            <Select
                              value={selectedTeachers[`${day}-${period}`] || ''}
                              onChange={(e) => handleTeacherChange(day, period, e.target.value)}
                              label="Teacher"
                              disabled={!selectedSubjects[`${day}-${period}`] || loadingTeachers[`${day}-${period}`]}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {Array.isArray(availableTeachers[`${day}-${period}`]) ? availableTeachers[`${day}-${period}`].map((teacher) => (
                                <MenuItem key={teacher._id} value={teacher._id}>
                                  {teacher.name}
                                </MenuItem>
                              )) : null}
                            </Select>
                          </FormControl>
                        </Box>
                      ) : (
                        timetable[day]?.[period]?.subjectName && timetable[day]?.[period]?.teacherName
                          ? `${timetable[day][period].subjectName} (${timetable[day][period].teacherName})`
                          : timetable[day]?.[period]?.subjectName || ''
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {period === 4 && (
                  <TableRow key="interval">
                    <TableCell>Interval (10:30 - 10:45)</TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell key={`interval-${day}`}></TableCell>
                    ))}
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        {editMode ? (
          <>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 1 }}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit Timetable
          </Button>
        )}
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Timetable;
