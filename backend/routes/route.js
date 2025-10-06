const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const { parentRegister, parentLogIn, getParents, getParentDetails, getParentChildDetails, addAnotherChild,deleteParent, changePassword: parentChangePassword } = require('../controllers/parent-controller.js');
const { adminRegister, adminLogIn, getAdminDetail, changePassword: adminChangePassword } = require('../controllers/admin-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, addSection, deleteSection } = require('../controllers/class-controller.js');
const { complainCreate, complainList, complainUpdate, complainDelete } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice, markNoticeAsRead } = require('../controllers/notice-controller.js');
// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    termAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    addTermMarks,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    changePassword: studentChangePassword,
    getStudentTermReport,
    checkSectionAttendanceStatus
} = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, assignMultipleSubjects, updateTeacherAssignments, testTeacherAssignment, teacherAttendance, changePassword: teacherChangePassword } = require('../controllers/teacher-controller.js');
const {
  submitAssignment,
  getAssignmentsByStudent,
  getAllAssignments,
  getAssignmentsByTeacher,
  upload,
} = require("../controllers/assignment-controller");
const {
  submitAssignment: studentSubmit,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
  upload: submissionUpload,
} = require("../controllers/submission-controller");

// Configure multer for file uploads
const noticeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/notices/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    },
});
const noticeUpload = multer({ 
    storage: noticeStorage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Complaint Routes
router.post('/ComplainAdd', complainCreate);
router.get('/ComplainList/:id', complainList);
router.put('/ComplainUpdate/:id', complainUpdate);
router.delete('/ComplainDelete/:id', complainDelete);

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/Admin/:id", getAdminDetail)
router.put("/Admin/password/:id", adminChangePassword);
// router.delete("/Admin/:id", deleteAdmin)
// router.put("/Admin/:id", updateAdmin)

// Parent

router.post('/ParentReg', parentRegister);
router.post('/ParentLogin', parentLogIn);
router.get('/Parents/:id', getParents);
router.get('/Parent/:id', getParentDetails);
router.get('/Parent/Child/:id', getParentChildDetails);
router.put('/Parent/AddChild/:id', addAnotherChild);
router.put('/Parent/password/:id', parentChangePassword);
router.delete("/Parent/:id", deleteParent);


// Student
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)
router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)
router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)
router.put("/Student/:id", updateStudent)
router.put('/UpdateExamResult/:id', updateExamResult)
router.post('/Students/addTermMarks/:id', addTermMarks);
router.put('/StudentAttendance/:id', studentAttendance)
router.put('/TermAttendance/:id', termAttendance)
router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)
router.put("/Student/password/:id", studentChangePassword)
router.get('/Student/termReport/:id', getStudentTermReport);
router.get('/CheckSectionAttendance/:sclassId/:sectionName', checkSectionAttendanceStatus);
router.get('/CheckClassAttendance/:sclassId', require("../controllers/student_controller").checkClassAttendanceStatus);

// Teacher
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)
router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)
router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)
router.put("/TeacherSubject", updateTeacherSubject)
router.put("/TeacherMultipleSubjects", assignMultipleSubjects)
router.put("/TeacherAssignments", updateTeacherAssignments)
router.post("/TestTeacherAssignment", testTeacherAssignment)
router.post('/TeacherAttendance/:id', teacherAttendance)
router.put("/Teacher/password/:id", teacherChangePassword)

// Notice
router.post('/NoticeCreate', noticeUpload.array('files', 5), noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)
router.put("/Notice/:id", updateNotice)
router.put('/NoticeRead', markNoticeAsRead);
router.get('/download/notice/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/notices', req.params.filename);
    res.download(filePath);
});
// ------------------- Notice -------------------

// Complain
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

router.put('/ComplainUpdate/:id', complainUpdate);

// Sclass
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)
router.get("/Sclass/Students/:id", getSclassStudents)
router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)
router.post("/Sclass/:id/addSection", addSection)
router.delete("/Sclass/:id/deleteSection/:sectionName", deleteSection)
router.get("/Sclass/Teachers/:id", require("../controllers/class-controller").getClassTeachers);
router.get("/Sclass/Timetable/:id", require("../controllers/class-controller").getTimetable);
router.put("/Sclass/Timetable/:id", require("../controllers/class-controller").updateTimetable);
router.get("/Sclass/AvailableSubjects/:id", require("../controllers/class-controller").getAvailableSubjects);
router.get("/Sclass/AvailableTeachers/:classId/:subjectId/:day/:period", require("../controllers/class-controller").getAvailableTeachers);

// Subject
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)
router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)
// ------------------- Subject -------------------

// ------------------- Assignments (teacher side) -------------------
router.post("/assignments/submit", upload.single('file'), submitAssignment);
router.get("/assignments/student/:studentId", getAssignmentsByStudent);
router.get("/assignments", getAllAssignments);
router.get("/assignments/teacher/:teacherId", getAssignmentsByTeacher);

// ------------------- Submissions (student side) -------------------
router.post("/submissions", submissionUpload.single('file'), studentSubmit);
router.get("/submissions/assignment/:assignmentId", getSubmissionsByAssignment);
router.get("/submissions/student/:studentId", getSubmissionsByStudent);
router.put("/submissions/:submissionId", submissionUpload.single('file'), require("../controllers/submission-controller").updateSubmission);
router.delete("/submissions/:submissionId", require("../controllers/submission-controller").deleteSubmission);

// Update submission marking (grade and feedback)
router.put("/submissions/:submissionId/marking", require("../controllers/submission-controller").updateSubmissionMarking);

module.exports = router;
