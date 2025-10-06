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
        const query = { sclassName: req.params.id };

        let students = await Student.find(query).populate("examResult.subName", "subName");
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
        const { timetable } = req.body;
        const classId = req.params.id;

        // Filter out slots where subject is selected but no teacher assigned
        const filteredTimetable = timetable.filter(slot => {
            if (slot.subjectId && !slot.teacher) {
                // Discard this slot
                return false;
            }
            return true;
        });

        // Validate clashes before saving
        for (const slot of filteredTimetable) {
            const { day, period, teacher } = slot;
            if (!teacher) continue;

            // Convert teacher to string for comparison
            const teacherIdStr = teacher.toString();

            // Find clashes excluding current class
            const clashes = await Sclass.find({
                _id: { $ne: classId },
                'timetable.day': day,
                'timetable.period': period,
                'timetable.teacher': { $exists: true }
            });

            // Check if any clash has the same teacher assigned
            const hasClash = clashes.some(sclass =>
                sclass.timetable.some(slot =>
                    slot.day === day &&
                    slot.period === period &&
                    slot.teacher.toString() === teacherIdStr
                )
            );

            if (hasClash) {
                return res.status(400).json({
                    message: `Scheduling clash detected for teacher ${teacherIdStr} on ${day} period ${period}`
                });
            }
        }

        const sclass = await Sclass.findByIdAndUpdate(
            classId,
            { timetable: filteredTimetable },
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
        const subjectTeachers = Array.isArray(subject.teacher) ? subject.teacher : [subject.teacher]; // Ensure array

        // Check for clashes: Find if any teacher is already scheduled at this day/period in other classes
        const clashes = await Sclass.find({
            _id: { $ne: classId },
            'timetable.day': day,
            'timetable.period': parseInt(period),
            'timetable.teacher': { $exists: true }
        });

        // Extract teacher IDs assigned at this slot in other classes
        const clashingTeacherIds = clashes.flatMap(sclass =>
            sclass.timetable
                .filter(slot => slot.day === day && slot.period === parseInt(period))
                .map(slot => slot.teacher.toString())
        );

        // Filter out teachers who have clashes
        const availableTeachers = subjectTeachers.filter(teacher =>
            !clashingTeacherIds.includes(teacher._id.toString())
        );

        if (availableTeachers.length > 0) {
            res.send(availableTeachers);
        } else {
            res.send({ message: "No available teachers for this slot" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getTeacherClasses = async (req, res) => {
    try {
        console.log("getTeacherClasses called with teacherId:", req.params.id);
        const teacher = await Teacher.findById(req.params.id).populate('teachSclasses').populate('teachSclass');
        if (!teacher) {
            console.log("Teacher not found for id:", req.params.id);
            return res.status(404).json({ message: "Teacher not found" });
        }
        // Collect union of classes from teachSclasses and teachSclass
        const classIdSet = new Set();
        if (Array.isArray(teacher.teachSclasses)) {
            teacher.teachSclasses.forEach(c => c && c._id && classIdSet.add(c._id.toString()));
        }
        if (teacher.teachSclass && teacher.teachSclass._id) {
            classIdSet.add(teacher.teachSclass._id.toString());
        }
        let classes = [];
        if (classIdSet.size > 0) {
            classes = await Sclass.find({ _id: { $in: Array.from(classIdSet) } }).select('sclassName');
        }

        const response = classes.map(cls => {
            return {
                _id: cls._id,
                sclassName: cls.sclassName,
            };
        });

        console.log("Teacher found, classes:", response);
        res.json(response);
    } catch (err) {
        console.error("Error in getTeacherClasses:", err);
        res.status(500).json(err);
    }
};


const updateTeacherClasses = async (req, res) => {
    try {
        const { teacherId, classIds } = req.body;
        if (!teacherId || !Array.isArray(classIds)) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const teacher = await require('../models/teacherSchema.js').findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        teacher.teachSclasses = classIds;
        await teacher.save();
        res.json({ message: "Teacher classes updated successfully", teachSclasses: teacher.teachSclasses });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, getTimetable, updateTimetable, getClassTeachers, getAvailableSubjects, getAvailableTeachers, getTeacherClasses, updateTeacherClasses };
