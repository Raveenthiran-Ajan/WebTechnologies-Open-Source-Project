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
  Tooltip,
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

const StudentTimetable = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${currentUser.sclassName._id}`);
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
    if (currentUser && currentUser.sclassName) {
      fetchTimetable();
    }
  }, [currentUser]);

  const downloadTimetable = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time," + daysOfWeek.join(",") + "\n";

    periods.forEach(period => {
      let row = timeSlots[period - 1];
      daysOfWeek.forEach(day => {
        const subject = timetable[day]?.[period] || "";
        row += "," + subject;
      });
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_timetable.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Class Timetable
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table aria-label="timetable table" sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', backgroundColor: 'cornflowerblue', color: 'white', fontWeight: 'bold', width: '120px' }}>Time</TableCell>
              {daysOfWeek.map(day => (
                <TableCell key={day} sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', backgroundColor: 'cornflowerblue', color: 'white', fontWeight: 'bold' }}>{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.map(period => (
              <React.Fragment key={period}>
                <TableRow hover>
                  <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', fontWeight: 'bold', backgroundColor: 'cornflowerblue', color: 'white', width: '120px' }}>{timeSlots[period - 1]}</TableCell>
                  {daysOfWeek.map(day => {
                    const subject = timetable[day]?.[period] || '';
                    return (
                      <Tooltip key={`${day}-${period}`} title={subject} arrow>
                        <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', cursor: 'default' }}>
                          {subject}
                        </TableCell>
                      </Tooltip>
                    );
                  })}
                </TableRow>
                {period === 4 && (
                  <TableRow key="interval" sx={{ backgroundColor: '#e0e0e0', height: '20px' }}>
                    <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', fontStyle: 'italic', width: '120px' }}>Interval (10:30 - 10:45)</TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell key={`interval-${day}`} sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)' }}></TableCell>
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

export default StudentTimetable;
