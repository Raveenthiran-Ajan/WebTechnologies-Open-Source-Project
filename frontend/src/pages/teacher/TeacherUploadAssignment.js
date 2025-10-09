import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Link,
  Autocomplete,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Stack, // added to fix 'Stack' is not defined
  MenuItem,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../config";
import GradeDistributionChart from "../../components/GradeDistributionChart";

const validateFile = (file) => {
  if (!file) return false;
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

const TeacherUploadAssignment = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // eslint-disable-line no-unused-vars
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [gradeFilterRange, setGradeFilterRange] = useState(null);
  const [showOnlyUngraded, setShowOnlyUngraded] = useState(false);

  // Simplified class selection - just the classes the teacher is assigned to
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);

  // Subjects assigned to the teacher
  const [teacherSubjects, setTeacherSubjects] = useState([]);

  // New state for selected class filter
  const [selectedClassId, setSelectedClassId] = useState("");

  // Remove sortByGrade state usage and handle sorting by grade via order/orderBy states only

  // New states for table sorting and pagination
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Stepper states
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Assignment Details', 'Class, Subject & Deadline', 'File Upload'];

  // Manage Uploaded Assignments states
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSelectedClassIds, setEditSelectedClassIds] = useState([]);
  const [editFile, setEditFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDueDate, setExtendDueDate] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [showViewSubmissions, setShowViewSubmissions] = useState(false);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [classSubmissions, setClassSubmissions] = useState([]);
  const [loadingClassSubmissions, setLoadingClassSubmissions] = useState(false);



  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      axios
        .get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`)
        .then((res) => {
          setAssignments(res.data);
          if (res.data.length > 0) {
            setSelectedAssignmentId(res.data[0]._id);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch assignments", err);
        });

      // Fetch teacher's classes
      axios
        .get(`${API_BASE_URL}/Sclass/TeacherClasses/${currentUser._id}`)
        .then((res) => {
          console.log("Teacher classes fetched:", res.data);
          setTeacherClasses(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch teacher classes", err);
        });

      // Note: Teacher subjects fetching moved to separate useEffect for upload form filter
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedClassIds.length > 0 && currentUser && currentUser._id) {
      console.log("Selected class IDs:", selectedClassIds);
      // Fetch subjects for all selected classes
      Promise.all(
        selectedClassIds.map((classId) =>
          axios.get(`${API_BASE_URL}/assignments/teacher-subjects/${currentUser._id}/${classId}`)
            .then(res => res.data)
            .catch(err => {
              console.error(`Failed to fetch teacher subjects for class ${classId}`, err);
              return [];
            })
        )
      ).then(results => {
        // Flatten and deduplicate subjects by _id
        const allSubjects = results.flat();
        const uniqueSubjectsMap = {};
        allSubjects.forEach(subj => {
          if (subj && subj._id && !uniqueSubjectsMap[subj._id]) {
            uniqueSubjectsMap[subj._id] = subj;
          }
        });
        const uniqueSubjects = Object.values(uniqueSubjectsMap);
        console.log("Combined unique teacher subjects:", uniqueSubjects);
        setTeacherSubjects(uniqueSubjects);
      });
    } else {
      setTeacherSubjects([]);
    }
  }, [selectedClassIds, currentUser]);

  // Clear subject when selected classes change
  useEffect(() => {
    setSubject("");
  }, [selectedClassIds]);

  useEffect(() => {
    if (currentUser && currentUser.teachSclass && currentUser.teachSclass._id) {
      axios
        .get(`${API_BASE_URL}/Sclass/Students/${currentUser.teachSclass._id}`)
        .then((res) => {
          setStudents(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch students", err);
        });
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedAssignmentId) {
      setLoadingSubmissions(true);
      axios
        .get(`${API_BASE_URL}/submissions/assignment/${selectedAssignmentId}`)
        .then((res) => {
          setSubmissions(res.data);
          setLoadingSubmissions(false);
        })
        .catch((err) => {
          console.error("Failed to fetch submissions", err);
          setLoadingSubmissions(false);
        });
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignmentId]);

  // Apply filters, search, and sorting to submissions
  useEffect(() => {
    let filtered = submissions;

    if (selectedStudentId) {
      filtered = filtered.filter((submission) => submission.studentId?._id === selectedStudentId);
    }

    // Filter by selected class
    if (selectedClassId) {
      filtered = filtered.filter((submission) => {
        const sclass = submission.studentId?.sclassName;
        if (!sclass) return false;
        if (typeof sclass === 'object' && sclass._id) return String(sclass._id) === String(selectedClassId);
        return String(sclass) === String(selectedClassId);
      });
    }

    if (showOnlyUngraded) {
      filtered = filtered.filter((submission) => !submission.grade);
    }

    if (gradeFilterRange) {
      filtered = filtered.filter((submission) => {
        const grade = Number(submission.grade);
        return !isNaN(grade) && grade >= gradeFilterRange[0] && grade <= gradeFilterRange[1];
      });
    }

    setFilteredSubmissions(filtered);
  }, [selectedStudentId, submissions, showOnlyUngraded, gradeFilterRange, selectedClassId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate: at least one class must be selected
    const hasSelection = Array.isArray(selectedClassIds) && selectedClassIds.length > 0;

    if (!title || !subject || !dueDate || !hasSelection) {
      setAlert({
        open: true,
        message: "Please fill in all required fields (title, subject, deadline, and at least one class).",
        severity: "error",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("dueDate", dueDate);
    formData.append("teacherId", currentUser._id);
    formData.append("assignments", JSON.stringify(selectedClassIds.map(classId => ({ classId }))));
    if (file) {
      formData.append("file", file);
    }

    axios
      .post(`${API_BASE_URL}/assignments/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      })
      .then((res) => {
        setAlert({
          open: true,
          message: "Assignment uploaded successfully!",
          severity: "success",
        });
        setTitle("");
        setDescription("");
        setSubject("");
        setDueDate("");
        setFile(null);
        setErrors({});
        setUploading(false);
        setUploadProgress(0);
        setSelectedClassIds([]);
        setActiveStep(0);
        return axios.get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`);
      })
      .then((res) => {
        setAssignments(res.data);
        if (res.data.length > 0) {
          setSelectedAssignmentId(res.data[0]._id);
        }
      })
      .catch((err) => {
        setAlert({
          open: true,
          message: (err.response && err.response.data.error) || "Failed to upload assignment.",
          severity: "error",
        });
        setUploading(false);
        setUploadProgress(0);
      });
  };

  function downloadText(text, filename) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename + "_answer.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleSaveMarking = useCallback((submissionId) => {
    const submission = submissions.find((sub) => sub._id === submissionId);
    if (!submission) return;

    axios
      .put(`${API_BASE_URL}/submissions/${submissionId}/marking`, {
        grade: submission.grade,
        feedback: submission.feedback,
      })
      .then(() => {
        setAlert({
          open: true,
          message: "Marking saved successfully",
          severity: "success",
        });
      })
      .catch(() => {
        setAlert({
          open: true,
          message: "Failed to save marking",
          severity: "error",
        });
      });
  }, [submissions]);

  // Debounced auto-save for grade and feedback changes
  const debounceRef = useRef({});
  const debouncedSave = useCallback((submissionId) => {
    if (debounceRef.current[submissionId]) {
      clearTimeout(debounceRef.current[submissionId]);
    }
    debounceRef.current[submissionId] = setTimeout(() => {
      handleSaveMarking(submissionId);
    }, 1000); // 1 second delay
  }, [handleSaveMarking]);

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Comparator for sorting
  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === 'name') {
      const aName = a.studentId?.name || '';
      const bName = b.studentId?.name || '';
      if (bName < aName) return -1;
      if (bName > aName) return 1;
      return 0;
    }
    if (orderBy === 'date') {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    }
    if (orderBy === 'grade') {
      const aGrade = Number(a.grade) || 0;
      const bGrade = Number(b.grade) || 0;
      return bGrade - aGrade;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const handleNext = (e) => {
    e.preventDefault(); // Prevents accidental submit
    // Validation before moving to next step
    if (activeStep === 0) {
      if (!title.trim()) {
        setAlert({
          open: true,
          message: "Please fill in the required field: Title.",
          severity: "error",
        });
        return;
      }
    } else if (activeStep === 1) {
      if (selectedClassIds.length === 0 || !subject.trim() || !dueDate) {
        setAlert({
          open: true,
          message: "Please select at least one class, choose a subject, and set a deadline date.",
          severity: "error",
        });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>Assignment Details</Typography>
            <Paper sx={{ p: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontWeight: 600, color: '#333', mb: 1, display: 'block' }}>Title</Typography>
                  <TextField fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontWeight: 600, color: '#333', mb: 1, display: 'block' }}>Description</Typography>
                  <TextField fullWidth multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>Class, Subject & Deadline</Typography>
            <Paper sx={{ p: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 600, color: '#333', mb: 1, display: 'block' }}>Select Class(es):</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#f9f9f9', maxHeight: '300px', overflowY: 'auto' }}>
                    {Array.isArray(teacherClasses) && teacherClasses.length > 0 ? (
                      teacherClasses.filter(cls => cls && cls._id).map((cls) => (
                        <label key={cls._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #eee' }}>
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(cls._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClassIds(prev => [...prev, cls._id]);
                              } else {
                                setSelectedClassIds(prev => prev.filter(id => id !== cls._id));
                              }
                            }}
                          />
                          <span style={{ fontWeight: '500' }}>Class {cls.sclassName}</span>
                        </label>
                      ))
                    ) : (
                      <Typography color="textSecondary" fontStyle="italic">
                        No classes available to select.
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 600, color: '#333', mb: 1, display: 'block' }}>Subject</Typography>
                <TextField
                  fullWidth
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter Subject"
                />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 600, color: '#333', mb: 1, display: 'block' }}>Deadline Date & Time (Required)</Typography>
                  <TextField
                    type="datetime-local"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>File Upload</Typography>
            <Paper sx={{ p: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
              <Box
                sx={{
                  border: "2px dashed #1976d2",
                  borderRadius: 4,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: file ? "#e3f2fd" : "#f0f7ff",
                  transition: "background-color 0.3s ease",
                  "&:hover": { bgcolor: "#bbdefb" },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
                onClick={() => document.getElementById("fileInput").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFile = e.dataTransfer.files[0];
                    if (validateFile(droppedFile)) {
                      setFile(droppedFile);
                      setErrors((prev) => ({ ...prev, file: null }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        file: "Invalid file type or size. Allowed: pdf, doc, docx, txt, jpg, jpeg, png. Max 5MB.",
                      }));
                    }
                    e.dataTransfer.clearData();
                  }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (validateFile(selectedFile)) {
                      setFile(selectedFile);
                      setErrors((prev) => ({ ...prev, file: null }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        file: "Invalid file type or size. Allowed: pdf, doc, docx, txt, jpg, jpeg, png. Max 5MB.",
                      }));
                    }
                  }}
                />
                {file ? (
                  <Typography fontWeight="medium" color="primary">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</Typography>
                ) : (
                  <Typography color="textSecondary" fontStyle="italic">
                    Drag & drop a file here, or click to select file
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary">
                  Accepted formats: PDF, DOCX, TXT, JPG, PNG (Max 5MB)
                </Typography>
              </Box>
              {errors.file && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.file}
                </Typography>
              )}
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  }

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated and sorted submissions
  const sortedSubmissions = filteredSubmissions.slice().sort(getComparator(order, orderBy));
  const paginatedSubmissions = sortedSubmissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Manage Assignments functions
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setEditTitle(assignment.title);
    setEditDescription(assignment.description);
    setEditSubject(assignment.subject);
    setEditDueDate(new Date(assignment.dueDate).toISOString().slice(0, 16));
    const classIds = Array.isArray(assignment.assignments)
      ? assignment.assignments.map((a) => 
          (a.classId && typeof a.classId === 'object' && a.classId._id)
            ? a.classId._id.toString()
            : a.classId?.toString?.() || String(a.classId)
        )
      : [];
    setEditSelectedClassIds(classIds);
    setEditFile(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const hasSelection = Array.isArray(editSelectedClassIds) && editSelectedClassIds.length > 0;

    if (!editTitle || !editSubject || !editDueDate || !hasSelection) {
      setAlert({
        open: true,
        message: "Please fill in all required fields (title, subject, deadline, and at least one class).",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    formData.append("subject", editSubject);
    formData.append("dueDate", editDueDate);
    formData.append("assignments", JSON.stringify(editSelectedClassIds.map(classId => ({ classId }))));
    if (editFile) {
      formData.append("file", editFile);
    }

    try {
      await axios.put(`${API_BASE_URL}/assignments/${editingAssignment._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAlert({
        open: true,
        message: "Assignment updated successfully!",
        severity: "success",
      });

      // Refresh assignments
      const res = await axios.get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`);
      setAssignments(res.data);

      setShowEditModal(false);
      setEditingAssignment(null);
    } catch (err) {
      setAlert({
        open: true,
        message: (err.response && err.response.data.error) || "Failed to update assignment.",
        severity: "error",
      });
    }
  };

  const handleExtendDeadline = (assignment) => {
    setEditingAssignment(assignment);
    setExtendDueDate(new Date(assignment.dueDate).toISOString().slice(0, 16));
    setShowExtendModal(true);
  };

  const handleSaveExtendDeadline = async () => {
    if (!extendDueDate) {
      setAlert({
        open: true,
        message: "Please select a new deadline.",
        severity: "error",
      });
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/assignments/${editingAssignment._id}/extend`, {
        dueDate: extendDueDate,
      });

      setAlert({
        open: true,
        message: "Deadline extended successfully!",
        severity: "success",
      });

      // Refresh assignments
      const res = await axios.get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`);
      setAssignments(res.data);

      setShowExtendModal(false);
      setEditingAssignment(null);
    } catch (err) {
      setAlert({
        open: true,
        message: (err.response && err.response.data.error) || "Failed to extend deadline.",
        severity: "error",
      });
    }
  };

  const handleDeleteAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/assignments/${assignmentToDelete._id}`);

      setAlert({
        open: true,
        message: "Assignment deleted successfully!",
        severity: "success",
      });

      // Refresh assignments
      const res = await axios.get(`${API_BASE_URL}/assignments/teacher/${currentUser._id}`);
      setAssignments(res.data);

      // If the deleted assignment was selected, reset selection
      if (selectedAssignmentId === assignmentToDelete._id) {
        setSelectedAssignmentId(res.data.length > 0 ? res.data[0]._id : "");
      }

      setShowDeleteDialog(false);
      setAssignmentToDelete(null);
    } catch (err) {
      setAlert({
        open: true,
        message: (err.response && err.response.data.error) || "Failed to delete assignment.",
        severity: "error",
      });
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setViewAssignment(assignment);
    setLoadingClassSubmissions(true);
    setShowViewSubmissions(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/submissions/assignment/${assignment._id}`);
      setClassSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch class submissions", err);
      setClassSubmissions([]);
    } finally {
      setLoadingClassSubmissions(false);
    }
  };

  const getStatusChip = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (dueDate < now) {
      return <Chip label="Expired" color="error" size="small" />;
    } else if (dueDate - now < 24 * 60 * 60 * 1000) { // Less than 24 hours
      return <Chip label="Due Soon" color="warning" size="small" />;
    } else {
      return <Chip label="Active" color="success" size="small" />;
    }
  };

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "#f9f9f9", minHeight: "100vh", pb: 4 }}>
      {/* Upload Assignment */}
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, boxShadow: 4, mb: 5, borderRadius: 3 }}>
        <Typography variant="h5" mb={3} fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon /> Upload Assignment
        </Typography>
        <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {uploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />}
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              type="button"
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                sx={{ borderColor: 'red', color: 'red', '&:hover': { borderColor: 'darkred', color: 'darkred' } }}
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setSubject("");
                  setDueDate("");
                  setFile(null);
                  setSelectedClassIds([]);
                  setActiveStep(0);
                }}
              >
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" color="primary" disabled={uploading} sx={{ fontWeight: 'bold' }}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              ) : (
                <Button type="button" variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Student Submissions */}
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, boxShadow: 4, borderRadius: 3, mt: 4 }}>
        <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
          View Student Submissions
        </Typography>

        {assignments.length > 0 ? (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
              Select Assignment
            </Typography>
            <TextField
              select
              label="Select Assignment"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              SelectProps={{ native: true }}
              fullWidth
              sx={{ mb: 3 }}
            >
              {Array.isArray(assignments) && assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title}
                </option>
              ))}
            </TextField>

            <Autocomplete
              options={students}
              getOptionLabel={(option) => option.name || ""}
              value={students.find((s) => s._id === selectedStudentId) || null}
              onChange={(event, newValue) => {
                setSelectedStudentId(newValue ? newValue._id : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search students"
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon />,
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              clearOnEscape
              disableClearable={false}
            />

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* unified filter button styles */}
              <Button
                onClick={() => setShowOnlyUngraded(!showOnlyUngraded)}
                variant={showOnlyUngraded ? 'contained' : 'outlined'}
                sx={{ minWidth: 160, height: 40, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Show only ungraded
              </Button>

              <Button
                onClick={() => {
                  if (orderBy === 'grade') {
                    setOrderBy('name');
                    setOrder('asc');
                  } else {
                    setOrderBy('grade');
                    setOrder('desc');
                  }
                }}
                variant={orderBy === 'grade' ? 'contained' : 'outlined'}
                sx={{ minWidth: 160, height: 40, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Sort by grade
              </Button>

              {/* Class Filter aligned with buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 220 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  Filter by Class
                </Typography>
              <TextField
                select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                SelectProps={{ native: true }}
                size="small"
                sx={{
                  minWidth: 180,
                  '& .MuiInputBase-root': { height: 40 },
                }}
              >
                <option value="">All Classes</option>
                {Array.isArray(teacherClasses) && teacherClasses.filter(cls => cls && cls._id).map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    Class {cls.sclassName}
                  </option>
                ))}
              </TextField>
              </Box>
               {gradeFilterRange && (
                 <Chip label={`Grade: ${gradeFilterRange[0]}-${gradeFilterRange[1]}`} onDelete={() => setGradeFilterRange(null)} />
               )}
             </Box>

            {loadingSubmissions ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
              </Box>
            ) : filteredSubmissions.length > 0 ? (
              <Box sx={{ width: "100%" }}>
                {/* Summary + Chart */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                  <Paper sx={{ flex: 1, p: 2, boxShadow: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Typography>Total Submissions: {filteredSubmissions.length}</Typography>
                    <Typography>
                      Graded: {filteredSubmissions.filter((s) => s.grade).length}
                    </Typography>
                    <Typography>
                      Ungraded: {filteredSubmissions.filter((s) => !s.grade).length}
                    </Typography>
                  </Paper>
                  <Paper sx={{ flex: 2, p: 2, boxShadow: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Grade Distribution
                    </Typography>
                    <GradeDistributionChart submissions={filteredSubmissions} onBarClick={(range) => setGradeFilterRange(range)} />
                  </Paper>
                </Box>

                {/* Submissions as Table */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'name'}
                            direction={orderBy === 'name' ? order : 'asc'}
                            onClick={() => handleRequestSort('name')}
                          >
                            Student Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'date'}
                            direction={orderBy === 'date' ? order : 'asc'}
                            onClick={() => handleRequestSort('date')}
                          >
                            Submission Date
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Feedback</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSubmissions.map((submission) => (
                        <TableRow key={submission._id}>
                          <TableCell>{submission.studentId?.name || "Unknown"}</TableCell>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <TextField
                              value={submission.grade || ""}
                              onChange={(e) => {
                                const newGrade = e.target.value;
                                setSubmissions((prev) =>
                                  prev.map((sub) =>
                                    sub._id === submission._id ? { ...sub, grade: newGrade } : sub
                                  )
                                );
                                debouncedSave(submission._id);
                              }}
                              type="number"
                              inputProps={{ min: 0, max: 100 }}
                              size="small"
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={submission.feedback || ""}
                              onChange={(e) => {
                                const newFeedback = e.target.value;
                                setSubmissions((prev) =>
                                  prev.map((sub) =>
                                    sub._id === submission._id ? { ...sub, feedback: newFeedback } : sub
                                  )
                                );
                                debouncedSave(submission._id);
                              }}
                              size="small"
                              multiline
                              rows={2}
                              sx={{ width: 200 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={submission.grade ? "Graded" : "Pending"}
                              color={submission.grade ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {submission.fileUrl ? (
                              <Link
                                href={`${API_BASE_URL}${submission.fileUrl}`}
                                target="_blank"
                                rel="noopener"
                                sx={{ textDecoration: "none", color: "primary.main" }}
                              >
                                View File
                              </Link>
                            ) : (
                              <IconButton
                                onClick={() =>
                                  downloadText(
                                    submission.answerText,
                                    submission.studentId?.name || "submission"
                                  )
                                }
                              >
                                <DownloadIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSubmissions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </Box>
            ) : (
              <Typography>No submissions found for this assignment.</Typography>
            )}
          </>
        ) : (
          <Typography>No assignments found. Please upload an assignment first.</Typography>
        )}
      </Paper>

      {/* Manage Uploaded Assignments */}
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, boxShadow: 4, borderRadius: 3, mt: 4, mb: 4 }}>
        <Typography variant="h5" mb={3} fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon /> Manage Uploaded Assignments
        </Typography>

        {assignments.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Classes</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment._id} hover sx={{ '& .MuiTableCell-root': { verticalAlign: 'middle' } }}>
                    {/* Title: left aligned for readability */}
                    <TableCell align="left" sx={{ px: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {assignment.title || 'Untitled'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {assignment.description ? `${String(assignment.description).slice(0, 80)}${assignment.description.length > 80 ? '…' : ''}` : assignment.subject || ''}
                      </Typography>
                    </TableCell>

                    {/* Subject: center */}
                    <TableCell align="center">
                      <Typography variant="body2">{assignment.subject || '—'}</Typography>
                    </TableCell>

                    {/* Classes: center (robust handling) */}
                    <TableCell align="center">
                      <Typography variant="body2">
                        {Array.isArray(assignment.assignments) && assignment.assignments.length > 0
                          ? assignment.assignments
                              .map((a) => {
                                if (!a || !a.classId) return null;
                                const classId = typeof a.classId === 'object' && a.classId !== null ? a.classId._id : a.classId;
                                if (!classId) return null;
                                const found = teacherClasses?.find((c) => String(c._id) === String(classId));
                                return found ? `Class ${found.sclassName ?? found.name ?? classId}` : `Class ${classId}`;
                              })
                              .filter(Boolean)
                              .join(', ')
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* Due Date: center */}
                    <TableCell align="center">
                      <Typography variant="body2">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : '—'}
                      </Typography>
                    </TableCell>

                    {/* Status: center */}
                    <TableCell align="center">
                      {getStatusChip(assignment)}
                    </TableCell>

                    {/* Actions: center */}
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton color="primary" onClick={() => handleEditAssignment(assignment)} title="Edit Assignment">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleExtendDeadline(assignment)} title="Extend Deadline">
                          <ScheduleIcon />
                        </IconButton>
                        <IconButton color="info" onClick={() => handleViewSubmissions(assignment)} title="View Submissions">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteAssignment(assignment)} title="Delete Assignment">
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No assignments uploaded yet.</Typography>
        )}
      </Paper>

      {/* Edit Assignment Modal */}
      {showEditModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setShowEditModal(false)}
        >
          <Paper
            sx={{ p: 4, width: '90%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" mb={3}>Edit Assignment</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="datetime-local"
                  fullWidth
                  label="Due Date"
                  InputLabelProps={{ shrink: true }}
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ mb: 1 }}>Select Classes:</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '200px', overflowY: 'auto' }}>
                  {Array.isArray(teacherClasses) && teacherClasses.length > 0 ? (
                    teacherClasses.filter(cls => cls && cls._id).map((cls) => (
                      <label key={cls._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #eee' }}>
                        <input
                          type="checkbox"
                          checked={editSelectedClassIds.includes(cls._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSelectedClassIds(prev => [...prev, cls._id]);
                            } else {
                              setEditSelectedClassIds(prev => prev.filter(id => id !== cls._id));
                            }
                          }}
                        />
                        <span style={{ fontWeight: '500' }}>Class {cls.sclassName}</span>
                      </label>
                    ))
                  ) : (
                    <Typography color="textSecondary" fontStyle="italic">
                      No classes available to select.
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => setEditFile(e.target.files[0])}
                  style={{ marginBottom: '8px' }}
                />
                <Typography variant="caption" color="textSecondary">
                  Optional: Upload a new file to replace the existing one
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="contained" onClick={handleSaveEdit}>
                Save Changes
              </Button>
              <Button variant="outlined" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Extend Deadline Modal */}
      {showExtendModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setShowExtendModal(false)}
        >
          <Paper
            sx={{ p: 4, width: '90%', maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" mb={3}>Extend Deadline</Typography>
            <TextField
              type="datetime-local"
              fullWidth
              label="New Due Date"
              InputLabelProps={{ shrink: true }}
              value={extendDueDate}
              onChange={(e) => setExtendDueDate(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleSaveExtendDeadline}>
                Extend Deadline
              </Button>
              <Button variant="outlined" onClick={() => setShowExtendModal(false)}>
                Cancel
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setShowDeleteDialog(false)}
        >
          <Paper
            sx={{ p: 4, width: '90%', maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" mb={2}>Confirm Delete</Typography>
            <Typography mb={3}>
              Are you sure you want to delete the assignment "{assignmentToDelete?.title}"? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="error" onClick={confirmDelete}>
                Delete
              </Button>
              <Button variant="outlined" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* View Submissions Modal */}
      {showViewSubmissions && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setShowViewSubmissions(false)}
        >
          <Paper
            sx={{ p: 4, width: '90%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" mb={3}>
              Submissions for "{viewAssignment?.title}"
            </Typography>
            {loadingClassSubmissions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : classSubmissions.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Submission Date</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classSubmissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell>{submission.studentId?.name || "Unknown"}</TableCell>
                        <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                        <TableCell>{submission.grade || "Not graded"}</TableCell>
                        <TableCell>
                          <Chip
                            label={submission.grade ? "Graded" : "Pending"}
                            color={submission.grade ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No submissions yet.</Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="outlined" onClick={() => setShowViewSubmissions(false)}>
                Close
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherUploadAssignment;
