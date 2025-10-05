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
    fileType: [String],
    filePath: [String],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
}, { timestamps: true });

module.exports = mongoose.model("notice", noticeSchema)