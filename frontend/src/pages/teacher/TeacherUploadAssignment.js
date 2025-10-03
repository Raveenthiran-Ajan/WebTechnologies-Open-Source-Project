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
} from "@mui/material";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [gradeFilterRange, setGradeFilterRange] = useState(null);
  const [showOnlyUngraded, setShowOnlyUngraded] = useState(false);

  // Remove sortByGrade state usage and handle sorting by grade via order/orderBy states only

  // New states for table sorting and pagination
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    }
  }, [currentUser]);

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
  }, [selectedStudentId, submissions, showOnlyUngraded, gradeFilterRange]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !subject || !dueDate) {
      setAlert({
        open: true,
        message: "Please fill in all required fields (title, subject, deadline).",
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
    formData.append("classId", currentUser.teachSclass._id);
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

  function handleSaveMarking(submissionId) {
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
  }

  // Debounced auto-save for grade and feedback changes
  const debounceRef = useRef({});
  const debouncedSave = useCallback((submissionId) => {
    if (debounceRef.current[submissionId]) {
      clearTimeout(debounceRef.current[submissionId]);
    }
    debounceRef.current[submissionId] = setTimeout(() => {
      handleSaveMarking(submissionId);
    }, 1000); // 1 second delay
  }, []);

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

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "#f9f9f9", minHeight: "100vh", pb: 4 }}>
      {/* Upload Assignment */}
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, boxShadow: 4, mb: 5, borderRadius: 3 }}>
        <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
          Upload Assignment
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField label="Title" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                fullWidth
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Deadline Date and Time"
                type="datetime-local"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  border: "2px dashed #1976d2",
                  borderRadius: 3,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: file ? "#e3f2fd" : "transparent",
                  transition: "background-color 0.3s ease",
                  "&:hover": { bgcolor: "#bbdefb" },
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
                    Drag & drop a file here, or click to select file (Max 5MB)
                  </Typography>
                )}
              </Box>
              {errors.file && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.file}
                </Typography>
              )}
            </Grid>
            <Grid item xs={6}>
              <Button
                type="reset"
                variant="outlined"
                color="secondary"
                fullWidth
                disabled={uploading}
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setSubject("");
                  setDueDate("");
                  setFile(null);
                }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Student Submissions */}
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, boxShadow: 4, borderRadius: 3 }}>
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
              {assignments.map((assignment) => (
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

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button variant={showOnlyUngraded ? 'contained' : 'outlined'} onClick={() => setShowOnlyUngraded(!showOnlyUngraded)}>
                Show only ungraded
              </Button>
            <Button
              variant={orderBy === 'grade' ? 'contained' : 'outlined'}
              onClick={() => {
                if (orderBy === 'grade') {
                  setOrder(order === 'asc' ? 'desc' : 'asc');
                } else {
                  setOrderBy('grade');
                  setOrder('desc');
                }
              }}
            >
              Sort by grade
            </Button>
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
