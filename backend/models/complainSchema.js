const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['student', 'parent', 'teacher']
    },
    date: {
        type: Date,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Actioned'],
        default: 'Pending'
    },
    actionedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        default: null
    },
    actionedDate: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("complain", complainSchema);