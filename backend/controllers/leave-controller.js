const LeaveRequest = require('../models/leaveRequest');
const Student = require('../models/studentSchema');
const Parent = require('../models/parentSchema');

// Submit a new leave request
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { studentId, parentId, reason, fromDate, toDate } = req.body;
    const leaveRequest = new LeaveRequest({
      student: studentId,
      parent: parentId,
      reason,
      fromDate,
      toDate
    });
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted', leaveRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all leave requests (admin/teacher)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate('student', 'name')
      .populate('parent', 'name');
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get leave requests for a specific student/parent
exports.getLeaveRequestsByUser = async (req, res) => {
  try {
    const { userId, role } = req.query;
    let filter = {};
    if (role === 'student') filter.student = userId;
    if (role === 'parent') filter.parent = userId;
    const leaveRequests = await LeaveRequest.find(filter)
      .populate('student', 'name')
      .populate('parent', 'name');
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or reject a leave request
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reviewedBy, rejectionReason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason: status === 'Rejected' ? rejectionReason : undefined
    };
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(requestId, update, { new: true });
    if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });
    res.json({ message: `Leave request ${status.toLowerCase()}`, leaveRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
