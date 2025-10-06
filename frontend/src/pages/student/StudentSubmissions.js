import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import SubmitIcon from '@mui/icons-material/Send';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Example subject icons mapping (replace with actual icons or imports)
import ComputerIcon from '@mui/icons-material/Computer';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScienceIcon from '@mui/icons-material/Science';

const subjectIcons = {
  computer: <ComputerIcon />,
  graph: <ShowChartIcon />,
  dna: <ScienceIcon />,
};

const statusColors = {
  Pending: '#FACC15', // yellow
  Submitted: '#60A5FA', // blue
  Graded: '#4ADE80', // green
  Overdue: '#F87171', // red
};

const HeaderBar = styled(Box)(({ theme }) => ({
  backgroundColor: '#1976D2',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: '12px 12px 0 0',
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #ddd',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const Card = styled(Paper)(({ theme }) => ({
  backgroundColor: '#f9fafb',
  borderRadius: 12,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
  },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '200px',
}));

const StatusBadge = styled(Chip)(({ status }) => ({
  backgroundColor: statusColors[status] || '#ccc',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: 16,
  minWidth: 80,
  textTransform: 'capitalize',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 40,
  marginLeft: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
}));

const StudentSubmissions = ({
  assignments,
  submissions,
  onOpenSubmissionForm,
  onDownload,
  onViewSubmission,
  onEditSubmission,
  onDeleteSubmission,
}) => {

  // Filter and sort state
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('soonest');

  // Filter assignments based on filter state
  const filteredAssignments = useMemo(() => {
    if (filter === 'All') return assignments;
    if (filter === 'Pending') {
      return assignments.filter((a) => {
        const sub = submissions.find((s) => s.assignmentId._id === a._id);
        const now = new Date();
        const due = new Date(a.dueDate);
        return !sub && due >= now;
      });
    }
    if (filter === 'Submitted') {
      return assignments.filter((a) => {
        const sub = submissions.find((s) => s.assignmentId._id === a._id);
        return !!sub;
      });
    }
    if (filter === 'Graded') {
      return assignments.filter((a) => {
        const sub = submissions.find((s) => s.assignmentId._id === a._id);
        return sub && sub.graded;
      });
    }
    return assignments;
  }, [assignments, submissions, filter]);

  // Sort assignments based on sortBy state
  const sortedAssignments = useMemo(() => {
    const sorted = [...filteredAssignments];
    if (sortBy === 'soonest') {
      sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === 'latest') {
      sorted.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    }
    return sorted;
  }, [filteredAssignments, sortBy]);

  // Calculate time left string
  const calculateTimeLeft = (dueDate) => {
    if (!dueDate) return 'No due date';
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    if (diff <= 0) return 'Overdue';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Get status for assignment
  const getStatus = (assignment) => {
    const sub = submissions.find((s) => s.assignmentId._id === assignment._id);
    const now = new Date();
    const due = new Date(assignment.dueDate);
    if (due < now && !sub) return 'Overdue';
    if (sub && sub.graded) return 'Graded';
    if (sub) return 'Submitted';
    return 'Pending';
  };

  // Get subject icon based on assignment subject name or type
  const getSubjectIcon = (assignment) => {
    const subjectName = assignment.subjectName?.toLowerCase() || '';
    if (subjectName.includes('computer')) return subjectIcons.computer;
    if (subjectName.includes('graph')) return subjectIcons.graph;
    if (subjectName.includes('dna') || subjectName.includes('science')) return subjectIcons.dna;
    return <ComputerIcon />;
  };

  // Generate ICS content for calendar sync
  const generateICSContent = (assignments) => {
    const now = new Date();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//School Management System//Assignment Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    assignments.forEach((assignment, index) => {
      const dueDate = new Date(assignment.dueDate);
      const startDate = new Date(dueDate);
      startDate.setHours(9, 0, 0, 0); // Set to 9 AM
      const endDate = new Date(dueDate);
      endDate.setHours(10, 0, 0, 0); // Set to 10 AM

      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const uid = `assignment-${assignment._id}@school-system`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `DTSTAMP:${formatDate(now)}`,
        `SUMMARY:${assignment.title}`,
        `DESCRIPTION:Assignment: ${assignment.title}\\nSubject: ${assignment.subjectName || 'N/A'}\\nDue Date: ${dueDate.toLocaleDateString()}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  // Handle calendar sync
  const handleCalendarSync = () => {
    const icsContent = generateICSContent(filteredAssignments);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assignments.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <HeaderBar>Student Submissions</HeaderBar>
      <FilterBar>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="soonest">Soonest Due</MenuItem>
            <MenuItem value="latest">Latest Due</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, val) => {
            if (val !== null) setFilter(val);
          }}
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="Pending">Pending</ToggleButton>
          <ToggleButton value="Submitted">Submitted</ToggleButton>
          <ToggleButton value="Graded">Graded</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          onClick={handleCalendarSync}
          size="small"
        >
          Sync Calendar
        </Button>
      </FilterBar>

      {sortedAssignments.length === 0 ? (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          {filter === 'Graded' ? 'No assignments have been graded yet.' : filter === 'Submitted' ? 'No submissions have been made yet.' : '🎉 You’re all caught up! No pending assessments.'}
        </Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 2,
          }}
        >
          {sortedAssignments.map((assignment) => {
            const status = getStatus(assignment);
            const timeLeft = calculateTimeLeft(assignment.dueDate);
            const sub = submissions.find((s) => s.assignmentId._id === assignment._id);
            const isPastDeadline = new Date(assignment.dueDate) < new Date();
            return (
              <Card key={assignment._id}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 1, color: '#1976d2' }}>{getSubjectIcon(assignment)}</Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {assignment.title}
                    </Typography>
                    {assignment.subjectName && (
                      <Typography variant="body2" color="text.secondary">
                        {assignment.subjectName}
                      </Typography>
                    )}
                    {assignment.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                        {assignment.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title={status === 'Overdue' ? 'Assignment is overdue' : ''}>
                    <StatusBadge status={status} label={status} />
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Due
                    </Typography>
                    <Typography variant="body2">{new Date(assignment.dueDate).toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Time Left
                    </Typography>
                    <Typography variant="body2">{timeLeft}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ActionButton
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => onDownload(assignment)}
                    size="small"
                  >
                    Download
                  </ActionButton>
                  {!sub ? (
                    <ActionButton
                      variant="outlined"
                      startIcon={<SubmitIcon />}
                      onClick={() => onOpenSubmissionForm(assignment._id)}
                      size="small"
                      disabled={status === 'Overdue'}
                    >
                      Submit
                    </ActionButton>
                  ) : (
                    <>
                      <ActionButton
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => onViewSubmission(assignment._id)}
                        size="small"
                      >
                        View
                      </ActionButton>
                      {!isPastDeadline && (
                        <>
                          <ActionButton
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => onEditSubmission(assignment._id)}
                            size="small"
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => onDeleteSubmission(assignment._id)}
                            size="small"
                          >
                            Delete
                          </ActionButton>
                        </>
                      )}
                    </>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default StudentSubmissions;
