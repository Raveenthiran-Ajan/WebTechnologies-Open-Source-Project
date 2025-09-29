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
                defaultTimetable[day][period] = '';
              });
            });
            setTimetable(defaultTimetable);
          } else {
            // Convert array to object
            const timetableObj = {};
            data.forEach(entry => {
              if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
              timetableObj[entry.day][entry.period] = entry.subject;
            });
            setTimetable(timetableObj);
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

  const handleSubjectChange = (day, period, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: value
      }
    }));
  };

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    try {
      // Convert object to array
      const timetableArray = [];
      Object.entries(timetable).forEach(([day, periodsObj]) => {
        Object.entries(periodsObj).forEach(([period, subject]) => {
          timetableArray.push({ day, period: parseInt(period), subject });
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
        timetableObj[entry.day][entry.period] = entry.subject;
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
                        <TextField
                          value={timetable[day]?.[period] || ''}
                          onChange={(e) => handleSubjectChange(day, period, e.target.value)}
                          size="small"
                          fullWidth
                        />
                      ) : (
                        timetable[day]?.[period] || ''
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
