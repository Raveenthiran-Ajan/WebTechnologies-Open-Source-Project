const LeaveRequest = require('../models/leaveRequestSchema.js');

const leaveRequestCreate = async (req, res) => {
    try {
        const leaveRequest = new LeaveRequest(req.body);
        const result = await leaveRequest.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const leaveRequestList = async (req, res) => {
    try {
        let leaveRequests = await LeaveRequest.find({ school: req.params.id })
            .populate('user', 'name')
            .populate('student', 'name rollNum')
            .populate('approvedBy', 'name');
        res.json({
            success: true,
            data: leaveRequests,
            message: leaveRequests.length > 0 ? null : "No leave requests found"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: [],
            message: err.message || "Error fetching leave requests"
        });
    }
};

const leaveRequestUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedBy, rejectionReason } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'Pending', 'Approved', or 'Rejected'" });
        }

        const existingRequest = await LeaveRequest.findById(id);
        if (!existingRequest) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        const updateData = {
            status,
            approvedBy: (status === 'Approved' || status === 'Rejected') ? approvedBy : null,
            approvedDate: (status === 'Approved' || status === 'Rejected') ? new Date() : null,
            rejectionReason: status === 'Rejected' ? rejectionReason : null
        };

        const updatedRequest = await LeaveRequest.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'name').populate('student', 'name rollNum').populate('approvedBy', 'name');

        res.status(200).json({
            success: true,
            message: `Leave request ${status.toLowerCase()} successfully`,
            data: updatedRequest
        });
    } catch (err) {
        console.error('Error updating leave request:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                error: err.message
            });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid leave request ID format'
            });
        }
        res.status(500).json({
            message: 'Server error occurred while updating leave request',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

const leaveRequestDelete = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await LeaveRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        await LeaveRequest.findByIdAndDelete(id);

        res.json({
            success: true,
            data: request,
            message: "Leave request deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Error deleting leave request"
        });
    }
};

const getLeaveRequestsByParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        let leaveRequests = await LeaveRequest.find({ user: parentId })
            .populate('student', 'name rollNum')
            .populate('approvedBy', 'name');
        res.json({
            success: true,
            data: leaveRequests,
            message: leaveRequests.length > 0 ? null : "No leave requests found"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: [],
            message: err.message || "Error fetching leave requests"
        });
    }
};

const getLeaveRequestsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Get the teacher's classes
        const Teacher = require('../models/teacherSchema.js');
        const teacher = await Teacher.findById(teacherId).populate('teachSclasses').populate('teachSclass');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                data: [],
                message: "Teacher not found"
            });
        }

        // Collect all class IDs the teacher teaches
        const classIds = new Set();
        if (Array.isArray(teacher.teachSclasses)) {
            teacher.teachSclasses.forEach(cls => cls && cls._id && classIds.add(cls._id.toString()));
        }
        if (teacher.teachSclass && teacher.teachSclass._id) {
            classIds.add(teacher.teachSclass._id.toString());
        }

        if (classIds.size === 0) {
            return res.json({
                success: true,
                data: [],
                message: "No classes assigned to this teacher"
            });
        }

        // Get students in the teacher's classes
        const Student = require('../models/studentSchema.js');
        const studentsInClasses = await Student.find({
            sclassName: { $in: Array.from(classIds) }
        }).select('_id');

        const studentIds = studentsInClasses.map(student => student._id);

        // Get leave requests for students in the teacher's classes
        let leaveRequests = await LeaveRequest.find({
            student: { $in: studentIds },
            status: 'Pending'
        })
            .populate('user', 'name')
            .populate('student', 'name rollNum sclassName')
            .populate('approvedBy', 'name');

        res.json({
            success: true,
            data: leaveRequests,
            message: leaveRequests.length > 0 ? null : "No pending leave requests found for your classes"
        });
    } catch (err) {
        console.error('Error fetching leave requests for teacher:', err);
        res.status(500).json({
            success: false,
            data: [],
            message: err.message || "Error fetching leave requests"
        });
    }
};

module.exports = {
    leaveRequestCreate,
    leaveRequestList,
    leaveRequestUpdate,
    leaveRequestDelete,
    getLeaveRequestsByParent,
    getLeaveRequestsByTeacher
};