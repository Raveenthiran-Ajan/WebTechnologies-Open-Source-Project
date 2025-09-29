const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const complain = new Complain(req.body)
        const result = await complain.save()
        res.send(result)
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ school: req.params.id });
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actionedBy } = req.body;
        
        const updateData = {
            status,
            actionedBy,
            actionedDate: status === 'Actioned' ? new Date() : null
        };

        const updatedComplain = await Complain.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedComplain) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.send(updatedComplain);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, complainList, complainUpdate };
