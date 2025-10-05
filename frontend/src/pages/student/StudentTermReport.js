import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getStudentTermReport } from '../../redux/studentRelated/studentHandle';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    FormControl,
    Select,
    MenuItem,
    Grid,
    Alert,
    IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const StudentTermReport = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { studentTermReport, loading, error } = useSelector((state) => state.student);

    const [selectedTerm, setSelectedTerm] = useState('TERM_1');

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getStudentTermReport(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const handleTermChange = (event) => {
        setSelectedTerm(event.target.value);
    };

    const handleDownloadPDF = () => {
        const report = studentTermReport?.[selectedTerm];
        if (!report || report.subjects.length === 0) {
            return; // Don't download if there's no data
        }

        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text(`Term Report - ${selectedTerm.replace('_', ' ')}`, 14, 22);

        // Student Info
        doc.setFontSize(12);
        doc.text(`Student: ${currentUser.name}`, 14, 32);
        doc.text(`Class: ${currentUser.sclassName.sclassName}`, 14, 38);

        // Summary
        const summaryText = `Total Marks: ${report.totalMarks}   |   Average: ${report.average.toFixed(2)}%   |   Class Rank: ${report.rank}`;
        doc.setFontSize(10);
        doc.text(summaryText, 14, 50);

        // Table
        const tableColumn = ["Subject", "Marks Obtained", "Grade"];
        const tableRows = [];

        report.subjects.forEach(subject => {
            const subjectData = [
                subject.subName,
                subject.marksObtained,
                subject.grade || '-',
            ];
            tableRows.push(subjectData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            headStyles: { fillColor: [25, 118, 210] }, // MUI primary color
        });

        doc.save(`Term_Report_${currentUser.name}_${selectedTerm}.pdf`);
    };

    const renderReportDetails = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Alert severity="error" sx={{ m: 2 }}>
                    Error fetching report: {error}
                </Alert>
            );
        }

        const report = studentTermReport?.[selectedTerm];

        if (!report || report.subjects.length === 0) {
            return (
                <Typography sx={{ p: 2, textAlign: 'center' }}>
                    No marks available for {selectedTerm.replace('_', ' ')}.
                </Typography>
            );
        }

        return (
            <>
                <Grid container spacing={2} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px', mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="h6">Total Marks</Typography>
                        <Typography>{report.totalMarks}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="h6">Average</Typography>
                        <Typography>{report.average.toFixed(2)}%</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="h6">Class Rank</Typography>
                        <Typography>{report.rank}</Typography>
                    </Grid>
                </Grid>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white' }}>Subject</TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>Marks</TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>Grade</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {report.subjects.map((subject, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {subject.subName}
                                    </TableCell>
                                    <TableCell align="right">{subject.marksObtained}</TableCell>
                                    <TableCell align="right">{subject.grade || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1">
                        Term Report
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl variant="outlined" size="small">
                            <Select
                                value={selectedTerm}
                                onChange={handleTermChange}
                            >
                                <MenuItem value="TERM_1">Term 1</MenuItem>
                                <MenuItem value="TERM_2">Term 2</MenuItem>
                                <MenuItem value="TERM_3">Term 3</MenuItem>
                            </Select>
                        </FormControl>
                        <IconButton onClick={handleDownloadPDF} color="primary"
                            disabled={loading || !studentTermReport?.[selectedTerm]?.subjects.length > 0}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Box>
                </Box>
                {renderReportDetails()}
            </Paper>
        </Container>
    );
};

export default StudentTermReport;