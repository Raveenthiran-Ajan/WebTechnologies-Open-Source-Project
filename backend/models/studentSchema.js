const mongoose = require('mongoose');
const crypto = require('crypto');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNum: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    sectionName: {
        type: String,
        required: false,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            },
            grade: {
                type: String,
                required: false
            },
            term: {
                type: String,
                enum: ['TERM_1', 'TERM_2', 'TERM_3'],
                required: false
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Holiday'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: false // Not required for term attendance
        },
        // New fields for term-based attendance
        term: {
            type: String,
            enum: ['TERM_1', 'TERM_2', 'TERM_3'],
            required: false
        },
        isTermAttendance: {
            type: Boolean,
            default: false
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

studentSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

    return resetToken;
};

module.exports = mongoose.model("student", studentSchema);