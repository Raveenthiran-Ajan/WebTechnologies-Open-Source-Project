# TODO: Implement Timetable Clash Prevention

## Tasks
- [x] Modify getAvailableTeachers in backend/controllers/class-controller.js to exclude current class from clash check
- [x] Modify updateTimetable in backend/controllers/class-controller.js to validate no clashes before saving
- [ ] Test the changes by editing timetables in the Admin Page

## Details
- Ensure that when editing timetables for a class, teachers already assigned to the same day/period in other classes do not appear in the available list
- Prevent saving timetables that would cause clashes

---

# TODO: Test Teacher Assignment Management Features

## Tasks
- [ ] Test upload assignment functionality with file and without file
- [ ] Test CRUD operations: create, read, update, delete assignments
- [ ] Verify responsive design on mobile and desktop
- [ ] Test overdue assignment highlighting
- [ ] Test view submissions integration
- [ ] Test edit assignment with file replacement
- [ ] Test delete assignment with confirmation dialog

## Details
- Backend APIs added: PUT /assignments/:id, DELETE /assignments/:id
- Frontend page: TeacherUploadAssignment.js with upload and manage sections
- Features: responsive table/cards, edit/delete dialogs, overdue highlighting, truncated descriptions
