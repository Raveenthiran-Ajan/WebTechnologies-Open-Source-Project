const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "Parent"
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // A parent can have one or more children in the same school
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    }]
});

module.exports = mongoose.model("parent", parentSchema);
