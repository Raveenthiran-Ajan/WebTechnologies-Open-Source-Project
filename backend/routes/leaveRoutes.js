const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave-controller');

// Submit a new leave request
router.post('/leave', leaveController.submitLeaveRequest);

// Get all leave requests (admin/teacher)
router.get('/leave', leaveController.getAllLeaveRequests);

// Get leave requests for a specific student/parent
router.get('/leave/user', leaveController.getLeaveRequestsByUser);

// Approve or reject a leave request
router.patch('/leave/:requestId/review', leaveController.reviewLeaveRequest);

module.exports = router;
