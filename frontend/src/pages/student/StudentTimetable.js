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
  Button
} from "@mui/material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AppTable = ({ title, columns, rows, renderRow, actions }) => (
  <Box sx={{ p: { xs: 1, sm: 3 }, background: "#f4f8fb", minHeight: "100vh" }}>
    <Typography
      variant="h4"
      gutterBottom
      sx={{
        fontWeight: 700,
        color: "#1976d2",
        letterSpacing: "0.04em",
        mb: 3
      }}
    >
      {title}
    </Typography>
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 0,
        boxShadow: "0 8px 32px 0 rgba(25, 118, 210, 0.12)",
        overflowX: "auto",
        background: "#fff",
        border: "1.5px solid #e3f2fd"
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1976d2" }}>
            {columns.map((col, i) => (
              <TableCell
                key={col}
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em",
                  textAlign: "center"
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(renderRow)}
        </TableBody>
      </Table>
    </TableContainer>
    {actions && (
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        {actions}
      </Box>
    )}
  </Box>
);

// Theme-matching subject colors
const subjectColors = {
  Maths: "#1976d2",
  Science: "#1565c0",
  English: "#2196f3",
  History: "#42a5f5",
  Geography: "#90caf9",
  Sinhala: "#0288d1",
  PE: "#00bcd4",
  Art: "#64b5f6",
  Music: "#b3e5fc",
  Default: "#e3f2fd"
};

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

const getSubjectColor = (subject) => "inherit"; // No color highlighting

const StudentTimetable = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${currentUser.sclassName._id}`);
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
    if (currentUser && currentUser.sclassName) {
      fetchTimetable();
    }
  }, [currentUser]);

  const downloadTimetable = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Student Timetable', 14, 22);
    const tableColumn = ['Time', ...daysOfWeek];
    const tableRows = [];

    periods.forEach(period => {
      const row = [timeSlots[period - 1]];
      daysOfWeek.forEach(day => {
        const subject = timetable[day]?.[period] || "";
        row.push(subject);
      });
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save('student_timetable.pdf');
  };

  return (
    <AppTable
      title="My Class Timetable"
      columns={["Time", ...daysOfWeek]}
      rows={periods}
      renderRow={(period, idx) => (
        <React.Fragment key={period}>
          <TableRow
            sx={{
              backgroundColor: idx % 2 === 0 ? "#f7fafd" : "#f0f4f8",
              "&:hover": { backgroundColor: "#e3f2fd" },
              transition: "background 0.3s"
            }}
          >
            <TableCell
              sx={{
                fontWeight: "bold",
                backgroundColor: "#e3f2fd",
                position: "sticky",
                left: 0,
                zIndex: 1,
                letterSpacing: "0.08em",
                borderRight: "2px solid #e3f2fd"
              }}
            >
              {timeSlots[period - 1]}
            </TableCell>
            {daysOfWeek.map((day, dayIdx) => {
              const subject = timetable?.[day]?.[period]?.subject || timetable?.[day]?.[period] || "";
              return (
                <TableCell
                  key={`${day}-${period}`}
                  sx={{
                    backgroundColor: "inherit",
                    color: "#1976d2",
                    fontWeight: 600,
                    borderRadius: 0,
                    textAlign: "center",
                    fontSize: "1.08rem",
                    letterSpacing: "0.10em",
                    boxShadow: "none",
                    cursor: "default",
                    transition: "background 0.3s, transform 0.2s",
                    borderRight: dayIdx !== daysOfWeek.length - 1 ? "2px solid #90caf9" : "none" // blue vertical lines
                  }}
                >
                  {subject}
                </TableCell>
              );
            })}
          </TableRow>
          {period === 4 && (
            <TableRow key="interval">
              <TableCell
                colSpan={daysOfWeek.length + 1}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#90caf9", // light blue shade
                  fontStyle: "italic",
                  textAlign: "center",
                  letterSpacing: "0.12em",
                  fontSize: "1.1rem",
                  borderRadius: 0,
                  color: "#1565c0"
                }}
              >
                Interval (10:30 - 10:45)
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      )}
      actions={(
        <Button
          variant="contained"
          color="primary"
          onClick={downloadTimetable}
          sx={{
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.10)"
          }}
        >
          Download Timetable
        </Button>
      )}
    />
  );
};

export default StudentTimetable;
