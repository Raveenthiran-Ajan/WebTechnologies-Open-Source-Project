const Notice = require('../models/noticeSchema.js');

const noticeCreate = async (req, res) => {
    try {
        const { title, details, date, adminID } = req.body;
        const file = req.file;

        let fileType = 'text';
        let filePath = null;

        if (file) {
            filePath = file.path;
            if (file.mimetype.startsWith('image/')) {
                fileType = 'image';
            } else if (file.mimetype === 'application/pdf') {
                fileType = 'pdf';
            } else if (file.mimetype.startsWith('video/')) {
                fileType = 'video';
            } else {
                fileType = 'text';
            }
        }

        const notice = new Notice({
            title,
            details,
            date,
            school: adminID,
            fileType,
            filePath
        });

        const result = await notice.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const noticeList = async (req, res) => {
    try {
        let notices = await Notice.find({ school: req.params.id })
        if (notices.length > 0) {
            res.send(notices)
        } else {
            res.send({ message: "No notices found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Notice not found" });
        }
        res.status(200).json({ message: "Notice deleted successfully", result });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the notice", error });
    }
}

const deleteNotices = async (req, res) => {
    try {
        const result = await Notice.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No notices found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

module.exports = { noticeCreate, noticeList, updateNotice, deleteNotice, deleteNotices };