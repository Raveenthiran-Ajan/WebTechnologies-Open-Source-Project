import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
    IconButton,
    InputLabel
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ParentTermReport = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { studentTermReport, loading, error } = useSelector((state) => state.student);

    const [selectedChild, setSelectedChild] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('TERM_1');

    useEffect(() => {
        if (selectedChild) {
            dispatch(getStudentTermReport(selectedChild));
        }
    }, [dispatch, selectedChild]);

    const handleChildChange = (event) => {
        setSelectedChild(event.target.value);
    };

    const handleTermChange = (event) => {
        setSelectedTerm(event.target.value);
    };

    const handleDownloadPDF = () => {
        const report = studentTermReport?.[selectedTerm];
        const child = currentUser.children.find(c => c._id === selectedChild);
        if (!report || report.subjects.length === 0 || !child) {
            return; // Don't download if there's no data
        }

        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        const termMap = {
            'TERM_1': t('parentTermReport.term1'),
            'TERM_2': t('parentTermReport.term2'),
            'TERM_3': t('parentTermReport.term3')
        };
        const termName = termMap[selectedTerm] || selectedTerm.replace('TERM_', 'Term ');
        doc.text(`${t('parentTermReport.pdfTitle', { term: termName })}`, 14, 22);

        // Student Info
        doc.setFontSize(12);
        doc.text(`${t('parentTermReport.pdfStudent')} ${child.name}`, 14, 32);
        doc.text(`${t('parentTermReport.pdfClass')} ${child.sclassName.sclassName}`, 14, 38);

        // Summary
        const summaryText = `${t('parentTermReport.pdfTotalMarks')} ${report.totalMarks}   |   ${t('parentTermReport.pdfAverage')} ${report.average.toFixed(2)}%   |   ${t('parentTermReport.pdfClassRank')} ${report.rank}`;
        doc.setFontSize(10);
        doc.text(summaryText, 14, 50);

        // Table
        const tableColumn = [t('parentTermReport.pdfSubject'), t('parentTermReport.pdfMarksObtained'), t('parentTermReport.pdfGrade')];
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

        doc.save(`Term_Report_${child.name}_${selectedTerm}.pdf`);
    };

    const renderReportDetails = () => {
        if (!selectedChild) {
            return <Typography sx={{ p: 2, textAlign: 'center' }}>{t('parentTermReport.pleaseSelectChild')}</Typography>;
        }

        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return <Alert severity="error" sx={{ m: 2 }}>{t('parentTermReport.errorFetchingReport', { error })}</Alert>;
        }

        const report = studentTermReport?.[selectedTerm];

        if (!report || report.subjects.length === 0) {
            const termMap = {
                'TERM_1': t('parentTermReport.term1'),
                'TERM_2': t('parentTermReport.term2'),
                'TERM_3': t('parentTermReport.term3')
            };
            const termName = termMap[selectedTerm] || selectedTerm.replace('TERM_', 'Term ');
            return <Typography sx={{ p: 2, textAlign: 'center' }}>{t('parentTermReport.noMarksAvailable', { term: termName })}</Typography>;
        }

        return (
            <>
                <Grid container spacing={2} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px', mb: 2 }}>
                    <Grid item xs={6} sm={3}><Typography variant="h6">{t('parentTermReport.totalMarks')}</Typography><Typography>{report.totalMarks}</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography variant="h6">{t('parentTermReport.average')}</Typography><Typography>{report.average.toFixed(2)}%</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography variant="h6">{t('parentTermReport.classRank')}</Typography><Typography>{report.rank}</Typography></Grid>
                </Grid>

                <TableContainer>
                    <Table>
                        <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}><TableCell sx={{ color: 'white' }}>{t('parentTermReport.subject')}</TableCell><TableCell align="right" sx={{ color: 'white' }}>{t('parentTermReport.marks')}</TableCell><TableCell align="right" sx={{ color: 'white' }}>{t('parentTermReport.grade')}</TableCell></TableRow></TableHead>
                        <TableBody>
                            {report.subjects.map((subject, index) => (
                                <TableRow key={index}><TableCell component="th" scope="row">{subject.subName}</TableCell><TableCell align="right">{subject.marksObtained}</TableCell><TableCell align="right">{subject.grade || '-'}</TableCell></TableRow>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" component="h1">{t('parentTermReport.termReport')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>{t('parentTermReport.selectChild')}</InputLabel>
                            <Select value={selectedChild} onChange={handleChildChange} label={t('parentTermReport.selectChild')}>
                                {currentUser.children.map((child) => (
                                    <MenuItem key={child._id} value={child._id}>{child.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small">
                            <InputLabel>{t('parentTermReport.term')}</InputLabel>
                            <Select value={selectedTerm} onChange={handleTermChange} label={t('parentTermReport.term')}>
                                <MenuItem value="TERM_1">{t('parentTermReport.term1')}</MenuItem>
                                <MenuItem value="TERM_2">{t('parentTermReport.term2')}</MenuItem>
                                <MenuItem value="TERM_3">{t('parentTermReport.term3')}</MenuItem>
                            </Select>
                        </FormControl>
                        <IconButton onClick={handleDownloadPDF} color="primary" disabled={loading || !studentTermReport?.[selectedTerm]?.subjects.length > 0}>
                            <DownloadIcon />
                        </IconButton>
                    </Box>
                </Box>
                {renderReportDetails()}
            </Paper>
        </Container>
    );
};

export default ParentTermReport;