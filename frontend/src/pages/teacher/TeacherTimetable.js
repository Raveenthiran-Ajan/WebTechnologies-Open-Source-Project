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

const TeacherTimetable = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${currentUser.teachSclass._id}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          // Convert array to object
          const timetableObj = {};
          data.forEach(entry => {
            if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
            timetableObj[entry.day][entry.period] = entry.subject;
          });
          setTimetable(timetableObj);
        }
      } catch (error) {
        console.error("Failed to fetch timetable", error);
      }
    }
    if (currentUser && currentUser.teachSclass) {
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
                      {timetable[day]?.[period] || ''}
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
    </Box>
  );
};

export default TeacherTimetable;
