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
        
        // Validate required fields
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        
        if (!['Pending', 'Actioned'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'Pending' or 'Actioned'" });
        }
        
        // Check if complaint exists first
        const existingComplain = await Complain.findById(id);
        if (!existingComplain) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        
        const updateData = {
            status,
            actionedBy: status === 'Actioned' ? actionedBy : null,
            actionedDate: status === 'Actioned' ? new Date() : null
        };

        const updatedComplain = await Complain.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('actionedBy', 'name');

        res.status(200).json({
            success: true,
            message: `Complaint ${status.toLowerCase()} successfully`,
            data: updatedComplain
        });
    } catch (err) {
        console.error('Error updating complaint:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                error: err.message 
            });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid complaint ID format' 
            });
        }
        res.status(500).json({ 
            message: 'Server error occurred while updating complaint',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

module.exports = { complainCreate, complainList, complainUpdate };
