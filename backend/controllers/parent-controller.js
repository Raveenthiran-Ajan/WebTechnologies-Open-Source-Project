const bcrypt = require('bcrypt');
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');

const parentRegister = async (req, res) => {
    try {
        const { name, email, password, school, studentId } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password || !school || !studentId) {
            return res.status(400).json({ message: "Please fill all the required fields" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

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
                parent = await parent.populate({
                    path: "children",
                    select: "-password -attendance -examResult" // Exclude sensitive/large fields
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

module.exports = {
    parentRegister,
    parentLogIn,
    getParents,
    getParentDetails,
    getParentChildDetails,
    addAnotherChild,
    deleteParent,
};
