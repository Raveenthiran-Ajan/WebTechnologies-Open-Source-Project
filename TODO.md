# Task: Update Teacher View to Class-Wide Attendance Table

## Steps to Complete:

1. [x] Update TeacherClassDetails.js: Change "View" button navigation from individual student to class-wide attendance route `/teacher/class/attendance/${classID}`.

2. [x] Update TeacherDashboard.js: Add route `<Route path="/teacher/class/attendance/:classId" element={<TeacherViewStudent />} />`.

3. [x] Update TeacherViewStudent.js:
   - Repurpose to TeacherClassAttendance logic: Use params.classId, fetch all class students via getClassStudents.
   - For each student, fetch userDetails via axios (to avoid multiple dispatches), extract attendance filtered for teacher's subject.
   - Compute per student: present, sessions, percentage, allData for expandable.
   - Display table with rows for students: Name, RollNum, Present, Sessions, Percentage, Actions (expandable details).
   - Add overall class average percentage.
   - Use layout similar to ViewStdAttendance.js: Typography, Table with Collapse, BottomNavigation for table/chart (CustomBarChart for student percentages).
   - Handle loading and empty states.

4. [x] Test: Navigate from class details "View" button, verify table loads with all students' attendance for subject, expandable rows show dates/status, chart displays, no errors.

5. [x] Fix: Attendance taking not updating class view - added navigation back to class attendance after successful attendance submission in StudentAttendance.js.

# TODO: Enhance Admin Timetable Editing with Available Subjects/Teachers and Clash Avoidance

- [x] Update backend/models/sclassSchema.js: Add subjectId and teacher fields to timetable array.
- [x] Update backend/controllers/class-controller.js: Add getAvailableSubjects and getAvailableTeachers functions with clash checking.
- [x] Update backend/routes/route.js: Add routes for available subjects and teachers.
- [x] Update frontend/src/pages/admin/classRelated/Timetable.js: Replace TextField with Select for subjects (fetch available on edit), add teacher Select on subject change, send subjectId/teacher on save.
- [x] If needed, update defaultTimetable in sclassCreate to include IDs (or handle migration).
- [x] Test: Run backend/frontend, edit timetable, verify dropdowns show available options, clashes prevented, save works.
- [x] Update TODO.md to mark steps as completed.
