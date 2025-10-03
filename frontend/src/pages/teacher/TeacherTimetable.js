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
  Button,
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
        if (!currentUser || !currentUser.teachSclass) return;
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${currentUser.teachSclass._id}`);
        const data = await response.json();
        console.log("Fetched timetable data:", data);
        if (Array.isArray(data)) {
          // Convert array to object
          const timetableObj = {};
          data.forEach(entry => {
            if (!timetableObj[entry.day]) timetableObj[entry.day] = {};
            timetableObj[entry.day][entry.period] = entry;
          });
          console.log("Processed timetable object:", timetableObj);
          setTimetable(timetableObj);
        }
      } catch (error) {
        console.error("Failed to fetch timetable", error);
      }
    }
    fetchTimetable();
  }, [currentUser]);

  // Get teacher's ID
  const teacherId = currentUser?._id;

  const isTeacherSlot = (slotTeacherId) => {
    if (!slotTeacherId) return false;
    return slotTeacherId === teacherId;
  };

  const downloadTimetable = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time," + daysOfWeek.join(",") + "\n";

    periods.forEach(period => {
      let row = timeSlots[period - 1];
      daysOfWeek.forEach(day => {
        const subject = timetable[day]?.[period]?.subject || "";
        row += "," + subject;
      });
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teacher_timetable.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  {daysOfWeek.map(day => {
                    const subject = timetable[day]?.[period];
                    return (
                      <TableCell
                        key={`${day}-${period}`}
                        sx={{
                          backgroundColor: isTeacherSlot(timetable[day]?.[period]?.teacher) ? 'rgba(241, 234, 97, 0.7)' : 'inherit',
                          fontWeight: isTeacherSlot(timetable[day]?.[period]?.teacher) ? 'bold' : 'normal',
                        }}
                      >
                        {subject?.subject || ''}
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
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={downloadTimetable}>
          Download Timetable
        </Button>
      </Box>
    </Box>
  );
};

export default TeacherTimetable;
