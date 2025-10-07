const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parent',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        default: null
    },
    approvedDate: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model("leaveRequest", leaveRequestSchema);