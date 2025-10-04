const mongoose = require("mongoose")

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    fileType: {
        type: String,
        enum: ['text', 'pdf', 'image', 'video'],
        default: 'text'
    },
    filePath: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("notice", noticeSchema)