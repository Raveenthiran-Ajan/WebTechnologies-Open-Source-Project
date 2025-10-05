const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            school: req.body.adminID,
            timetable: []
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
        let sclasses = await Sclass.find({ school: req.params.id }).lean();
        if (sclasses.length > 0) {
            const sclassesWithCounts = await Promise.all(sclasses.map(async (sclass) => {
                const studentCount = await Student.countDocuments({ sclassName: sclass._id });
                // Only teachers who teach any subject in the class
                const subjectIds = await Subject.find({ sclassName: sclass._id }).distinct('_id');
                const teacherObjs = await Teacher.find({ teachSubjects: { $in: subjectIds } }).select('_id name email');
                const teacherCount = teacherObjs.length;
                return {
                    ...sclass,
                    students: studentCount,
                    teachers: teacherCount,
                    teacherList: teacherObjs,
                };
            }));
            res.send(sclassesWithCounts);
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
        let students = await Student.find({ sclassName: req.params.id }).populate("examResult.subName", "subName");
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

const getClassTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ teachSclass: req.params.id }).populate('teachSubject', 'subName');
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                const { password, ...teacherWithoutPassword } = teacher._doc;
                return teacherWithoutPassword;
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getAvailableSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id }).populate('teacher', 'name');
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found for this class" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getAvailableTeachers = async (req, res) => {
    try {
        const { classId, subjectId, day, period } = req.params;
        // Get teachers for the subject
        const subject = await Subject.findById(subjectId).populate('teacher');
        if (!subject || !subject.teacher) {
            return res.send({ message: "No teachers assigned to this subject" });
        }
        const subjectTeachers = [subject.teacher]; // Assuming one teacher per subject, but can be array

        // Check for clashes: Find if any teacher is already scheduled at this day/period in any class
        const clashes = await Sclass.find({
            'timetable.day': day,
            'timetable.period': parseInt(period),
            'timetable.teacher': { $in: subjectTeachers.map(t => t._id) }
        });

        const clashingTeacherIds = clashes.flatMap(sclass =>
            sclass.timetable.filter(slot => slot.day === day && slot.period === parseInt(period)).map(slot => slot.teacher)
        );

        const availableTeachers = subjectTeachers.filter(teacher => !clashingTeacherIds.includes(teacher._id.toString()));

        if (availableTeachers.length > 0) {
            res.send(availableTeachers);
        } else {
            res.send({ message: "No available teachers for this slot" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, getTimetable, updateTimetable, getClassTeachers, getAvailableSubjects, getAvailableTeachers };
