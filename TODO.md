# Timetable Enhancement Tasks

## Backend Enhancements
- [x] Add subject weekly period limit validation in updateTimetable function (class-controller.js)
- [x] Add check to prevent overlapping subjects in the same day/period slot (class-controller.js)

## Frontend Enhancements
- [x] Implement color coding for timetable slots (white: empty, green: saved, yellow: warning, red: invalid) in Timetable.js
- [x] Add hover highlights and info tooltips for slots in Timetable.js
- [x] Add editing mode banner in Timetable.js
- [x] Add frontend validation to prevent overlapping subjects and invalid data in Timetable.js
- [x] Disable save button if validations fail in Timetable.js

## Testing
- [ ] Test backend validations with sample data (including teacher conflicts and subject limits)
- [ ] Test frontend UI enhancements and validations (color coding, tooltips, dropdown initialization)
- [ ] Test full flow: edit, validate, save, refresh (with warnings for subject limits)
