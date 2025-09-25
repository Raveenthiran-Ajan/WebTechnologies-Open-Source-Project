import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
} from "@mui/material";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StudentTimetable = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${currentUser.sclassName._id}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTimetable(data);
        }
      } catch (error) {
        console.error("Failed to fetch timetable", error);
      }
    }
    if (currentUser && currentUser.sclassName) {
      fetchTimetable();
    }
  }, [currentUser]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Class Timetable
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
                <TableCell>{entry.subject}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentTimetable;
