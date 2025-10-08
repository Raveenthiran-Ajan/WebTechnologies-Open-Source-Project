import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button
} from "@mui/material";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];
const timeSlots = [
  '7:50 - 8:30 am',
  '8:30 - 9:10 am',
  '9:10 - 9:50 am',
  '9:50 - 10:30 am',
  '10:45 - 11:25 am',
  '11:25 - 12:05 pm',
  '12:05 - 12:45 pm',
  '12:45 - 1:25 pm'
];

const AdminTimetable = () => {
  const { classId } = useParams();
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${classId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
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
    if (classId) fetchTimetable();
  }, [classId]);

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
    link.setAttribute("download", "admin_timetable.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, background: "#f4f8fb", minHeight: "100vh" }}>
      {/* Heading removed per request */}
      {/* Read-only timetable removed per request */}
    </Box>
  );
};

export default AdminTimetable;