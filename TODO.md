# TODO: Improve Upload Assignment Form UI

- [x] Add icons to form fields (e.g., TitleIcon, DescriptionIcon, etc.)
- [x] Improve form layout with better spacing and modern design
- [x] Create a custom drag-and-drop file upload component with preview and file size display
- [x] Add real-time form validation with error messages
- [x] Include a progress bar during file upload
- [x] Enhance responsiveness and overall UI aesthetics

# TODO: Improve View Submissions UI

- [x] Add icons to table headers and improve table design
- [x] Add status indicators for graded/ungraded submissions
- [x] Implement search/filter functionality for submissions
- [x] Enhance grade and feedback input fields
- [x] Add download buttons for submitted files
- [x] Improve table responsiveness and overall layout

# TODO: Add Timetable Feature to Class Details

- [x] Update sclassSchema to include timetable array with day, period, subject fields
- [x] Update class-controller to initialize default timetable on class creation
- [x] Add getTimetable and updateTimetable controller functions
- [x] Add routes for GET and PUT timetable endpoints
- [x] Update redux sclassHandle to include getTimetable and updateTimetable async actions
- [x] Create Timetable component with table display and edit functionality
- [x] Integrate Timetable component into Admin ClassDetails page as a new tab

# TODO: Add Select Class Option to Add Student Form

- [x] Edit frontend/src/pages/admin/studentRelated/AddStudent.js: Remove the situation conditional for class selection, insert <label>Class</label> and <select> dropdown after the Name input (using sclassesList for options, onChange={changeHandler}, value={className}, with default "Select Class" option).
- [x] Test: Run frontend, navigate to Admin > Add Student, verify dropdown loads classes, select one, submit form, check if student is registered with correct sclassName (via console or backend logs).
- [x] Handle any conflicts or errors (e.g., if no classes, show message).
- [x] Mark steps as completed in TODO.md.
