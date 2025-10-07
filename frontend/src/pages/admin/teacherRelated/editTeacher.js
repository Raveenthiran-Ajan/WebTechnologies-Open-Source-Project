import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { getTeacherDetails, updateTeacherAttendance, updateTeacherBulkAssignments } from '../../../redux/teacherRelated/teacherHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import SearchIcon from '@mui/icons-material/Search';

// Small, scalable edit UI for many classes/subjects with disable rules
const EditTeacher = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { teacherDetails, loading: teacherLoading } = useSelector((s) => s.teacher);
  const { sclassesList, loading: classLoading } = useSelector((s) => s.sclass);
  const { currentUser } = useSelector((s) => s.user);

  const [subjectsByClass, setSubjectsByClass] = useState({});
  // Preselect keys for assignments already belonging to this teacher
  const [selectedKeys, setSelectedKeys] = useState(new Set()); // key: `${classId}-${subjectId}`
  const [attendanceClass, setAttendanceClass] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [classesWithTeachers, setClassesWithTeachers] = useState(new Set());
  const [minePairsFromBackend, setMinePairsFromBackend] = useState(new Set());
  const [othersPairsFromBackend, setOthersPairsFromBackend] = useState(new Set());

  // Load teacher + classes
  useEffect(() => {
    dispatch(getTeacherDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    const schoolIdFromTeacher = teacherDetails?.school && (typeof teacherDetails.school === 'object' ? teacherDetails.school._id : teacherDetails.school);
    const fallbackId = currentUser?._id;
    const schoolId = schoolIdFromTeacher || (currentUser?.role === 'Admin' ? fallbackId : null);
    if (schoolId) dispatch(getAllSclasses(schoolId, 'Sclass'));
  }, [dispatch, teacherDetails?.school, currentUser?._id, currentUser?.role]);

  // Preselect all assignments for this teacher when data loads
  useEffect(() => {
    // Only run when backend assignments or subjectsByClass change
    if (!subjectsByClass || !Object.keys(subjectsByClass).length) return;
    const preselected = new Set();
    Object.entries(subjectsByClass).forEach(([classId, subs]) => {
      subs.forEach((sub) => {
        const subTeacherId = sub && sub.teacher ? (typeof sub.teacher === 'object' ? sub.teacher._id : sub.teacher) : null;
        if (subTeacherId && subTeacherId === id) {
          preselected.add(`${classId}-${sub._id}`);
        }
      });
    });
    setSelectedKeys(preselected);
  }, [subjectsByClass, id]);
  useEffect(() => {
    if (teacherDetails?.attendanceClass) {
      setAttendanceClass(teacherDetails.attendanceClass._id || teacherDetails.attendanceClass);
    }
  }, [teacherDetails?.attendanceClass]);

  // Fetch all teachers to build: classesWithTeachers, and per-class subject assignments for mine/others from teachAssignments
  useEffect(() => {
    const load = async () => {
      try {
        const schoolId = teacherDetails?.school && (typeof teacherDetails.school === 'object' ? teacherDetails.school._id : teacherDetails.school);
        if (!schoolId) return;
        const res = await axios.get(`${API_BASE_URL}/Teachers/${schoolId}`);
        const clsTeacherSet = new Set();
        const mine = new Set();
        const others = new Set();
        const list = Array.isArray(res.data) ? res.data : [];
        list.forEach(t => {
          if (!t) return;
          // class teacher
          const ac = t.attendanceClass;
          const acId = ac && (typeof ac === 'object' ? ac._id : ac);
          if (acId && t._id !== id) clsTeacherSet.add(acId);

          // per-class subject assignments (only from teachAssignments)
          const tas = Array.isArray(t.teachAssignments) ? t.teachAssignments : [];
          tas.forEach(a => {
            const c = a?.sclass?._id || a?.sclass;
            const s = a?.subject?._id || a?.subject;
            if (c && s) {
              const key = `${c}-${s}`;
              if (t._id === id) mine.add(key); else others.add(key);
            }
          });
        });
        setClassesWithTeachers(clsTeacherSet);
        setMinePairsFromBackend(mine);
        setOthersPairsFromBackend(others);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [teacherDetails?.school, id]);

  // Fetch subjects per class lazily when class list arrives
  useEffect(() => {
    const fetchAll = async () => {
      const map = {};
      for (const c of (sclassesList || [])) {
        try {
          const res = await axios.get(`${API_BASE_URL}/ClassSubjects/${c._id}`);
          const list = Array.isArray(res.data) ? res.data : [];
          // Keep server-provided hasTeacher flag; avoid guessing assignment by teacher id here
          map[c._id] = list;
        } catch (e) {
          map[c._id] = [];
        }
      }
      setSubjectsByClass(map);
    };
    if (sclassesList && sclassesList.length) fetchAll();
  }, [sclassesList]);

  const classFilter = (cls) => cls.sclassName.toLowerCase().includes(searchClass.toLowerCase());
  const subjectFilter = (sub) => {
    if (!searchSubject.trim()) return true;
    const q = searchSubject.toLowerCase();
    return (
      (sub.subName || '').toLowerCase().includes(q) ||
      (sub.subCode || '').toLowerCase().includes(q)
    );
  };

  const toggle = (classId, subjectId, disabled) => {
    if (disabled) return;
    const key = `${classId}-${subjectId}`;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key); // allow removal
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectedCount = selectedKeys.size;

  const handleSave = async () => {
    setSaving(true);
    try {
      // The selectedKeys set now represents the full, final set of assignments for this teacher
      const finalPairs = Array.from(selectedKeys);
      const classIds = Array.from(new Set(finalPairs.map(k => k.split('-')[0])));
      const subjectIds = Array.from(new Set(finalPairs.map(k => k.split('-')[1])));
      const pairObjects = finalPairs.map(k => {
        const [sclass, subject] = k.split('-');
        return { sclass, subject };
      });
      await dispatch(updateTeacherBulkAssignments(id, classIds, subjectIds, pairObjects));
      await dispatch(updateTeacherAttendance(id, attendanceClass || null));
      navigate(-1);
    } catch (e) {
      // errors handled in slice; keep UI responsive
    } finally {
      setSaving(false);
    }
  };

  const loading = teacherLoading || classLoading;
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Edit Teacher</Typography>
          <Box sx={{ flex: 1 }} />
          {teacherDetails && (
            <Chip color="primary" label={teacherDetails.name} />
          )}
        </Box>

        {/* Search bars */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search classes"
              value={searchClass}
              onChange={(e) => setSearchClass(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search subjects by name or code"
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {(!sclassesList || sclassesList.length === 0) && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">No classes available to display.</Typography>
            </Grid>
          )}
          {(sclassesList || []).filter(classFilter).map((cls) => {
            const list = (subjectsByClass[cls._id] || []).filter(subjectFilter);
            return (
              <Grid item xs={12} md={6} lg={4} key={cls._id}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ClassIcon color="primary" /> {cls.sclassName}
                  </Typography>

                  {list.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No subjects</Typography>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.5, maxHeight: 360, overflow: 'auto' }}>
                      {list.map((sub) => {
                        const key = `${cls._id}-${sub._id}`;
                        const selected = selectedKeys.has(key); // explicit user selection only (per class)
                        const subTeacherId = sub && sub.teacher ? (typeof sub.teacher === 'object' ? sub.teacher._id : sub.teacher) : null;
                        // 'Mine' means: this pair is currently selected for this teacher
                        const mine = selected;
                        // Only show 'Assigned' if another teacher is assigned to this exact class/subject pair
                        const assignedByOther = !mine && othersPairsFromBackend.has(key);
                        const disabled = assignedByOther; // lock if another teacher owns this pair
                        return (
                          <Box key={sub._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, borderRadius: 1, bgcolor: selected ? 'primary.50' : 'transparent' }}>
                            <Tooltip title={disabled ? 'Already assigned to another teacher' : ''}>
                              <span>
                                <Button size="small" variant={selected ? 'contained' : 'outlined'} disabled={disabled} onClick={() => toggle(cls._id, sub._id, disabled)}>
                                  {selected ? 'Selected' : 'Select'}
                                </Button>
                              </span>
                            </Tooltip>
                            <SubjectIcon fontSize="small" color={disabled ? 'disabled' : 'action'} />
                            <Typography variant="body2" sx={{ flex: 1, color: disabled ? 'text.disabled' : 'text.primary' }}>
                              {sub.subName} {sub.subCode ? `(${sub.subCode})` : ''}
                            </Typography>
                            {mine && (
                              <Chip size="small" label="This Teacher" color="success" variant="outlined" />
                            )}
                            {!mine && assignedByOther && (
                              <Chip size="small" label="Assigned" color="warning" variant="outlined" />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Class teacher toggle - single select style */}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={
                      !Array.from(selectedKeys).some(k => k.startsWith(cls._id + '-')) ? 'Select this class for teaching first' :
                      (classesWithTeachers.has(cls._id) && attendanceClass !== cls._id ? 'Another teacher is already class teacher for this class' : '')
                    }>
                      <span>
                        <Button
                          size="small"
                          variant={attendanceClass === cls._id ? 'contained' : 'outlined'}
                          disabled={
                            !Array.from(selectedKeys).some(k => k.startsWith(cls._id + '-')) ||
                            (classesWithTeachers.has(cls._id) && attendanceClass !== cls._id)
                          }
                          onClick={() => setAttendanceClass(prev => prev === cls._id ? '' : cls._id)}
                        >
                          {attendanceClass === cls._id ? 'Class Teacher' : 'Set Class Teacher'}
                        </Button>
                      </span>
                    </Tooltip>
                    {attendanceClass === cls._id && <Chip size="small" label="Selected" color="primary" />}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
          <Chip label={`${selectedCount} assignments`} />
          <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="contained" disabled={saving || selectedCount === 0} onClick={handleSave}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditTeacher;
