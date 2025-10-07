const mongoose = require("mongoose")
const crypto = require('crypto');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Teacher"
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // Multiple subjects and classes for teaching
    teachSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    }],
    teachSclasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    }],
    // Specific subject-class assignments
    teachAssignments: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        },
        sclass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass',
            required: true
        }
    }],
    // Single class for attendance responsibility
    attendanceClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    },
    // Backward compatibility
    teachSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    },
    teachSclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        presentCount: {
            type: String,
        },
        absentCount: {
            type: String,
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

teacherSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

    return resetToken;
};

module.exports = mongoose.model("teacher", teacherSchema)