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

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable = ({ classID }) => {
  const dispatch = useDispatch();

  const [timetable, setTimetable] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${classID}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          if (data.length === 0) {
            // Initialize with default empty timetable
            const defaultTimetable = [];
            for (let day = 0; day < 7; day++) {
              for (let period = 1; period <= 8; period++) {
                defaultTimetable.push({ day: daysOfWeek[day], period, subject: '' });
              }
            }
            setTimetable(defaultTimetable);
          } else {
            setTimetable(data);
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

  // New effect to initialize timetable when entering edit mode if empty
  useEffect(() => {
    if (editMode && timetable.length === 0) {
      const defaultTimetable = [];
      for (let day = 0; day < 7; day++) {
        for (let period = 1; period <= 8; period++) {
          defaultTimetable.push({ day: daysOfWeek[day], period, subject: '' });
        }
      }
      setTimetable(defaultTimetable);
    }
  }, [editMode, timetable.length]);

  const handleSubjectChange = (index, value) => {
    const newTimetable = [...timetable];
    newTimetable[index] = { ...newTimetable[index], subject: value };
    setTimetable(newTimetable);
  };

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    try {
      console.log('Saving timetable:', timetable);
      const response = await fetch(`http://localhost:5000/Sclass/Timetable/${classID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetable }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Save response data:', data);
      setTimetable(data);
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
              <TableCell>Day</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Subject</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timetable.map((entry, index) => (
              <TableRow key={`${entry.day}-${entry.period}`}>
                <TableCell>{entry.day}</TableCell>
                <TableCell>{entry.period}</TableCell>
                <TableCell>
                  {editMode ? (
                    <TextField
                      value={entry.subject}
                      onChange={(e) => handleSubjectChange(index, e.target.value)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    entry.subject
                  )}
                </TableCell>
              </TableRow>
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
    </Box>
  );
};

export default Timetable;
