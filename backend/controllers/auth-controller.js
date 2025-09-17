const crypto = require('crypto');
const Admin = require('../models/adminSchema');
const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const sendEmail = require('../utils/sendEmail');

const getModel = (role) => {
    switch (role) {
        case 'Admin':
            return Admin;
        case 'Student':
            return Student;
        case 'Teacher':
            return Teacher;
        default:
            return null;
    }
};

const forgotPassword = async (req, res, next) => {
    const { role } = req.body;
    const Model = getModel(role);

    if (!Model) {
        return res.status(404).json({ message: "User role not found" });
    }

    try {
        const user = await Model.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: "Email could not be sent" });
        }

        const resetToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/${role.toLowerCase()}/reset-password/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text: message
            });

            res.status(200).json({ success: true, data: "Email Sent" });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    const { role } = req.body;
    const Model = getModel(role);

    if (!Model) {
        return res.status(404).json({ message: "User role not found" });
    }

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    try {
        const user = await Model.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid Token" });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: "Password Updated Successfully",
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { forgotPassword, resetPassword };
