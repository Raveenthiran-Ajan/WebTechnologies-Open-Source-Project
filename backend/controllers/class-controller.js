const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        const defaultTimetable = [
            { day: 'Monday', period: 1, subject: 'Maths' },
            { day: 'Monday', period: 2, subject: 'Science' },
            { day: 'Tuesday', period: 1, subject: 'History' },
            { day: 'Tuesday', period: 2, subject: 'IT' },
            { day: 'Wednesday', period: 1, subject: 'Geography' },
            { day: 'Wednesday', period: 2, subject: 'Civic' },
            { day: 'Thursday', period: 1, subject: 'Maths' },
            { day: 'Thursday', period: 2, subject: 'Science' },
            { day: 'Friday', period: 1, subject: 'History' },
            { day: 'Friday', period: 2, subject: 'IT' }
        ];

        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            school: req.body.adminID,
            timetable: defaultTimetable
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            school: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        }
        else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        let sclasses = await Sclass.find({ school: req.params.id })
        if (sclasses.length > 0) {
            res.send(sclasses)
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("school", "schoolName")
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getSclassStudents = async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ school: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        const deletedStudents = await Student.deleteMany({ school: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ school: req.params.id });
        res.send(deletedClasses);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getTimetable = async (req, res) => {
    try {
        const sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            res.send(sclass.timetable);
        } else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTimetable = async (req, res) => {
    try {
        const sclass = await Sclass.findByIdAndUpdate(
            req.params.id,
            { timetable: req.body.timetable },
            { new: true }
        );
        if (sclass) {
            res.send(sclass.timetable);
        } else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, getTimetable, updateTimetable };
