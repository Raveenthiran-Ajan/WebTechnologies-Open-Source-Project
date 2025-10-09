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
  Tooltip,
  Alert as MuiAlert,
} from "@mui/material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [timetable, setTimetable] = useState(() => {
    const obj = {};
    daysOfWeek.forEach(day => {
      obj[day] = {};
      periods.forEach(period => {
        obj[day][period] = { subjectId: '', teacherId: '', subjectName: '', teacherName: '' };
      });
    });
    return obj;
  });
  const [editMode, setEditMode] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedTeachers, setSelectedTeachers] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState({});

  // Validation states
  const [slotStatus, setSlotStatus] = useState({}); // key: day-period, value: 'empty'|'saved'|'warning'|'invalid'|'exceeded'
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [exceedingSubjects, setExceedingSubjects] = useState(new Set());

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${classID}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          // Always initialize with all days and periods
          const timetableObj = {};
          const newSelectedSubjects = {};
          const newSelectedTeachers = {};
          daysOfWeek.forEach(day => {
            timetableObj[day] = {};
            periods.forEach(period => {
              timetableObj[day][period] = { subjectId: '', teacherId: '', subjectName: '', teacherName: '' };
            });
          });
          // Fill in with fetched data
          data.forEach(entry => {
            if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
            timetableObj[entry.day][entry.period] = {
              subjectId: entry.subjectId || '',
              teacherId: entry.teacher ? entry.teacher._id : '',
              subjectName: entry.subject || '',
              teacherName: entry.teacher ? entry.teacher.name : ''
            };
            if (entry.subjectId) {
              newSelectedSubjects[`${entry.day}-${entry.period}`] = entry.subjectId;
            }
            if (entry.teacher) {
              newSelectedTeachers[`${entry.day}-${entry.period}`] = entry.teacher._id;
            }
          });
          setTimetable(timetableObj);
          setSelectedSubjects(newSelectedSubjects);
          setSelectedTeachers(newSelectedTeachers);
          // Initialize slotStatus as saved for loaded slots
          const initialStatus = {};
          Object.entries(timetableObj).forEach(([day, periodsObj]) => {
            Object.entries(periodsObj).forEach(([period, slot]) => {
              const key = `${day}-${period}`;
              if (slot.subjectId && slot.teacherId) {
                initialStatus[key] = 'saved';
              } else {
                initialStatus[key] = 'empty';
              }
            });
          });
          setSlotStatus(initialStatus);
          setValidationErrors([]);
          setIsSaveDisabled(false);
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
      const response = await fetch(`http://localhost:5000/ClassSubjects/${classID}`);
      const data = await response.json();
      setAvailableSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch available subjects", error);
      setAvailableSubjects([]);
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
      setAvailableTeachers(prev => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error("Failed to fetch available teachers", error);
      setAvailableTeachers(prev => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingTeachers(prev => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    if (editMode && classID) {
      fetchAvailableSubjects();
    }
  }, [editMode, classID]);

  useEffect(() => {
    if (editMode && Object.keys(selectedSubjects).length > 0) {
      Object.entries(selectedSubjects).forEach(([key, subjectId]) => {
        if (subjectId && !availableTeachers[key]) {
          const [day, period] = key.split('-');
          fetchAvailableTeachers(subjectId, day, period);
        }
      });
    }
  }, [editMode, selectedSubjects]);

  const validateTimetable = (currentTimetable, currentSelectedSubjects, currentSelectedTeachers) => {
    const errors = [];
    const slotMap = {};
    const newSlotStatus = {};
    const newExceedingSubjects = new Set();

    Object.entries(currentTimetable).forEach(([day, periodsObj]) => {
      Object.entries(periodsObj).forEach(([period, slot]) => {
        const key = `${day}-${period}`;
        if (slot.subjectId) {
          // Check overlapping
          const slotKey = `${day}-${period}`;
          if (slotMap[slotKey]) {
            errors.push(`Overlapping subjects in ${day} period ${period}`);
            newSlotStatus[key] = 'invalid';
          } else {
            slotMap[slotKey] = true;
            if (slot.teacherId) {
              newSlotStatus[key] = 'saved';
            } else {
              newSlotStatus[key] = 'warning';
            }
          }
        } else {
          newSlotStatus[key] = 'empty';
        }
      });
    });

    // Check subject period limits
    const subjectCount = {};
    Object.entries(currentTimetable).forEach(([day, periodsObj]) => {
      Object.entries(periodsObj).forEach(([period, slot]) => {
        if (slot.subjectId) {
          subjectCount[slot.subjectId] = (subjectCount[slot.subjectId] || 0) + 1;
        }
      });
    });

    availableSubjects.forEach(subject => {
      if (subject.periodsPerWeek && subjectCount[subject._id] > subject.periodsPerWeek) {
        errors.push(`You have assigned more than the allowed number of periods for ${subject.subName} this week. Please adjust the timetable before saving.`);
        newExceedingSubjects.add(subject._id);
      }
    });

    // Update slotStatus for exceeding subjects
    Object.entries(currentTimetable).forEach(([day, periodsObj]) => {
      Object.entries(periodsObj).forEach(([period, slot]) => {
        const key = `${day}-${period}`;
        if (slot.subjectId && newExceedingSubjects.has(slot.subjectId)) {
          newSlotStatus[key] = 'exceeded';
        }
      });
    });

    setSlotStatus(newSlotStatus);
    setValidationErrors(errors);
    setIsSaveDisabled(errors.length > 0);
    setExceedingSubjects(newExceedingSubjects);
  };

  const handleSubjectChange = (day, period, subjectId) => {
    const key = `${day}-${period}`;
    setSelectedSubjects(prev => ({ ...prev, [key]: subjectId }));
    setSelectedTeachers(prev => ({ ...prev, [key]: '' })); // Clear teacher
    setAvailableTeachers(prev => ({ ...prev, [key]: [] })); // Clear teachers

    if (subjectId) {
      fetchAvailableTeachers(subjectId, day, period);
    }

    // Update timetable with subjectId and name
    const selectedSubject = Array.isArray(availableSubjects) ? availableSubjects.find(s => s._id === subjectId) : null;
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

    // Update slot status and validate
    setSlotStatus(prev => ({ ...prev, [key]: subjectId ? 'warning' : 'empty' }));
    validateTimetable({ ...timetable, [day]: { ...timetable[day], [period]: { ...timetable[day][period], subjectId } } }, { ...selectedSubjects, [key]: subjectId }, { ...selectedTeachers, [key]: '' });
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

    // Update slot status and validate
    setSlotStatus(prev => ({ ...prev, [key]: teacherId ? 'saved' : 'warning' }));
    validateTimetable(timetable, selectedSubjects, { ...selectedTeachers, [key]: teacherId });
  };

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const downloadTimetable = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Class Timetable', 14, 22);
    const tableColumn = ['Time', ...daysOfWeek];
    const tableRows = [];

    periods.forEach(period => {
      const row = [timeSlots[period - 1]];
      daysOfWeek.forEach(day => {
        const slot = timetable[day]?.[period];
        const subject = slot?.subjectName && slot?.teacherName
          ? `${slot.subjectName}\n${slot.teacherName}`
          : slot?.subjectName || slot?.teacherName || "";
        row.push(subject);
      });
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save('class_timetable.pdf');
  };

  const handleSave = async () => {
    try {
      // Clear subject if teacher is not selected
      const cleanedTimetable = { ...timetable };
      const cleanedSelectedSubjects = { ...selectedSubjects };
      const cleanedSelectedTeachers = { ...selectedTeachers };
      Object.entries(cleanedTimetable).forEach(([day, periodsObj]) => {
        Object.entries(periodsObj).forEach(([period, slot]) => {
          if (slot.subjectId && !slot.teacherId) {
            cleanedTimetable[day][period] = {
              subjectId: '',
              teacherId: '',
              subjectName: '',
              teacherName: ''
            };
            const key = `${day}-${period}`;
            delete cleanedSelectedSubjects[key];
            delete cleanedSelectedTeachers[key];
          }
        });
      });
      setSelectedSubjects(cleanedSelectedSubjects);
      setSelectedTeachers(cleanedSelectedTeachers);

      // Convert object to array
      const timetableArray = [];
      Object.entries(cleanedTimetable).forEach(([day, periodsObj]) => {
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
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Save response data:', data);
      // Convert back to object
      const timetableObj = {};
      data.timetable.forEach(entry => {
        if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
        timetableObj[entry.day][entry.period] = {
          subjectId: entry.subjectId || '',
          teacherId: entry.teacher ? entry.teacher._id : '',
          subjectName: entry.subject || '',
          teacherName: entry.teacher ? entry.teacher.name : ''
        };
      });
      setTimetable(timetableObj);
      setEditMode(false);
      setAlert({ open: true, message: 'Timetable saved successfully', severity: 'success' });
    } catch (error) {
      console.error("Failed to update timetable", error);
      setAlert({ open: true, message: error.message || 'Failed to save timetable', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Class Timetable
      </Typography>
      {editMode && (
        <MuiAlert severity="info" sx={{ mb: 2 }}>
          Editing Mode: Make changes and save to update the timetable. Ensure no overlapping subjects and assign teachers.
        </MuiAlert>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="timetable table" stickyHeader>
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
                  {daysOfWeek.map(day => {
                    const key = `${day}-${period}`;
                    const status = slotStatus[key] || 'empty';
                    const tooltipTitle = status === 'saved' ? 'Saved' : status === 'warning' ? 'Subject selected, teacher not assigned' : status === 'invalid' ? 'Invalid: overlapping or limit exceeded' : status === 'exceeded' ? 'Subject exceeds weekly period limit' : 'Empty';
                    const bgColor = status === 'saved' ? '#d4edda' : status === 'warning' ? '#fff3cd' : status === 'invalid' ? '#f8d7da' : status === 'exceeded' ? '#ffe6e6' : '#ffffff';
                    return (
                      <TableCell
                        key={key}
                        sx={{
                          backgroundColor: bgColor,
                          '&:hover': { backgroundColor: '#e0e0e0' }
                        }}
                      >
                        <Tooltip title={tooltipTitle}>
                          <Box>
                            {editMode ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormControl size="small" fullWidth>
                                  <InputLabel>Subject</InputLabel>
                                  <Select
                                    value={selectedSubjects[key] || ''}
                                    onChange={(e) => handleSubjectChange(day, period, e.target.value)}
                                    label="Subject"
                                  >
                                    <MenuItem value="">
                                      <em>None</em>
                                    </MenuItem>
                                    {Array.isArray(availableSubjects) ? availableSubjects.map((subject) => (
                                      <MenuItem key={subject._id} value={subject._id}>
                                        {subject.subName}
                                      </MenuItem>
                                    )) : null}
                                  </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                  <InputLabel>Teacher</InputLabel>
                                  <Select
                                    value={selectedTeachers[key] || ''}
                                    onChange={(e) => handleTeacherChange(day, period, e.target.value)}
                                    label="Teacher"
                                    disabled={!selectedSubjects[key] || loadingTeachers[key]}
                                  >
                                    <MenuItem value="">
                                      <em>None</em>
                                    </MenuItem>
                                    {Array.isArray(availableTeachers[key]) ? availableTeachers[key].map((teacher) => (
                                      <MenuItem key={teacher._id} value={teacher._id}>
                                        {teacher.name}
                                      </MenuItem>
                                    )) : null}
                                  </Select>
                                </FormControl>
                              </Box>
                            ) : (
                              timetable[day]?.[period]?.subjectName && timetable[day]?.[period]?.teacherName ? (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{timetable[day][period].subjectName}</Typography>
                                  <Typography variant="body2">{timetable[day][period].teacherName}</Typography>
                                </Box>
                              ) : (
                                timetable[day]?.[period]?.subjectName || timetable[day]?.[period]?.teacherName || ''
                              )
                            )}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
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
      {editMode && isSaveDisabled && validationErrors.some(error => error.includes('periods for')) && (
        <MuiAlert severity="warning" sx={{ mt: 2, mb: 1 }}>
          ⚠️ Saving is disabled because one or more subjects exceed their allowed number of periods per week. Please adjust them to continue.
        </MuiAlert>
      )}
      <Box sx={{ mt: 2 }}>
        {editMode ? (
          <>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaveDisabled} sx={{ mr: 1 }}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mr: 1 }}>
              Edit Timetable
            </Button>
            <Button variant="outlined" onClick={downloadTimetable}>
              Download Timetable
            </Button>
          </>
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
