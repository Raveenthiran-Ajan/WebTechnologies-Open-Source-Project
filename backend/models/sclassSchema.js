const mongoose = require("mongoose");

const sclassSchema = new mongoose.Schema({
    sclassName: {
        type: String,
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    subjects: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject'
        },
        sessions: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    timetable: [{


        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        period: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        subject: {
            type: String,
            required: true
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject'
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'teacher'
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("sclass", sclassSchema);

