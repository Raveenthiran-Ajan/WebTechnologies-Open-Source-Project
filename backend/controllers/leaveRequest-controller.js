const LeaveRequest = require('../models/leaveRequestSchema.js');

const leaveRequestCreate = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Validate dates are not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(startDate) < today) {
            return res.status(400).json({ message: "Start date cannot be in the past" });
        }

        if (new Date(endDate) < today) {
            return res.status(400).json({ message: "End date cannot be in the past" });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: "End date cannot be before start date" });
        }

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

        // Get pending leave requests
        const pendingRequests = await LeaveRequest.find({
            user: parentId,
            status: 'Pending'
        })
            .populate('student', 'name rollNum')
            .sort({ date: -1 });

        // Get processed leave requests (approved/rejected)
        const processedRequests = await LeaveRequest.find({
            user: parentId,
            status: { $in: ['Approved', 'Rejected'] }
        })
            .populate('student', 'name rollNum')
            .populate('approvedBy', 'name')
            .sort({ approvedDate: -1 }); // Most recently processed first

        res.json({
            success: true,
            data: {
                pending: pendingRequests,
                processed: processedRequests
            },
            message: (pendingRequests.length + processedRequests.length) > 0 ? null : "No leave requests found"
        });
    } catch (err) {
        console.error('Error fetching leave requests for parent:', err);
        res.status(500).json({
            success: false,
            data: { pending: [], processed: [] },
            message: err.message || "Error fetching leave requests"
        });
    }
};

const getLeaveRequestsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Get the teacher with all class assignments
        const Teacher = require('../models/teacherSchema.js');
        const teacher = await Teacher.findById(teacherId).populate('attendanceClass').populate('teachSclasses').populate('teachSclass');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                data: { pending: [], processed: [] },
                message: "Teacher not found"
            });
        }

        // Only class teachers (those with attendanceClass set) should receive leave requests
        if (!teacher.attendanceClass || !teacher.attendanceClass._id) {
            console.log(`Teacher ${teacher.name} (${teacherId}): Not a class teacher, no attendanceClass set`);
            return res.json({
                success: true,
                data: { pending: [], processed: [] },
                message: "Only class teachers can view leave requests"
            });
        }

        const responsibleClassId = teacher.attendanceClass._id;
        console.log(`Teacher ${teacher.name} (${teacherId}): Class teacher for class ${responsibleClassId}`);

        // Get students in the teacher's responsible class
        const Student = require('../models/studentSchema.js');
        const studentsInClass = await Student.find({
            sclassName: responsibleClassId
        }).select('_id');

        const studentIds = studentsInClass.map(student => student._id);

        if (studentIds.length === 0) {
            return res.json({
                success: true,
                data: { pending: [], processed: [] },
                message: "No students in your class"
            });
        }

        // Get pending leave requests
        const pendingRequests = await LeaveRequest.find({
            student: { $in: studentIds },
            status: 'Pending'
        })
            .populate('user', 'name')
            .populate('student', 'name rollNum sclassName')
            .sort({ date: -1 });

        // Get processed leave requests (approved/rejected)
        const processedRequests = await LeaveRequest.find({
            student: { $in: studentIds },
            status: { $in: ['Approved', 'Rejected'] }
        })
            .populate('user', 'name')
            .populate('student', 'name rollNum sclassName')
            .populate('approvedBy', 'name')
            .sort({ approvedDate: -1 }); // Most recently processed first

        console.log(`Teacher ${teacher.name} (${teacherId}): Found ${pendingRequests.length} pending, ${processedRequests.length} processed leave requests for class ${responsibleClassId}`);

        res.json({
            success: true,
            data: {
                pending: pendingRequests,
                processed: processedRequests
            },
            message: (pendingRequests.length + processedRequests.length) > 0 ? null : "No leave requests found for your class"
        });
    } catch (err) {
        console.error('Error fetching leave requests for teacher:', err);
        res.status(500).json({
            success: false,
            data: { pending: [], processed: [] },
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