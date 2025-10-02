const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: false
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'parent',
    required: false
  },
  reason: {
    type: String,
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: false
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
