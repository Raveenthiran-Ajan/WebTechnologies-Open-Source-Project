import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';
import AssignmentsPage from './pages/AssignmentsPage';
import AssignmentSubmission from "./components/AssignmentSubmission";
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import ParentDashboard from './pages/parent/ParentDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';
import AdminTimetable from './pages/admin/AdminTimetable';


const App = () => {
  const { currentRole } = useSelector(state => state.user);

  return (
    <Router>
      <LanguageSwitcher />
      {currentRole === null && 
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/choose" element={<ChooseUser visitor="normal" />} />
          <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

          <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
          <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
          <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
          <Route path="/Parentlogin" element={<LoginPage role="Parent" />} />

          <Route path="/forgot-password/:userRole" element={<ForgotPassword />} />
          <Route path="/reset-password/:userRole/:token" element={<ResetPassword />} />

          <Route path="/Adminregister" element={<AdminRegisterPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/teacher/upload-assignment" element={<AssignmentSubmission />} />

          <Route path='*' element={<Navigate to="/" />} />
        </Routes>
      }

      {currentRole === "Admin" && 
        <>
          <AdminDashboard />
          <Routes>
            <Route path="/Admin/classes/class/:classId" element={<AdminTimetable />} />
            <Route path="/Admin/classes/class/:classId" element={<AdminTimetable />} />
            {/* Add other admin routes here if needed */}
          </Routes>
        </>
      }

      {currentRole === "Student" && 
        <>
          <StudentDashboard />
          {/* Add student-specific <Routes> here if needed */}
        </>
      }

      {currentRole === "Teacher" && 
        <>
          <TeacherDashboard />
          {/* Add teacher-specific <Routes> here if needed */}
        </>
      }

      {currentRole === "Parent" && 
        <>
          <ParentDashboard />
          {/* Add parent-specific <Routes> here if needed */}
        </>
      }
    </Router>
  )
}

export default App