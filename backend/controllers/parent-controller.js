const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');
const sendEmail = require('../utils/sendEmail.js');
const Admin = require('../models/adminSchema.js');

const parentRegister = async (req, res) => {
    try {
        const { name, email, school, studentId, autoGeneratePassword, password } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !school || !studentId) {
            return res.status(400).json({ message: "Please fill all the required fields" });
        }

        let finalPassword;
        
        if (autoGeneratePassword) {
            // Generate random password
            finalPassword = crypto.randomBytes(8).toString('hex');
        } else {
            // Use provided password
            finalPassword = password;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(finalPassword, salt);

        const existingParent = await Parent.findOne({ email });
        if (existingParent) {
            return res.send({ message: 'Email already exists' });
        }

        // Find the student to link based on roll number, class, and school
        const studentToLink = await Student.findById(studentId);
        if (!studentToLink) {
            return res.status(404).send({ message: "Student with provided details not found." });
        }

        // Optional: Check if a parent is already registered for this student
        const parentAlreadyLinked = await Parent.findOne({ children: studentToLink._id });
        if (parentAlreadyLinked) {
            return res.send({ message: "A parent is already registered for this student." });
        }

        const newParent = new Parent({
            name,
            email,
            password: hashedPass,
            school,
            children: [studentToLink._id] // Link the student
        });

        const result = await newParent.save();
        
        // Send welcome email only if password was auto-generated
        if (autoGeneratePassword) {
            const adminDoc = await Admin.findById(school).select('schoolName');
            const schoolName = (adminDoc && adminDoc.schoolName) ? adminDoc.schoolName : 'Our';
            const loginUrl = 'http://localhost:3000/Parentlogin'; // Role-based login URL for parents
            const emailHtml = `
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 24px;">
                    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 24px;">
                        <h2 style="text-align: center; color: #333333; margin: 0 0 16px;">Welcome to ${schoolName} School Management System!</h2>
                        <p style="margin: 0 0 12px;">Dear ${name},</p>
                        <p style="margin: 0 0 16px;">Your parent account has been successfully created. Here are your login credentials:</p>

                        <div style="background-color: #f5f7fa; padding: 16px; border-radius: 8px; margin: 0 0 16px;">
                            <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #1976d2; text-decoration: underline;">${email}</a></p>
                            <p style="margin: 0 0 8px;"><strong>Password:</strong> ${finalPassword}</p>
                            <p style="margin: 0;"><strong>Role:</strong> Parent</p>
                        </div>

                        <p style="margin: 0 0 12px;">Please use the following link to login:</p>
                        <div style="text-align: center; margin: 12px 0 20px;">
                            <a href="${loginUrl}" style="background-color: #1976d2; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Login as Parent</a>
                        </div>

                        <p style="margin: 0 0 12px;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                        <p style="margin: 0 0 16px;">If you have any questions, please contact the system administrator.</p>

                        <p style="margin: 0;">Best regards,<br>School Management System Team</p>
                    </div>
                </body>
                </html>
            `;
            
            try {
                await sendEmail({
                    to: email,
                    subject: 'Welcome to School Management System - Your Account Details',
                    text: emailHtml
                });
            } catch (emailErr) {
                console.error('Error sending email:', emailErr);
                // Don't fail the registration if email fails
            }
        }
        
        result.password = undefined;
        res.status(201).send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};

const parentLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let parent = await Parent.findOne({ email });
        if (parent) {
            const validated = await bcrypt.compare(password, parent.password);
            if (validated) {
                // Populate children details for the parent's dashboard
                // Also populate each child's class (sclassName) so UI can show proper class name
                parent = await parent.populate({
                    path: "children",
                    select: "-password -attendance -examResult", // Exclude sensitive/large fields
                    populate: {
                        path: "sclassName",
                        select: "sclassName"
                    }
                });
                parent = await parent.populate("school", "schoolName");

                parent.password = undefined;
                res.send(parent);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Parent not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getParents = async (req, res) => {
    try {
        const parents = await Parent.find({ school: req.params.id })
            .populate("school", "schoolName")
            .populate({
                path: "children",
                select: "name rollNum sclassName",
                populate: {
                    path: "sclassName",
                    select: "sclassName"
                }
            });

        if (parents.length > 0) {
            res.send(parents);
        } else {
            res.send({ message: "No parents found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getParentDetails = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id)
            .populate({
                path: "children",
                select: "name rollNum sclassName",
                populate: {
                    path: "sclassName",
                    select: "sclassName"
                }
            });
        if (parent) {
            res.send(parent);
        } else {
            res.send({ message: "No parent found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getParentChildDetails = async (req, res) => {
    try {
        // In a real-world scenario, you'd add authentication middleware
        // to ensure the requesting parent is linked to this student.
        const student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const addAnotherChild = async (req, res) => {
    try {
        const { rollNum, sclassName } = req.body;
        const parentId = req.params.id;

        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).send({ message: "Parent not found." });
        }

        const studentToLink = await Student.findOne({ rollNum, sclassName, school: parent.school });
        if (!studentToLink) {
            return res.status(404).send({ message: "Student with provided details not found in your school." });
        }

        if (parent.children.includes(studentToLink._id)) {
            return res.send({ message: "This student is already linked to your account." });
        }

        const parentAlreadyLinked = await Parent.findOne({ children: studentToLink._id });
        if (parentAlreadyLinked) {
            return res.send({ message: "A parent is already registered for this student." });
        }

        parent.children.push(studentToLink._id);
        const savedParent = await parent.save();

        const result = await Parent.findById(savedParent._id)
            .populate({
                path: "children",
                select: "name rollNum sclassName",
                populate: {
                    path: "sclassName",
                    select: "sclassName"
                }
            });
        res.status(200).send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteParent = async (req, res) => {
    try {
        const result = await Parent.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const parent = await Parent.findById(req.params.id);

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, parent.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        parent.password = hashedPassword;
        await parent.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    parentRegister,
    parentLogIn,
    getParents,
    getParentDetails,
    getParentChildDetails,
    addAnotherChild,
    deleteParent,
    changePassword,
};
