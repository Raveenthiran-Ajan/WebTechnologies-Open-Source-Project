import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container
} from "@mui/material";

const periods = [1, 2, 3, 4, 5, 6, 7, 8];
const timeSlots = ['7:50-8:30', '8:30-9:10', '9:10-9:50', '9:50-10:30', '10:45-11:25', '11:25-12:05', '12:05-12:45', '12:45-1:25'];

const ParentTimetable = () => {
  const { t } = useTranslation();
  const daysOfWeek = [t('parentTimetable.monday'), t('parentTimetable.tuesday'), t('parentTimetable.wednesday'), t('parentTimetable.thursday'), t('parentTimetable.friday')];
  const { currentUser } = useSelector((state) => state.user);
  const [timetable, setTimetable] = useState({});
  const [selectedChild, setSelectedChild] = useState('');

  const selectedChildDetails = currentUser.children.find(child => child._id === selectedChild);

  useEffect(() => {
    async function fetchTimetable() {
      if (!selectedChildDetails) return;
      try {
        const response = await fetch(`http://localhost:5000/Sclass/Timetable/${selectedChildDetails.sclassName._id}`);
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
    fetchTimetable();
  }, [selectedChildDetails]);

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
    link.setAttribute("download", `timetable_${selectedChildDetails.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>{t('parentTimetable.title')}</Typography>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>{t('parentTimetable.selectChild')}</InputLabel>
          <Select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} label="Select Child">
            {currentUser.children.map(child => (
              <MenuItem key={child._id} value={child._id}>{child.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {selectedChild ? (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table aria-label="timetable table" sx={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', backgroundColor: 'cornflowerblue', color: 'white', fontWeight: 'bold', width: '120px' }}>{t('parentTimetable.time')}</TableCell>
                  {daysOfWeek.map(day => (<TableCell key={day} sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', backgroundColor: 'cornflowerblue', color: 'white', fontWeight: 'bold' }}>{day}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.map(period => (
                  <React.Fragment key={period}>
                    <TableRow hover>
                      <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', fontWeight: 'bold', backgroundColor: 'cornflowerblue', color: 'white', width: '120px' }}>{timeSlots[period - 1]}</TableCell>
                      {daysOfWeek.map(day => {
                        const subject = timetable[day]?.[period] || '';
                        return (<Tooltip key={`${day}-${period}`} title={subject} arrow><TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', cursor: 'default' }}>{subject}</TableCell></Tooltip>);
                      })}
                    </TableRow>
                    {period === 4 && (<TableRow key="interval" sx={{ backgroundColor: '#e0e0e0', height: '20px' }}><TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)', fontStyle: 'italic', width: '120px' }}>{t('parentTimetable.interval')}</TableCell>{daysOfWeek.map(day => (<TableCell key={`interval-${day}`} sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)' }}></TableCell>))}</TableRow>)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: 'right' }}><Button variant="contained" onClick={downloadTimetable}>{t('parentTimetable.downloadTimetable')}</Button></Box>
        </>
      ) : (
        <Typography sx={{ mt: 4, textAlign: 'center' }}>{t('parentTimetable.selectChildMessage')}</Typography>
      )}
    </Container>
  );
};

export default ParentTimetable;